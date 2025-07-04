'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { SyllabusForm } from '@/components/syllabus-form';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, FilePlus, Trash2, Menu, FilePenLine, Shield } from 'lucide-react';
import type { Syllabus, UserData } from '@/types/syllabus';
import {
  createSyllabusAction,
  deleteSyllabusAction,
  getSyllabusesAction,
  saveSyllabusAction,
  getSyllabusByIdAction,
  getAllUsersAction
} from './actions';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';

export default function Home() {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [renamingSyllabusId, setRenamingSyllabusId] = useState<string | null>(null);
  const [tempSyllabusName, setTempSyllabusName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.uid) {
      setIsDataLoading(true);
      const syllabusIdFromUrl = searchParams.get('syllabusId');

      if (isAdmin && syllabusIdFromUrl) {
        // Admin is editing a specific syllabus
        Promise.all([
          getSyllabusByIdAction(syllabusIdFromUrl),
          getSyllabusesAction(user.uid), // Also fetch admin's own syllabuses for the sidebar
          getAllUsersAction()
        ]).then(([{ syllabus, error: syllabusError }, { syllabuses: userSyllabuses, error: listError }, { users, error: usersError }]) => {
          if (syllabusError) toast({ variant: 'destructive', title: 'Error al cargar plan de estudios', description: syllabusError });
          if (listError) toast({ variant: 'destructive', title: 'Error al cargar lista', description: listError });
          if (usersError) toast({ variant: 'destructive', title: 'Error al cargar usuarios', description: usersError });
          
          setSelectedSyllabus(syllabus);
          setSyllabuses(userSyllabuses);
          setAllUsers(users);
        }).finally(() => setIsDataLoading(false));

      } else {
        // Normal user flow
        getSyllabusesAction(user.uid)
          .then(({ syllabuses: loadedSyllabuses, error }) => {
            if (error) {
              toast({ variant: 'destructive', title: 'Error al cargar datos', description: error });
            } else {
              setSyllabuses(loadedSyllabuses);
              if (loadedSyllabuses.length > 0) {
                // If a syllabus was just selected from admin, don't override it
                if (!selectedSyllabus) {
                  setSelectedSyllabus(loadedSyllabuses[0]);
                }
              } else {
                setSelectedSyllabus(null);
              }
            }
          })
          .finally(() => setIsDataLoading(false));
      }
    } else if (!loading) {
      setIsDataLoading(false);
    }
  }, [user, loading, toast, router, isAdmin, searchParams, selectedSyllabus]);
  
  const handleCreateSyllabus = async () => {
    if (!user) return;
    setIsCreating(true);
    const authorName = user.displayName || user.email || 'Desconocido';
    const authorEmail = user.email || '';
    const { syllabus: newSyllabus, error } = await createSyllabusAction(user.uid, authorName, authorEmail);
    if (error || !newSyllabus) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error || 'No se pudo crear el plan de estudios.',
      });
    } else {
      setSyllabuses((prev) => [...prev, newSyllabus]);
      setSelectedSyllabus(newSyllabus);
      toast({ title: 'Éxito', description: 'Nuevo plan de estudios creado.' });
    }
    setIsCreating(false);
  };

  const handleDeleteSyllabus = async (syllabusId: string) => {
    if (!syllabusId) return;
    const { success, error } = await deleteSyllabusAction(syllabusId);
    if (error || !success) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error || 'No se pudo eliminar el plan de estudios.',
      });
    } else {
      const newSyllabuses = syllabuses.filter((s) => s.id !== syllabusId);
      setSyllabuses(newSyllabuses);
      if (selectedSyllabus?.id === syllabusId) {
        setSelectedSyllabus(newSyllabuses.length > 0 ? newSyllabuses[0]! : null);
      }
      toast({ title: 'Éxito', description: 'Plan de estudios eliminado.' });
    }
  };

  const handleStartRename = (syllabusId: string, currentName: string) => {
    setRenamingSyllabusId(syllabusId);
    setTempSyllabusName(currentName);
  };

  const handleFinishRename = async (syllabusId: string) => {
    const syllabusToUpdate = syllabuses.find(s => s.id === syllabusId) || (selectedSyllabus?.id === syllabusId ? selectedSyllabus : null);
    if (!syllabusToUpdate) return;

    if (!tempSyllabusName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'El nombre del plan no puede estar vacío.' });
      setRenamingSyllabusId(null);
      return;
    }

    if (syllabusToUpdate.courseName !== tempSyllabusName) {
      const updatedSyllabus = { ...syllabusToUpdate, courseName: tempSyllabusName };
      
      handleSyllabusChange(updatedSyllabus);

      const { success, error } = await saveSyllabusAction(updatedSyllabus);
      if (!success) {
        toast({ variant: 'destructive', title: 'Error al renombrar', description: error });
        handleSyllabusChange(syllabusToUpdate);
      } else {
        toast({ title: 'Éxito', description: 'Plan de estudios renombrado.' });
      }
    }
    setRenamingSyllabusId(null);
  };

  const handleSelectSyllabus = (syllabus: Syllabus) => {
    if (renamingSyllabusId !== syllabus.id) {
        if (isAdmin) {
          router.push(`/?syllabusId=${syllabus.id}`);
        }
        setSelectedSyllabus(syllabus);
    }
  };

  const handleSyllabusChange = (updatedSyllabus: Syllabus) => {
    setSelectedSyllabus(updatedSyllabus);
    setSyllabuses((prev) =>
      prev.map((s) => (s.id === updatedSyllabus.id ? updatedSyllabus : s))
    );
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarContent>
          <SidebarHeader>
            <h2 className="text-lg font-semibold truncate">Mis Planes</h2>
          </SidebarHeader>
          <SidebarMenu className="p-2">
            {isDataLoading && syllabuses.length === 0 ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              syllabuses.map((syllabus) => (
                <SidebarMenuItem key={syllabus.id}>
                  {renamingSyllabusId === syllabus.id ? (
                    <Input
                      value={tempSyllabusName}
                      onChange={(e) => setTempSyllabusName(e.target.value)}
                      onBlur={() => handleFinishRename(syllabus.id!)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                        if (e.key === 'Escape') setRenamingSyllabusId(null);
                      }}
                      onFocus={(e) => e.target.select()}
                      autoFocus
                      className="h-8 text-sm px-2 w-full"
                    />
                  ) : (
                    <>
                      <SidebarMenuButton
                        isActive={selectedSyllabus?.id === syllabus.id}
                        onClick={() => handleSelectSyllabus(syllabus)}
                      >
                        <span className="truncate">{syllabus.courseName}</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        className="right-8 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(syllabus.id!, syllabus.courseName);
                        }}
                      >
                        <FilePenLine size={14} />
                      </SidebarMenuAction>
                      <SidebarMenuAction
                        className="text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSyllabus(syllabus.id!);
                        }}
                      >
                        <Trash2 size={14} />
                      </SidebarMenuAction>
                    </>
                  )}
                </SidebarMenuItem>
              ))
            )}
            <SidebarMenuItem>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleCreateSyllabus}
                disabled={isCreating}
              >
                {isCreating ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <FilePlus className="mr-2" />
                )}
                Nuevo Plan
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <div className="flex flex-col gap-2 p-3 border-t text-sm">
            {isAdmin && (
               <Link href="/admin" className="flex items-center gap-2 font-semibold text-primary hover:underline">
                  <Shield size={16} />
                  <span>Panel de Admin</span>
              </Link>
            )}
            <button onClick={logout} className="flex items-center gap-2 font-semibold">
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <main className="container mx-auto px-4 py-8 relative">
          <header className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden">
                <Menu />
              </SidebarTrigger>
              <div className="text-left">
                <h1 className="text-2xl md:text-4xl font-bold font-headline text-primary-foreground">
                  Plan de Estudio Fácil
                </h1>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Crea y gestiona tus planes de estudio.
                </p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground hidden md:block">{user.email}</span>
          </header>

          {isDataLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
          ) : selectedSyllabus ? (
            <SyllabusForm
              key={selectedSyllabus.id}
              syllabus={selectedSyllabus}
              allUsers={allUsers}
              onSyllabusChange={handleSyllabusChange}
              onSave={saveSyllabusAction}
            />
          ) : (
            <div className="text-center min-h-[50vh] flex flex-col items-center justify-center bg-muted/50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold">¡Bienvenido!</h2>
              <p className="text-muted-foreground mt-2 max-w-md">
                Seleccione un plan de estudios del panel lateral o cree uno nuevo para comenzar.
              </p>
              <Button className="mt-6" onClick={handleCreateSyllabus} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <FilePlus className="mr-2" />
                )}
                Crear Mi Primer Plan
              </Button>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

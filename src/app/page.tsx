'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SyllabusForm } from '@/components/syllabus-form';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, FilePlus, Trash2, Menu } from 'lucide-react';
import type { Syllabus } from '@/types/syllabus';
import {
  createSyllabusAction,
  deleteSyllabusAction,
  getSyllabusesAction,
  saveSyllabusAction,
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
} from '@/components/ui/sidebar';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.uid) {
      setIsDataLoading(true);
      getSyllabusesAction(user.uid)
        .then(({ syllabuses: loadedSyllabuses, error }) => {
          if (error) {
            toast({ variant: 'destructive', title: 'Error al cargar datos', description: error });
          } else {
            setSyllabuses(loadedSyllabuses);
            if (loadedSyllabuses.length > 0) {
              setSelectedSyllabusId(loadedSyllabuses[0].id!);
            } else {
              setSelectedSyllabusId(null);
            }
          }
        })
        .finally(() => setIsDataLoading(false));
    } else if (!loading) {
      setIsDataLoading(false);
    }
  }, [user, loading, toast]);
  
  const selectedSyllabus = useMemo(() => {
    return syllabuses.find(s => s.id === selectedSyllabusId) || null;
  }, [syllabuses, selectedSyllabusId]);

  const handleCreateSyllabus = async () => {
    if (!user) return;
    setIsCreating(true);
    const authorName = user.displayName || user.email || 'Desconocido';
    const { syllabus: newSyllabus, error } = await createSyllabusAction(user.uid, authorName);
    if (error || !newSyllabus) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error || 'No se pudo crear el plan de estudios.',
      });
    } else {
      setSyllabuses((prev) => [...prev, newSyllabus]);
      setSelectedSyllabusId(newSyllabus.id!);
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
      if (selectedSyllabusId === syllabusId) {
        setSelectedSyllabusId(newSyllabuses.length > 0 ? newSyllabuses[0].id! : null);
      }
      toast({ title: 'Éxito', description: 'Plan de estudios eliminado.' });
    }
  };

  const handleSelectSyllabus = (syllabusId: string) => {
    setSelectedSyllabusId(syllabusId);
  };

  const handleSyllabusChange = (updatedSyllabus: Syllabus) => {
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
            {isDataLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              syllabuses.map((syllabus) => (
                <SidebarMenuItem key={syllabus.id}>
                  <SidebarMenuButton
                    isActive={selectedSyllabusId === syllabus.id}
                    onClick={() => handleSelectSyllabus(syllabus.id!)}
                    className="justify-between"
                  >
                    <span className="truncate">{syllabus.courseName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSyllabus(syllabus.id!);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </SidebarMenuButton>
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
          <div className="flex items-center gap-2 p-3 border-t text-sm">
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

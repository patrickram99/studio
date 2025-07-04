'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getAllSyllabusesAction,
  getAllUsersAction,
} from '@/app/actions';
import { useAuth } from '@/context/auth-context';
import type { Syllabus, UserData } from '@/types/syllabus';
import { Loader2, ArrowLeft, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllSyllabusesAction(), getAllUsersAction()])
      .then(([{ syllabuses: allSyllabuses }, { users: allUsers }]) => {
        setSyllabuses(allSyllabuses);
        setUsers(allUsers);
      })
      .finally(() => setLoading(false));
  }, []);

  const syllabusesByUser = useMemo(() => {
    const userMap = new Map(users.map(u => [u.uid, u]));
    return syllabuses.reduce((acc, syllabus) => {
      const author = userMap.get(syllabus.userId!) || { uid: 'unknown', email: 'Usuario Desconocido' };
      if (!acc[author.uid]) {
        acc[author.uid] = {
          user: author,
          syllabuses: [],
        };
      }
      acc[author.uid].syllabuses.push(syllabus);
      return acc;
    }, {} as Record<string, { user: UserData; syllabuses: Syllabus[] }>);
  }, [syllabuses, users]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Panel de Administración</h1>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2" /> Volver al Editor
            </Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle>Todos los Planes de Estudio</CardTitle>
                <CardDescription>Vea y gestione todos los planes de estudio del sistema, agrupados por usuario.</CardDescription>
            </CardHeader>
            <CardContent>
                {Object.keys(syllabusesByUser).length === 0 ? (
                    <p className="text-center text-muted-foreground">No se han creado planes de estudio todavía.</p>
                ) : (
                <Accordion type="single" collapsible className="w-full">
                    {Object.values(syllabusesByUser).map(({ user, syllabuses }) => (
                        <AccordionItem value={user.uid} key={user.uid}>
                            <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                                <div className="flex items-center gap-2">
                                    <Users className="text-primary" />
                                    <span className="font-semibold">{user.displayName || user.email}</span>
                                    <span className="text-sm text-muted-foreground">({syllabuses.length} planes)</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-2 p-4">
                                    {syllabuses.map(s => (
                                        <li key={s.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                                           <div>
                                                <p className="font-medium text-primary-foreground">{s.courseName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Última actualización: {format(s.updateDate, "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                                                </p>
                                            </div>
                                            <Button size="sm" asChild>
                                                <Link href={`/?syllabusId=${s.id}`}>
                                                    <FileText className="mr-2" /> Editar
                                                </Link>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SyllabusForm } from '@/components/syllabus-form';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-10">
        <div className="text-left">
          <h1 className="text-4xl font-bold font-headline text-primary-foreground">Plan de Estudio Fácil</h1>
          <p className="text-muted-foreground mt-2">
            Crea y gestiona los planes de estudio de tus cursos de forma sencilla e intuitiva.
          </p>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
            </Button>
        </div>
      </header>
      <SyllabusForm />
    </main>
  );
}

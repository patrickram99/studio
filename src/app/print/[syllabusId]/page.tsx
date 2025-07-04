'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Loader2, ShieldAlert } from 'lucide-react';

import { useAuth } from '@/context/auth-context';
import { getSyllabusByIdAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { PrintableSyllabus } from '@/components/printable-syllabus';
import type { Syllabus } from '@/types/syllabus';

export default function PrintPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const syllabusId = params.syllabusId as string;

  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    if (syllabusId) {
      getSyllabusByIdAction(syllabusId)
        .then(({ syllabus: data, error: fetchError }) => {
          if (fetchError) {
            setError(fetchError);
          } else if (data?.userId !== user.uid) {
            setError('No tiene permiso para ver este plan de estudios.');
          } else {
            setSyllabus(data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [syllabusId, user, authLoading, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2" />
            Volver al Inicio
          </Link>
        </Button>
      </div>
    );
  }

  if (!syllabus) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
        <h1 className="text-2xl font-bold mb-2">Plan de Estudios no Encontrado</h1>
         <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2" />
            Volver al Inicio
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card p-4 shadow-sm sticky top-0 z-10 no-print">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2" />
                Volver
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">Vista de Impresión</h1>
          </div>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="mr-2" />
            Imprimir o Guardar como PDF
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-white p-8 md:p-12 shadow-lg rounded-lg">
          <PrintableSyllabus syllabus={syllabus} />
        </div>
      </main>
    </div>
  );
}

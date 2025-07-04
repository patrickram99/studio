import { SyllabusForm } from '@/components/syllabus-form';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline text-primary-foreground">Plan de Estudio Fácil</h1>
        <p className="text-muted-foreground mt-2">
          Crea y gestiona los planes de estudio de tus cursos de forma sencilla e intuitiva.
        </p>
      </header>
      <SyllabusForm />
    </main>
  );
}

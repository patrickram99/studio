'use client';

import { useState, ChangeEvent, useCallback, useMemo } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileSignature,
  FileText,
  FlaskConical,
  GraduationCap,
  KeyRound,
  Library,
  ListTree,
  Loader2,
  PlusCircle,
  Quote,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { format } from "date-fns";
import { es } from "date-fns/locale";


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { validateReferenceAction } from '@/app/actions';
import type { ValidateApaReferenceOutput } from '@/ai/flows/validate-apa-reference';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Week {
  id: number;
  topic: string;
  activities: string;
  evidence: string;
}

interface LearningUnit {
  id: number;
  name: string;
  weeks: Week[];
}

export function SyllabusForm() {
  const { toast } = useToast();
  
  // State for all form fields
  const [courseName, setCourseName] = useState('Introducción a la Inteligencia Artificial');
  const [courseKey, setCourseKey] = useState('CS401');
  const [credits, setCredits] = useState('8');
  const [theoryHours, setTheoryHours] = useState('4');
  const [practiceHours, setPracticeHours] = useState('4');
  const [author, setAuthor] = useState('Claude Shannon');

  const [creationDate, setCreationDate] = useState<Date | undefined>(new Date());
  const [updateDate, setUpdateDate] = useState<Date | undefined>(new Date());

  const [graduateCompetency, setGraduateCompetency] = useState('Diseña y desarrolla sistemas inteligentes que resuelven problemas complejos en diversos dominios, considerando implicaciones éticas y sociales.');
  const [courseCompetency, setCourseCompetency] = useState('Aplica los principios fundamentales del aprendizaje automático para construir y evaluar modelos predictivos, y comprende los algoritmos básicos de la IA.');
  const [prerequisites, setPrerequisites] = useState('Conocimientos sólidos de programación (Python), álgebra lineal, probabilidad y estadística.');
  const [summary, setSummary] = useState('Este curso ofrece una introducción completa a los conceptos y técnicas de la inteligencia artificial. Los temas incluyen agentes inteligentes, búsqueda, representación del conocimiento, incertidumbre, aprendizaje automático y procesamiento del lenguaje natural.');

  const [learningUnits, setLearningUnits] = useState<LearningUnit[]>([
    {
      id: 1,
      name: 'Introducción a la IA y Agentes Inteligentes',
      weeks: [
        { id: 1, topic: 'Historia y fundamentos de la IA', activities: 'Clase teórica y debate sobre el futuro de la IA.', evidence: 'Ensayo corto.' },
        { id: 2, topic: 'Agentes inteligentes', activities: 'Diseño de un agente simple en pseudocódigo.', evidence: 'Diagrama de agente.' },
      ],
    },
    {
      id: 2,
      name: 'Resolución de problemas con búsqueda',
      weeks: [
        { id: 3, topic: 'Búsqueda no informada (BFS, DFS)', activities: 'Ejercicios de implementación de algoritmos de búsqueda.', evidence: 'Código de algoritmos de búsqueda.' },
      ],
    },
  ]);

  const [methodology, setMethodology] = useState('ABP');
  const [customMethodology, setCustomMethodology] = useState('');

  const [apaReference, setApaReference] = useState('Russell, S. J., & Norvig, P. (2020). Artificial intelligence: A modern approach (4th ed.). Pearson.');
  const [validationResult, setValidationResult] = useState<ValidateApaReferenceOutput | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  const totalWeeks = useMemo(() => learningUnits.reduce((acc, unit) => acc + unit.weeks.length, 0), [learningUnits]);

  const handleAddWeek = useCallback((unitIndex: number) => {
    setLearningUnits(prevUnits => {
      const newUnits = [...prevUnits];
      const unit = newUnits[unitIndex];
      const newWeekNumber = totalWeeks + 1;
      const isExamWeek = newWeekNumber === 9;

      unit.weeks.push({
        id: Date.now(),
        topic: isExamWeek ? 'Examen Parcial' : '',
        activities: isExamWeek ? 'Evaluación de los conocimientos de la unidad.' : '',
        evidence: isExamWeek ? 'Examen resuelto.' : '',
      });
      
      if(isExamWeek) {
        toast({
            title: "Semana de Examen Parcial Agregada",
            description: "La semana 9 se ha populado automáticamente como 'Examen Parcial'.",
        });
      }

      return newUnits;
    });
  }, [totalWeeks, toast]);

  const handleDeleteWeek = useCallback((unitIndex: number, weekId: number) => {
    setLearningUnits(prevUnits =>
      prevUnits.map((unit, uIndex) => {
        if (uIndex === unitIndex) {
          return {
            ...unit,
            weeks: unit.weeks.filter(week => week.id !== weekId),
          };
        }
        return unit;
      })
    );
  }, []);

  const handleWeekChange = (unitIndex: number, weekId: number, field: keyof Week, value: string) => {
    setLearningUnits(prevUnits =>
      prevUnits.map((unit, uIndex) => {
        if (uIndex === unitIndex) {
          return {
            ...unit,
            weeks: unit.weeks.map(week => {
              if (week.id === weekId) {
                return { ...week, [field]: value };
              }
              return week;
            }),
          };
        }
        return unit;
      })
    );
  };

  const handleUnitNameChange = (unitIndex: number, newName: string) => {
    setLearningUnits(prevUnits =>
      prevUnits.map((unit, uIndex) =>
        uIndex === unitIndex ? { ...unit, name: newName } : unit
      )
    );
  };

  const handleAddUnit = () => {
    setLearningUnits(prevUnits => [
      ...prevUnits,
      {
        id: Date.now(),
        name: `Unidad de Aprendizaje ${prevUnits.length + 1}`,
        weeks: [],
      },
    ]);
  };
  
  const handleDeleteUnit = (unitId: number) => {
    setLearningUnits(prevUnits => prevUnits.filter(unit => unit.id !== unitId));
  };


  const handleSignatureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleValidateReference = async () => {
    setIsValidating(true);
    setValidationResult(null);
    const result = await validateReferenceAction(apaReference);
    setValidationResult(result);
    setIsValidating(false);
  };

  return (
    <div className="space-y-8">
      {/* General Course Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="text-primary" />
            Información General del Curso
          </CardTitle>
          <CardDescription>
            Proporcione los detalles básicos del curso. Todos los campos son en Español.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="courseName" className="flex items-center gap-2"><BookOpen size={16} />Nombre del curso</Label>
            <Input id="courseName" placeholder="Ej. Cálculo Diferencial" value={courseName} onChange={e => setCourseName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courseKey" className="flex items-center gap-2"><KeyRound size={16} />Clave</Label>
            <Input id="courseKey" placeholder="Ej. 1011" value={courseKey} onChange={e => setCourseKey(e.target.value)}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="credits" className="flex items-center gap-2"><Sparkles size={16} />Créditos</Label>
            <Input id="credits" type="number" placeholder="Ej. 8" value={credits} onChange={e => setCredits(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theoryHours" className="flex items-center gap-2"><BookOpen size={16} />Horas teóricas</Label>
            <Input id="theoryHours" type="number" placeholder="Ej. 4" value={theoryHours} onChange={e => setTheoryHours(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="practiceHours" className="flex items-center gap-2"><FlaskConical size={16} />Horas prácticas</Label>
            <Input id="practiceHours" type="number" placeholder="Ej. 2" value={practiceHours} onChange={e => setPracticeHours(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author" className="flex items-center gap-2"><User size={16} />Elaboró</Label>
            <Input id="author" placeholder="Nombre del profesor" value={author} onChange={e => setAuthor(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><CalendarDays size={16} />Fecha de elaboración</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !creationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {creationDate ? format(creationDate, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={creationDate} onSelect={setCreationDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><CalendarDays size={16} />Fecha de última actualización</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !updateDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {updateDate ? format(updateDate, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={updateDate} onSelect={setUpdateDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Competencies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="text-primary" />
            Gestión de Competencias
          </CardTitle>
          <CardDescription>Defina las competencias del perfil de egreso y del curso.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="graduateCompetency" className="flex items-center gap-2"><GraduationCap size={16} />Competencia del Perfil de Egreso</Label>
            <Textarea id="graduateCompetency" placeholder="Describa la competencia del perfil de egreso..." rows={4} value={graduateCompetency} onChange={e => setGraduateCompetency(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courseCompetency" className="flex items-center gap-2"><BookOpen size={16} />Competencia del Curso</Label>
            <Textarea id="courseCompetency" placeholder="Describa la competencia específica del curso..." rows={4} value={courseCompetency} onChange={e => setCourseCompetency(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      
      {/* Prerequisites and Summary */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ClipboardList className="text-primary" />
                Resumen y Prerrequisitos
            </CardTitle>
            <CardDescription>Detalle las competencias previas y un resumen del contenido del curso.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="prerequisites" className="flex items-center gap-2"><ListTree size={16} />Competencias Previas Requeridas</Label>
                <Textarea id="prerequisites" placeholder="Ej. Conocimientos básicos de álgebra." rows={4} value={prerequisites} onChange={e => setPrerequisites(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="summary" className="flex items-center gap-2"><FileText size={16} />Resumen del Curso</Label>
                <Textarea id="summary" placeholder="Proporcione un resumen conciso del curso..." rows={4} value={summary} onChange={e => setSummary(e.target.value)} />
            </div>
        </CardContent>
      </Card>
      
      {/* Learning Units */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="text-primary" />
            Unidades de Aprendizaje
          </CardTitle>
          <CardDescription>
            Agregue y gestione las semanas de aprendizaje para cada unidad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {learningUnits.map((unit, unitIndex) => (
            <div key={unit.id} className="p-4 border rounded-lg space-y-4 bg-background/50">
              <div className="flex items-center justify-between">
                <Input 
                    value={unit.name}
                    onChange={(e) => handleUnitNameChange(unitIndex, e.target.value)}
                    className="text-lg font-semibold flex-grow mr-4 border-0 shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center gap-2">
                    <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAddWeek(unitIndex)}
                    aria-label="Agregar Semana"
                    >
                        <PlusCircle size={16} />
                    </Button>
                    {learningUnits.length > 1 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteUnit(unit.id)}
                        aria-label="Eliminar Unidad"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                </div>
              </div>

              {unit.weeks.map((week, weekIndex) => (
                <div key={week.id} className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-start p-3 border-l-4 border-primary rounded-r-md bg-card">
                  <div className="flex md:flex-col items-center gap-2">
                    <span className="text-sm font-bold text-primary">Semana {learningUnits.slice(0, unitIndex).reduce((acc, u) => acc + u.weeks.length, 0) + weekIndex + 1}</span>
                    <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => handleDeleteWeek(unitIndex, week.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
                    <div className="space-y-1">
                      <Label htmlFor={`topic-${week.id}`}>Tema/Subtema</Label>
                      <Input id={`topic-${week.id}`} value={week.topic} onChange={(e) => handleWeekChange(unitIndex, week.id, 'topic', e.target.value)} placeholder="Tema de la semana"/>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`activities-${week.id}`}>Actividades</Label>
                      <Input id={`activities-${week.id}`} value={week.activities} onChange={(e) => handleWeekChange(unitIndex, week.id, 'activities', e.target.value)} placeholder="Actividades de aprendizaje"/>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`evidence-${week.id}`}>Evidencias</Label>
                      <Input id={`evidence-${week.id}`} value={week.evidence} onChange={(e) => handleWeekChange(unitIndex, week.id, 'evidence', e.target.value)} placeholder="Evidencias de aprendizaje"/>
                    </div>
                  </div>
                </div>
              ))}
               {unit.weeks.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No hay semanas en esta unidad. ¡Agregue una!</p>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={handleAddUnit} className="w-full">
            <PlusCircle size={16} className="mr-2" />
            Agregar Unidad de Aprendizaje
          </Button>
        </CardContent>
      </Card>

      {/* Methodology and References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="text-primary" />
            Metodología y Referencias
          </CardTitle>
          <CardDescription>Seleccione una metodología y valide sus referencias en formato APA.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="methodology">Metodología</Label>
              <Select onValueChange={setMethodology} value={methodology}>
                <SelectTrigger id="methodology">
                  <SelectValue placeholder="Seleccione una metodología" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ABP">Aprendizaje Basado en Proyectos</SelectItem>
                  <SelectItem value="ABPr">Aprendizaje Basado en Problemas</SelectItem>
                  <SelectItem value="EC">Estudio de Caso</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {methodology === 'Otro' && (
              <div className="space-y-2 animate-in fade-in">
                <Label htmlFor="customMethodology">Especifique la metodología</Label>
                <Input id="customMethodology" value={customMethodology} onChange={e => setCustomMethodology(e.target.value)} placeholder="Metodología personalizada" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apaReference" className="flex items-center gap-2"><Quote size={16}/>Referencia Bibliográfica (APA)</Label>
              <Textarea id="apaReference" value={apaReference} onChange={e => setApaReference(e.target.value)} placeholder="Pegue aquí su referencia en formato APA 7 para validación..." rows={4} />
            </div>
            <Button onClick={handleValidateReference} disabled={isValidating}>
              {isValidating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validando...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Validar con IA</>
              )}
            </Button>
            {validationResult && (
              <Alert variant={validationResult.isValid ? 'default' : 'destructive'} className={cn(validationResult.isValid && 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600')}>
                {validationResult.isValid ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>{validationResult.isValid ? 'Referencia Válida' : 'Referencia Inválida'}</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">{validationResult.feedback}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="text-primary" />
            Firma del Docente
          </CardTitle>
          <CardDescription>Cargue una imagen de su firma para incluirla en el documento final.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
            <Label htmlFor="signature-upload" className="flex flex-col items-center justify-center w-full md:w-1/2 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click para cargar</span> o arrastre y suelte</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 800x400px)</p>
                </div>
                <Input id="signature-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleSignatureChange} />
            </Label>
            {signaturePreview && (
            <div className="w-full md:w-1/2">
                <p className="text-sm font-medium mb-2">Vista Previa:</p>
                <div className="border rounded-md p-4 flex justify-center items-center bg-white">
                    <Image src={signaturePreview} alt="Vista previa de la firma" width={200} height={100} style={{ objectFit: 'contain' }} />
                </div>
            </div>
            )}
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-8">
        <Button size="lg">
          Generar y Exportar PDF
        </Button>
      </div>

    </div>
  );
}

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
  Printer,
  Quote,
  Save,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
import type { Syllabus, Week } from '@/types/syllabus';

interface SyllabusFormProps {
  syllabus: Syllabus;
  onSyllabusChange: (updatedSyllabus: Syllabus) => void;
  onSave: (syllabusToSave: Syllabus) => Promise<{ success: boolean; error?: string }>;
}

export function SyllabusForm({ syllabus, onSyllabusChange, onSave }: SyllabusFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidateApaReferenceOutput | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleFieldChange = (field: keyof Syllabus, value: any) => {
    onSyllabusChange({ ...syllabus, [field]: value });
  };

  const totalWeeks = useMemo(
    () => syllabus.learningUnits.reduce((acc, unit) => acc + unit.weeks.length, 0),
    [syllabus.learningUnits]
  );

  const handleAddWeek = useCallback(
    (unitIndex: number) => {
      const newUnits = JSON.parse(JSON.stringify(syllabus.learningUnits));
      const unit = newUnits[unitIndex];
      const newWeekNumber = totalWeeks + 1;
      const isExamWeek = newWeekNumber === 9 || newWeekNumber === 18;

      unit.weeks.push({
        id: Date.now(),
        topic: isExamWeek ? `Examen ${newWeekNumber === 9 ? 'Parcial' : 'Final'}` : '',
        activities: isExamWeek ? 'Evaluación de los conocimientos.' : '',
        evidence: isExamWeek ? 'Examen resuelto.' : '',
      });

      if (isExamWeek) {
        toast({
          title: `Semana de Examen Agregada`,
          description: `La semana ${newWeekNumber} se ha populado automáticamente.`,
        });
      }

      onSyllabusChange({ ...syllabus, learningUnits: newUnits });
    },
    [syllabus, totalWeeks, toast, onSyllabusChange]
  );

  const handleDeleteWeek = useCallback(
    (unitIndex: number, weekId: number) => {
      const newLearningUnits = syllabus.learningUnits.map((unit, uIndex) => {
        if (uIndex === unitIndex) {
          return {
            ...unit,
            weeks: unit.weeks.filter((week) => week.id !== weekId),
          };
        }
        return unit;
      });
      onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });
    },
    [syllabus, onSyllabusChange]
  );

  const handleWeekChange = (unitIndex: number, weekId: number, field: keyof Week, value: string) => {
    const newLearningUnits = syllabus.learningUnits.map((unit, uIndex) => {
      if (uIndex === unitIndex) {
        return {
          ...unit,
          weeks: unit.weeks.map((week) => {
            if (week.id === weekId) {
              return { ...week, [field]: value };
            }
            return week;
          }),
        };
      }
      return unit;
    });
    onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });
  };

  const handleUnitNameChange = (unitIndex: number, newName: string) => {
    const newLearningUnits = syllabus.learningUnits.map((unit, uIndex) =>
      uIndex === unitIndex ? { ...unit, name: newName } : unit
    );
    onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });
  };

  const handleAddUnit = () => {
    const newLearningUnits = [
      ...syllabus.learningUnits,
      {
        id: Date.now(),
        name: `Unidad de Aprendizaje ${syllabus.learningUnits.length + 1}`,
        weeks: [],
      },
    ];
    onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });
  };

  const handleDeleteUnit = (unitId: number) => {
    const newLearningUnits = syllabus.learningUnits.filter((unit) => unit.id !== unitId);
    onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });
  };

  const handleSignatureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSyllabusChange({ ...syllabus, signaturePreview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleValidateReference = async () => {
    setIsValidating(true);
    setValidationResult(null);
    const result = await validateReferenceAction(syllabus.apaReference);
    setValidationResult(result);
    setIsValidating(false);
  };

  const handleSave = async () => {
    if (!syllabus.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se puede guardar un plan de estudios sin ID.',
      });
      return;
    }
    setIsSaving(true);
    const result = await onSave(syllabus);
    if (result.success) {
      toast({ title: 'Éxito', description: 'Plan de estudios guardado correctamente.' });
    } else {
      toast({ variant: 'destructive', title: 'Error al guardar', description: result.error });
    }
    setIsSaving(false);
  };
  
  const handleExportPdf = useCallback(() => {
    const missingFields: string[] = [];
    const {
      courseName, courseKey, credits, theoryHours, practiceHours, author,
      graduateCompetency, courseCompetency, prerequisites, summary,
      learningUnits, methodology, customMethodology, apaReference
    } = syllabus;

    if (!courseName.trim()) missingFields.push('Nombre del curso');
    if (!courseKey.trim()) missingFields.push('Clave');
    if (!credits.trim()) missingFields.push('Créditos');
    if (!theoryHours.trim()) missingFields.push('Horas teóricas');
    if (!practiceHours.trim()) missingFields.push('Horas prácticas');
    if (!author.trim()) missingFields.push('Elaboró');
    if (!graduateCompetency.trim()) missingFields.push('Competencia del Perfil de Egreso');
    if (!courseCompetency.trim()) missingFields.push('Competencia del Curso');
    if (!prerequisites.trim()) missingFields.push('Competencias Previas Requeridas');
    if (!summary.trim()) missingFields.push('Resumen del Curso');
    if (!methodology) missingFields.push('Metodología');
    if (methodology === 'Otro' && !customMethodology.trim()) {
      missingFields.push('Especifique la metodología');
    }
    if (!apaReference.trim()) missingFields.push('Referencia Bibliográfica (APA)');

    if (learningUnits.length === 0) {
      missingFields.push('Unidades de Aprendizaje');
    } else {
      let unitError = false;
      for (const unit of learningUnits) {
        if (!unit.name.trim() || unit.weeks.length === 0) {
          unitError = true;
          break;
        }
        for (const week of unit.weeks) {
          if (!week.topic.trim() || !week.activities.trim() || !week.evidence.trim()) {
            unitError = true;
            break;
          }
        }
        if (unitError) break;
      }
      if (unitError) {
        missingFields.push('Todas las Unidades de Aprendizaje y sus semanas deben estar completas');
      }
    }

    if (missingFields.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Faltan campos por llenar',
        description: `Por favor, complete los siguientes campos: ${missingFields.slice(0, 4).join(', ')}${missingFields.length > 4 ? '...' : '.'}`,
      });
    } else {
      window.open(`/print/${syllabus.id}`, '_blank');
    }
  }, [syllabus, toast]);

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
            <Label htmlFor="courseName" className="flex items-center gap-2">
              <BookOpen size={16} />
              Nombre del curso
            </Label>
            <Input
              id="courseName"
              placeholder="Ej. Cálculo Diferencial"
              value={syllabus.courseName}
              onChange={(e) => handleFieldChange('courseName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courseKey" className="flex items-center gap-2">
              <KeyRound size={16} />
              Clave
            </Label>
            <Input
              id="courseKey"
              placeholder="Ej. 1011"
              value={syllabus.courseKey}
              onChange={(e) => handleFieldChange('courseKey', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="credits" className="flex items-center gap-2">
              <Sparkles size={16} />
              Créditos
            </Label>
            <Input
              id="credits"
              type="number"
              placeholder="Ej. 8"
              value={syllabus.credits}
              onChange={(e) => handleFieldChange('credits', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theoryHours" className="flex items-center gap-2">
              <BookOpen size={16} />
              Horas teóricas
            </Label>
            <Input
              id="theoryHours"
              type="number"
              placeholder="Ej. 4"
              value={syllabus.theoryHours}
              onChange={(e) => handleFieldChange('theoryHours', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="practiceHours" className="flex items-center gap-2">
              <FlaskConical size={16} />
              Horas prácticas
            </Label>
            <Input
              id="practiceHours"
              type="number"
              placeholder="Ej. 2"
              value={syllabus.practiceHours}
              onChange={(e) => handleFieldChange('practiceHours', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author" className="flex items-center gap-2">
              <User size={16} />
              Elaboró
            </Label>
            <Input
              id="author"
              placeholder="Nombre del profesor"
              value={syllabus.author}
              onChange={(e) => handleFieldChange('author', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarDays size={16} />
              Fecha de elaboración
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !syllabus.creationDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {syllabus.creationDate ? (
                    format(new Date(syllabus.creationDate), 'PPP', { locale: es })
                  ) : (
                    <span>Seleccione una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(syllabus.creationDate)}
                  onSelect={(date) => handleFieldChange('creationDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarDays size={16} />
              Fecha de última actualización
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !syllabus.updateDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {syllabus.updateDate ? (
                    format(new Date(syllabus.updateDate), 'PPP', { locale: es })
                  ) : (
                    <span>Seleccione una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(syllabus.updateDate)}
                  onSelect={(date) => handleFieldChange('updateDate', date)}
                  initialFocus
                />
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
            <Label htmlFor="graduateCompetency" className="flex items-center gap-2">
              <GraduationCap size={16} />
              Competencia del Perfil de Egreso
            </Label>
            <Textarea
              id="graduateCompetency"
              placeholder="Describa la competencia del perfil de egreso..."
              rows={4}
              value={syllabus.graduateCompetency}
              onChange={(e) => handleFieldChange('graduateCompetency', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courseCompetency" className="flex items-center gap-2">
              <BookOpen size={16} />
              Competencia del Curso
            </Label>
            <Textarea
              id="courseCompetency"
              placeholder="Describa la competencia específica del curso..."
              rows={4}
              value={syllabus.courseCompetency}
              onChange={(e) => handleFieldChange('courseCompetency', e.target.value)}
            />
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
          <CardDescription>
            Detalle las competencias previas y un resumen del contenido del curso.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="prerequisites" className="flex items-center gap-2">
              <ListTree size={16} />
              Competencias Previas Requeridas
            </Label>
            <Textarea
              id="prerequisites"
              placeholder="Ej. Conocimientos básicos de álgebra."
              rows={4}
              value={syllabus.prerequisites}
              onChange={(e) => handleFieldChange('prerequisites', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary" className="flex items-center gap-2">
              <FileText size={16} />
              Resumen del Curso
            </Label>
            <Textarea
              id="summary"
              placeholder="Proporcione un resumen conciso del curso..."
              rows={4}
              value={syllabus.summary}
              onChange={(e) => handleFieldChange('summary', e.target.value)}
            />
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
          <CardDescription>Agregue y gestione las semanas de aprendizaje para cada unidad.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {syllabus.learningUnits.map((unit, unitIndex) => (
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
                  {syllabus.learningUnits.length > 1 && (
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
                <div
                  key={week.id}
                  className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-start p-3 border-l-4 border-primary rounded-r-md bg-card"
                >
                  <div className="flex md:flex-col items-center gap-2">
                    <span className="text-sm font-bold text-primary">
                      Semana{' '}
                      {syllabus.learningUnits
                        .slice(0, unitIndex)
                        .reduce((acc, u) => acc + u.weeks.length, 0) +
                        weekIndex +
                        1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-7 w-7"
                      onClick={() => handleDeleteWeek(unitIndex, week.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
                    <div className="space-y-1">
                      <Label htmlFor={`topic-${week.id}`}>Tema/Subtema</Label>
                      <Input
                        id={`topic-${week.id}`}
                        value={week.topic}
                        onChange={(e) =>
                          handleWeekChange(unitIndex, week.id, 'topic', e.target.value)
                        }
                        placeholder="Tema de la semana"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`activities-${week.id}`}>Actividades</Label>
                      <Input
                        id={`activities-${week.id}`}
                        value={week.activities}
                        onChange={(e) =>
                          handleWeekChange(unitIndex, week.id, 'activities', e.target.value)
                        }
                        placeholder="Actividades de aprendizaje"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`evidence-${week.id}`}>Evidencias</Label>
                      <Input
                        id={`evidence-${week.id}`}
                        value={week.evidence}
                        onChange={(e) =>
                          handleWeekChange(unitIndex, week.id, 'evidence', e.target.value)
                        }
                        placeholder="Evidencias de aprendizaje"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {unit.weeks.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No hay semanas en esta unidad. ¡Agregue una!
                </p>
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
          <CardDescription>
            Seleccione una metodología y valide sus referencias en formato APA.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="methodology">Metodología</Label>
              <Select
                onValueChange={(value) => handleFieldChange('methodology', value)}
                value={syllabus.methodology}
              >
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
            {syllabus.methodology === 'Otro' && (
              <div className="space-y-2 animate-in fade-in">
                <Label htmlFor="customMethodology">Especifique la metodología</Label>
                <Input
                  id="customMethodology"
                  value={syllabus.customMethodology}
                  onChange={(e) => handleFieldChange('customMethodology', e.target.value)}
                  placeholder="Metodología personalizada"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apaReference" className="flex items-center gap-2">
                <Quote size={16} />
                Referencia Bibliográfica (APA)
              </Label>
              <Textarea
                id="apaReference"
                value={syllabus.apaReference}
                onChange={(e) => handleFieldChange('apaReference', e.target.value)}
                placeholder="Pegue aquí su referencia en formato APA 7 para validación..."
                rows={4}
              />
            </div>
            <Button onClick={handleValidateReference} disabled={isValidating}>
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Validar con IA
                </>
              )}
            </Button>
            {validationResult && (
              <Alert
                variant={validationResult.isValid ? 'default' : 'destructive'}
                className={cn(
                  validationResult.isValid && 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600'
                )}
              >
                {validationResult.isValid ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>{validationResult.isValid ? 'Referencia Válida' : 'Referencia Inválida'}</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">
                  {validationResult.feedback}
                </AlertDescription>
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
          <CardDescription>
            Cargue una imagen de su firma para incluirla en el documento final.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          <Label
            htmlFor="signature-upload"
            className="flex flex-col items-center justify-center w-full md:w-1/2 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click para cargar</span> o arrastre y suelte
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 800x400px)</p>
            </div>
            <Input
              id="signature-upload"
              type="file"
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={handleSignatureChange}
            />
          </Label>
          {syllabus.signaturePreview && (
            <div className="w-full md:w-1/2">
              <p className="text-sm font-medium mb-2">Vista Previa:</p>
              <div className="border rounded-md p-4 flex justify-center items-center bg-white">
                <Image
                  src={syllabus.signaturePreview}
                  alt="Vista previa de la firma"
                  width={200}
                  height={100}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end mt-8 gap-4">
        <Button size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save />}
          {isSaving ? 'Guardando...' : 'Guardar Progreso'}
        </Button>
        <Button size="lg" onClick={handleExportPdf}>
            <Printer className="mr-2" />
            Generar y Exportar PDF
        </Button>
      </div>
    </div>
  );
}

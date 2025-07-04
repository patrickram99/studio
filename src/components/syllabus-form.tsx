'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileSignature,
  FlaskConical,
  GraduationCap,
  Library,
  Loader2,
  PlusCircle,
  Printer,
  Quote,
  Save,
  Sparkles,
  Trash2,
  Upload,
  Users,
  XCircle,
  Percent,
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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Syllabus, Week, LearningUnit, EvaluationCriterion, UserData } from '@/types/syllabus';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from './ui/table';
import { useAuth } from '@/context/auth-context';

interface SyllabusFormProps {
  syllabus: Syllabus;
  allUsers: UserData[];
  onSyllabusChange: (updatedSyllabus: Syllabus) => void;
  onSave: (syllabusToSave: Syllabus) => Promise<{ success: boolean; error?: string }>;
}

export function SyllabusForm({ syllabus, allUsers, onSyllabusChange, onSave }: SyllabusFormProps) {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [validatingUnitIndex, setValidatingUnitIndex] = useState<number | null>(null);

  const handleFieldChange = (field: keyof Syllabus, value: any) => {
    onSyllabusChange({ ...syllabus, [field]: value });
  };

  const handleNestedFieldChange = (field: keyof Syllabus, subField: string, value: any) => {
    onSyllabusChange({ 
      ...syllabus, 
      [field]: {
        ...(syllabus[field] as any),
        [subField]: value
      } 
    });
  };
  
  const totalEvaluationWeight = useMemo(() => {
    return (syllabus.evaluationCriteria || []).reduce((total, criterion) => total + (Number(criterion.weight) || 0), 0);
  }, [syllabus.evaluationCriteria]);


  // Learning Unit Handlers
  const handleUnitChange = (unitIndex: number, field: keyof LearningUnit, value: any) => {
    const newLearningUnits = (syllabus.learningUnits || []).map((unit, uIndex) =>
      uIndex === unitIndex ? { ...unit, [field]: value } : unit
    );
    onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });
  };

  const handleAddUnit = () => {
    const currentUnits = syllabus.learningUnits || [];
    const newLearningUnits = [
      ...currentUnits,
      {
        id: Date.now(),
        denomination: `Unidad ${currentUnits.length + 1}`,
        startDate: null,
        endDate: null,
        studentCapacity: '',
        weeks: [],
        methodology: 'ABP',
        customMethodology: '',
        apaReference: '',
        validationResult: null,
      },
    ];
    onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });
  };

  const handleDeleteUnit = (unitId: number) => {
    const newLearningUnits = (syllabus.learningUnits || []).filter((unit) => unit.id !== unitId);
    onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });
  };

  const handleAddWeek = (unitIndex: number) => {
    const newLearningUnits = [...(syllabus.learningUnits || [])];
    if (!newLearningUnits[unitIndex]) return;
    if (!newLearningUnits[unitIndex].weeks) {
        newLearningUnits[unitIndex].weeks = [];
    }
    
    const weeks = newLearningUnits[unitIndex].weeks;
    const newWeekNumber = weeks.length + 1;
    let specificContents = '';

    if (newWeekNumber === 9) {
      specificContents = 'Examen Parcial';
    }

    weeks.push({
      id: Date.now(),
      specificContents: specificContents,
    });
    onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });
  };

  const handleDeleteWeek = (unitIndex: number, weekId: number) => {
    const newLearningUnits = [...(syllabus.learningUnits || [])];
    if (newLearningUnits[unitIndex]?.weeks) {
      newLearningUnits[unitIndex].weeks = newLearningUnits[unitIndex].weeks.filter(
        (week) => week.id !== weekId
      );
    }
    onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });
  };

  const handleWeekChange = (unitIndex: number, weekIndex: number, value: string) => {
    const newLearningUnits = [...(syllabus.learningUnits || [])];
    if (newLearningUnits[unitIndex]?.weeks?.[weekIndex]) {
      newLearningUnits[unitIndex].weeks[weekIndex].specificContents = value;
    }
    onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });
  };


  // Evaluation Criteria Handlers
  const handleCriterionChange = (critIndex: number, field: keyof EvaluationCriterion, value: any) => {
      const newCriteria = (syllabus.evaluationCriteria || []).map((crit, cIndex) =>
      cIndex === critIndex ? { ...crit, [field]: value } : crit
    );
    onSyllabusChange({ ...syllabus, evaluationCriteria: newCriteria });
  };

  const handleAddCriterion = () => {
    const newCriteria = [
      ...(syllabus.evaluationCriteria || []),
      {
        id: Date.now(),
        evaluation: '',
        weight: 0,
        instrument: '',
        date: null,
      },
    ];
    onSyllabusChange({ ...syllabus, evaluationCriteria: newCriteria });
  };

  const handleDeleteCriterion = (critId: number) => {
    const newCriteria = (syllabus.evaluationCriteria || []).filter((crit) => crit.id !== critId);
    onSyllabusChange({ ...syllabus, evaluationCriteria: newCriteria });
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSyllabusChange({ ...syllabus, signaturePreview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleValidateReference = async (unitIndex: number) => {
    setValidatingUnitIndex(unitIndex);
    const unit = (syllabus.learningUnits || [])[unitIndex];
    if (!unit) return;

    const result = await validateReferenceAction(unit.apaReference);
    
    const newLearningUnits = [...(syllabus.learningUnits || [])];
    newLearningUnits[unitIndex].validationResult = result;
    onSyllabusChange({ ...syllabus, learningUnits: newLearningUnits });

    setValidatingUnitIndex(null);
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
    if (!syllabus.facultad.trim()) missingFields.push('Facultad');
    if (!syllabus.carreraProfesional.trim()) missingFields.push('Carrera Profesional');
    if (!syllabus.periodoLectivo.trim()) missingFields.push('Periodo Lectivo');
    if (!syllabus.semestre.trim()) missingFields.push('Semestre');
    if (!syllabus.numeroDeCreditos.trim()) missingFields.push('Nro. de Créditos');
    if (!syllabus.numeroDeHoras.teoria.trim()) missingFields.push('Horas de Teoría');
    if (!syllabus.numeroDeHoras.practica.trim()) missingFields.push('Horas de Práctica');
    if (!syllabus.areaDeFormacion.trim()) missingFields.push('Área de Formación');
    if (!syllabus.codigoDelCurso.trim()) missingFields.push('Código del Curso');
    if (!syllabus.tipoDeCurso.trim()) missingFields.push('Tipo de Curso');
    if (!syllabus.preRequisito.trim()) missingFields.push('Pre Requisito');
    if (!syllabus.docente.trim()) missingFields.push('Docente');
    if (!syllabus.correo.trim()) missingFields.push('Correo');

    if (!syllabus.graduateCompetency.trim()) missingFields.push('Competencia del Perfil de Egreso');
    if (!syllabus.courseCompetency.trim()) missingFields.push('Competencia del Curso');
    if (!syllabus.summary.trim()) missingFields.push('Resumen del Curso');
    
    if (totalEvaluationWeight !== 100) missingFields.push('El peso total de evaluación debe ser 100%');
    if ((syllabus.evaluationCriteria || []).some(c => !c.evaluation.trim() || !c.instrument.trim() || !c.date)) {
        missingFields.push('Todos los campos en Criterios de Evaluación son requeridos');
    }

    if ((syllabus.learningUnits || []).length === 0) {
      missingFields.push('Al menos una Unidad de Aprendizaje');
    } else {
        let unitError = false;
        for (const unit of (syllabus.learningUnits || [])) {
            if (!unit.denomination.trim() || !unit.studentCapacity.trim() || !unit.startDate || !unit.endDate) {
                unitError = true;
                break;
            }
            if((unit.weeks || []).length === 0 || (unit.weeks || []).some(w => !w.specificContents.trim())) {
                unitError = true;
                break;
            }
            if (!unit.methodology) {
              unitError = true;
              break;
            }
            if (unit.methodology === 'Otro' && !unit.customMethodology.trim()) {
              unitError = true;
              break;
            }
            if (!unit.apaReference.trim()) {
              unitError = true;
              break;
            }
        }
        if (unitError) {
            missingFields.push('Todas las Unidades de Aprendizaje y sus subsecciones deben estar completas');
        }
    }

    if (missingFields.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Faltan campos por llenar o hay errores',
        description: `Por favor, complete lo siguiente: ${missingFields.slice(0, 4).join(', ')}${missingFields.length > 4 ? '...' : '.'}`,
      });
    } else {
      window.open(`/print/${syllabus.id}`, '_blank');
    }
  }, [syllabus, toast, totalEvaluationWeight]);

  return (
    <div className="space-y-8">
      {/* General Course Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="text-primary" />
            I. Datos Generales
          </CardTitle>
          <CardDescription>
            Proporcione los detalles básicos del curso. Todos los campos son en Español.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Col 1 */}
            <div className="md:col-span-3 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facultad">Facultad</Label>
                <Input id="facultad" value={syllabus.facultad} onChange={(e) => handleFieldChange('facultad', e.target.value)} placeholder="Ingenierías y Arquitectura" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carreraProfesional">Carrera Profesional</Label>
                <Input id="carreraProfesional" value={syllabus.carreraProfesional} onChange={(e) => handleFieldChange('carreraProfesional', e.target.value)} placeholder="Ingeniería de Software" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodoLectivo">Periodo Lectivo</Label>
                <Input id="periodoLectivo" value={syllabus.periodoLectivo} onChange={(e) => handleFieldChange('periodoLectivo', e.target.value)} placeholder="2025 - I" />
              </div>
            </div>

            {/* Col 2 */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="semestre">Semestre</Label>
                <Input id="semestre" value={syllabus.semestre} onChange={(e) => handleFieldChange('semestre', e.target.value)} placeholder="VII" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroDeCreditos">Nro. de Créditos</Label>
                <Input id="numeroDeCreditos" value={syllabus.numeroDeCreditos} onChange={(e) => handleFieldChange('numeroDeCreditos', e.target.value)} placeholder="Cuatro" />
              </div>
              <div className="space-y-2">
                <Label>Nro. de Horas</Label>
                <div className="flex gap-2">
                  <Input type="number" value={syllabus.numeroDeHoras.teoria} onChange={(e) => handleNestedFieldChange('numeroDeHoras', 'teoria', e.target.value)} placeholder="Teoría" aria-label="Horas de teoría" />
                  <Input type="number" value={syllabus.numeroDeHoras.practica} onChange={(e) => handleNestedFieldChange('numeroDeHoras', 'practica', e.target.value)} placeholder="Práctica" aria-label="Horas de práctica"/>
                </div>
              </div>
            </div>

            {/* Col 3 */}
            <div className="md:col-span-3 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="areaDeFormacion">Área de Formación</Label>
                <Input id="areaDeFormacion" value={syllabus.areaDeFormacion} onChange={(e) => handleFieldChange('areaDeFormacion', e.target.value)} placeholder="Estudios de Especialidad" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="codigoDelCurso">Código del Curso</Label>
                <Input id="codigoDelCurso" value={syllabus.codigoDelCurso} onChange={(e) => handleFieldChange('codigoDelCurso', e.target.value)} placeholder="3.7.4.21" />
              </div>
            </div>

            {/* Col 4 */}
            <div className="md:col-span-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDeCurso">Tipo de Curso</Label>
                <Input id="tipoDeCurso" value={syllabus.tipoDeCurso} onChange={(e) => handleFieldChange('tipoDeCurso', e.target.value)} placeholder="Obligatorio" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preRequisito">Pre Requisito(s)</Label>
                <Input id="preRequisito" value={syllabus.preRequisito} onChange={(e) => handleFieldChange('preRequisito', e.target.value)} placeholder="Base de Datos II" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="docente">Docente y Correo</Label>
                 <Input id="docente" value={syllabus.docente} onChange={(e) => handleFieldChange('docente', e.target.value)} placeholder="Nombre del Docente" />
                 <Input id="correo" type="email" value={syllabus.correo} onChange={(e) => handleFieldChange('correo', e.target.value)} placeholder="correo@example.com" />
              </div>
            </div>
          </div>
          {isAdmin && allUsers.length > 0 && (
            <div className="pt-4 mt-4 border-t">
              <Label htmlFor="assign-user">Asignar a Usuario (Admin)</Label>
              <Select value={syllabus.userId} onValueChange={(value) => handleFieldChange('userId', value)}>
                <SelectTrigger id="assign-user">
                  <SelectValue placeholder="Seleccionar un usuario..." />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map(u => (
                    <SelectItem key={u.uid} value={u.uid}>{u.email || u.displayName || u.uid}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
            <Label htmlFor="graduateCompetency">Competencia del Perfil de Egreso</Label>
            <Textarea
              id="graduateCompetency"
              placeholder="Describa la competencia del perfil de egreso..."
              rows={4}
              value={syllabus.graduateCompetency}
              onChange={(e) => handleFieldChange('graduateCompetency', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courseCompetency">Competencia del Curso</Label>
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
            Resumen del Curso
          </CardTitle>
          <CardDescription>
            Proporcione un resumen conciso del contenido del curso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="summary">Resumen del Curso</Label>
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
          <CardDescription>Defina las unidades, sus capacidades, semanas, metodología y fuentes de consulta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(syllabus.learningUnits || []).map((unit, unitIndex) => (
            <div key={unit.id} className="p-4 border rounded-lg space-y-6 bg-background/50">
              <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold">Unidad {unitIndex + 1}</h3>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteUnit(unit.id)} aria-label="Eliminar Unidad">
                      <Trash2 size={16} />
                  </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor={`unit-denomination-${unit.id}`}>Denominación</Label>
                      <Input id={`unit-denomination-${unit.id}`} value={unit.denomination} onChange={(e) => handleUnitChange(unitIndex, 'denomination', e.target.value)} placeholder="Tecnologías para el desarrollo web" />
                  </div>
                  <div className="space-y-2">
                      <Label>Intervalo de Fechas</Label>
                      <div className="flex items-center gap-2">
                          <Popover>
                              <PopoverTrigger asChild>
                                  <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !unit.startDate && 'text-muted-foreground')}>
                                      <CalendarDays className="mr-2 h-4 w-4" />
                                      {unit.startDate ? format(unit.startDate, 'LLL dd, y', { locale: es }) : <span>Fecha de inicio</span>}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={unit.startDate || undefined} onSelect={(date) => handleUnitChange(unitIndex, 'startDate', date)} initialFocus /></PopoverContent>
                          </Popover>
                          <span className="text-muted-foreground">-</span>
                          <Popover>
                              <PopoverTrigger asChild>
                                  <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !unit.endDate && 'text-muted-foreground')}>
                                      <CalendarDays className="mr-2 h-4 w-4" />
                                      {unit.endDate ? format(unit.endDate, 'LLL dd, y', { locale: es }) : <span>Fecha de fin</span>}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={unit.endDate || undefined} onSelect={(date) => handleUnitChange(unitIndex, 'endDate', date)} initialFocus /></PopoverContent>
                          </Popover>
                      </div>
                  </div>
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor={`unit-capacity-${unit.id}`}>Enunciado de la capacidad a ser lograda por el estudiante</Label>
                  <Textarea id={`unit-capacity-${unit.id}`} value={unit.studentCapacity} onChange={(e) => handleUnitChange(unitIndex, 'studentCapacity', e.target.value)} placeholder="El estudiante conoce y utiliza responsablemente las tecnologías..." />
              </div>
              
              {/* Weeks Section */}
              <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Semanas y Contenidos Específicos</h4>
                      <Button variant="outline" size="sm" onClick={() => handleAddWeek(unitIndex)}><PlusCircle size={14} className="mr-2" /> Agregar Semana</Button>
                  </div>
                  <div className="space-y-2">
                      {(unit.weeks || []).map((week, weekIndex) => (
                          <div key={week.id} className="flex items-start gap-2">
                              <div className="flex items-center gap-2 pt-2">
                                  <span className="font-semibold text-sm w-16">Semana {weekIndex + 1}</span>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteWeek(unitIndex, week.id)}><Trash2 size={14} /></Button>
                              </div>
                              <Textarea
                                  value={week.specificContents}
                                  onChange={(e) => handleWeekChange(unitIndex, weekIndex, e.target.value)}
                                  placeholder="Contenidos específicos de la semana..."
                                  className="flex-1"
                                  rows={3}
                              />
                          </div>
                      ))}
                      {(unit.weeks || []).length === 0 && <p className="text-center text-sm text-muted-foreground py-2">No hay semanas en esta unidad.</p>}
                  </div>
              </div>
              
              {/* Methodology and References Section */}
              <div className="border-t pt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`methodology-${unit.id}`} className="flex items-center gap-2"><FlaskConical size={16}/> Metodología</Label>
                    <Select
                      onValueChange={(value) => handleUnitChange(unitIndex, 'methodology', value)}
                      value={unit.methodology}
                    >
                      <SelectTrigger id={`methodology-${unit.id}`}>
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
                  {unit.methodology === 'Otro' && (
                    <div className="space-y-2 animate-in fade-in">
                      <Label htmlFor={`customMethodology-${unit.id}`}>Especifique la metodología</Label>
                      <Input
                        id={`customMethodology-${unit.id}`}
                        value={unit.customMethodology}
                        onChange={(e) => handleUnitChange(unitIndex, 'customMethodology', e.target.value)}
                        placeholder="Metodología personalizada"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`apaReference-${unit.id}`} className="flex items-center gap-2">
                      <Quote size={16} />
                      Fuentes de Consulta Documental y Sitios Web
                    </Label>
                    <Textarea
                      id={`apaReference-${unit.id}`}
                      value={unit.apaReference}
                      onChange={(e) => handleUnitChange(unitIndex, 'apaReference', e.target.value)}
                      placeholder="Pegue aquí sus referencias bibliográficas y sitios web para validación con IA..."
                      rows={4}
                    />
                  </div>
                  <Button onClick={() => handleValidateReference(unitIndex)} disabled={validatingUnitIndex === unitIndex || !unit.apaReference}>
                    {validatingUnitIndex === unitIndex ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" /> Validar con IA
                      </>
                    )}
                  </Button>
                  {unit.validationResult && (
                    <Alert
                      variant={unit.validationResult.isValid ? 'default' : 'destructive'}
                      className={cn(
                        unit.validationResult.isValid && 'bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600'
                      )}
                    >
                      {unit.validationResult.isValid ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>{unit.validationResult.isValid ? 'Referencia Válida' : 'Referencia Inválida'}</AlertTitle>
                      <AlertDescription className="whitespace-pre-wrap">
                        {unit.validationResult.feedback}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={handleAddUnit} className="w-full mt-4">
            <PlusCircle size={16} className="mr-2" />
            Agregar Unidad de Aprendizaje
          </Button>
        </CardContent>
      </Card>
      
      {/* Evaluation Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="text-primary" />
            Criterios de Evaluación
          </CardTitle>
          <CardDescription>Defina los criterios de evaluación, su peso, instrumento y fecha. El peso total debe sumar 100%.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Evaluación</TableHead>
                <TableHead className="w-[15%] text-center">Peso (%)</TableHead>
                <TableHead className="w-[35%]">Instrumento</TableHead>
                <TableHead className="w-[15%]">Fecha</TableHead>
                <TableHead className="w-[5%]">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(syllabus.evaluationCriteria || []).map((criterion, index) => (
                <TableRow key={criterion.id}>
                  <TableCell>
                    <Input 
                        value={criterion.evaluation} 
                        onChange={(e) => handleCriterionChange(index, 'evaluation', e.target.value)}
                        placeholder="Ej. Evaluación Parcial 1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                        type="number" 
                        value={criterion.weight} 
                        onChange={(e) => handleCriterionChange(index, 'weight', Number(e.target.value))}
                        className="text-center"
                        placeholder="20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                        value={criterion.instrument} 
                        onChange={(e) => handleCriterionChange(index, 'instrument', e.target.value)} 
                        placeholder="Ej. Examen escrito" 
                    />
                  </TableCell>
                  <TableCell>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !criterion.date && 'text-muted-foreground')}>
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {criterion.date ? format(criterion.date, 'LLL dd, y', { locale: es }) : <span>Elegir</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={criterion.date || undefined} onSelect={(date) => handleCriterionChange(index, 'date', date)} initialFocus /></PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteCriterion(criterion.id)}><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className={cn("text-center font-bold", totalEvaluationWeight !== 100 && "text-destructive")}>{totalEvaluationWeight}%</TableCell>
                    <TableCell colSpan={3}>
                      {totalEvaluationWeight !== 100 && <p className="text-xs text-destructive">La suma de los pesos debe ser 100%.</p>}
                    </TableCell>
                </TableRow>
            </TableFooter>
          </Table>
          <Button onClick={handleAddCriterion} variant="outline" className="mt-4 w-full"><PlusCircle size={16} className="mr-2"/>Agregar Criterio</Button>
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

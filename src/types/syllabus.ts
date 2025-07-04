import type { ValidateApaReferenceOutput } from "@/ai/flows/validate-apa-reference";

export interface Week {
  id: number;
  specificContents: string;
}

export interface LearningUnit {
  id: number;
  denomination: string;
  startDate: Date | null;
  endDate: Date | null;
  studentCapacity: string;
  weeks: Week[];
  methodology: string;
  customMethodology: string;
  apaReference: string;
  validationResult: ValidateApaReferenceOutput | null;
}

export interface EvaluationCriterion {
  id: number;
  evaluation: string;
  weight: number;
  instrument: string;
  date: Date | null;
}

export interface Syllabus {
  id?: string;
  userId?: string;
  
  // Main name for the list
  courseName: string;

  // New detailed fields from image
  facultad: string;
  carreraProfesional: string;
  periodoLectivo: string;
  semestre: string;
  numeroDeCreditos: string;
  numeroDeHoras: {
    teoria: string;
    practica: string;
  };
  areaDeFormacion: string;
  codigoDelCurso: string;
  tipoDeCurso: string;
  preRequisito: string;
  docente: string;
  correo: string;

  // Core content
  creationDate: Date;
  updateDate: Date;
  graduateCompetency: string;
  courseCompetency: string;
  summary: string;
  learningUnits: LearningUnit[];
  signaturePreview: string | null;
  evaluationCriteria: EvaluationCriterion[];
}

// Type for user data, helpful for the admin dashboard
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
}

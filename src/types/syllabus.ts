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
  courseName: string;
  courseKey: string;
  credits: string;
  theoryHours: string;
  practiceHours: string;
  author: string;
  creationDate: Date;
  updateDate: Date;
  graduateCompetency: string;
  courseCompetency: string;
  prerequisites: string;
  summary: string;
  learningUnits: LearningUnit[];
  signaturePreview: string | null;
  evaluationCriteria: EvaluationCriterion[];
}

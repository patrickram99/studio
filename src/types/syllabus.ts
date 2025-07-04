export interface Week {
  id: number;
  topic: string;
  activities: string;
  evidence: string;
}

export interface LearningUnit {
  id: number;
  name: string;
  weeks: Week[];
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
  methodology: string;
  customMethodology: string;
  apaReference: string;
  signaturePreview: string | null;
}

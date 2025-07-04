'use server';

import {
  validateApaReference,
  ValidateApaReferenceInput,
  ValidateApaReferenceOutput,
} from '@/ai/flows/validate-apa-reference';
import { db } from '@/lib/firebase';
import type { Syllabus, UserData } from '@/types/syllabus';
import {
  doc,
  setDoc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { getAuth } from "firebase-admin/auth";
import { adminApp } from '@/lib/firebase-admin';

export async function validateReferenceAction(
  referenceText: string
): Promise<ValidateApaReferenceOutput> {
  if (!referenceText.trim()) {
    return {
      isValid: false,
      feedback: 'El campo de referencia no puede estar vacío.',
    };
  }

  try {
    const input: ValidateApaReferenceInput = { referenceText };
    const result = await validateApaReference(input);
    return result;
  } catch (error) {
    console.error('Error validating APA reference:', error);
    return {
      isValid: false,
      feedback:
        'Ocurrió un error al validar la referencia. Verifique que su clave de API de Gemini esté configurada en el archivo .env.',
    };
  }
}

/**
 * Creates a new syllabus with default values for a user.
 */
export async function createSyllabusAction(
  userId: string,
  authorName: string,
  authorEmail: string
): Promise<{ syllabus: Syllabus | null; error?: string }> {
  if (!db) return { syllabus: null, error: 'La base de datos no está configurada.' };
  if (!userId) return { syllabus: null, error: 'Usuario no autenticado.' };

  try {
    const newSyllabusData = {
      userId,
      courseName: 'Nuevo Plan de Estudio',
      facultad: '',
      carreraProfesional: '',
      periodoLectivo: '',
      semestre: '',
      numeroDeCreditos: '',
      numeroDeHoras: { teoria: '', practica: '' },
      areaDeFormacion: '',
      codigoDelCurso: '',
      tipoDeCurso: '',
      preRequisito: '',
      docente: authorName,
      correo: authorEmail,
      creationDate: Timestamp.now(),
      updateDate: Timestamp.now(),
      graduateCompetency: '',
      courseCompetency: '',
      prerequisites: '',
      summary: '',
      learningUnits: [],
      signaturePreview: null,
      evaluationCriteria: [
        { id: 1, evaluation: 'Evaluación Parcial 1', weight: 20, instrument: 'Examen escrito', date: null },
        { id: 2, evaluation: 'Evaluación Parcial 2', weight: 20, instrument: 'Examen escrito', date: null },
        { id: 3, evaluation: 'Trabajos Prácticos', weight: 30, instrument: 'Proyectos y tareas', date: null },
        { id: 4, evaluation: 'Evaluación Final', weight: 30, instrument: 'Examen final', date: null },
      ],
    };

    const docRef = await addDoc(collection(db, 'syllabuses'), newSyllabusData);

    const syllabus: Syllabus = {
      ...newSyllabusData,
      id: docRef.id,
      creationDate: newSyllabusData.creationDate.toDate(),
      updateDate: newSyllabusData.updateDate.toDate(),
    };

    return { syllabus };
  } catch (error: any) {
    console.error('Error creating syllabus:', error);
    return { syllabus: null, error: error.message };
  }
}

/**
 * Saves changes to an existing syllabus.
 */
export async function saveSyllabusAction(
  syllabusData: Syllabus
): Promise<{ success: boolean; error?: string }> {
  if (!db) return { success: false, error: 'La base de datos no está configurada.' };
  if (!syllabusData.id || !syllabusData.userId) {
    return { success: false, error: 'Falta el ID del plan de estudios o del usuario.' };
  }

  try {
    const { id, ...data } = syllabusData;
    const docRef = doc(db, 'syllabuses', id);

    const dataToSave = {
      ...data,
      creationDate: Timestamp.fromDate(new Date(syllabusData.creationDate)),
      updateDate: Timestamp.now(),
    };

    await setDoc(docRef, dataToSave, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Error saving syllabus:', error);
    return { success: false, error: error.message };
  }
}

function convertTimestampsToDates(data: any): any {
  if (!data) return data;

  if (data.creationDate instanceof Timestamp) {
    data.creationDate = data.creationDate.toDate();
  }
  if (data.updateDate instanceof Timestamp) {
    data.updateDate = data.updateDate.toDate();
  }
  if (Array.isArray(data.learningUnits)) {
    data.learningUnits.forEach((unit: any) => {
      if (unit.startDate instanceof Timestamp) unit.startDate = unit.startDate.toDate();
      if (unit.endDate instanceof Timestamp) unit.endDate = unit.endDate.toDate();
    });
  }
  if (Array.isArray(data.evaluationCriteria)) {
    data.evaluationCriteria.forEach((criterion: any) => {
      if (criterion.date instanceof Timestamp) criterion.date = criterion.date.toDate();
    });
  }
  return data;
}

/**
 * Fetches all syllabuses for a given user.
 */
export async function getSyllabusesAction(
  userId: string
): Promise<{ syllabuses: Syllabus[]; error?: string }> {
  if (!db) return { syllabuses: [], error: 'La base de datos no está configurada.' };
  if (!userId) return { syllabuses: [], error: 'Usuario no autenticado.' };

  try {
    const q = query(collection(db, 'syllabuses'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const syllabuses = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const convertedData = convertTimestampsToDates(data);
      return {
        ...convertedData,
        id: docSnap.id,
      } as Syllabus;
    });

    return { syllabuses };
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      return { syllabuses: [] }; 
    }
    const descriptiveError = `Error de base de datos (${error.code}). Verifique las reglas de Firestore y la conexión. Mensaje: ${error.message}`;
    return { syllabuses: [], error: descriptiveError };
  }
}


/**
 * Deletes a syllabus by its ID.
 */
export async function deleteSyllabusAction(
  syllabusId: string
): Promise<{ success: boolean; error?: string }> {
  if (!db) return { success: false, error: 'La base de datos no está configurada.' };
  if (!syllabusId) return { success: false, error: 'Se requiere el ID del plan de estudios.' };

  try {
    await deleteDoc(doc(db, 'syllabuses', syllabusId));
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting syllabus:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches a single syllabus by its ID.
 */
export async function getSyllabusByIdAction(
  syllabusId: string
): Promise<{ syllabus: Syllabus | null; error?: string }> {
  if (!db) return { syllabus: null, error: 'La base de datos no está configurada.' };
  if (!syllabusId) return { syllabus: null, error: 'Se requiere el ID del plan de estudios.' };

  try {
    const docRef = doc(db, 'syllabuses', syllabusId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { syllabus: null, error: 'No se encontró el plan de estudios.' };
    }

    const data = docSnap.data();
    const convertedData = convertTimestampsToDates(data);
    const syllabus: Syllabus = {
      ...convertedData,
      id: docSnap.id,
    };

    return { syllabus };
  } catch (error: any) {
    console.error('Error getting syllabus by ID:', error);
    return { syllabus: null, error: error.message };
  }
}


// --- ADMIN ACTIONS ---

/**
 * Fetches all syllabuses from all users. (Admin only)
 */
export async function getAllSyllabusesAction(): Promise<{ syllabuses: Syllabus[]; error?: string }> {
  if (!db) return { syllabuses: [], error: 'La base de datos no está configurada.' };
  
  try {
    const q = query(collection(db, 'syllabuses'), orderBy('updateDate', 'desc'));
    const querySnapshot = await getDocs(q);

    const syllabuses = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const convertedData = convertTimestampsToDates(data);
      return {
        ...convertedData,
        id: docSnap.id,
      } as Syllabus;
    });

    return { syllabuses };
  } catch (error: any) {
    console.error('Error fetching all syllabuses:', error);
    const descriptiveError = `Error de base de datos (${error.code}). Verifique las reglas de Firestore y la conexión. Mensaje: ${error.message}`;
    return { syllabuses: [], error: descriptiveError };
  }
}

/**
 * Fetches all users from Firebase Auth. (Admin only)
 */
export async function getAllUsersAction(): Promise<{ users: UserData[]; error?: string }> {
  try {
    const auth = getAuth(adminApp);
    const userRecords = await auth.listUsers();
    const users = userRecords.users.map(user => ({
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
    }));
    return { users };
  } catch (error: any) {
    console.error('Error fetching all users:', error);
    return { users: [], error: error.message };
  }
}

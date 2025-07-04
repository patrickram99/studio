'use server';

import {
  validateApaReference,
  ValidateApaReferenceInput,
  ValidateApaReferenceOutput,
} from '@/ai/flows/validate-apa-reference';
import { db } from '@/lib/firebase';
import type { Syllabus } from '@/types/syllabus';
import {
  doc,
  setDoc,
  getDocs,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

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
        'Ocurrió un error al validar la referencia. Por favor, inténtelo de nuevo.',
    };
  }
}

/**
 * Creates a new syllabus with default values for a user.
 */
export async function createSyllabusAction(
  userId: string,
  authorName: string
): Promise<{ syllabus: Syllabus | null; error?: string }> {
  if (!db) return { syllabus: null, error: 'La base de datos no está configurada.' };
  if (!userId) return { syllabus: null, error: 'Usuario no autenticado.' };

  try {
    const newSyllabusData = {
      userId,
      courseName: 'Nuevo Plan de Estudio',
      courseKey: 'CURSO-101',
      credits: '0',
      theoryHours: '0',
      practiceHours: '0',
      author: authorName,
      creationDate: Timestamp.now(),
      updateDate: Timestamp.now(),
      graduateCompetency: '',
      courseCompetency: '',
      prerequisites: '',
      summary: '',
      learningUnits: [],
      methodology: 'ABP',
      customMethodology: '',
      apaReference: '',
      signaturePreview: null,
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
      return {
        ...data,
        id: docSnap.id,
        creationDate: (data.creationDate as Timestamp).toDate(),
        updateDate: (data.updateDate as Timestamp).toDate(),
      } as Syllabus;
    });

    return { syllabuses };
  } catch (error: any) {
    console.error('Error getting syllabuses:', error);
    return { syllabuses: [], error: error.message };
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

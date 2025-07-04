'use server';

import { validateApaReference, ValidateApaReferenceInput, ValidateApaReferenceOutput } from '@/ai/flows/validate-apa-reference';
import { db } from '@/lib/firebase';
import type { Syllabus } from '@/types/syllabus';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

export async function validateReferenceAction(referenceText: string): Promise<ValidateApaReferenceOutput> {
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
      feedback: 'Ocurrió un error al validar la referencia. Por favor, inténtelo de nuevo.',
    };
  }
}

export async function saveSyllabusAction(userId: string, syllabusData: Syllabus): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: 'La base de datos no está configurada.' };
  }
  if (!userId) {
    return { success: false, error: 'Usuario no autenticado.' };
  }

  try {
    const docRef = doc(db, 'syllabuses', userId);
    
    // Firestore can handle JS Date objects, and will convert them to Timestamps.
    const dataToSave = {
      ...syllabusData,
      creationDate: new Date(syllabusData.creationDate),
      updateDate: new Date(),
      userId: userId,
    };

    await setDoc(docRef, dataToSave);
    return { success: true };
  } catch (error: any) {
    console.error('Error saving syllabus:', error);
    return { success: false, error: error.message || 'Ocurrió un error al guardar el plan de estudios.' };
  }
}

export async function getSyllabusAction(userId: string): Promise<{ syllabus: Syllabus | null; error?: string }> {
  if (!db) {
    return { syllabus: null, error: 'La base de datos no está configurada.' };
  }
  if (!userId) {
    return { syllabus: null, error: 'Usuario no autenticado.' };
  }

  try {
    const docRef = doc(db, 'syllabuses', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Convert Firestore Timestamps back to JS Date objects
      const syllabus: Syllabus = {
        ...(data as Omit<Syllabus, 'creationDate' | 'updateDate'>),
        creationDate: (data.creationDate as Timestamp).toDate(),
        updateDate: (data.updateDate as Timestamp).toDate(),
      };
      return { syllabus };
    } else {
      // No syllabus found for this user, which is normal for a new user.
      return { syllabus: null };
    }
  } catch (error: any) {
    console.error('Error getting syllabus:', error);
    return { syllabus: null, error: error.message || 'Ocurrió un error al cargar el plan de estudios.' };
  }
}

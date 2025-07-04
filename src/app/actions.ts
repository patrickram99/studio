'use server';

import { validateApaReference, ValidateApaReferenceInput, ValidateApaReferenceOutput } from '@/ai/flows/validate-apa-reference';

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

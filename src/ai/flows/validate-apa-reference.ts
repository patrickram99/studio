'use server';

/**
 * @fileOverview APA reference validation flow.
 *
 * - validateApaReference - A function that validates an APA reference.
 * - ValidateApaReferenceInput - The input type for the validateApaReference function.
 * - ValidateApaReferenceOutput - The return type for the validateApaReference function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateApaReferenceInputSchema = z.object({
  referenceText: z.string().describe('The APA reference text to validate.'),
});
export type ValidateApaReferenceInput = z.infer<typeof ValidateApaReferenceInputSchema>;

const ValidateApaReferenceOutputSchema = z.object({
  isValid: z.boolean().describe('Indica si la referencia APA es válida o no.'),
  feedback: z.string().describe('Comentarios sobre la referencia APA, incluyendo errores y sugerencias de corrección. Debe estar en español.'),
});
export type ValidateApaReferenceOutput = z.infer<typeof ValidateApaReferenceOutputSchema>;

export async function validateApaReference(input: ValidateApaReferenceInput): Promise<ValidateApaReferenceOutput> {
  return validateApaReferenceFlow(input);
}

const validateApaReferencePrompt = ai.definePrompt({
  name: 'validateApaReferencePrompt',
  input: {schema: ValidateApaReferenceInputSchema},
  output: {schema: ValidateApaReferenceOutputSchema},
  prompt: `Eres un experto en el estilo de citación APA. Se te proporcionará una referencia y tu trabajo es determinar si es válida y devolver comentarios sobre ella, incluyendo errores y sugerencias para corregirla. Responde siempre en español.

Referencia a validar:

{{{referenceText}}}`,
});

const validateApaReferenceFlow = ai.defineFlow(
  {
    name: 'validateApaReferenceFlow',
    inputSchema: ValidateApaReferenceInputSchema,
    outputSchema: ValidateApaReferenceOutputSchema,
  },
  async input => {
    const {output} = await validateApaReferencePrompt(input);
    return output!;
  }
);

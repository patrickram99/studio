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
  isValid: z.boolean().describe('Whether the APA reference is valid or not.'),
  feedback: z.string().describe('Feedback on the APA reference, including errors and suggestions.'),
});
export type ValidateApaReferenceOutput = z.infer<typeof ValidateApaReferenceOutputSchema>;

export async function validateApaReference(input: ValidateApaReferenceInput): Promise<ValidateApaReferenceOutput> {
  return validateApaReferenceFlow(input);
}

const validateApaReferencePrompt = ai.definePrompt({
  name: 'validateApaReferencePrompt',
  input: {schema: ValidateApaReferenceInputSchema},
  output: {schema: ValidateApaReferenceOutputSchema},
  prompt: `You are an expert in APA style referencing.  You will be given a reference, and your job is to determine if it is valid, and return feedback on it, including errors and suggestions.

Reference to validate:

{{referenceText}}`,
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

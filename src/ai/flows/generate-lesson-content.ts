
'use server';

/**
 * @fileOverview Generates lesson content from a prompt using AI.
 *
 * - generateLessonContent - A function that generates lesson content.
 * - GenerateLessonContentInput - The input type for the generateLessonContent function.
 * - GenerateLessonContentOutput - The return type for the generateLessonContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { checkAndDeductCredits } from '@/lib/actions/user-credits';
import { auth } from '@/lib/firebase';


const GenerateLessonContentInputSchema = z.object({
  prompt: z.string().describe('The prompt to use to generate the lesson content.'),
});

export type GenerateLessonContentInput = z.infer<
  typeof GenerateLessonContentInputSchema
>;

const GenerateLessonContentOutputSchema = z.object({
  lessonContent: z.string().describe('The generated lesson content.'),
});

export type GenerateLessonContentOutput = z.infer<
  typeof GenerateLessonContentOutputSchema
>;

export async function generateLessonContent(
  input: GenerateLessonContentInput
): Promise<GenerateLessonContentOutput> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentification requise.");
  }
  await checkAndDeductCredits(user.uid);
  return generateLessonContentFlow(input);
}

const generateLessonContentPrompt = ai.definePrompt({
  name: 'generateLessonContentPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: GenerateLessonContentInputSchema},
  output: {schema: GenerateLessonContentOutputSchema},
  prompt: `Generate lesson content in French based on the following prompt:\n\n{{prompt}}`,
});

const generateLessonContentFlow = ai.defineFlow(
  {
    name: 'generateLessonContentFlow',
    inputSchema: GenerateLessonContentInputSchema,
    outputSchema: GenerateLessonContentOutputSchema,
  },
  async input => {
    const {output} = await generateLessonContentPrompt(input);
    return output!;
  }
);

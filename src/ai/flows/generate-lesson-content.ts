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
  return generateLessonContentFlow(input);
}

const generateLessonContentPrompt = ai.definePrompt({
  name: 'generateLessonContentPrompt',
  input: {schema: GenerateLessonContentInputSchema},
  output: {schema: GenerateLessonContentOutputSchema},
  prompt: `Generate lesson content based on the following prompt:\n\n{{prompt}}`,
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

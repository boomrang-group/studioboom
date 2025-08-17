'use server';
/**
 * @fileOverview Server Action for generating lesson content.
 */
import { generateLessonContentFlow } from './generate-lesson-content.core';
import type { z } from 'genkit';
import type { GenerateLessonContentInputSchema, GenerateLessonContentOutputSchema } from './generate-lesson-content.core';

export type GenerateLessonContentInput = z.infer<typeof GenerateLessonContentInputSchema>;
export type GenerateLessonContentOutput = z.infer<typeof GenerateLessonContentOutputSchema>;

export async function generateLessonContent(
  input: GenerateLessonContentInput
): Promise<GenerateLessonContentOutput> {
  return generateLessonContentFlow(input);
}

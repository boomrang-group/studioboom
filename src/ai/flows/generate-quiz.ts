'use server';
/**
 * @fileOverview Server Action for generating quizzes.
 */
import { generateQuizFlow } from './generate-quiz.core';
import type { z } from 'genkit';
import type { GenerateQuizInputSchema, GenerateQuizOutputSchema } from './generate-quiz.core';

export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

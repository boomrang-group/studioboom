
'use server';
/**
 * @fileOverview Server Action for generating quizzes.
 */
import { generateQuizFlow } from './generate-quiz.core';
import type { z } from 'genkit';
import type { GenerateQuizInputSchema, GenerateQuizOutputSchema } from './generate-quiz.core';
import { auth } from '@/lib/firebase';
import { checkAndDeductCredits } from '@/lib/actions/user-credits';

export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentification requise.");
  }
  await checkAndDeductCredits(user.uid);
  return generateQuizFlow(input);
}


'use server';
/**
 * @fileOverview Server Action for handling the video script generation process.
 */
import { generateVideoScriptFlow } from './generate-video-script.core';
import type { z } from 'genkit';
import type { GenerateVideoScriptInputSchema, GenerateVideoScriptOutputSchema } from './generate-video-script.core';
import { auth } from '@/lib/firebase';
import { checkAndDeductCredits } from '@/lib/actions/user-credits';

export type GenerateVideoScriptInput = z.infer<typeof GenerateVideoScriptInputSchema>;
export type GenerateVideoScriptOutput = z.infer<typeof GenerateVideoScriptOutputSchema>;

export async function generateVideoScript(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentification requise.");
  }
  await checkAndDeductCredits(user.uid);
  return generateVideoScriptFlow(input);
}

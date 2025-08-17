'use server';
/**
 * @fileOverview Server Action to convert text to speech using AI.
 */
import { generateAudioSummaryFlow } from './generate-audio-summary.core';
import type { z } from 'genkit';
import type { GenerateAudioSummaryOutputSchema } from './generate-audio-summary.core';

export type GenerateAudioSummaryInput = string;
export type GenerateAudioSummaryOutput = z.infer<typeof GenerateAudioSummaryOutputSchema>;

export async function generateAudioSummary(
  input: GenerateAudioSummaryInput
): Promise<GenerateAudioSummaryOutput> {
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('Input must be a non-empty string.');
  }
  return generateAudioSummaryFlow(input);
}

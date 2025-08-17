'use server';

import { generateAudioDialogueFlow } from './generate-audio-dialogue.core';
import type { GenerateAudioDialogueOutput } from './generate-audio-dialogue.core';

export async function generateAudioDialogue(summary: string): Promise<GenerateAudioDialogueOutput> {
  if (typeof summary !== 'string' || summary.trim() === '') {
    throw new Error('generateAudioDialogue(summary): summary is required (non-empty string).');
  }
  return await generateAudioDialogueFlow({ summary });
}


'use server';
/**
 * @fileOverview Server Action for the document summarization process.
 */
import { summarizeDocumentFlow } from './summarize-document.core';
import type { z } from 'genkit';
import type { SummarizeDocumentInputSchema, SummarizeDocumentOutputSchema } from './summarize-document.core';
import { auth } from '@/lib/firebase';
import { checkAndDeductCredits } from '@/lib/actions/user-credits';

export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentification requise.");
  }
  await checkAndDeductCredits(user.uid);
  return summarizeDocumentFlow(input);
}

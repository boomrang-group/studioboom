'use server';
/**
 * @fileOverview Server Action for the document summarization process.
 */
import { summarizeDocumentFlow } from './summarize-document.core';
import type { z } from 'genkit';
import type { SummarizeDocumentInputSchema, SummarizeDocumentOutputSchema } from './summarize-document.core';

export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

/**
 * @fileOverview Core logic for summarizing an uploaded document.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const SummarizeDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to summarize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('The summary of the document.'),
});

export const prompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: SummarizeDocumentInputSchema},
  output: {schema: SummarizeDocumentOutputSchema},
  prompt: `You are an expert summarizer, able to distill complex documents into their key points.

  Please summarize the following document in French:

  {{media url=documentDataUri}}`,
});

export const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

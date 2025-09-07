/**
 * @fileOverview Core logic for generating lesson content from a prompt using AI.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const GenerateLessonContentInputSchema = z.object({
  prompt: z.string().describe('The prompt to use to generate the lesson content.'),
});

export const GenerateLessonContentOutputSchema = z.object({
  lessonContent: z.string().describe('The generated lesson content.'),
});

export const generateLessonContentPrompt = ai.definePrompt({
  name: 'generateLessonContentPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: GenerateLessonContentInputSchema},
  output: {schema: GenerateLessonContentOutputSchema},
  prompt: `Generate lesson content in French based on the following prompt:\n\n{{prompt}}`,
});

export const generateLessonContentFlow = ai.defineFlow(
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

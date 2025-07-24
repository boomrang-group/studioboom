'use server';

/**
 * @fileOverview Generates quizzes from lesson text using AI.
 *
 * - generateQuiz - A function that generates a quiz from a lesson text.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  lessonText: z
    .string()
    .describe('The lesson text to generate a quiz from.'),
  questionType: z
    .enum(['multiple choice', 'true/false', 'short answer'])
    .describe('The type of questions to generate.'),
  numberOfQuestions: z
    .number()
    .int()
    .positive()
    .default(5)
    .describe('The number of questions to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z.string().describe('The generated quiz in a readable format.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert quiz generator for teachers.

  You will generate a quiz in French from the given lesson text, generating the specified number of questions.
  The questions should be of the specified type.

  Lesson Text: {{{lessonText}}}
  Question Type: {{{questionType}}}
  Number of Questions: {{{numberOfQuestions}}}

  The quiz should be formatted in a readable way for students.
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

// This is an auto-generated file from Firebase Studio.
'use server';
/**
 * @fileOverview A video script generation AI agent.
 *
 * - generateVideoScript - A function that handles the video script generation process.
 * - GenerateVideoScriptInput - The input type for the generateVideoScript function.
 * - GenerateVideoScriptOutput - The return type for the generateVideoScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoScriptInputSchema = z.object({
  topic: z.string().describe('The topic of the lesson video.'),
  targetAudience: z.string().describe('The target audience for the video (e.g., elementary school, high school).'),
  lessonLengthMinutes: z.number().describe('The desired length of the lesson video in minutes.'),
});
export type GenerateVideoScriptInput = z.infer<typeof GenerateVideoScriptInputSchema>;

const GenerateVideoScriptOutputSchema = z.object({
  script: z.string().describe('The generated video script.'),
});
export type GenerateVideoScriptOutput = z.infer<typeof GenerateVideoScriptOutputSchema>;

export async function generateVideoScript(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVideoScriptPrompt',
  input: {schema: GenerateVideoScriptInputSchema},
  output: {schema: GenerateVideoScriptOutputSchema},
  prompt: `You are an AI video script generator for educational videos.

  Your task is to create an engaging video script for a lesson based on the provided topic, target audience, and desired length.

  Topic: {{{topic}}}
  Target Audience: {{{targetAudience}}}
  Lesson Length: {{{lessonLengthMinutes}}} minutes

  The video script should be well-structured, including an introduction, main points, and a conclusion.  It should be appropriate for the target audience. The script should be detailed enough to provide specific guidance on visuals and narration.
  `,
});

const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: GenerateVideoScriptInputSchema,
    outputSchema: GenerateVideoScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

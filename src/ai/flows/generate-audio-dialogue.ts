
'use server';
/**
 * @fileOverview Converts a text summary into an audio dialogue.
 *
 * - generateAudioDialogue - A function that converts text to a two-person audio dialogue.
 * - GenerateAudioDialogueInput - The input type for the generateAudioDialogue function.
 * - GenerateAudioDialogueOutput - The return type for the generateAudioDialogue function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';

export type GenerateAudioDialogueInput = string;

const GenerateAudioDialogueOutputSchema = z.object({
  media: z.string().describe('The audio data URI for the dialogue.'),
});
export type GenerateAudioDialogueOutput = z.infer<typeof GenerateAudioDialogueOutputSchema>;

export async function generateAudioDialogue(
  input: GenerateAudioDialogueInput
): Promise<GenerateAudioDialogueOutput> {
  return generateAudioDialogueFlow(input);
}


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const dialoguePrompt = ai.definePrompt({
    name: 'dialoguePrompt',
    model: googleAI.model('gemini-1.5-flash'),
    input: { schema: z.object({ summary: z.string() }) },
    output: { schema: z.string() },
    prompt: `Transform the following text into a conversational dialogue script between two speakers, Speaker1 and Speaker2. The dialogue should be engaging and natural, breaking down the information into a back-and-forth conversation.

Text to convert:
{{{summary}}}

The output should be ONLY the script, formatted exactly as follows:
Speaker1: [First line of dialogue]
Speaker2: [Second line of dialogue]
...and so on.
`,
});


const generateAudioDialogueFlow = ai.defineFlow(
  {
    name: 'generateAudioDialogueFlow',
    inputSchema: z.string(),
    outputSchema: GenerateAudioDialogueOutputSchema,
  },
  async (summary) => {
    if (!summary || !summary.trim()) {
      throw new Error('Summary input cannot be empty.');
    }

    const dialogueResponse = await dialoguePrompt({ summary });
    const dialogueScript = dialogueResponse.output;

    if (!dialogueScript) {
      throw new Error('Failed to generate dialogue script from summary.');
    }

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'Speaker1',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
              },
              {
                speaker: 'Speaker2',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Achernar' },
                },
              },
            ],
          },
        },
      },
      prompt: dialogueScript,
    });
    
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

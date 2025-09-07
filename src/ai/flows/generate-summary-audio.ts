
'use server';

/**
 * @fileOverview Converts summary text to speech.
 *
 * - generateSummaryAudio - A function that handles the text-to-speech process.
 * - GenerateSummaryAudioOutput - The return type for the generateSummaryAudio function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit/zod';
import wav from 'wav';

export type GenerateSummaryAudioOutput = {
  media: string;
};

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

    const bufs: any[] = [];
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

const generateSummaryAudioFlow = ai.defineFlow(
  {
    name: 'generateSummaryAudioFlow',
    inputSchema: z.string(),
    outputSchema: z.object({ media: z.string() }),
  },
  async (summaryText) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: summaryText,
    });
    if (!media) {
      throw new Error('No media returned from TTS model');
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


export async function generateSummaryAudio(summaryText: string): Promise<GenerateSummaryAudioOutput> {
  return await generateSummaryAudioFlow(summaryText);
}

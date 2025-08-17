'use server';
/**
 * Converts a text summary into a 2-voice audio dialogue.
 * - Input: { summary: string }
 * - Output: { media: dataURL<string audio/*> }
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { Buffer } from 'node:buffer';
import wav from 'wav';

// ---- Schémas (OBJET !)
export const GenerateAudioDialogueInputSchema = z.object({
  summary: z.string().min(1, 'Summary input cannot be empty.'),
});
export const GenerateAudioDialogueOutputSchema = z.object({
  media: z.string(),
});
export type GenerateAudioDialogueOutput = z.infer<typeof GenerateAudioDialogueOutputSchema>;


// ---- Utils
async function pcmToWavBase64(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2) {
  return new Promise<string>((resolve, reject) => {
    const writer = new wav.Writer({ channels, sampleRate: rate, bitDepth: sampleWidth * 8 });
    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d as Buffer));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}
function parseDataUrl(dataUrl: string): { mime: string; base64: string } {
  const i = dataUrl.indexOf(',');
  if (i < 0) throw new Error('Invalid data URL');
  const header = dataUrl.slice(0, i);
  const mime = header.replace(/^data:([^;]+).*$/, '$1');
  return { mime, base64: dataUrl.slice(i + 1) };
}

// ---- Prompt
const dialoguePrompt = ai.definePrompt({
  name: 'dialoguePrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: z.object({ summary: z.string() }) },
  output: { schema: z.string() },
  prompt: `
Transform the following text into an engaging two-person dialogue.
Speakers: Speaker1 and Speaker2. Keep lines short and natural.
Return ONLY:

Speaker1: ...
Speaker2: ...
Speaker1: ...
Speaker2: ...

Text:
{{{summary}}}
  `.trim(),
});

// ---- Flow (INPUT = OBJET)
export const generateAudioDialogueFlow = ai.defineFlow(
  {
    name: 'generateAudioDialogueFlow',
    inputSchema: GenerateAudioDialogueInputSchema,
    outputSchema: GenerateAudioDialogueOutputSchema,
  },
  async ({ summary }) => {
    const s = summary?.trim();
    if (!s) throw new Error('Summary input cannot be empty.');

    const dialogueResponse = await dialoguePrompt({ summary: s });
    const dialogueScript = dialogueResponse.output;
    if (!dialogueScript) throw new Error('Failed to generate dialogue script.');

    const result = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              { speaker: 'Speaker1', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } } },
              { speaker: 'Speaker2', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Achernar' } } },
            ],
          },
        },
      },
      prompt: dialogueScript,
    });

    const mediaAny: any = (result as any)?.media ?? (result as any)?.output ?? (result as any);
    const m = Array.isArray(mediaAny) ? mediaAny[0] : mediaAny;
    const url: string | undefined = m?.url ?? m?.uri ?? m?.data;
    if (!url) throw new Error('No audio media returned');

    const { mime, base64 } = parseDataUrl(url);
    const raw = Buffer.from(base64, 'base64');

    if (mime === 'audio/pcm' || mime === 'audio/x-raw') {
      const wavB64 = await pcmToWavBase64(raw);
      return { media: `data:audio/wav;base64,${wavB64}` };
    }
    return { media: `data:${mime};base64,${base64}` };
  }
);

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

// -------- Types
export const GenerateAudioDialogueInputSchema = z.object({
  summary: z.string().min(1, 'Summary input cannot be empty.'),
});
export type GenerateAudioDialogueInput = z.infer<typeof GenerateAudioDialogueInputSchema>;

const GenerateAudioDialogueOutputSchema = z.object({
  media: z.string().describe('Audio data URL for the dialogue'),
});
export type GenerateAudioDialogueOutput = z.infer<typeof GenerateAudioDialogueOutputSchema>;

// -------- Utils
async function pcmToWavBase64(
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

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d as Buffer));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

function parseDataUrl(dataUrl: string): { mime: string; base64: string } {
  const comma = dataUrl.indexOf(',');
  if (comma === -1) {
    throw new Error('Invalid data URL');
  }
  const header = dataUrl.slice(0, comma); // e.g. data:audio/wav;base64
  const base64 = dataUrl.slice(comma + 1);
  const mime = header.replace(/^data:([^;]+).*$/, '$1');
  return { mime, base64 };
}

// -------- Prompt: summary -> dialogue script
const dialoguePrompt = ai.definePrompt({
  name: 'dialoguePrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: z.object({ summary: z.string() }) },
  output: { schema: z.string() },
  prompt: `
Transform the following text into an engaging two-person dialogue.
Speakers: Speaker1 and Speaker2. Keep lines short and natural.
Return ONLY lines in this exact format:

Speaker1: ...
Speaker2: ...
Speaker1: ...
Speaker2: ...

Text:
{{{summary}}}
  `.trim(),
});

// -------- Flow
export const generateAudioDialogueFlow = ai.defineFlow(
  {
    name: 'generateAudioDialogueFlow',
    inputSchema: GenerateAudioDialogueInputSchema, // <- évite l'erreur "must be string" côté Studio si input vide
    outputSchema: GenerateAudioDialogueOutputSchema,
  },
  async ({ summary }) => {
    const s = summary?.trim();
    if (!s) throw new Error('Summary input cannot be empty.');

    // 1) summary -> dialogue script
    const dialogueResponse = await dialoguePrompt({ summary: s });
    const dialogueScript = dialogueResponse.output;
    if (!dialogueScript) throw new Error('Failed to generate dialogue script.');

    // 2) dialogue script -> audio (multi-voice)
    const result = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'), // si indisponible dans ta version, garde 'gemini-1.5-flash' + AUDIO
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

    // Le SDK peut renvoyer "media" sous diverses formes (objet, tableau, etc.)
    // On normalise:
    const mediaAny: any = (result as any)?.media ?? (result as any)?.output ?? (result as any);
    const m = Array.isArray(mediaAny) ? mediaAny[0] : mediaAny;

    const url: string | undefined = m?.url ?? m?.uri ?? m?.data;
    if (!url) throw new Error('No audio media returned');

    const { mime, base64 } = parseDataUrl(url);
    const raw = Buffer.from(base64, 'base64');

    // Si le flux est déjà WAV/MP3/OGG -> renvoyer tel quel.
    // Si c'est du PCM -> encapsuler en WAV.
    if (mime === 'audio/pcm' || mime === 'audio/x-raw') {
      const wavB64 = await pcmToWavBase64(raw);
      return { media: `data:audio/wav;base64,${wavB64}` };
    }

    // Sinon, retourner l’audio tel quel (préserve format d’origine)
    return { media: `data:${mime};base64,${base64}` };
  }
);

// -------- Server Action conviviale à appeler depuis le client
export async function generateAudioDialogue(
  input: string
): Promise<GenerateAudioDialogueOutput> {
  // Appel explicite du flow avec schéma objet (évite null)
  return await generateAudioDialogueFlow({ summary: input });
}

import { config } from 'dotenv';
config();

import '@/ai/flows/generate-lesson-content.core.ts';
import '@/ai/flows/generate-video-script.core.ts';
import '@/ai/flows/generate-quiz.core.ts';
import '@/ai/flows/summarize-document.core.ts';
import '@/ai/flows/generate-audio-summary.core.ts';
import '@/ai/flows/generate-audio-dialogue.core.ts';

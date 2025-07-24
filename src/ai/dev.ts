import { config } from 'dotenv';
config();

import '@/ai/flows/generate-lesson-content.ts';
import '@/ai/flows/generate-video-script.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/summarize-document.ts';
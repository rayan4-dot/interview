import { config } from 'dotenv';
config();

import '@/ai/flows/generate-feedback.ts';
import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/analyze-resume.ts';
import '@/ai/flows/analyze-cover-letter.ts';
import '@/ai/flows/analyze-video.ts';
import '@/ai/flows/analyze-voice.ts';

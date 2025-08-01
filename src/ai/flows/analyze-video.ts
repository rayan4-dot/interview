'use server';

/**
 * @fileOverview An video analysis AI agent for interviews.
 *
 * - analyzeVideo - A function that handles the video analysis process.
 * - AnalyzeVideoInput - The input type for the analyzeVideo function.
 * - AnalyzeVideoOutput - The return type for the analyzeVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVideoInputSchema = z.object({
    videoDataUri: z
    .string()
    .describe(
      "The video of the interview response, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    language: z.string().describe('The language for the feedback.').default('English'),
});
export type AnalyzeVideoInput = z.infer<typeof AnalyzeVideoInputSchema>;

const AnalyzeVideoOutputSchema = z.object({
  nonVerbalFeedback: z.string().describe('Feedback on non-verbal cues like facial expressions, posture, and eye contact.'),
  confidenceScore: z.number().describe('A numerical score representing the confidence level based on non-verbal cues.'),
});
export type AnalyzeVideoOutput = z.infer<typeof AnalyzeVideoOutputSchema>;

export async function analyzeVideo(input: AnalyzeVideoInput): Promise<AnalyzeVideoOutput> {
  return analyzeVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVideoPrompt',
  input: {schema: AnalyzeVideoInputSchema},
  output: {schema: AnalyzeVideoOutputSchema},
  prompt: `You are an expert interview coach specializing in non-verbal communication.

You will analyze the provided video of an interview response and provide feedback in the specified language on the user's facial expressions, posture, and eye contact.

Based on your analysis, provide a confidence score (out of 100).

Language: {{{language}}}
Video Response:
{{media url=videoDataUri}}`,
});

const analyzeVideoFlow = ai.defineFlow(
  {
    name: 'analyzeVideoFlow',
    inputSchema: AnalyzeVideoInputSchema,
    outputSchema: AnalyzeVideoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

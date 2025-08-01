'use server';

/**
 * @fileOverview A voice and speech analysis AI agent for interviews.
 *
 * - analyzeVoice - A function that handles the voice analysis process.
 * - AnalyzeVoiceInput - The input type for the analyzeVoice function.
 * - AnalyzeVoiceOutput - The return type for the analyzeVoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVoiceInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio of the interview response, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  question: z.string().describe('The interview question that was asked.'),
  role: z.string().describe('The job role the user is interviewing for.'),
  language: z.string().describe('The language for the feedback.').default('English'),
});
export type AnalyzeVoiceInput = z.infer<typeof AnalyzeVoiceInputSchema>;

const AnalyzeVoiceOutputSchema = z.object({
  speechFeedback: z.string().describe('Feedback on tone, clarity, hesitation, pacing, and pronunciation, as well as the professionalism and relevance of the content. This should include specific advice on phonetics and accent improvement if necessary.'),
  clarityScore: z.number().describe('A numerical score representing the overall quality of the response, considering both delivery and content.'),
});
export type AnalyzeVoiceOutput = z.infer<typeof AnalyzeVoiceOutputSchema>;

export async function analyzeVoice(input: AnalyzeVoiceInput): Promise<AnalyzeVoiceOutput> {
  return analyzeVoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVoicePrompt',
  input: {schema: AnalyzeVoiceInputSchema},
  output: {schema: AnalyzeVoiceOutputSchema},
  prompt: `You are an expert interview and speech coach with a specialization in pronunciation and accent training. Your judgment must be strict and professional. You will provide your feedback in the specified language.

You will analyze the provided audio of an interview response. Your analysis must consider three main aspects:
1.  **Content Relevance and Professionalism**: This is the most important factor. Is the answer relevant to the question? Is it professional and appropriate for a job interview? Any response that is unprofessional, disrespectful, or completely irrelevant should be scored close to zero.
2.  **Speech Delivery**: Evaluate the user's tone, clarity, hesitation, and pacing.
3.  **Pronunciation and Accent**: This is a key part of your analysis. Listen carefully for any mispronounced words. If you detect any, provide specific corrections and, if possible, phonetic guidance. Give actionable advice on how the user can improve their accent for better clarity.

The user is interviewing for the role of: {{{role}}}.
The question they were asked is: "{{{question}}}"
The language for your response should be: {{{language}}}

Analyze the audio response and provide a holistic clarity score (out of 100) and detailed feedback.

Your feedback must be direct and clearly explain why the answer was or was not successful. If the answer is unprofessional, your feedback should state so bluntly. For pronunciation issues, be encouraging but specific.

Audio Response:
{{media url=audioDataUri}}`,
});

const analyzeVoiceFlow = ai.defineFlow(
  {
    name: 'analyzeVoiceFlow',
    inputSchema: AnalyzeVoiceInputSchema,
    outputSchema: AnalyzeVoiceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

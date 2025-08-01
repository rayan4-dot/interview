'use server';

/**
 * @fileOverview Generates structured feedback on interview responses.
 *
 * - generateFeedback - A function that generates feedback on interview responses.
 * - GenerateFeedbackInput - The input type for the generateFeedback function.
 * - GenerateFeedbackOutput - The return type for the generateFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFeedbackInputSchema = z.object({
  question: z.string().describe('The interview question asked.'),
  response: z.string().describe('The user\'s response to the question.'),
  jobDescription: z.string().optional().describe('The job description for context.'),
  resume: z.string().optional().describe('The user\'s resume for context.'),
  language: z.string().describe('The language for the feedback.').default('English'),
});
export type GenerateFeedbackInput = z.infer<typeof GenerateFeedbackInputSchema>;

const GenerateFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Structured feedback on the response.'),
  score: z.number().describe('Score of the response'),
  areasForImprovement: z.string().describe('Areas for improvement.'),
});
export type GenerateFeedbackOutput = z.infer<typeof GenerateFeedbackOutputSchema>;

export async function generateFeedback(input: GenerateFeedbackInput): Promise<GenerateFeedbackOutput> {
  return generateFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeedbackPrompt',
  input: {schema: GenerateFeedbackInputSchema},
  output: {schema: GenerateFeedbackOutputSchema},
  prompt: `You are an AI interview coach. Your task is to provide structured feedback on an interview response in the specified language.

  Consider the job description and resume if provided.

  Language: {{{language}}}
  Question: {{{question}}}
  Response: {{{response}}}

  Job Description: {{{jobDescription}}}
  Resume: {{{resume}}}

  Provide feedback in the specified language in the following format:

  Feedback: [Detailed feedback on the response]
  Score: [Score between 0 and 100]
  Areas for Improvement: [Specific areas for improvement]
`,
});

const generateFeedbackFlow = ai.defineFlow(
  {
    name: 'generateFeedbackFlow',
    inputSchema: GenerateFeedbackInputSchema,
    outputSchema: GenerateFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

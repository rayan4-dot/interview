'use server';

/**
 * @fileOverview A cover letter analysis AI agent.
 *
 * - analyzeCoverLetter - A function that handles the cover letter analysis process.
 * - AnalyzeCoverLetterInput - The input type for the analyzeCoverLetter function.
 * - AnalyzeCoverLetterOutput - The return type for the analyzeCoverLetter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCoverLetterInputSchema = z.object({
  coverLetterText: z.string().describe('The text of the cover letter to analyze.'),
});
export type AnalyzeCoverLetterInput = z.infer<typeof AnalyzeCoverLetterInputSchema>;

const AnalyzeCoverLetterOutputSchema = z.object({
  structureFeedback: z.string().describe('Feedback on the structure of the cover letter.'),
  clarityFeedback: z.string().describe('Feedback on the clarity of the cover letter.'),
  keywordOptimizationFeedback: z
    .string()
    .describe('Feedback on the keyword optimization of the cover letter.'),
  overallScore: z.number().describe('A numerical score representing the overall quality of the cover letter.'),
});
export type AnalyzeCoverLetterOutput = z.infer<typeof AnalyzeCoverLetterOutputSchema>;

export async function analyzeCoverLetter(input: AnalyzeCoverLetterInput): Promise<AnalyzeCoverLetterOutput> {
  return analyzeCoverLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCoverLetterPrompt',
  input: {schema: AnalyzeCoverLetterInputSchema},
  output: {schema: AnalyzeCoverLetterOutputSchema},
  prompt: `You are an expert career coach specializing in cover letter optimization.

You will analyze the provided cover letter text and provide feedback on its structure, clarity, and keyword optimization.

Based on your analysis, provide an overall score (out of 100) indicating the quality of the cover letter.

Cover Letter Text: {{{coverLetterText}}}`,
});

const analyzeCoverLetterFlow = ai.defineFlow(
  {
    name: 'analyzeCoverLetterFlow',
    inputSchema: AnalyzeCoverLetterInputSchema,
    outputSchema: AnalyzeCoverLetterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

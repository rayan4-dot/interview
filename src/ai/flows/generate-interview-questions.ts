'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating industry-specific and role-based interview questions.
 *
 * The flow takes industry and role as input and returns a list of relevant interview questions.
 * - `generateInterviewQuestions` - A function that generates interview questions based on industry and role.
 * - `GenerateInterviewQuestionsInput` - The input type for the generateInterviewQuestions function.
 * - `GenerateInterviewQuestionsOutput` - The output type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  industry: z.string().describe('The industry for which to generate interview questions (e.g., Tech, Marketing, Finance).'),
  role: z.string().describe('The role for which to generate interview questions (e.g., Software Engineer, HR Manager).'),
  numQuestions: z.number().describe('The number of questions to generate').default(5),
  language: z.string().describe('The language for the interview questions.').default('English'),
});
export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of interview questions relevant to the specified industry and role.'),
});
export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

export async function generateInterviewQuestions(input: GenerateInterviewQuestionsInput): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const interviewQuestionsPrompt = ai.definePrompt({
  name: 'interviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an AI career coach specializing in creating interview questions.

  Generate {{numQuestions}} interview questions for the following industry and role, in the specified language.

  Industry: {{{industry}}}
  Role: {{{role}}}
  Language: {{{language}}}

  Format the output as a JSON object with a "questions" field containing an array of strings.
  Each string should be a unique interview question relevant to the specified industry and role, in the specified language.
  Do not repeat questions.
  Do not include any introductory or concluding remarks. Just the questions.
  `,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await interviewQuestionsPrompt(input);
    return output!;
  }
);

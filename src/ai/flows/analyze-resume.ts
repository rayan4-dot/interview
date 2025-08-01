'use server';

/**
 * @fileOverview Analyzes a resume and provides structured, actionable feedback and improvement suggestions.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. The resume content will be extracted from this."
    ),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const ResumeSectionImprovementSchema = z.object({
    section: z.string().describe("The resume section being improved (e.g., 'Experience', 'Summary', 'Skills')."),
    originalText: z.string().describe("A brief quote of the original text from the resume section that needs improvement."),
    improvedText: z.string().describe("The AI-rewritten, improved version of the text."),
    explanation: z.string().describe("A clear and concise explanation of why the improved text is better (e.g., 'Uses stronger action verbs and quantifies achievements')."),
});

const AnalyzeResumeOutputSchema = z.object({
  overallFeedback: z.string().describe("A high-level summary of the resume's strengths and areas for improvement."),
  suggestedImprovements: z.array(ResumeSectionImprovementSchema).describe("An array of specific, actionable improvements for different sections of the resume."),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are a world-class professional resume expert and career coach.

  Your task is to analyze the provided resume and provide structured, actionable feedback to help the user dramatically improve it.

  1.  **Overall Feedback**: Start with a high-level summary. Briefly mention the resume's strengths and the primary areas that need enhancement.
  2.  **Suggested Improvements**: Identify 2-4 key areas in the resume that could be significantly improved. For each area:
      - Identify the section (e.g., "Professional Summary", "Experience: Acme Corp", "Skills").
      - Quote a small, specific part of the original text.
      - Provide a rewritten, "improved" version of that text.
      - Explain concisely why your version is an improvement (e.g., "Quantifies achievements with metrics," "Uses more impactful action verbs," "Is more concise and clear.").

  Focus on making the resume more impactful, achievement-oriented, and ATS-friendly.

  Resume for analysis:
  {{media url=resumeDataUri}}`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

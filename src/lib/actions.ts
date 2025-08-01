"use server";

import { analyzeCoverLetter, type AnalyzeCoverLetterInput } from "@/ai/flows/analyze-cover-letter";
import { analyzeResume, type AnalyzeResumeInput } from "@/ai/flows/analyze-resume";
import { generateFeedback, type GenerateFeedbackInput } from "@/ai/flows/generate-feedback";
import { generateInterviewQuestions, type GenerateInterviewQuestionsInput } from "@/ai/flows/generate-interview-questions";
import { analyzeVideo, type AnalyzeVideoInput } from "@/ai/flows/analyze-video";
import { analyzeVoice, type AnalyzeVoiceInput } from "@/ai/flows/analyze-voice";


export async function getInterviewQuestionsAction(input: GenerateInterviewQuestionsInput) {
  try {
    const output = await generateInterviewQuestions(input);
    return { success: true, data: output };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate interview questions." };
  }
}

export async function getFeedbackAction(input: GenerateFeedbackInput) {
  try {
    const output = await generateFeedback(input);
    return { success: true, data: output };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate feedback." };
  }
}

export async function analyzeResumeAction(input: AnalyzeResumeInput) {
  try {
    const output = await analyzeResume(input);
    return { success: true, data: output };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to analyze resume." };
  }
}

export async function analyzeCoverLetterAction(input: AnalyzeCoverLetterInput) {
  try {
    const output = await analyzeCoverLetter(input);
    return { success: true, data: output };
  } catch (error)
    {
    console.error(error);
    return { success: false, error: "Failed to analyze cover letter." };
  }
}

export async function analyzeVideoAction(input: AnalyzeVideoInput) {
    try {
      const output = await analyzeVideo(input);
      return { success: true, data: output };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to analyze video." };
    }
}

export async function analyzeVoiceAction(input: AnalyzeVoiceInput) {
    try {
        const output = await analyzeVoice(input);
        return { success: true, data: output };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to analyze voice." };
    }
}

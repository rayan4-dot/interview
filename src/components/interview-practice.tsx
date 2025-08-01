
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { getInterviewQuestionsAction, getFeedbackAction } from '@/lib/actions';
import { Loader2, ArrowRight, CornerDownLeft, Sparkles, Star, Lightbulb, Languages } from 'lucide-react';
import type { GenerateFeedbackOutput } from '@/ai/flows/generate-feedback';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const setupSchema = z.object({
  industry: z.string().min(1, 'Please select an industry.'),
  role: z.string().min(1, 'Please select a role.'),
  language: z.string().min(1, 'Please select a language.'),
});
type SetupFormValues = z.infer<typeof setupSchema>;

const responseSchema = z.object({
  response: z.string().min(20, 'Please provide a more detailed response.'),
});
type ResponseFormValues = z.infer<typeof responseSchema>;

const industryRoles: Record<string, string[]> = {
  Technology: ["Software Engineer", "Product Manager", "Data Scientist", "DevOps Engineer", "UI/UX Designer"],
  Marketing: ["Marketing Manager", "Content Strategist", "SEO Specialist", "Social Media Manager", "Digital Marketing Analyst"],
  Finance: ["Financial Analyst", "Accountant", "Investment Banker", "Auditor", "Financial Advisor"],
  Healthcare: ["Registered Nurse", "Medical Doctor", "Healthcare Administrator", "Pharmacist", "Medical Assistant"],
  Education: ["Teacher", "School Principal", "Instructional Designer", "Academic Advisor", "Librarian"],
  "Human Resources": ["HR Manager", "Recruiter", "HR Generalist", "Compensation and Benefits Specialist", "Training and Development Manager"],
};
const industries = Object.keys(industryRoles);
const languages = ["English", "French", "Arabic", "Darija"];

export default function InterviewPractice() {
  const { toast } = useToast();
  const [sessionState, setSessionState] = useState<'setup' | 'interviewing' | 'finished'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<GenerateFeedbackOutput | null>(null);
  
  const [sessionDetails, setSessionDetails] = useState<{ industry: string, role: string, language: string } | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  const setupForm = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      industry: '',
      role: '',
      language: 'English',
    },
  });

  const responseForm = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
  });

  const handleIndustryChange = (industry: string) => {
    setupForm.setValue('industry', industry);
    setAvailableRoles(industryRoles[industry] || []);
    setupForm.setValue('role', '');
  }

  const startInterview: SubmitHandler<SetupFormValues> = async (data) => {
    setIsLoading(true);
    setSessionDetails(data);
    const response = await getInterviewQuestionsAction({ ...data, numQuestions: 5 });
    if (response.success && response.data?.questions.length) {
      setQuestions(response.data.questions);
      setSessionState('interviewing');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error || 'Could not fetch interview questions.',
      });
    }
    setIsLoading(false);
  };
  
  const submitResponse: SubmitHandler<ResponseFormValues> = async (data) => {
    setIsLoading(true);
    setFeedback(null);
    if (!sessionDetails) return;

    const response = await getFeedbackAction({ 
      question: questions[currentQuestionIndex],
      response: data.response,
      jobDescription: `The user is applying for a ${sessionDetails.role} role in the ${sessionDetails.industry} industry.`,
      language: sessionDetails.language,
    });

    if (response.success && response.data) {
      setFeedback(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error || 'Could not get feedback.',
      });
    }
    setIsLoading(false);
  };

  const nextQuestion = () => {
    setFeedback(null);
    responseForm.reset();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setSessionState('finished');
    }
  };

  const restartSession = () => {
    setSessionState('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setFeedback(null);
    setSessionDetails(null);
    setAvailableRoles([]);
    setupForm.reset();
    responseForm.reset();
  }

  if (sessionState === 'setup') {
    return (
      <div className="mx-auto max-w-lg">
        <Form {...setupForm}>
          <form onSubmit={setupForm.handleSubmit(startInterview)} className="space-y-6">
            <FormField
              control={setupForm.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select onValueChange={handleIndustryChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map(industry => <SelectItem key={industry} value={industry}>{industry}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={setupForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={availableRoles.length === 0}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={setupForm.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Languages /> Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Start Interview'}
            </Button>
          </form>
        </Form>
      </div>
    );
  }
  
  if (sessionState === 'finished') {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <CardHeader>
          <CardTitle className="font-headline">Interview Complete!</CardTitle>
          <CardDescription>You've completed all the questions for this session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={restartSession}>Start a New Session</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="mb-2 h-2" />
        <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <Card className="mt-2">
          <CardContent className="p-6">
            <p className="text-lg font-semibold text-foreground">{questions[currentQuestionIndex]}</p>
          </CardContent>
        </Card>
      </div>

      <Form {...responseForm}>
        <form onSubmit={responseForm.handleSubmit(submitResponse)} className="space-y-4">
          <FormField
            control={responseForm.control}
            name="response"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Your Response</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Type your answer here..."
                    className="min-h-[150px]"
                    {...field}
                    disabled={!!feedback || isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!feedback && (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><CornerDownLeft className="mr-2 h-4 w-4" /> Submit Answer</>
              )}
            </Button>
          )}
        </form>
      </Form>

      {isLoading && !feedback && (
         <Card className="mt-6 animate-pulse">
            <CardHeader className="h-10 w-1/3 bg-muted rounded"></CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="h-4 w-full rounded bg-muted"></div>
              <div className="h-4 w-full rounded bg-muted"></div>
              <div className="h-4 w-5/6 rounded bg-muted"></div>
            </CardContent>
         </Card>
      )}

      {feedback && (
        <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-bold font-headline flex items-center gap-2"><Sparkles className="text-accent h-6 w-6"/>Feedback Analysis</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Star className="h-6 w-6 text-yellow-400"/>
                <CardTitle>Overall Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary">{feedback.score}<span className="text-2xl text-muted-foreground">/100</span></p>
                <Progress value={feedback.score} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Lightbulb className="h-6 w-6 text-green-500"/>
                <CardTitle>Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feedback.areasForImprovement}</p>
              </CardContent>
            </Card>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Detailed Feedback</h3>
            <p className="mt-2 whitespace-pre-wrap rounded-md bg-secondary p-4 text-secondary-foreground">
              {feedback.feedback}
            </p>
          </div>
          <Button onClick={nextQuestion} className="w-full md:w-auto">
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Interview"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

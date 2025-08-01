
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getInterviewQuestionsAction, analyzeVideoAction } from '@/lib/actions';
import { Loader2, Camera, Video, VideoOff, ArrowRight, Sparkles, Star, Lightbulb, AlertCircle, Languages } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AnalyzeVideoOutput } from '@/ai/flows/analyze-video';
import { Progress } from '@/components/ui/progress';

const setupSchema = z.object({
  industry: z.string().min(1, 'Please select an industry.'),
  role: z.string().min(1, 'Please select a role.'),
  language: z.string().min(1, 'Please select a language.'),
});
type SetupFormValues = z.infer<typeof setupSchema>;

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

export default function VideoAnalysis() {
  const { toast } = useToast();
  const [sessionState, setSessionState] = useState<'setup' | 'interviewing' | 'finished'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<AnalyzeVideoOutput | null>(null);
  const [sessionDetails, setSessionDetails] = useState<{ industry: string, role: string, language: string } | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  const setupForm = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      industry: '',
      role: '',
      language: 'English',
    }
  });

  const fileToDataUri = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = useCallback(async (videoBlob: Blob) => {
    if (!videoBlob || !sessionDetails) return;
    setIsLoading(true);
    setFeedback(null);
    
    try {
        const videoDataUri = await fileToDataUri(videoBlob);
        const response = await analyzeVideoAction({ videoDataUri, language: sessionDetails.language });
        if (response.success && response.data) {
            setFeedback(response.data);
        } else {
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: response.error || 'An unexpected error occurred.',
            });
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not analyze the video. Please try again.',
        });
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  }, [toast, sessionDetails]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Video play failed:", e));
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    if (sessionState === 'interviewing') {
        getCameraPermission();
    }


    return () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
    }
  }, [sessionState, toast]);
  
  const handleIndustryChange = (industry: string) => {
    setupForm.setValue('industry', industry);
    setAvailableRoles(industryRoles[industry] || []);
    setupForm.setValue('role', '');
  }

  const startInterview: SubmitHandler<SetupFormValues> = async (data) => {
    setIsLoading(true);
    setSessionDetails(data);
    const response = await getInterviewQuestionsAction({ ...data, numQuestions: 3 });
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

  const handleStartRecording = () => {
    if (streamRef.current) {
      const localRecordedChunks: Blob[] = [];
      setIsRecording(true);
      const stream = streamRef.current;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          localRecordedChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(localRecordedChunks, { type: 'video/webm' });
        handleAnalyze(recordedBlob);
        setIsRecording(false);
      }

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } else {
        toast({
            variant: 'destructive',
            title: 'Camera not ready',
            description: 'Could not access the camera stream to start recording.',
        });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
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
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Start Video Interview'}
            </Button>
          </form>
        </Form>
        {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please grant camera permissions and refresh to start an interview.
                </AlertDescription>
            </Alert>
        )}
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

      <Card>
        <CardHeader>
          <CardTitle>Live Camera Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video w-full rounded-md bg-muted">
            <video ref={videoRef} className="h-full w-full rounded-md" autoPlay muted playsInline />
            {hasCameraPermission === false ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-destructive/80 text-destructive-foreground">
                <VideoOff className="h-16 w-16" />
                <h3 className="text-xl font-bold">Camera Access Denied</h3>
              </div>
            ) : hasCameraPermission === null && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-muted/80 text-muted-foreground">
                    <Camera className="h-16 w-16 animate-pulse" />
                    <p>Waiting for camera...</p>
                 </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!feedback &&
        <div className="flex flex-col items-center gap-4">
          {!isRecording ? (
            <Button onClick={handleStartRecording} size="lg" disabled={isLoading || !hasCameraPermission}>
              <Video className="mr-2" /> Start Recording Answer
            </Button>
          ) : (
            <Button onClick={handleStopRecording} size="lg" variant="destructive" disabled={isLoading}>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recording...
            </Button>
          )}
        </div>
      }

      {isLoading && !feedback && (
         <Card className="mt-6 animate-pulse">
            <CardHeader className="h-10 w-1/3 bg-muted rounded"></CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="flex justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary"/>
                </div>
              <div className="h-4 w-full rounded bg-muted"></div>
              <div className="h-4 w-5/6 rounded bg-muted mx-auto"></div>
              <p className="text-center text-muted-foreground">Analyzing your performance... this may take a moment.</p>
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
                <CardTitle>Confidence Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary">{feedback.confidenceScore}<span className="text-2xl text-muted-foreground">/100</span></p>
                <Progress value={feedback.confidenceScore} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Lightbulb className="h-6 w-6 text-green-500"/>
                <CardTitle>Non-Verbal Cue Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feedback.nonVerbalFeedback}</p>
              </CardContent>
            </Card>
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

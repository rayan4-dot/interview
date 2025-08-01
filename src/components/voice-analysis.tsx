
"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getInterviewQuestionsAction, analyzeVoiceAction } from '@/lib/actions';
import { Loader2, Mic, MicOff, ArrowRight, Sparkles, Star, Lightbulb, AlertCircle, Languages } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AnalyzeVoiceOutput } from '@/ai/flows/analyze-voice';
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

export default function VoiceAnalysis() {
  const { toast } = useToast();
  const [sessionState, setSessionState] = useState<'setup' | 'interviewing' | 'finished'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<AnalyzeVoiceOutput | null>(null);
  const [sessionDetails, setSessionDetails] = useState<{ industry: string, role: string, language: string } | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const setupForm = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      industry: '',
      role: '',
      language: 'English',
    }
  });

  const drawVisualizer = () => {
    if (!analyserRef.current || !visualizerRef.current) return;

    const canvas = visualizerRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current?.getByteTimeDomainData(dataArray);

      if (canvasCtx) {
        canvasCtx.fillStyle = 'hsl(var(--background))';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'hsl(var(--primary))';
        canvasCtx.beginPath();

        const sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      }
    };
    draw();
  };
  
  useEffect(() => {
    const getMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasMicPermission(true);
        streamRef.current = stream;

        const context = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = context;
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyserRef.current = analyser;
        source.connect(analyser);
        if (visualizerRef.current) {
          drawVisualizer();
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setHasMicPermission(false);
        toast({
          variant: 'destructive',
          title: 'Microphone Access Denied',
          description: 'Please enable microphone permissions in your browser settings.',
        });
      }
    };

    if(sessionState === 'interviewing') {
        getMicPermission();
    }

    return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        streamRef.current?.getTracks().forEach(track => track.stop());
        if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setRecordedChunks([]);
      const recorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      recorder.start();
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const fileToDataUri = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handleAnalyze = async () => {
    if (recordedChunks.length === 0 || !sessionDetails) return;
    setIsLoading(true);
    setFeedback(null);
    const recordedBlob = new Blob(recordedChunks, { type: 'audio/webm' });
    
    try {
        const audioDataUri = await fileToDataUri(recordedBlob);
        const response = await analyzeVoiceAction({ 
          audioDataUri,
          question: questions[currentQuestionIndex],
          role: sessionDetails.role,
          language: sessionDetails.language,
        });
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
            description: 'Could not analyze the audio. Please try again.',
        });
        console.error(error);
    } finally {
        setIsLoading(false);
        setRecordedChunks([]);
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setRecordedChunks([]);
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
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Start Voice Interview'}
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
    <div className="mx-auto max-w-2xl space-y-8">
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
          <CardTitle>Record Your Answer</CardTitle>
        </CardHeader>
        <CardContent className="relative flex flex-col items-center gap-4">
          <canvas ref={visualizerRef} width="500" height="100" className="rounded-md bg-background"></canvas>
            {hasMicPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-destructive/80 text-destructive-foreground">
                    <MicOff className="h-16 w-16" />
                    <h3 className="text-xl font-bold">Microphone Access Denied</h3>
                </div>
            )}
            {hasMicPermission === null && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-muted/80 text-muted-foreground">
                    <Mic className="h-16 w-16 animate-pulse" />
                    <p>Requesting microphone permission...</p>
                 </div>
            )}
        </CardContent>
      </Card>

      {!feedback && 
        <div className="flex flex-col items-center gap-4">
            {!isRecording && recordedChunks.length === 0 && (
                <Button onClick={handleStartRecording} size="lg" disabled={isLoading || !hasMicPermission}>
                    <Mic className="mr-2" /> Start Recording
                </Button>
            )}
            {isRecording && (
                <Button onClick={handleStopRecording} size="lg" variant="destructive" disabled={isLoading}>
                    <MicOff className="mr-2" /> Stop Recording
                </Button>
            )}
            {recordedChunks.length > 0 && !isRecording && (
                <Button onClick={handleAnalyze} size="lg" disabled={isLoading}>
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Speech...
                    </>
                ) : (
                    'Submit and Analyze'
                )}
                </Button>
            )}
        </div>
      }
      
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
                <CardTitle>Clarity Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-primary">{feedback.clarityScore}<span className="text-2xl text-muted-foreground">/100</span></p>
                <Progress value={feedback.clarityScore} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Lightbulb className="h-6 w-6 text-green-500"/>
                <CardTitle>Speech Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feedback.speechFeedback}</p>
              </CardContent>
            </Card>
          </div>
          <Button onClick={nextQuestion} className="w-full md:w-auto">
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Interview"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {hasMicPermission === false && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
                You need to grant microphone permissions in your browser settings to use this feature. After granting permissions, please refresh the page.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// src/components/cover-letter-analyzer-form.tsx
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
import { analyzeCoverLetterAction } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import type { AnalyzeCoverLetterOutput } from '@/ai/flows/analyze-cover-letter';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schema = z.object({
  coverLetterText: z.string().min(100, { message: 'Please enter at least 100 characters for a meaningful analysis.' }),
});
type FormValues = z.infer<typeof schema>;

export default function CoverLetterAnalyzerForm() {
  const { toast } = useToast();
  const [result, setResult] = useState<AnalyzeCoverLetterOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      coverLetterText: ""
    }
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await analyzeCoverLetterAction({ coverLetterText: data.coverLetterText });

      if (response.success && response.data) {
        setResult(response.data);
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
        description: 'Could not analyze the cover letter. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="coverLetterText"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Your Cover Letter</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste your cover letter text here..."
                    className="min-h-[250px] text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              'Analyze Cover Letter'
            )}
          </Button>
        </form>
      </Form>

      {isLoading && (
        <div className="mt-8 space-y-6">
            <div className="h-8 w-1/4 rounded bg-muted animate-pulse"></div>
            <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted animate-pulse"></div>
                <div className="h-4 w-full rounded bg-muted animate-pulse"></div>
                <div className="h-4 w-5/6 rounded bg-muted animate-pulse"></div>
            </div>
        </div>
      )}

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-headline">Analysis Results</CardTitle>
            <Progress value={result.overallScore} className="mt-2 h-3" />
            <CardDescription className="pt-2 text-right font-bold text-lg text-primary">{result.overallScore} / 100</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">Structure Feedback</h3>
              <p className="mt-1 text-muted-foreground">{result.structureFeedback}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Clarity Feedback</h3>
              <p className="mt-1 text-muted-foreground">{result.clarityFeedback}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Keyword Optimization</h3>
              <p className="mt-1 text-muted-foreground">{result.keywordOptimizationFeedback}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

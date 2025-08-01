"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeResumeAction } from '@/lib/actions';
import { Loader2, FileCheck2, UploadCloud, ArrowRight, Wand2 } from 'lucide-react';
import type { AnalyzeResumeOutput } from '@/ai/flows/analyze-resume';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from './ui/badge';

const schema = z.object({
  file: z.any().refine((files) => files?.length > 0, 'Please upload a resume file.'),
});
type FormValues = z.infer<typeof schema>;

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ResumeAnalyzerForm() {
  const { toast } = useToast();
  const [result, setResult] = useState<AnalyzeResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const fileRef = form.register("file");
  const fileList = form.watch('file');

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setResult(null);
    try {
      const file = data.file[0] as File;
      const dataUri = await fileToDataUri(file);
      const response = await analyzeResumeAction({ resumeDataUri: dataUri });

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
        description: 'Could not analyze the resume. Please try again.',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <label
                  htmlFor="resume-upload"
                  className={cn(
                    "relative block w-full cursor-pointer rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-12 text-center transition-colors hover:border-primary/40 hover:bg-primary/10",
                    { "border-accent/80 bg-accent/10": fileList?.length > 0 }
                  )}
                >
                  {fileList?.length > 0 ? (
                    <div className="flex flex-col items-center gap-2 text-accent">
                      <FileCheck2 className="h-10 w-10" />
                      <span className="font-semibold">{fileName}</span>
                      <span className="text-xs text-muted-foreground">Click or drag to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UploadCloud className="h-10 w-10" />
                      <span className="font-semibold">Click to upload or drag and drop</span>
                      <span className="text-xs">PDF, DOCX, or other resume formats</span>
                    </div>
                  )}
                   <FormControl>
                      <Input
                        id="resume-upload"
                        type="file"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        {...fileRef}
                        onChange={handleFileChange}
                      />
                  </FormControl>
                </label>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading || !fileList || fileList.length === 0} className="w-full md:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              'Analyze Resume'
            )}
          </Button>
        </form>
      </Form>

      {isLoading && (
        <Card className="mt-8 animate-pulse">
          <CardHeader>
            <div className="h-6 w-1/2 rounded bg-muted"></div>
            <div className="mt-2 h-4 w-3/4 rounded bg-muted"></div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="h-4 w-full rounded bg-muted"></div>
            <div className="h-4 w-full rounded bg-muted"></div>
            <div className="h-4 w-5/6 rounded bg-muted"></div>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Overall Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {result.overallFeedback}
              </p>
            </CardContent>
          </Card>
          
          <div>
             <h3 className="text-xl font-bold font-headline mb-4 flex items-center gap-2"><Wand2 className="h-6 w-6 text-primary"/> AI-Suggested Improvements</h3>
             <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {result.suggestedImprovements.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-lg hover:no-underline">
                        Improvement for: <Badge variant="secondary" className="ml-2">{item.section}</Badge>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">Original Text</h4>
                          <blockquote className="mt-1 border-l-2 pl-4 italic text-sm text-muted-foreground/80">
                            "{item.originalText}"
                          </blockquote>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-green-600 dark:text-green-500">Suggested Text</h4>
                          <blockquote className="mt-1 border-l-2 border-green-500 bg-green-500/10 p-4 rounded-r-lg text-sm">
                            {item.improvedText}
                          </blockquote>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Explanation</h4>
                            <p className="text-sm text-muted-foreground">{item.explanation}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                ))}
             </Accordion>
          </div>
        </div>
      )}
    </div>
  );
}

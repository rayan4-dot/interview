
"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BotMessageSquare, FileText, Mail, Mic, Video, UserPlus, ClipboardList } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { useAppMode } from '@/hooks/use-app-mode';
import ProgressChart from '@/components/progress-chart';

export default function Home() {
  const { mode } = useAppMode();

  const candidateTools = [
    {
      title: 'Mock Interview Practice',
      description: 'Engage in realistic mock interviews with our AI. Get instant feedback on your answers.',
      href: '/interview',
      icon: <BotMessageSquare className="h-6 w-6 text-primary" />,
      cta: 'Start Practice',
    },
    {
      title: 'AI Resume Analyzer',
      description: 'Upload your resume to get an in-depth analysis of its structure, clarity, and keyword optimization.',
      href: '/resume-analyzer',
      icon: <FileText className="h-6 w-6 text-primary" />,
      cta: 'Analyze Resume',
    },
    {
      title: 'Cover Letter Review',
      description: 'Paste your cover letter text to receive AI-powered suggestions for improvement and impact.',
      href: '/cover-letter-analyzer',
      icon: <Mail className="h-6 w-6 text-primary" />,
      cta: 'Review Letter',
    },
    {
      title: 'Video Interview Analysis',
      description: 'Analyze facial expressions, posture, and eye contact for non-verbal cues.',
      href: '/video-analysis',
      icon: <Video className="h-6 w-6 text-primary" />,
      cta: 'Start Video Analysis',
    },
    {
        title: 'Voice & Speech Analysis',
        description: 'Detects tone, clarity, and hesitation. Provides feedback on speech pacing & pronunciation.',
        href: '/voice-analysis',
        icon: <Mic className="h-6 w-6 text-primary" />,
        cta: 'Start Voice Analysis',
    }
  ];

  const managerTools = [
     {
      title: 'Create Interview',
      description: 'Design a custom interview by selecting questions or generating them with AI.',
      href: '/manager/create-interview',
      icon: <ClipboardList className="h-6 w-6 text-primary" />,
      cta: 'Create Now',
    },
     {
      title: 'Invite Candidate',
      description: 'Send a unique link to candidates to take the interview asynchronously.',
      href: '#',
      icon: <UserPlus className="h-6 w-6 text-primary" />,
      cta: 'Invite Candidate',
    },
  ]
  
  const tools = mode === 'candidate' ? candidateTools : managerTools;
  const pageTitle = mode === 'candidate' ? "Welcome Back, Guest!" : "Hiring Manager Dashboard";
  const pageDescription = mode === 'candidate' ? "Your personalized dashboard is ready. Let's continue preparing for your dream job." : "Create interviews, invite candidates, and review submissions.";

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
       <PageHeader
          title={pageTitle}
          description={pageDescription}
        >
            <Button asChild>
              <Link href={mode === 'candidate' ? "/interview" : "/manager/create-interview"}>
                {mode === 'candidate' ? 'Start New Mock Interview' : 'Create New Interview'} <ArrowRight className="ml-2" />
              </Link>
            </Button>
        </PageHeader>

      {mode === 'candidate' && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Snapshot</CardTitle>
            <CardDescription>Your progress over the last 5 sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart />
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          {mode === 'candidate' ? 'Practice Tools' : 'Manager Tools'}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.title} className="flex flex-col border-2 border-transparent hover:border-primary/70 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="flex-row items-start gap-4 space-y-0">
                <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                    {tool.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <Button asChild variant="secondary" className="w-full">
                  <Link href={tool.href}>
                    {tool.cta} <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

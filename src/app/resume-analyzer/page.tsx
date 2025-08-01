import PageHeader from '@/components/page-header';
import ResumeAnalyzerForm from '@/components/resume-analyzer-form';

export default function ResumeAnalyzerPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <PageHeader
        title="AI Resume Analyzer"
        description="Upload your resume to receive AI-powered feedback on its structure, clarity, and keyword optimization."
      />
      <div className="flex-1 rounded-lg border p-4 shadow-sm md:p-6">
        <ResumeAnalyzerForm />
      </div>
    </main>
  );
}

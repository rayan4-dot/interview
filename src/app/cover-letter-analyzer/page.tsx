import PageHeader from '@/components/page-header';
import CoverLetterAnalyzerForm from '@/components/cover-letter-analyzer-form';

export default function CoverLetterAnalyzerPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <PageHeader
        title="AI Cover Letter Analyzer"
        description="Paste your cover letter text to receive AI-powered suggestions and an overall quality score."
      />
      <div className="flex-1 rounded-lg border p-4 shadow-sm md:p-6">
        <CoverLetterAnalyzerForm />
      </div>
    </main>
  );
}

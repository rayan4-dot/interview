import PageHeader from '@/components/page-header';
import VideoAnalysis from '@/components/video-analysis';

export default function VideoAnalysisPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <PageHeader
        title="AI Video Interview Analysis"
        description="Analyze your non-verbal cues like facial expressions, posture, and eye contact."
      />
      <div className="flex-1 rounded-lg border p-4 shadow-sm md:p-6">
        <VideoAnalysis />
      </div>
    </main>
  );
}

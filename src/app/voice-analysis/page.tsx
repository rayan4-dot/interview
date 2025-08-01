import PageHeader from '@/components/page-header';
import VoiceAnalysis from '@/components/voice-analysis';

export default function VoiceAnalysisPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <PageHeader
        title="AI Voice & Speech Analysis"
        description="Get real-time feedback on your tone, clarity, pacing, and pronunciation."
      />
      <div className="flex-1 rounded-lg border p-4 shadow-sm md:p-6">
        <VoiceAnalysis />
      </div>
    </main>
  );
}

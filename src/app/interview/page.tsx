import PageHeader from '@/components/page-header';
import InterviewPractice from '@/components/interview-practice';

export default function InterviewPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <PageHeader
        title="AI Mock Interview"
        description="Select your industry and role to start a tailored interview session."
      />
      <div className="flex-1 rounded-lg border p-4 shadow-sm md:p-6">
        <InterviewPractice />
      </div>
    </main>
  );
}

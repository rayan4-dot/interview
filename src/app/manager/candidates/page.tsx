import PageHeader from '@/components/page-header';

export default function CandidatesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <PageHeader
        title="Manage Candidates"
        description="Review candidate submissions and invite new candidates."
      />
      <div className="flex-1 rounded-lg border p-4 shadow-sm md:p-6">
        <div className="flex h-[450px] w-full items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">Candidate list and invitation management will go here.</p>
        </div>
      </div>
    </main>
  );
}

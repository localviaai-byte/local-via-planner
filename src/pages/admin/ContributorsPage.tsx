import { ContributorsSection } from '@/components/admin/ContributorsSection';

export default function ContributorsPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl lg:text-3xl font-semibold">Contributors</h1>
        <p className="text-muted-foreground">Gestisci gli inviti e i permessi dei contributor</p>
      </div>
      <ContributorsSection />
    </div>
  );
}

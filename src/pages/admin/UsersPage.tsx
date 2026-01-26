import { UsersSection } from '@/components/admin/UsersSection';

export default function UsersPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl lg:text-3xl font-semibold">Utenti</h1>
        <p className="text-muted-foreground">Visualizza e gestisci gli utenti della piattaforma</p>
      </div>
      <UsersSection />
    </div>
  );
}

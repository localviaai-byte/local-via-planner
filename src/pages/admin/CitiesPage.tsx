import { CitiesSection } from '@/components/admin/CitiesSection';

export default function CitiesPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl lg:text-3xl font-semibold">Città</h1>
        <p className="text-muted-foreground">Gestisci le città e i loro contenuti</p>
      </div>
      <CitiesSection />
    </div>
  );
}

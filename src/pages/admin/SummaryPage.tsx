import { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Map, Users, Building2, Compass, ShoppingBag, Star, 
  Brain, CalendarDays, Utensils, UserCog, Shield, Bell,
  Search, Globe, Layers, MessageSquare, Flag, Clock,
  BarChart3, Package, Sparkles, Route, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const featureCategories = [
  {
    title: 'Gestione Contenuti',
    icon: Layers,
    features: [
      { name: 'Gestione Città', desc: 'CRUD completo con wizard di creazione, zone, status automatico', status: 'active' },
      { name: 'Gestione Luoghi', desc: 'Wizard multi-step, quality score automatico, vibe sliders, orari', status: 'active' },
      { name: 'Zone Cittadine', desc: 'Suddivisione città in zone con vibe, suggerimenti e best time', status: 'active' },
      { name: 'Connessioni Città', desc: 'Day trip, metro, nearby con tempi, costi e tip locali', status: 'active' },
      { name: 'Cluster Città', desc: 'Raggruppamento città per aree geografiche', status: 'active' },
      { name: 'Media Luoghi', desc: 'Galleria foto con ordinamento per ogni luogo', status: 'active' },
      { name: 'Tag System', desc: 'Tag gerarchici con gruppi e pesi per luoghi e prodotti', status: 'active' },
    ]
  },
  {
    title: 'Itinerario AI',
    icon: Brain,
    features: [
      { name: 'Wizard Pianificazione', desc: '5 step: destinazione, interessi, stile, ritmo, cibo', status: 'active' },
      { name: 'Generazione AI', desc: 'Itinerario personalizzato via edge function con OpenAI', status: 'active' },
      { name: 'Filtro Cibo Dinamico', desc: 'Solo cucine disponibili nel DB per la città selezionata', status: 'active' },
      { name: 'Periodo Viaggio', desc: 'Stagione, mese o date specifiche riflesse nell\'itinerario', status: 'active' },
      { name: 'Viewer Itinerario', desc: 'Timeline interattiva con slot, dettagli luogo, mappa', status: 'active' },
      { name: 'Sostituzione Slot', desc: 'Replace di singoli slot con alternative compatibili', status: 'active' },
      { name: 'Spostamento Slot', desc: 'Riorganizzazione drag degli slot tra giorni', status: 'active' },
      { name: 'Salvataggio Piano', desc: 'Persistenza su Supabase con preferenze e items', status: 'active' },
    ]
  },
  {
    title: 'Prodotti & Esperienze',
    icon: Package,
    features: [
      { name: 'Catalogo Prodotti', desc: 'Tour, degustazioni, workshop, dining, trasporti, ticket', status: 'active' },
      { name: 'Regole Prodotto', desc: 'Trigger automatici per suggerire prodotti in base a contesto', status: 'active' },
      { name: 'Add-on Itinerario', desc: 'Suggerimenti prodotto contestuali nello slot timeline', status: 'active' },
      { name: 'Checkout Extras', desc: 'Sheet di riepilogo prodotti selezionati con totale', status: 'active' },
    ]
  },
  {
    title: 'RBAC & Team',
    icon: Shield,
    features: [
      { name: 'Ruoli', desc: 'Admin, Editor, Local Contributor con permessi granulari', status: 'active' },
      { name: 'Inviti Contributor', desc: 'Invio via codice con scadenza, assegnazione città', status: 'active' },
      { name: 'Onboarding Contributor', desc: 'Wizard 4-step per nuovi contributor locali', status: 'active' },
      { name: 'Dashboard Contributor', desc: 'Vista dedicata con suggerimenti e luoghi propri', status: 'active' },
      { name: 'Review Workflow', desc: 'Approvazione/rifiuto luoghi con commenti editor', status: 'active' },
      { name: 'Activity Logs', desc: 'Storico completo azioni con filtri e ricerca', status: 'active' },
    ]
  },
  {
    title: 'Discovery & Enrichment',
    icon: Search,
    features: [
      { name: 'AI Discovery', desc: 'Scoperta automatica luoghi via edge function + Firecrawl', status: 'active' },
      { name: 'AI Prefill', desc: 'Precompilazione campi luogo con intelligenza artificiale', status: 'active' },
      { name: 'TripAdvisor Enrich', desc: 'Arricchimento dati da TripAdvisor (rating, ranking, foto)', status: 'active' },
      { name: 'Geocoding', desc: 'Batch geocoding via Mapbox per coordinate luoghi', status: 'active' },
      { name: 'Enrich Photos', desc: 'Arricchimento automatico foto da fonti esterne', status: 'active' },
      { name: 'Place Flags', desc: 'Segnalazione problemi sui luoghi con risoluzione', status: 'active' },
    ]
  },
  {
    title: 'Frontend & UX',
    icon: Globe,
    features: [
      { name: 'Landing Page', desc: 'Hero section con CTA verso wizard pianificazione', status: 'active' },
      { name: 'Mappa Interattiva', desc: 'Mapbox GL con pin luoghi e navigazione', status: 'active' },
      { name: 'Calendario', desc: 'Selezione date viaggio con react-day-picker', status: 'active' },
      { name: 'Design Responsive', desc: 'Layout mobile-first con sidebar collassabile admin', status: 'active' },
      { name: 'Dark/Light Mode', desc: 'Tema via next-themes con token semantici CSS', status: 'active' },
    ]
  },
];

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  beta: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  planned: 'bg-muted text-muted-foreground border-border',
};

export default function SummaryPage() {
  const totalFeatures = featureCategories.reduce((sum, cat) => sum + cat.features.length, 0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    if (!contentRef.current) return;
    html2pdf()
      .set({
        margin: [10, 10],
        filename: 'LocalVia_Riepilogo.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(contentRef.current)
      .save();
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-semibold">Riepilogo Piattaforma</h1>
          <p className="text-muted-foreground">Executive summary e lista funzionalità</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
          <Download className="w-4 h-4 mr-2" />
          Scarica PDF
        </Button>
      </div>

      <div ref={contentRef}>

      {/* Executive Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-terracotta" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">LocalVia</strong> è una piattaforma di travel planning 
              che genera itinerari personalizzati sfruttando un database curato da contributor locali e 
              un motore AI. L'obiettivo è offrire esperienze autentiche, lontane dalle trappole turistiche.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{totalFeatures}</p>
                <p className="text-xs">Funzionalità attive</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{featureCategories.length}</p>
                <p className="text-xs">Aree funzionali</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-foreground">10+</p>
                <p className="text-xs">Edge Functions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feature List */}
      <div className="space-y-6">
        <h2 className="font-display text-xl font-semibold">Lista Funzionalità</h2>
        {featureCategories.map((category, i) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <category.icon className="w-5 h-5 text-terracotta" />
                  {category.title}
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {category.features.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.features.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-3 py-1.5 border-b last:border-0">
                      <Badge variant="outline" className={`text-[10px] shrink-0 mt-0.5 ${statusColors[feature.status]}`}>
                        {feature.status === 'active' ? 'Attivo' : feature.status === 'beta' ? 'Beta' : 'Pianificato'}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{feature.name}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      </div>
    </div>
  );
}

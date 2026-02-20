import { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Building2, Shield,
  Search, Globe, Layers,
  BarChart3, Package, Sparkles, Route, Download,
  Brain, Handshake, CreditCard, Link2, Store,
  Percent, UserCheck, Gift, Target, TrendingUp, Palette
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/* ─── Feature Categories ─── */
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

/* ─── Status Colors ─── */
const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  beta: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  planned: 'bg-muted text-muted-foreground border-border',
};

/* ─── Partnership Programs ─── */
const partnershipPrograms = [
  {
    title: 'Referral Partner',
    subtitle: 'B&B, Tour Operator, NCC, Guide turistiche',
    icon: Link2,
    color: 'text-blue-500',
    details: [
      'Il partner riceve un link affiliato e/o codice sconto univoco',
      'Commissione del 10–20% su ogni prenotazione attribuita',
      'L\'utente finale ottiene il 5% di sconto usando il codice affiliato',
      'Tracking diretto: ogni conversione è attribuita al partner tramite codice',
      'Dashboard partner per monitorare click, conversioni e guadagni',
    ],
  },
  {
    title: 'Affiliate Partner – Ristoratori',
    subtitle: 'Ristoranti, trattorie, wine bar, bistrot',
    icon: Store,
    color: 'text-terracotta',
    details: [
      'Fee mensile fissa per essere presenti in piattaforma',
      'Visibilità garantita negli itinerari AI come opzione locale curata',
      'Badge "Partner LocalVia" nel profilo del locale',
      'Accesso a insight: quante volte il locale è stato consigliato, click, salvataggi',
      'Possibilità di promuovere esperienze speciali (menu degustazione, eventi)',
    ],
  },
];

/* ─── Revenue Streams ─── */
const revenueStreams = [
  { name: 'Commissioni Referral', desc: 'Percentuale su prenotazioni generate dai partner affiliati (tour, esperienze, trasporti)', icon: Percent },
  { name: 'Fee Ristoratori', desc: 'Abbonamento mensile per presenza curata in piattaforma e visibilità negli itinerari', icon: CreditCard },
  { name: 'Prodotti & Esperienze', desc: 'Margine su tour guidati, degustazioni, workshop e ticket venduti direttamente', icon: Gift },
  { name: 'Premium / Upsell', desc: 'Itinerari personalizzati premium, concierge digitale, contenuti esclusivi (futuro)', icon: TrendingUp },
];

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
          <p className="text-muted-foreground">Executive summary completo</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
          <Download className="w-4 h-4 mr-2" />
          Scarica PDF
        </Button>
      </div>

      <div ref={contentRef} className="space-y-8">

        {/* ══════ EXECUTIVE SUMMARY ══════ */}
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
              <p>
                Il modello di business combina <strong className="text-foreground">commissioni su prenotazioni</strong> generate 
                tramite partner affiliati (B&B, tour operator, NCC), <strong className="text-foreground">abbonamenti mensili</strong> per 
                ristoratori che vogliono essere presenti nella piattaforma, e <strong className="text-foreground">margini sui prodotti</strong> venduti 
                direttamente (tour, degustazioni, esperienze).
              </p>
              <div className="grid sm:grid-cols-4 gap-4 pt-2">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{totalFeatures}</p>
                  <p className="text-xs">Funzionalità attive</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{featureCategories.length}</p>
                  <p className="text-xs">Aree funzionali</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">2</p>
                  <p className="text-xs">Programmi Partner</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">4</p>
                  <p className="text-xs">Revenue Streams</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════ COLOR PALETTE ══════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-terracotta" />
                Palette & Design System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Identità visiva <strong className="text-foreground">"Urban Local Journal"</strong> — toni caldi e mediterranei, zero gradienti tech. 
                Font display: <span className="font-display">Playfair Display</span> · Font body: <span className="font-body">Inter</span>.
              </p>

              {/* Core Palette */}
              <div>
                <p className="text-xs font-medium mb-2 text-foreground">Palette Principale</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Terracotta', hex: '#C46A4A', css: 'bg-terracotta', desc: 'Primary · CTA, accenti, icone' },
                    { name: 'Warm Sand', hex: '#F4F1EC', css: 'bg-sand', desc: 'Background principale' },
                    { name: 'Soft Ivory', hex: '#FBFAF8', css: 'bg-sand-light', desc: 'Card, superfici elevate' },
                    { name: 'Charcoal', hex: '#1F1F1F', css: 'bg-foreground', desc: 'Testo principale' },
                    { name: 'Olive', hex: '#7A8F7A', css: 'bg-accent', desc: 'Accent · Cultura, relax' },
                    { name: 'Warm Gray', hex: '#6E6A65', css: 'bg-muted-foreground', desc: 'Testo secondario' },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-lg border">
                      <div className={`w-10 h-10 rounded-lg shrink-0 border ${c.css}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{c.hex}</p>
                        <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accent & Contextual */}
              <div>
                <p className="text-xs font-medium mb-2 text-foreground">Accenti Contestuali</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Deep Wine', hex: '#6B2E3A', css: 'bg-wine', desc: 'Night · Social, flirt' },
                    { name: 'Gold', hex: '#D9A441', css: 'bg-gold', desc: 'Warning · Highlight' },
                    { name: 'Status Success', hex: '#6E8F7A', css: 'bg-status-success', desc: 'Conferme, attivo' },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-lg border">
                      <div className={`w-10 h-10 rounded-lg shrink-0 border ${c.css}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{c.hex}</p>
                        <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography & Radius */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-xs font-medium text-foreground">Tipografia</p>
                  <p className="font-display text-lg">Playfair Display</p>
                  <p className="text-xs text-muted-foreground">Display · Titoli, heading, hero</p>
                  <p className="font-body text-lg">Inter</p>
                  <p className="text-xs text-muted-foreground">Body · Testo, UI, label</p>
                </div>
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-xs font-medium text-foreground">Design Tokens</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Border radius: <span className="font-mono text-foreground">16px</span> (lg)</p>
                    <p>Shadow: <span className="font-mono text-foreground">soft, quasi invisibili</span></p>
                    <p>Gradients: <span className="font-mono text-foreground">caldi, no tech</span></p>
                    <p>Dark mode: <span className="font-mono text-foreground">Night theme con Wine</span></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════ REVENUE MODEL ══════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-terracotta" />
                Modello di Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {revenueStreams.map((stream) => (
                  <div key={stream.name} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-9 h-9 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0">
                      <stream.icon className="w-4 h-4 text-terracotta" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{stream.name}</p>
                      <p className="text-xs text-muted-foreground">{stream.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════ PARTNERSHIP PROGRAMS ══════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Handshake className="w-5 h-5 text-terracotta" />
                Programmi di Partnership
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {partnershipPrograms.map((program) => (
                <div key={program.title} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                      <program.icon className={`w-5 h-5 ${program.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{program.title}</p>
                      <p className="text-xs text-muted-foreground">{program.subtitle}</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 pl-1">
                    {program.details.map((detail, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-terracotta mt-0.5">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Affiliate Flow Diagram */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-medium mb-3 text-foreground">Flusso Referral</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground gap-2 flex-wrap">
                  <div className="text-center px-2 py-1.5 bg-background rounded border">
                    <UserCheck className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                    Partner condivide link
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="text-center px-2 py-1.5 bg-background rounded border">
                    <Target className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                    Utente usa codice (-5%)
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="text-center px-2 py-1.5 bg-background rounded border">
                    <Route className="w-4 h-4 mx-auto mb-1 text-terracotta" />
                    Prenotazione tracciata
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="text-center px-2 py-1.5 bg-background rounded border">
                    <Percent className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                    Partner guadagna 10–20%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════ PACCHETTI / PRODOTTI ══════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-terracotta" />
                Pacchetti & Prodotti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                LocalVia monetizza attraverso un catalogo di <strong className="text-foreground">prodotti ed esperienze</strong> suggeriti 
                contestualmente all'interno dell'itinerario. Ogni prodotto viene proposto in base a regole 
                intelligenti (tipo di luogo, interessi dell'utente, fascia oraria, zona).
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'Tour Guidati', desc: 'Walking tour, tour tematici, tour privati' },
                  { label: 'Degustazioni', desc: 'Vino, olio, street food, cooking class' },
                  { label: 'Workshop', desc: 'Ceramica, fotografia, artigianato locale' },
                  { label: 'Dining Experience', desc: 'Cene con chef, menu degustazione, aperitivi speciali' },
                  { label: 'Trasporti', desc: 'NCC, transfer aeroporto, noleggio scooter' },
                  { label: 'Ticket & Ingressi', desc: 'Musei, siti archeologici, eventi speciali' },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-lg border">
                    <p className="text-xs font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs">
                I prodotti vengono suggeriti come <strong className="text-foreground">add-on</strong> contestuali negli slot dell'itinerario, 
                con un checkout semplificato che mostra il riepilogo e il totale degli extra selezionati.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════ FEATURE LIST ══════ */}
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

import { motion } from 'framer-motion';
import { ChevronRight, Compass, LayoutDashboard, Sparkles, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import heroImage from '@/assets/hero-italy.jpg';
import logoWhite from '@/assets/logo-white.png';

interface HeroSectionProps {
  onStart: () => void;
}

export function HeroSection({ onStart }: HeroSectionProps) {
  const { user, isPartner, isContributor, isAdmin, isEditor } = useAuth();

  const getDashboardLink = () => {
    if (isPartner) return '/partner';
    if (isContributor) return '/contributor';
    if (isAdmin || isEditor) return '/admin';
    return null;
  };

  const dashboardLink = getDashboardLink();

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      {/* ── Full-screen hero image ── */}
      <div className="relative h-[60dvh] min-h-[360px] overflow-hidden">
        <img
          src={heroImage}
          alt="Veduta panoramica di un borgo italiano sulla costa"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />

        {/* Auth — subtle top-right */}
        <div className="absolute top-safe-top mt-4 right-4 z-20 flex items-center gap-2">
          {user && dashboardLink && (
            <a
              href={dashboardLink}
              className="px-3 py-1.5 text-xs tracking-wide uppercase text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors border border-white/10 flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3 h-3" />
              La mia area
            </a>
          )}
          {user && (
            <a
              href="/my-plans"
              className="px-3 py-1.5 text-xs tracking-wide uppercase text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors border border-white/10 flex items-center gap-1.5"
            >
              <Compass className="w-3 h-3" />
              I miei piani
            </a>
          )}
          {!user && (
            <a
              href="/auth"
              className="px-3 py-1.5 text-xs tracking-wide uppercase text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors border border-white/10"
            >
              Accedi / Registrati
            </a>
          )}
        </div>

        {/* Hero headline — anchored to bottom of image */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={logoWhite} alt="LocalVia" className="h-10 md:h-14 w-auto" />
            <p className="mt-3 text-[15px] text-white/85 max-w-[280px] leading-snug font-light">
              Scegli una città italiana.<br />
              Noi costruiamo il tuo itinerario perfetto.
            </p>
          </motion.div>
        </div>

        {/* Smooth curve transition */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path
              d="M0 60L60 52C120 44 240 28 360 22C480 16 600 20 720 24C840 28 960 32 1080 34C1200 36 1320 36 1380 36L1440 36V60H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </div>

      {/* ── Content below the fold ── */}
      <div className="flex-1 flex flex-col px-5 pt-5 pb-6 max-w-lg mx-auto w-full">
        {/* Editorial tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-display text-lg text-foreground/90 leading-relaxed text-center"
        >
          Non il solito itinerario.{' '}
          <span className="text-muted-foreground">
            È quello che ti consiglierebbe un amico del posto.
          </span>
        </motion.p>

        {/* Value props — 3 cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-6 grid grid-cols-3 gap-2.5"
        >
          {[
            { icon: MapPin, label: 'Curato da locali', sub: 'Consigli di chi vive lì', color: 'text-primary' },
            { icon: Sparkles, label: 'AI che non inventa', sub: 'Dati veri, zero allucinazioni', color: 'text-gold' },
            { icon: Clock, label: 'Tempi realistici', sub: 'Ritmo su misura per te', color: 'text-olive' },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-2 p-3.5 bg-card rounded-2xl shadow-soft text-center"
            >
              <div className={`w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center ${f.color}`}>
                <f.icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-foreground leading-tight">{f.label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{f.sub}</span>
            </div>
          ))}
        </motion.div>

        {/* Italy badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-5 flex items-center justify-center gap-2"
        >
          <span className="text-sm">🇮🇹</span>
          <span className="text-xs text-muted-foreground">
            Disponibile per <span className="font-medium text-foreground">qualsiasi città italiana</span>
          </span>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="pb-safe-bottom"
        >
          <Button
            onClick={onStart}
            variant="hero"
            size="lg"
            className="w-full h-14 text-base font-medium"
          >
            Dove vuoi andare?
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
          <p className="text-center text-[11px] text-muted-foreground mt-3">
            Gratis · Nessuna registrazione richiesta
          </p>
        </motion.div>

        {/* Footer */}
        <div className="mt-6 pb-2 text-center">
          <a
            href="mailto:info@localvia.app"
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            info@localvia.app
          </a>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { ChevronRight, Compass, LayoutDashboard, Sparkles, MapPin, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import heroImage from '@/assets/hero-italy.jpg';
import logoWhite from '@/assets/logo-white.png';
import logoColor from '@/assets/logo-color.png';

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
    <div className="h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      {/* ── Hero image — compact ── */}
      <div className="relative h-[42dvh] min-h-[220px] overflow-hidden shrink-0">
        <img
          src={heroImage}
          alt="Veduta panoramica di un borgo italiano sulla costa"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />

        {/* Auth — top-right */}
        <div className="absolute top-safe-top mt-3 right-3 z-20 flex items-center gap-1.5">
          {user && dashboardLink && (
            <a
              href={dashboardLink}
              className="px-2.5 py-1 text-[10px] tracking-wide uppercase text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors border border-white/10 flex items-center gap-1"
            >
              <LayoutDashboard className="w-2.5 h-2.5" />
              Area
            </a>
          )}
          {user && (
            <a
              href="/my-plans"
              className="px-2.5 py-1 text-[10px] tracking-wide uppercase text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors border border-white/10 flex items-center gap-1"
            >
              <Compass className="w-2.5 h-2.5" />
              Piani
            </a>
          )}
          {!user && (
            <a
              href="/auth"
              className="px-2.5 py-1 text-[10px] tracking-wide uppercase text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors border border-white/10"
            >
              Accedi
            </a>
          )}
        </div>

        {/* Logo + tagline — bottom of image */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={logoWhite} alt="LocalVia" className="h-8 md:h-12 w-auto" />
            <p className="mt-1.5 text-[13px] text-white/85 max-w-[260px] leading-snug font-light">
              Scegli una città italiana.<br />
              Noi costruiamo il tuo itinerario perfetto.
            </p>
          </motion.div>
        </div>

        {/* Curve */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path
              d="M0 40L60 34C120 28 240 18 360 14C480 10 600 12 720 16C840 20 960 22 1080 24C1200 26 1320 26 1380 26L1440 26V40H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col px-5 pt-3 pb-4 max-w-lg mx-auto w-full min-h-0">
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="font-display text-[15px] text-foreground/90 leading-relaxed text-center"
        >
          Non il solito itinerario.{' '}
          <span className="text-muted-foreground">
            È quello che ti consiglierebbe un amico del posto.
          </span>
        </motion.p>

        {/* Value props — compact row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-4 grid grid-cols-3 gap-2"
        >
          {[
            { icon: MapPin, label: 'Curato da locali', sub: 'Chi vive lì', color: 'text-primary' },
            { icon: Sparkles, label: 'AI che non inventa', sub: 'Dati veri', color: 'text-gold' },
            { icon: Clock, label: 'Tempi realistici', sub: 'Su misura', color: 'text-olive' },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1 py-2.5 px-2 bg-card rounded-2xl shadow-soft text-center"
            >
              <div className={`w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center ${f.color}`}>
                <f.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-semibold text-foreground leading-tight">{f.label}</span>
              <span className="text-[9px] text-muted-foreground leading-tight">{f.sub}</span>
            </div>
          ))}
        </motion.div>

        {/* Italy badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="mt-3 flex items-center justify-center gap-1.5"
        >
          <span className="text-xs">🇮🇹</span>
          <span className="text-[11px] text-muted-foreground">
            Disponibile per <span className="font-medium text-foreground">qualsiasi città italiana</span>
          </span>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1 min-h-2" />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="pb-safe-bottom"
        >
          <Button
            onClick={onStart}
            variant="hero"
            size="lg"
            className="w-full h-12 text-[15px] font-medium"
          >
            Dove vuoi andare?
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Gratis · Nessuna registrazione richiesta
          </p>
        </motion.div>

        {/* Footer */}
        <div className="mt-3 pb-1 flex items-center justify-center gap-3">
          <img src={logoColor} alt="LocalVia" className="h-4 w-auto opacity-60" />
          <span className="text-muted-foreground/30">|</span>
          <div className="flex items-center gap-2.5">
            <a href="mailto:info@localvia.app" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-3.5 h-3.5" />
            </a>
            <a href="https://instagram.com/localvia.app" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a href="https://tiktok.com/@localvia.app" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.18 8.18 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

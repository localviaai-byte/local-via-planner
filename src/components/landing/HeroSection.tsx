import { motion } from 'framer-motion';
import { ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-pompeii.jpg';

interface HeroSectionProps {
  onStart: () => void;
}

const destinations = [
  { name: 'Pompei', emoji: '🏛️' },
  { name: 'Napoli', emoji: '🍕' },
  { name: 'Costiera', emoji: '🌊' },
];

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      {/* ── Full-screen hero image ── */}
      <div className="relative h-[55dvh] min-h-[320px] overflow-hidden">
        <img
          src={heroImage}
          alt="Pompei ruins with Mount Vesuvius"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

        {/* Login — subtle top-right */}
        <a
          href="/admin/login"
          className="absolute top-safe-top mt-4 right-4 z-20 px-3 py-1.5 text-xs tracking-wide uppercase text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors border border-white/10"
        >
          Login
        </a>

        {/* Hero headline — anchored to bottom of image */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-[2.75rem] md:text-6xl font-semibold text-white leading-[1.05] tracking-tight">
              Local<span className="text-gold">Via</span>
            </h1>
            <p className="mt-2 text-base text-white/80 max-w-xs leading-snug font-light">
              Itinerari curati da chi il posto lo vive davvero
            </p>
          </motion.div>
        </div>

        {/* Smooth curve transition into content */}
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
      <div className="flex-1 flex flex-col px-5 pt-4 pb-6 max-w-lg mx-auto w-full">
        {/* Editorial tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-display text-lg text-foreground/90 leading-relaxed text-center"
        >
          Non sembra un'app.{' '}
          <span className="text-muted-foreground">
            Sembra il consiglio giusto, al momento giusto.
          </span>
        </motion.p>

        {/* Value props — compact horizontal cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-6 grid grid-cols-3 gap-2"
        >
          {[
            { emoji: '🏛️', label: 'Curato', sub: 'da locali veri' },
            { emoji: '🧠', label: 'AI smart', sub: 'non inventa' },
            { emoji: '⏱️', label: 'Realistico', sub: 'tempi su misura' },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-2xl shadow-soft text-center"
            >
              <span className="text-xl">{f.emoji}</span>
              <span className="text-xs font-medium text-foreground leading-tight">{f.label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{f.sub}</span>
            </div>
          ))}
        </motion.div>

        {/* Available destinations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-5 flex items-center justify-center gap-2"
        >
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <div className="flex items-center gap-1.5">
            {destinations.map((d, i) => (
              <span key={d.name} className="text-xs text-muted-foreground">
                <span className="mr-0.5">{d.emoji}</span>
                <span className="font-medium text-foreground">{d.name}</span>
                {i < destinations.length - 1 && <span className="ml-1.5">·</span>}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Spacer to push CTA to bottom */}
        <div className="flex-1 min-h-4" />

        {/* CTA — fixed visual weight */}
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
            Inizia a pianificare
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
          <p className="text-center text-[11px] text-muted-foreground mt-3">
            Gratis · Nessuna registrazione richiesta
          </p>
        </motion.div>
      </div>
    </div>
  );
}

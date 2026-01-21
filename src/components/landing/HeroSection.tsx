import { motion } from 'framer-motion';
import { Compass, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-pompeii.jpg';

interface HeroSectionProps {
  onStart: () => void;
}

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Image Area */}
      <div className="relative h-[60vh] overflow-hidden">
        {/* Background Image */}
        <img 
          src={heroImage} 
          alt="Pompei ruins with Mount Vesuvius" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay - warm and cinematic */}
        <div className="absolute inset-0 bg-gradient-overlay" />

        {/* Login Button - top right */}
        <a 
          href="/admin/login"
          className="absolute top-4 right-4 z-20 px-3 py-1.5 text-sm text-white/80 hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full transition-colors border border-white/10"
        >
          Login
        </a>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/20 backdrop-blur-md rounded-full text-white/90 text-sm mb-5 border border-white/10">
              <Compass className="w-4 h-4" />
              <span>Pianificazione intelligente</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl font-semibold text-white leading-tight tracking-tight">
              Local<span className="text-gold">Via</span>
            </h1>
            
            <p className="mt-4 text-lg text-white/85 max-w-sm mx-auto leading-relaxed font-light">
              Itinerari curati da chi il posto lo vive davvero
            </p>
          </motion.div>
        </div>

        {/* Soft curve transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path 
              d="M0 80L60 72C120 64 240 48 360 40C480 32 600 32 720 36C840 40 960 48 1080 52C1200 56 1320 56 1380 56L1440 56V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" 
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </div>

      {/* Content Section - Editorial feel */}
      <div className="flex-1 px-6 py-8 -mt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-md mx-auto space-y-8"
        >
          {/* Editorial intro */}
          <p className="font-display text-xl text-foreground/90 leading-relaxed text-center">
            Non sembra un'app.<br />
            <span className="text-muted-foreground">
              Sembra un consiglio giusto, dato al momento giusto.
            </span>
          </p>

          {/* Features - editorial cards */}
          <div className="space-y-3">
            {[
              {
                emoji: '🏛️',
                title: 'Contenuti curati',
                description: 'Ogni posto è scelto da chi ci è stato',
              },
              {
                emoji: '🧠',
                title: 'AI che seleziona',
                description: 'Non inventa: compone tra opzioni validate',
              },
              {
                emoji: '⏱️',
                title: 'Tempi realistici',
                description: 'Spostamenti, pause e ritmi su misura',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-card rounded-2xl shadow-soft"
              >
                <span className="text-2xl">{feature.emoji}</span>
                <div>
                  <h3 className="font-medium text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA - Sticky at bottom on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-4"
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
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Disponibile per <span className="font-medium text-foreground">Pompei</span>, 
              {' '}<span className="font-medium text-foreground">Napoli</span> e 
              {' '}<span className="font-medium text-foreground">Costiera</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

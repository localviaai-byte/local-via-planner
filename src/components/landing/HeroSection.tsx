import { motion } from 'framer-motion';
import { MapPin, Compass, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-pompeii.jpg';

interface HeroSectionProps {
  onStart: () => void;
}

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Image Area */}
      <div className="relative h-[55vh] overflow-hidden">
        {/* Background Image */}
        <img 
          src={heroImage} 
          alt="Pompei ruins with Mount Vesuvius" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay - stronger for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full text-white text-sm mb-6 border border-white/20">
              <Compass className="w-4 h-4" />
              <span>Travel Planning Intelligente</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg">
              Local<span className="text-gold">Via</span>
            </h1>
            
            <p className="mt-4 text-lg text-white/95 max-w-md mx-auto drop-shadow-md">
              Itinerari curati da esperti locali, 
              personalizzati con intelligenza artificiale
            </p>
          </motion.div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path 
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-6 py-8 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-md mx-auto space-y-8"
        >
          {/* Features */}
          <div className="grid gap-4">
            {[
              {
                icon: '🏛️',
                title: 'Contenuti curati',
                description: 'POI verificati con orari, prezzi e recensioni reali',
              },
              {
                icon: '🧠',
                title: 'AI che seleziona',
                description: 'Non inventa: sceglie tra opzioni validate da esperti',
              },
              {
                icon: '⏱️',
                title: 'Tempi realistici',
                description: 'Spostamenti, pause e ritmi calibrati su di te',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border shadow-soft"
              >
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button 
              onClick={onStart}
              size="lg" 
              className="w-full bg-gradient-hero hover:opacity-90 transition-opacity h-14 text-lg font-semibold shadow-elevated"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Inizia a pianificare
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Disponibile per <span className="font-medium text-foreground">Pompei</span>, 
              {' '}<span className="font-medium text-foreground">Napoli</span> e 
              {' '}<span className="font-medium text-foreground">Costiera Amalfitana</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

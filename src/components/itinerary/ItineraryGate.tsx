import { motion } from 'framer-motion';
import { Lock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ItineraryGateProps {
  /** Number of free slots to show before the gate */
  freeSlots?: number;
}

export function ItineraryGate({ freeSlots = 3 }: ItineraryGateProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative my-8"
    >
      {/* Fade overlay on last visible slot */}
      <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-background pointer-events-none z-10" />

      {/* Gate card */}
      <div className="relative z-20 mx-auto max-w-md">
        <div className="card-editorial p-6 text-center border border-primary/20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>

          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            Vuoi vedere l'itinerario completo?
          </h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Hai visto un'anteprima delle prime {freeSlots} tappe. Registrati gratuitamente per sbloccare tutto l'itinerario, salvarlo e personalizzarlo.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/auth?redirect=/')}
              className="w-full h-12 text-base"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Registrati gratis
            </Button>
            <button
              onClick={() => navigate('/auth?redirect=/')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Hai già un account? <span className="text-primary font-medium">Accedi</span>
            </button>
          </div>

          {/* Trust signals */}
          <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <span>✓ Gratis</span>
            <span>✓ Solo email</span>
            <span>✓ Niente spam</span>
          </div>
        </div>
      </div>

      {/* Blurred placeholder slots */}
      <div className="mt-6 space-y-4 select-none pointer-events-none" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-editorial p-4 blur-sm opacity-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { PlaceFormData } from '@/types/database';
import { Lightbulb } from 'lucide-react';

interface StepWarningProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
}

const EXAMPLE_WARNINGS = [
  "Evita il sabato se odi la folla",
  "Funziona solo dopo le 22",
  "Meglio andarci prima di cena",
  "Prenota sempre, anche il martedì",
  "Il tavolo in terrazza vale l'attesa",
  "La domenica è solo per famiglie",
];

export default function StepWarning({ formData, onUpdate }: StepWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Il segreto da local
        </h2>
        <p className="text-muted-foreground">
          C'è qualcosa che solo uno del posto sa?
        </p>
      </div>

      {/* Warning textarea */}
      <div className="space-y-2">
        <Label htmlFor="warning" className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-gold" />
          Il tuo consiglio da insider
        </Label>
        <Textarea
          id="warning"
          value={formData.local_warning}
          onChange={(e) => onUpdate({ local_warning: e.target.value })}
          placeholder="Cosa dovrebbe sapere chi ci va per la prima volta?"
          className="bg-card resize-none min-h-[120px]"
          maxLength={300}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Opzionale ma prezioso</span>
          <span>{formData.local_warning.length}/300</span>
        </div>
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Esempi di consigli utili:
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_WARNINGS.map((example, i) => (
            <button
              key={i}
              onClick={() => onUpdate({ local_warning: example })}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Quality note */}
      <div className="card-editorial p-4 bg-gold/5 border border-gold/20">
        <p className="text-sm text-foreground">
          <span className="font-medium">💡 Bonus qualità:</span> Un warning ben scritto 
          aumenta il punteggio del tuo posto e lo rende più utile per i viaggiatori.
        </p>
      </div>
    </motion.div>
  );
}

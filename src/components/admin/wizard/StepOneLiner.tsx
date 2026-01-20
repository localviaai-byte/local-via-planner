import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { PlaceFormData } from '@/types/database';
import { Quote, AlertCircle } from 'lucide-react';

interface StepOneLinerProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
  cityName: string;
}

export default function StepOneLiner({ formData, onUpdate, cityName }: StepOneLinerProps) {
  const charCount = formData.local_one_liner.length;
  const isValid = charCount >= 10 && charCount <= 140;
  const isTooShort = charCount > 0 && charCount < 10;
  const isTooLong = charCount > 140;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          La frase da local
        </h2>
        <p className="text-muted-foreground">
          Questa è la parte più importante. Questa frase apparirà ai viaggiatori.
        </p>
      </div>

      {/* Prompt */}
      <div className="card-editorial p-5 bg-primary/5 border border-primary/20">
        <p className="font-display text-lg text-foreground">
          <Quote className="w-5 h-5 inline-block mr-2 text-primary" />
          "Se sei a <span className="font-semibold">{cityName || '...'}</span> e vuoi{' '}
          <span className="text-primary">___</span>, questo è il posto giusto."
        </p>
      </div>

      {/* One-liner input */}
      <div className="space-y-2">
        <Label htmlFor="oneliner">Completa la frase *</Label>
        <Textarea
          id="oneliner"
          value={formData.local_one_liner}
          onChange={(e) => onUpdate({ local_one_liner: e.target.value })}
          placeholder="mangiare la vera pizza napoletana in un posto dove vanno i locali"
          className={`bg-card resize-none ${isTooLong ? 'border-destructive' : ''}`}
          rows={3}
          maxLength={150}
        />
        <div className="flex justify-between items-center">
          {isTooShort && (
            <span className="text-xs text-gold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Almeno 10 caratteri
            </span>
          )}
          {isTooLong && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Massimo 140 caratteri
            </span>
          )}
          {!isTooShort && !isTooLong && <span />}
          <span className={`text-xs ${isTooLong ? 'text-destructive' : 'text-muted-foreground'}`}>
            {charCount}/140
          </span>
        </div>
      </div>

      {/* Preview */}
      {isValid && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-editorial p-4"
        >
          <p className="text-xs text-muted-foreground mb-2">Anteprima:</p>
          <p className="font-display text-foreground italic">
            "Se sei a {cityName || '...'} e vuoi {formData.local_one_liner}, questo è il posto giusto."
          </p>
        </motion.div>
      )}

      {/* Guidelines */}
      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">⚠️ Regole editoriali:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <span className="text-destructive">Evita</span>: "imperdibile", "suggestivo", "incantevole", "magico"
          </li>
          <li>
            <span className="text-olive">Preferisci</span>: situazioni concrete, comportamenti, contesto umano
          </li>
          <li>Scrivi come se consigliassi a un amico</li>
        </ul>
      </div>
    </motion.div>
  );
}

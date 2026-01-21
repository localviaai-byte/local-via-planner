import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAIPrefill } from '@/hooks/useAIPrefill';
import type { PlaceFormData } from '@/types/database';

interface StepIdentityProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
  cityName?: string;
  cityRegion?: string | null;
  cityLatitude?: number | null;
  cityLongitude?: number | null;
}

export default function StepIdentity({ 
  formData, 
  onUpdate, 
  cityName = '',
  cityRegion,
  cityLatitude,
  cityLongitude
}: StepIdentityProps) {
  const { prefillPlace, isLoading } = useAIPrefill();

  const handleAIPrefill = async () => {
    const updates = await prefillPlace(
      formData.name, 
      formData.place_type, 
      cityName,
      cityRegion,
      cityLatitude,
      cityLongitude
    );
    if (updates) {
      onUpdate(updates);
    }
  };

  const canPrefill = formData.name.trim().length >= 2 && cityName.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Le info minime
        </h2>
        <p className="text-muted-foreground">
          Al resto pensiamo noi
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome del posto *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Es: Bar del Fico"
          className="bg-card"
          maxLength={100}
        />
      </div>

      {/* AI Prefill Button */}
      {cityName && (
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleAIPrefill}
            disabled={!canPrefill || isLoading}
            className="w-full gap-2 border-primary/30 hover:border-primary hover:bg-primary/5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cerco informazioni...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                🔍 Cerca e pre-compila con AI
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            L'AI cercherà info sul web per pre-compilare i campi
          </p>
        </div>
      )}

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Indirizzo</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          placeholder="Es: Via Roma 42"
          className="bg-card"
        />
      </div>

      {/* Zone */}
      <div className="space-y-2">
        <Label htmlFor="zone">Zona / Quartiere</Label>
        <Input
          id="zone"
          value={formData.zone}
          onChange={(e) => onUpdate({ zone: e.target.value })}
          placeholder="Es: Centro Storico, Vomero, Trastevere..."
          className="bg-card"
        />
        <p className="text-xs text-muted-foreground">
          Il quartiere aiuta i viaggiatori a orientarsi
        </p>
      </div>

      {/* Photo URL (simplified for now) */}
      <div className="space-y-2">
        <Label htmlFor="photo">Foto (URL)</Label>
        <Input
          id="photo"
          type="url"
          value={formData.photo_url}
          onChange={(e) => onUpdate({ photo_url: e.target.value })}
          placeholder="https://..."
          className="bg-card"
        />
        <p className="text-xs text-muted-foreground">
          Una foto vera, non da stock
        </p>
      </div>
    </motion.div>
  );
}

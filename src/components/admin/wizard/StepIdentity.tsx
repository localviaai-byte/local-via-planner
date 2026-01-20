import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PlaceFormData } from '@/types/database';

interface StepIdentityProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
}

export default function StepIdentity({ formData, onUpdate }: StepIdentityProps) {
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

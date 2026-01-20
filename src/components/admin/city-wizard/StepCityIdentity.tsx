import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import type { CityFormData, CityTag } from '@/types/database';
import { CITY_TAG_OPTIONS } from '@/types/database';

interface StepCityIdentityProps {
  formData: CityFormData;
  onUpdate: (updates: Partial<CityFormData>) => void;
}

export default function StepCityIdentity({ formData, onUpdate }: StepCityIdentityProps) {
  const toggleTag = (tag: CityTag) => {
    const current = formData.tags;
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    onUpdate({ tags: updated });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Definiamo il perimetro
        </h2>
        <p className="text-muted-foreground">
          Poi i locals fanno il resto
        </p>
      </div>
      
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome città *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Es: Pompei, Napoli, Amalfi..."
          className="bg-card text-lg"
        />
      </div>
      
      {/* Region */}
      <div className="space-y-2">
        <Label htmlFor="region">Regione</Label>
        <Input
          id="region"
          value={formData.region}
          onChange={(e) => onUpdate({ region: e.target.value })}
          placeholder="Es: Campania"
          className="bg-card"
        />
      </div>
      
      {/* Country */}
      <div className="space-y-2">
        <Label htmlFor="country">Paese</Label>
        <Input
          id="country"
          value={formData.country}
          onChange={(e) => onUpdate({ country: e.target.value })}
          placeholder="Italia"
          className="bg-card"
        />
      </div>
      
      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitudine</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            value={formData.latitude ?? ''}
            onChange={(e) => onUpdate({ latitude: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="40.7512"
            className="bg-card"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng">Longitudine</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            value={formData.longitude ?? ''}
            onChange={(e) => onUpdate({ longitude: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="14.4875"
            className="bg-card"
          />
        </div>
      </div>
      
      {/* City tags */}
      <div className="space-y-3">
        <Label>Tag città (cosa la caratterizza)</Label>
        <div className="flex flex-wrap gap-2">
          {CITY_TAG_OPTIONS.map((tag) => {
            const isSelected = formData.tags.includes(tag.id);
            return (
              <Button
                key={tag.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={`h-auto py-2 px-3 ${!isSelected && 'bg-card'}`}
                onClick={() => toggleTag(tag.id)}
              >
                <span className="mr-1.5">{tag.icon}</span>
                {tag.label}
                {isSelected && <Check className="w-3 h-3 ml-1.5" />}
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Seleziona i tag che meglio descrivono questa città
        </p>
      </div>
    </motion.div>
  );
}

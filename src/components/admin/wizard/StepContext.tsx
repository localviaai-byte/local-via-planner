import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PlaceFormData, City, PlaceType } from '@/types/database';
import { PLACE_TYPE_OPTIONS } from '@/types/database';

interface StepContextProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
  cities: City[];
}

export default function StepContext({ formData, onUpdate, cities }: StepContextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
          Che tipo di posto vuoi aggiungere?
        </h2>
        <p className="text-muted-foreground">
          Scegli la città e il tipo di luogo
        </p>
      </div>

      {/* City select */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Città</label>
        <Select
          value={formData.city_id}
          onValueChange={(value) => onUpdate({ city_id: value })}
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="Seleziona una città" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Place type grid */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Tipo di luogo</label>
        <div className="grid grid-cols-2 gap-3">
          {PLACE_TYPE_OPTIONS.map((type) => {
            const isSelected = formData.place_type === type.id;
            return (
              <Button
                key={type.id}
                variant={isSelected ? 'default' : 'outline'}
                className={`h-auto py-4 flex flex-col items-center gap-2 ${
                  isSelected ? '' : 'bg-card hover:bg-secondary'
                }`}
                onClick={() => onUpdate({ place_type: type.id as PlaceType })}
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="text-sm font-medium">{type.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

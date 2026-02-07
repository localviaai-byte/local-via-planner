import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ZoneSelector } from '@/components/admin/ZoneSelector';
import type { PlaceFormData, City, PlaceType } from '@/types/database';
import { PLACE_TYPE_OPTIONS } from '@/types/database';

interface StepContextProps {
  formData: PlaceFormData;
  onUpdate: (updates: Partial<PlaceFormData>) => void;
  cities: City[];
  isContributorMode?: boolean;
}

export default function StepContext({ formData, onUpdate, cities, isContributorMode = false }: StepContextProps) {
  // For contributors with a single assigned city, auto-select it
  const shouldShowCitySelect = !isContributorMode || cities.length !== 1;
  
  // Auto-select city for contributors
  if (isContributorMode && cities.length === 1 && !formData.city_id) {
    onUpdate({ city_id: cities[0].id });
  }

  const handleZoneSelect = (zoneId: string | null, zoneName: string) => {
    onUpdate({ 
      zone_id: zoneId, 
      zone: zoneName 
    });
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
          Che tipo di posto vuoi aggiungere?
        </h2>
        <p className="text-muted-foreground">
          Scegli la città, la zona e il tipo di luogo
        </p>
      </div>

      {/* City select - hidden for contributors with single city */}
      {shouldShowCitySelect ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Città</label>
          <Select
            value={formData.city_id}
            onValueChange={(value) => onUpdate({ city_id: value, zone_id: null, zone: '' })}
          >
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Seleziona una città" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border z-50">
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Città assegnata</p>
          <p className="font-medium text-foreground">{cities[0]?.name}</p>
        </div>
      )}

      {/* Zone selector - appears after city is selected */}
      {formData.city_id && (
        <ZoneSelector
          cityId={formData.city_id}
          selectedZoneId={formData.zone_id}
          selectedZoneName={formData.zone}
          onSelect={handleZoneSelect}
        />
      )}

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

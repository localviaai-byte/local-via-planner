import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAIPrefill } from '@/hooks/useAIPrefill';
import { ZoneSelector } from '@/components/admin/ZoneSelector';
import { MapPinPicker } from '@/components/admin/wizard/MapPinPicker';
import { 
  PRICE_RANGE_OPTIONS, 
  FOOD_PRIMARY_OPTIONS, 
  FOOD_SECONDARY_OPTIONS, 
  FORMAT_EXPERIENCE_OPTIONS,
  SHOP_CATEGORY_OPTIONS,
  SHOP_FORMAT_OPTIONS,
  type FoodPrimary,
  type FoodSecondary,
  type FormatExperience,
  type ShopCategory,
  type ShopFormat,
} from '@/types/database';
import type { PlaceFormData } from '@/types/database';
import { dietaryRestrictions } from '@/lib/mockData';
import { Textarea } from '@/components/ui/textarea';

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
  const isRestaurant = formData.place_type === 'restaurant';
  const isBar = formData.place_type === 'bar';
  const isFoodPlace = isRestaurant || isBar;

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

  const handleZoneSelect = (zoneId: string | null, zoneName: string) => {
    onUpdate({ 
      zone_id: zoneId, 
      zone: zoneName 
    });
  };

  const toggleFoodPrimary = (id: string) => {
    const current = [...(formData.food_primary || [])];
    if (current.includes(id as FoodPrimary)) {
      onUpdate({ food_primary: current.filter(s => s !== id) as FoodPrimary[] });
    } else {
      onUpdate({ food_primary: [...current, id as FoodPrimary] });
    }
  };

  const toggleFoodSecondary = (id: string) => {
    const current = [...(formData.food_secondary || [])];
    if (current.includes(id as FoodSecondary)) {
      onUpdate({ food_secondary: current.filter(s => s !== id) as FoodSecondary[] });
    } else {
      onUpdate({ food_secondary: [...current, id as FoodSecondary] });
    }
  };

  const toggleFormatExperience = (id: string) => {
    const current = [...(formData.format_experience || [])];
    if (current.includes(id as FormatExperience)) {
      onUpdate({ format_experience: current.filter(s => s !== id) as FormatExperience[] });
    } else {
      onUpdate({ format_experience: [...current, id as FormatExperience] });
    }
  };

  const toggleDietaryOption = (id: string) => {
    const current = [...(formData.dietary_options || [])];
    if (current.includes(id)) {
      onUpdate({ dietary_options: current.filter(d => d !== id) });
    } else {
      onUpdate({ dietary_options: [...current, id] });
    }
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

      {/* Map Pin Picker */}
      <MapPinPicker
        latitude={formData.latitude ?? null}
        longitude={formData.longitude ?? null}
        onChange={(lat, lng) => onUpdate({ latitude: lat, longitude: lng })}
        placeName={formData.name}
        cityName={cityName}
        cityLatitude={cityLatitude}
        cityLongitude={cityLongitude}
      />

      {/* Zone Selector */}
      {formData.city_id ? (
        <ZoneSelector
          cityId={formData.city_id}
          selectedZoneId={formData.zone_id}
          selectedZoneName={formData.zone}
          onSelect={handleZoneSelect}
        />
      ) : (
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
            Seleziona prima una città per vedere le zone disponibili
          </p>
        </div>
      )}

      {/* Food/Drink specific structured fields */}
      {isFoodPlace && (
        <div className="space-y-5 pt-2 border-t border-border/50">
          <p className="text-sm font-medium text-muted-foreground">
            {isRestaurant ? '🍽️ Info ristorante' : '🍷 Info locale'}
          </p>
          
          {/* Food Primary (multi select) */}
          <div className="space-y-2">
            <Label>Cucina principale *</Label>
            <div className="grid grid-cols-2 gap-2">
              {FOOD_PRIMARY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleFoodPrimary(opt.id)}
                  className={`
                    p-3 rounded-2xl text-left transition-all duration-200 cursor-pointer flex items-center gap-2 border-2
                    ${(formData.food_primary || []).includes(opt.id as FoodPrimary)
                      ? 'bg-primary/15 border-primary shadow-md'
                      : 'bg-card border-transparent hover:shadow-soft'
                    }
                  `}
                >
                  <span>{opt.icon}</span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Food Secondary (multi select) */}
          <div className="space-y-2">
            <Label>Specializzazione (facoltativo)</Label>
            <div className="flex flex-wrap gap-2">
              {FOOD_SECONDARY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleFoodSecondary(opt.id)}
                  className={`
                    px-3 py-2 rounded-full text-sm transition-all cursor-pointer flex items-center gap-1
                    ${(formData.food_secondary || []).includes(opt.id as FoodSecondary)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-foreground hover:shadow-soft'
                    }
                  `}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Format / Experience (multi select) */}
          <div className="space-y-2">
            <Label>Formato / Esperienza</Label>
            <div className="grid grid-cols-2 gap-2">
              {FORMAT_EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleFormatExperience(opt.id)}
                  className={`
                    p-3 rounded-2xl text-left transition-all duration-200 cursor-pointer flex items-center gap-2 border-2
                    ${(formData.format_experience || []).includes(opt.id as FormatExperience)
                      ? 'bg-primary/15 border-primary shadow-md'
                      : 'bg-card border-transparent hover:shadow-soft'
                    }
                  `}
                >
                  <span>{opt.icon}</span>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Price Range */}
          <div className="space-y-2">
            <Label>Fascia di prezzo</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRICE_RANGE_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant={formData.price_range === option.id ? 'default' : 'outline'}
                  className="flex flex-col h-auto py-3"
                  onClick={() => onUpdate({ price_range: option.id as PlaceFormData['price_range'] })}
                >
                  <span className="text-lg">{option.label}</span>
                  <span className="text-[10px] opacity-70">{option.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Dietary Options */}
          <div className="space-y-2">
            <Label>Esigenze alimentari supportate</Label>
            <div className="space-y-2">
              {dietaryRestrictions.map((restriction) => (
                <button
                  key={restriction.id}
                  type="button"
                  onClick={() => toggleDietaryOption(restriction.id)}
                  className="flex w-full items-center gap-3 p-3 bg-card rounded-2xl cursor-pointer transition-all hover:shadow-soft text-left"
                >
                  <Checkbox
                    checked={(formData.dietary_options || []).includes(restriction.id)}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => toggleDietaryOption(restriction.id)}
                  />
                  <span className="text-sm font-medium text-foreground">{restriction.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chi siamo */}
      <div className="space-y-5 pt-2 border-t border-border/50">
        <p className="text-sm font-medium text-muted-foreground">
          👤 Chi siamo
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="about_us">Descrizione attività</Label>
          <Textarea
            id="about_us"
            value={formData.about_us || ''}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                onUpdate({ about_us: e.target.value });
              }
            }}
            placeholder="Racconta brevemente chi siete, la vostra storia, cosa vi rende unici..."
            className="bg-card resize-none"
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.about_us || '').length}/300
          </p>
        </div>

        <div className="space-y-3">
          <Label>Contatti</Label>
          <div className="space-y-2">
            <Input
              value={formData.contact_phone || ''}
              onChange={(e) => onUpdate({ contact_phone: e.target.value })}
              placeholder="📞 Telefono"
              className="bg-card"
              maxLength={30}
            />
            <Input
              type="email"
              value={formData.contact_email || ''}
              onChange={(e) => onUpdate({ contact_email: e.target.value })}
              placeholder="✉️ Email"
              className="bg-card"
              maxLength={100}
            />
            <Input
              type="url"
              value={formData.contact_website || ''}
              onChange={(e) => onUpdate({ contact_website: e.target.value })}
              placeholder="🌐 Sito web"
              className="bg-card"
              maxLength={200}
            />
          </div>
        </div>
      </div>

      {/* Photo URL */}
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

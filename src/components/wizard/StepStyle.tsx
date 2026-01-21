import { motion } from 'framer-motion';
import { Compass, Users, Footprints, Car } from 'lucide-react';
import { avoidOptions, type TripPreferences } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface StepStyleProps {
  preferences: TripPreferences;
  onUpdate: (updates: Partial<TripPreferences>) => void;
}

export function StepStyle({ preferences, onUpdate }: StepStyleProps) {
  const toggleAvoid = (id: string) => {
    const current = [...preferences.avoid];
    if (current.includes(id)) {
      onUpdate({ avoid: current.filter(a => a !== id) });
    } else {
      onUpdate({ avoid: [...current, id] });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Editorial header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-semibold text-foreground mb-3 tracking-tight">
          Come ti muovi?
        </h2>
        <p className="text-muted-foreground">
          Ultimi dettagli per un itinerario perfetto
        </p>
      </div>

      {/* Activity Style */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Compass className="w-4 h-4" />
          Stile di visita
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={preferences.activityStyle === 'highlights' ? 'default' : 'outline'}
            onClick={() => onUpdate({ activityStyle: 'highlights' })}
            className="h-auto py-5 flex flex-col gap-2"
          >
            <span className="text-2xl">🎯</span>
            <span className="font-medium">Pochi highlight</span>
            <span className="text-xs opacity-70">Qualità &gt; quantità</span>
          </Button>
          <Button
            type="button"
            variant={preferences.activityStyle === 'maximize' ? 'default' : 'outline'}
            onClick={() => onUpdate({ activityStyle: 'maximize' })}
            className="h-auto py-5 flex flex-col gap-2"
          >
            <span className="text-2xl">✨</span>
            <span className="font-medium">Massimizza</span>
            <span className="text-xs opacity-70">Vedi tutto il possibile</span>
          </Button>
        </div>
      </div>

      {/* Guided Tours */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="w-4 h-4" />
          Visite guidate
        </label>
        <div className="grid grid-cols-3 gap-3">
          <Button
            type="button"
            variant={preferences.guidedTours === 'unknown' ? 'default' : 'outline'}
            onClick={() => onUpdate({ guidedTours: 'unknown' })}
            className="h-auto py-4 flex flex-col gap-1"
          >
            <span className="text-xl">🤷</span>
            <span className="text-sm">Non lo so</span>
          </Button>
          <Button
            type="button"
            variant={preferences.guidedTours === 'autonomous' ? 'default' : 'outline'}
            onClick={() => onUpdate({ guidedTours: 'autonomous' })}
            className="h-auto py-4 flex flex-col gap-1"
          >
            <span className="text-xl">🚶</span>
            <span className="text-sm">Autonomo</span>
          </Button>
          <Button
            type="button"
            variant={preferences.guidedTours === 'guided' ? 'default' : 'outline'}
            onClick={() => onUpdate({ guidedTours: 'guided' })}
            className="h-auto py-4 flex flex-col gap-1"
          >
            <span className="text-xl">🎤</span>
            <span className="text-sm">Con guida</span>
          </Button>
        </div>
      </div>

      {/* Walking Tolerance */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Footprints className="w-4 h-4" />
          Tolleranza camminate
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'low', label: 'Poche', icon: '🦥' },
            { value: 'medium', label: 'Moderate', icon: '🚶' },
            { value: 'high', label: 'Tante', icon: '🏃' },
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={preferences.walkingTolerance === option.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ walkingTolerance: option.value as TripPreferences['walkingTolerance'] })}
              className="h-auto py-4 flex flex-col gap-1"
            >
              <span className="text-xl">{option.icon}</span>
              <span className="text-sm">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Transport */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Car className="w-4 h-4" />
          Come ti sposti?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'walking', label: 'A piedi', icon: '👟' },
            { value: 'public', label: 'Mezzi pubblici', icon: '🚌' },
            { value: 'taxi', label: 'Taxi/Uber', icon: '🚕' },
            { value: 'car', label: 'Auto propria', icon: '🚗' },
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={preferences.transport === option.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ transport: option.value as TripPreferences['transport'] })}
              className="h-12"
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Things to Avoid */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-muted-foreground">
          Cose da evitare
        </label>
        <div className="space-y-2">
          {avoidOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 p-4 bg-card rounded-2xl cursor-pointer transition-all hover:shadow-soft"
            >
              <Checkbox
                checked={preferences.avoid.includes(option.id)}
                onCheckedChange={() => toggleAvoid(option.id)}
              />
              <span className="text-sm text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Wishes */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-muted-foreground">
          Desideri particolari <span className="opacity-60">(opzionale)</span>
        </label>
        <Textarea
          value={preferences.wishes}
          onChange={(e) => onUpdate({ wishes: e.target.value })}
          placeholder="Es: Vorrei vedere il tramonto sul mare, provare la vera pizza napoletana..."
          className="min-h-[100px] resize-none rounded-2xl"
        />
      </div>
    </motion.div>
  );
}

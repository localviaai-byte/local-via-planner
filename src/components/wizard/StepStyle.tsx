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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="text-center mb-1">
        <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">
          Come ti muovi?
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ultimi dettagli per un itinerario perfetto
        </p>
      </div>

      {/* Activity Style */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Compass className="w-3.5 h-3.5" />
          Stile di visita
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button"
            variant={preferences.activityStyle === 'highlights' ? 'default' : 'outline'}
            onClick={() => onUpdate({ activityStyle: 'highlights' })}
            className="h-auto py-3.5 flex flex-col gap-1">
            <span className="text-xl">🎯</span>
            <span className="font-medium text-xs">Pochi highlight</span>
            <span className="text-[9px] opacity-70">Qualità &gt; quantità</span>
          </Button>
          <Button type="button"
            variant={preferences.activityStyle === 'maximize' ? 'default' : 'outline'}
            onClick={() => onUpdate({ activityStyle: 'maximize' })}
            className="h-auto py-3.5 flex flex-col gap-1">
            <span className="text-xl">✨</span>
            <span className="font-medium text-xs">Massimizza</span>
            <span className="text-[9px] opacity-70">Vedi tutto il possibile</span>
          </Button>
        </div>
      </div>

      {/* Guided Tours */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          Visite guidate
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'unknown', label: 'Non lo so', icon: '🤷' },
            { value: 'autonomous', label: 'Autonomo', icon: '🚶' },
            { value: 'guided', label: 'Con guida', icon: '🎤' },
          ].map((opt) => (
            <Button key={opt.value} type="button"
              variant={preferences.guidedTours === opt.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ guidedTours: opt.value as TripPreferences['guidedTours'] })}
              className="h-auto py-3 flex flex-col gap-0.5">
              <span className="text-lg">{opt.icon}</span>
              <span className="text-[11px]">{opt.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Walking Tolerance */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Footprints className="w-3.5 h-3.5" />
          Tolleranza camminate
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'low', label: 'Poche', icon: '🦥' },
            { value: 'medium', label: 'Moderate', icon: '🚶' },
            { value: 'high', label: 'Tante', icon: '🏃' },
          ].map((option) => (
            <Button key={option.value} type="button"
              variant={preferences.walkingTolerance === option.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ walkingTolerance: option.value as TripPreferences['walkingTolerance'] })}
              className="h-auto py-3 flex flex-col gap-0.5">
              <span className="text-lg">{option.icon}</span>
              <span className="text-[11px]">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Transport */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Car className="w-3.5 h-3.5" />
          Come ti sposti?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'walking', label: 'A piedi', icon: '👟' },
            { value: 'public', label: 'Mezzi pubblici', icon: '🚌' },
            { value: 'taxi', label: 'Taxi/Uber', icon: '🚕' },
            { value: 'car', label: 'Auto propria', icon: '🚗' },
          ].map((option) => (
            <Button key={option.value} type="button"
              variant={preferences.transport === option.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ transport: option.value as TripPreferences['transport'] })}
              className="h-10 text-xs">
              <span className="mr-1.5">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Things to Avoid */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Cose da evitare
        </label>
        <div className="space-y-1.5">
          {avoidOptions.map((option) => (
            <label key={option.id}
              className="flex items-center gap-3 p-3 bg-card rounded-xl cursor-pointer transition-all hover:shadow-soft">
              <Checkbox
                checked={preferences.avoid.includes(option.id)}
                onCheckedChange={() => toggleAvoid(option.id)}
              />
              <span className="text-xs text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Wishes */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Desideri particolari <span className="opacity-60">(opzionale)</span>
        </label>
        <Textarea
          value={preferences.wishes}
          onChange={(e) => onUpdate({ wishes: e.target.value })}
          placeholder="Es: Vorrei vedere il tramonto sul mare..."
          className="min-h-[80px] resize-none rounded-xl text-sm"
        />
      </div>
    </motion.div>
  );
}

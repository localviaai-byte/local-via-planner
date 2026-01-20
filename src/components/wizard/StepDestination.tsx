import { motion } from 'framer-motion';
import { MapPin, Calendar, Users } from 'lucide-react';
import { cities, type TripPreferences } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StepDestinationProps {
  preferences: TripPreferences;
  onUpdate: (updates: Partial<TripPreferences>) => void;
}

export function StepDestination({ preferences, onUpdate }: StepDestinationProps) {
  const travelWithOptions = [
    { value: 'couple', label: 'In coppia', icon: '💑' },
    { value: 'family', label: 'Famiglia', icon: '👨‍👩‍👧‍👦' },
    { value: 'friends', label: 'Amici', icon: '👥' },
    { value: 'solo', label: 'Da solo', icon: '🧳' },
  ];

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
          Dove vuoi andare?
        </h2>
        <p className="text-muted-foreground">
          Raccontaci come sarà questo viaggio
        </p>
      </div>

      {/* City Selection - Editorial cards */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MapPin className="w-4 h-4" />
          Destinazione
        </label>
        <div className="grid gap-3">
          {cities.map((city) => (
            <motion.button
              key={city.id}
              type="button"
              onClick={() => onUpdate({ city: city.id })}
              className={`
                relative p-4 rounded-2xl text-left transition-all duration-200
                ${preferences.city === city.id
                  ? 'bg-card ring-2 ring-primary shadow-card'
                  : 'bg-card hover:shadow-soft'
                }
              `}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                  {city.id === 'pompei' ? '🏛️' : city.id === 'napoli' ? '🌋' : '🌊'}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">{city.name}</h3>
                  <p className="text-sm text-muted-foreground">{city.description}</p>
                  <div className="flex gap-2 mt-2">
                    {city.popularFor.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-secondary text-xs text-muted-foreground rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Nearby toggle */}
        {preferences.city && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center justify-between p-4 bg-olive-light rounded-2xl"
          >
            <div>
              <p className="text-sm font-medium text-foreground">Includi dintorni</p>
              <p className="text-xs text-muted-foreground">Aggiungi attrazioni vicine</p>
            </div>
            <Switch
              checked={preferences.nearbyAreas}
              onCheckedChange={(checked) => onUpdate({ nearbyAreas: checked })}
            />
          </motion.div>
        )}
      </div>

      {/* Duration */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Calendar className="w-4 h-4" />
          Durata del viaggio
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((days) => (
            <Button
              key={days}
              type="button"
              variant={preferences.numDays === days ? 'default' : 'outline'}
              onClick={() => onUpdate({ numDays: days })}
              className="h-12"
            >
              {days} {days === 1 ? 'giorno' : 'giorni'}
            </Button>
          ))}
        </div>
      </div>

      {/* Travel Composition */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="w-4 h-4" />
          Con chi viaggi?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {travelWithOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={preferences.travelWith === option.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ travelWith: option.value as TripPreferences['travelWith'] })}
              className="h-auto py-4 flex flex-col gap-1"
            >
              <span className="text-2xl">{option.icon}</span>
              <span>{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Travelers count */}
      {preferences.travelWith === 'family' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 p-4 bg-card rounded-2xl shadow-soft"
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Adulti</label>
              <Select
                value={String(preferences.travelers.adults)}
                onValueChange={(v) => onUpdate({ 
                  travelers: { ...preferences.travelers, adults: Number(v) }
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Bambini</label>
              <Select
                value={String(preferences.travelers.children)}
                onValueChange={(v) => onUpdate({ 
                  travelers: { ...preferences.travelers, children: Number(v) }
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Senior</label>
              <Select
                value={String(preferences.travelers.seniors)}
                onValueChange={(v) => onUpdate({ 
                  travelers: { ...preferences.travelers, seniors: Number(v) }
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

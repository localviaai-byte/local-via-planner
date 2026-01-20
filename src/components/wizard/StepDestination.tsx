import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, ChevronDown } from 'lucide-react';
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
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Dove vuoi andare?
        </h2>
        <p className="text-muted-foreground">
          Seleziona la tua destinazione e raccontaci del tuo viaggio
        </p>
      </div>

      {/* City Selection */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          Destinazione
        </label>
        <div className="grid gap-3">
          {cities.map((city) => (
            <motion.button
              key={city.id}
              type="button"
              onClick={() => onUpdate({ city: city.id })}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${preferences.city === city.id
                  ? 'border-primary bg-terracotta-light shadow-card'
                  : 'border-border bg-card hover:border-primary/50'
                }
              `}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                  {city.id === 'pompei' ? '🏛️' : city.id === 'napoli' ? '🌋' : '🌊'}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold">{city.name}</h3>
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

        {preferences.city && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center justify-between p-4 bg-sea-light rounded-xl"
          >
            <div>
              <p className="text-sm font-medium text-foreground">Includi dintorni</p>
              <p className="text-xs text-muted-foreground">Aggiungi attrazioni nelle vicinanze</p>
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
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          Durata del viaggio
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((days) => (
            <Button
              key={days}
              type="button"
              variant={preferences.numDays === days ? 'default' : 'outline'}
              onClick={() => onUpdate({ numDays: days })}
              className={preferences.numDays === days ? 'bg-gradient-hero border-0' : ''}
            >
              {days} {days === 1 ? 'giorno' : 'giorni'}
            </Button>
          ))}
        </div>
      </div>

      {/* Travel Composition */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Users className="w-4 h-4 text-primary" />
          Con chi viaggi?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {travelWithOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={preferences.travelWith === option.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ travelWith: option.value as TripPreferences['travelWith'] })}
              className={`h-auto py-4 flex flex-col gap-1 ${
                preferences.travelWith === option.value ? 'bg-gradient-hero border-0' : ''
              }`}
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
          className="space-y-4 p-4 bg-secondary rounded-xl"
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
                <SelectTrigger>
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
                <SelectTrigger>
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
                <SelectTrigger>
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

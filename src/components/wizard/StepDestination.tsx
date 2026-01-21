import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Train } from 'lucide-react';
import { cities, maxTravelOptions, type TripPreferences } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
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
      className="space-y-6"
    >
      {/* Editorial header - more compact on mobile */}
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-2 tracking-tight">
          Dove vuoi andare?
        </h2>
        <p className="text-sm text-muted-foreground">
          Raccontaci come sarà questo viaggio
        </p>
      </div>

      {/* City Selection - Compact mobile cards */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <MapPin className="w-3.5 h-3.5" />
          Destinazione
        </label>
        <div className="grid gap-2">
          {cities.map((city) => (
            <motion.button
              key={city.id}
              type="button"
              onClick={() => onUpdate({ city: city.id })}
              className={`
                relative p-3 rounded-xl text-left transition-all duration-200
                ${preferences.city === city.id
                  ? 'bg-card ring-2 ring-primary shadow-card'
                  : 'bg-card hover:shadow-soft'
                }
              `}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                  {city.id === 'pompei' ? '🏛️' : city.id === 'napoli' ? '🌋' : '🌊'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-semibold text-foreground">{city.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{city.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {city.popularFor.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-secondary text-[10px] text-muted-foreground rounded-full"
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

        {/* Travel distance preference - replaces old nearbyAreas toggle */}
        {preferences.city && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2 mt-3"
          >
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Train className="w-3.5 h-3.5" />
              Ti va di spostarti fuori città?
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {maxTravelOptions.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant={preferences.maxTravelMinutes === option.id ? 'default' : 'outline'}
                  onClick={() => onUpdate({ 
                    maxTravelMinutes: option.id,
                    nearbyAreas: option.id > 0 
                  })}
                  className="h-auto py-2 px-2 flex flex-col items-start text-left overflow-hidden"
                >
                  <span className="font-medium text-sm truncate w-full">{option.label}</span>
                  <span className="text-[10px] opacity-70 font-normal truncate w-full">{option.description}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Duration - more compact */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <Calendar className="w-3.5 h-3.5" />
          Durata del viaggio
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((days) => (
            <Button
              key={days}
              type="button"
              variant={preferences.numDays === days ? 'default' : 'outline'}
              onClick={() => onUpdate({ numDays: days })}
              className="h-10 text-sm px-2"
            >
              {days} {days === 1 ? 'g' : 'gg'}
            </Button>
          ))}
        </div>
      </div>

      {/* Travel Composition - more compact */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <Users className="w-3.5 h-3.5" />
          Con chi viaggi?
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {travelWithOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={preferences.travelWith === option.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ travelWith: option.value as TripPreferences['travelWith'] })}
              className="h-auto py-2.5 flex flex-col gap-0.5 px-1"
            >
              <span className="text-lg">{option.icon}</span>
              <span className="text-[10px] leading-tight">{option.label}</span>
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

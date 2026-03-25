import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Train, Sun } from 'lucide-react';
import { cities, maxTravelOptions, type TripPreferences, type TravelPeriodType, type Season } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
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
          {cities.map((city) => {
            const isSelected = preferences.cities?.includes(city.id) || preferences.city === city.id;
            return (
              <motion.button
                key={city.id}
                type="button"
                onClick={() => {
                  const currentCities = preferences.cities || (preferences.city ? [preferences.city] : []);
                  let newCities: string[];
                  if (currentCities.includes(city.id)) {
                    newCities = currentCities.filter(c => c !== city.id);
                  } else {
                    newCities = [...currentCities, city.id];
                  }
                  onUpdate({ 
                    cities: newCities,
                    city: newCities[0] || '',
                  });
                }}
                className={`
                  relative p-3 rounded-xl text-left transition-all duration-200 border-2
                  ${isSelected
                    ? 'bg-primary/5 border-primary shadow-card'
                    : 'bg-card border-transparent hover:shadow-soft'
                  }
                `}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-primary/15' : 'bg-secondary'
                  }`}>
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
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Starting city selector - shown when 2+ cities selected */}
        {(preferences.cities?.length ?? 0) >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2 mt-3"
          >
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5" />
              Da dove parti?
            </label>
            <div className="grid gap-1.5">
              {preferences.cities.map((cityId) => {
                const cityData = cities.find(c => c.id === cityId);
                if (!cityData) return null;
                const isStarting = preferences.startingCity === cityId;
                return (
                  <Button
                    key={cityId}
                    type="button"
                    variant={isStarting ? 'default' : 'outline'}
                    onClick={() => onUpdate({ startingCity: cityId })}
                    className="h-auto py-2.5 px-3 justify-start text-left"
                  >
                    <span className="text-base mr-2">
                      {cityId === 'pompei' ? '🏛️' : cityId === 'napoli' ? '🌋' : '🌊'}
                    </span>
                    <span className="text-sm font-medium">{cityData.name}</span>
                    {isStarting && (
                      <span className="ml-auto text-[10px] opacity-80">📍 Partenza</span>
                    )}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Travel distance preference - replaces old nearbyAreas toggle */}
        {(preferences.cities?.length > 0 || preferences.city) && (
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

      {/* Duration */}
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

      {/* Travel Period */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <Sun className="w-3.5 h-3.5" />
          Quando pensi di andare?
        </label>
        
        {/* Period type selector */}
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { value: 'season' as TravelPeriodType, label: 'Stagione', icon: '🌤️' },
            { value: 'month' as TravelPeriodType, label: 'Mese', icon: '📅' },
            { value: 'dates' as TravelPeriodType, label: 'Date precise', icon: '📌' },
          ]).map((opt) => (
            <Button
              key={opt.value}
              type="button"
              variant={preferences.travelPeriod?.type === opt.value ? 'default' : 'outline'}
              onClick={() => onUpdate({ 
                travelPeriod: opt.value === preferences.travelPeriod?.type 
                  ? { type: 'none' } 
                  : { type: opt.value } 
              })}
              className="h-auto py-2 flex flex-col gap-0.5 px-1"
            >
              <span className="text-base">{opt.icon}</span>
              <span className="text-[10px] leading-tight">{opt.label}</span>
            </Button>
          ))}
        </div>

        {/* Season picker */}
        {preferences.travelPeriod?.type === 'season' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-4 gap-1.5">
            {([
              { value: 'spring' as Season, label: 'Primavera', icon: '🌸' },
              { value: 'summer' as Season, label: 'Estate', icon: '☀️' },
              { value: 'autumn' as Season, label: 'Autunno', icon: '🍂' },
              { value: 'winter' as Season, label: 'Inverno', icon: '❄️' },
            ]).map((s) => (
              <Button
                key={s.value}
                type="button"
                variant={preferences.travelPeriod?.season === s.value ? 'default' : 'outline'}
                onClick={() => onUpdate({ travelPeriod: { type: 'season', season: s.value } })}
                className="h-auto py-2.5 flex flex-col gap-0.5 px-1"
              >
                <span className="text-lg">{s.icon}</span>
                <span className="text-[10px] leading-tight">{s.label}</span>
              </Button>
            ))}
          </motion.div>
        )}

        {/* Month picker */}
        {preferences.travelPeriod?.type === 'month' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }, (_, i) => {
              const monthName = format(new Date(2025, i, 1), 'MMM', { locale: it });
              return (
                <Button
                  key={i}
                  type="button"
                  variant={preferences.travelPeriod?.month === i ? 'default' : 'outline'}
                  onClick={() => onUpdate({ travelPeriod: { type: 'month', month: i } })}
                  className="h-9 text-xs capitalize px-1"
                >
                  {monthName}
                </Button>
              );
            })}
          </motion.div>
        )}

        {/* Date picker */}
        {preferences.travelPeriod?.type === 'dates' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("flex-1 justify-start text-left text-sm", !preferences.travelPeriod?.dates?.start && "text-muted-foreground")}>
                  {preferences.travelPeriod?.dates?.start 
                    ? format(preferences.travelPeriod.dates.start, 'dd MMM yyyy', { locale: it })
                    : 'Da...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={preferences.travelPeriod?.dates?.start}
                  onSelect={(date) => {
                    if (date) {
                      const current = preferences.travelPeriod?.dates;
                      onUpdate({ travelPeriod: { 
                        type: 'dates', 
                        dates: { start: date, end: current?.end || date } 
                      }});
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("flex-1 justify-start text-left text-sm", !preferences.travelPeriod?.dates?.end && "text-muted-foreground")}>
                  {preferences.travelPeriod?.dates?.end 
                    ? format(preferences.travelPeriod.dates.end, 'dd MMM yyyy', { locale: it })
                    : 'A...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={preferences.travelPeriod?.dates?.end}
                  onSelect={(date) => {
                    if (date) {
                      const current = preferences.travelPeriod?.dates;
                      onUpdate({ travelPeriod: { 
                        type: 'dates', 
                        dates: { start: current?.start || date, end: date } 
                      }});
                    }
                  }}
                  disabled={(date) => date < (preferences.travelPeriod?.dates?.start || new Date())}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </motion.div>
        )}

        {/* Arrival time - shown when dates are selected */}
        {preferences.travelPeriod?.type === 'dates' && preferences.travelPeriod?.dates?.start && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">🕐 A che ora inizi il primo giorno?</p>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { value: 'early' as const, label: 'Mattina', icon: '🌅', desc: 'Entro le 9:00' },
                { value: 'normal' as const, label: 'Pomeriggio', icon: '☀️', desc: 'Dopo le 13:00' },
                { value: 'late' as const, label: 'Sera', icon: '🌙', desc: 'Dopo le 18:00' },
              ]).map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={preferences.startTime === opt.value ? 'default' : 'outline'}
                  onClick={() => onUpdate({ startTime: opt.value })}
                  className="h-auto py-2.5 flex flex-col gap-0.5 px-1"
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="text-[10px] font-medium leading-tight">{opt.label}</span>
                  <span className="text-[9px] opacity-70 leading-tight">{opt.desc}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* "Non lo so ancora" option */}
        {preferences.travelPeriod?.type !== 'none' && (
          <button
            type="button"
            onClick={() => onUpdate({ travelPeriod: { type: 'none' } })}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Non lo so ancora
          </button>
        )}
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

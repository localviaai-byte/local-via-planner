import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Train, Sun, Search, X, Sparkles } from 'lucide-react';
import { maxTravelOptions, type TripPreferences, type TravelPeriodType, type Season, type CityObject } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { supabase } from '@/integrations/supabase/client';

interface StepDestinationProps {
  preferences: TripPreferences;
  onUpdate: (updates: Partial<TripPreferences>) => void;
}

interface CityResult {
  id: string;
  name: string;
  region: string | null;
  slug: string;
  status: string | null;
}

export function StepDestination({ preferences, onUpdate }: StepDestinationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCities = preferences.cityObjects || [];

  const travelWithOptions = [
    { value: 'couple', label: 'In coppia', icon: '💑' },
    { value: 'family', label: 'Famiglia', icon: '👨‍👩‍👧‍👦' },
    { value: 'friends', label: 'Amici', icon: '👥' },
    { value: 'solo', label: 'Da solo', icon: '🧳' },
  ];

  // Search cities in DB
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await supabase
          .from('cities')
          .select('id, name, region, slug, status')
          .ilike('name', `%${query}%`)
          .eq('is_active', true)
          .order('name')
          .limit(8);

        setSearchResults(data || []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addCity = (city: CityObject) => {
    // Don't add duplicates
    const exists = selectedCities.some(c => 
      (c.id && c.id === city.id) || c.name.toLowerCase() === city.name.toLowerCase()
    );
    if (exists) return;

    const newCities = [...selectedCities, city];
    let startingCity = preferences.startingCity;
    if (!startingCity || !newCities.some(c => (c.id || c.name) === startingCity)) {
      startingCity = newCities[0]?.id || newCities[0]?.name || '';
    }

    onUpdate({
      cityObjects: newCities,
      cities: newCities.map(c => c.slug || c.id || c.name),
      city: newCities[0]?.slug || newCities[0]?.id || newCities[0]?.name || '',
      startingCity: newCities.length >= 2 ? startingCity : undefined,
    });
    setSearchQuery('');
    setShowDropdown(false);
  };

  const removeCity = (index: number) => {
    const newCities = selectedCities.filter((_, i) => i !== index);
    let startingCity = preferences.startingCity;
    if (startingCity && !newCities.some(c => (c.id || c.name) === startingCity)) {
      startingCity = newCities[0]?.id || newCities[0]?.name || '';
    }
    
    onUpdate({
      cityObjects: newCities,
      cities: newCities.map(c => c.slug || c.id || c.name),
      city: newCities[0]?.slug || newCities[0]?.id || newCities[0]?.name || '',
      startingCity: newCities.length >= 2 ? startingCity : undefined,
    });
  };

  const getStatusBadge = (city: CityResult) => {
    if (city.status === 'active') return { label: 'Curata', color: 'bg-green-100 text-green-700' };
    if (city.status === 'building') return { label: 'In costruzione', color: 'bg-amber-100 text-amber-700' };
    return null;
  };

  // Check if search query matches a new city (not in results and not already selected)
  const canAddCustom = searchQuery.trim().length >= 2 && 
    !searchResults.some(r => r.name.toLowerCase() === searchQuery.trim().toLowerCase()) &&
    !selectedCities.some(c => c.name.toLowerCase() === searchQuery.trim().toLowerCase());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-2 tracking-tight">
          Dove vuoi andare?
        </h2>
        <p className="text-sm text-muted-foreground">
          Cerca una città italiana e pianifica il tuo viaggio
        </p>
      </div>

      {/* City Search */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <MapPin className="w-3.5 h-3.5" />
          Destinazione
        </label>

        {/* Selected cities chips */}
        {selectedCities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCities.map((city, idx) => (
              <motion.div
                key={city.id || city.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl"
              >
                <span className="text-sm font-medium text-foreground">{city.name}</span>
                {city.region && <span className="text-xs text-muted-foreground">({city.region})</span>}
                {city.isNew && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-accent/20 text-accent-foreground text-[10px] rounded-full">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeCity(idx)}
                  className="p-0.5 rounded-full hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Search input */}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Cerca una città... (es. Roma, Firenze, Milano)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
              className="pl-10 h-12 rounded-xl text-base"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Dropdown results */}
          <AnimatePresence>
            {showDropdown && (searchResults.length > 0 || canAddCustom) && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
              >
                {/* DB results */}
                {searchResults.map((city) => {
                  const badge = getStatusBadge(city);
                  const isAlreadySelected = selectedCities.some(c => c.id === city.id);
                  return (
                    <button
                      key={city.id}
                      type="button"
                      disabled={isAlreadySelected}
                      onClick={() => addCity({ 
                        id: city.id, 
                        name: city.name, 
                        region: city.region || undefined,
                        slug: city.slug,
                        isNew: false 
                      })}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0",
                        isAlreadySelected && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">{city.name}</span>
                        {city.region && (
                          <span className="text-xs text-muted-foreground ml-1.5">— {city.region}</span>
                        )}
                      </div>
                      {badge && (
                        <span className={cn("px-2 py-0.5 text-[10px] font-medium rounded-full", badge.color)}>
                          {badge.label}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Custom city option */}
                {canAddCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      const name = searchQuery.trim();
                      addCity({ name, isNew: true });
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/10 transition-colors bg-secondary/30"
                  >
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">
                        Esplora "{searchQuery.trim()}"
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        L'AI scoprirà i luoghi migliori per te
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-full">
                      AI
                    </span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Starting city selector - shown when 2+ cities selected */}
      {selectedCities.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <MapPin className="w-3.5 h-3.5" />
            Da dove parti?
          </label>
          <div className="grid gap-1.5">
            {selectedCities.map((city) => {
              const cityKey = city.id || city.name;
              const isStarting = preferences.startingCity === cityKey;
              return (
                <Button
                  key={cityKey}
                  type="button"
                  variant={isStarting ? 'default' : 'outline'}
                  onClick={() => onUpdate({ startingCity: cityKey })}
                  className="h-auto py-2.5 px-3 justify-start text-left"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{city.name}</span>
                  {city.isNew && (
                    <span className="ml-1.5 text-[10px] opacity-70">✨ AI</span>
                  )}
                  {isStarting && (
                    <span className="ml-auto text-[10px] opacity-80">📍 Partenza</span>
                  )}
                </Button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Travel distance preference */}
      {selectedCities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
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

        {/* Arrival time */}
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

      {/* Travel Composition */}
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

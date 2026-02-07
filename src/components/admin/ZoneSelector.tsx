import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Check, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCityZones, useCreateZone } from '@/hooks/useCities';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { CityZone } from '@/types/database';

interface ZoneSelectorProps {
  cityId: string;
  selectedZoneId: string | null;
  selectedZoneName: string;
  onSelect: (zoneId: string | null, zoneName: string) => void;
}

export function ZoneSelector({ 
  cityId, 
  selectedZoneId, 
  selectedZoneName,
  onSelect 
}: ZoneSelectorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: zones, isLoading } = useCityZones(cityId);
  const createZone = useCreateZone();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showNewZoneForm, setShowNewZoneForm] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter zones based on search
  const filteredZones = zones?.filter(zone =>
    zone.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Check if search matches no zones (suggest creating)
  const noMatchingZones = searchQuery.length > 0 && filteredZones.length === 0;
  
  const handleSelectZone = (zone: CityZone) => {
    onSelect(zone.id, zone.name);
    setIsOpen(false);
    setSearchQuery('');
  };
  
  const handleClearZone = () => {
    onSelect(null, '');
  };
  
  const handleCreateZone = async () => {
    if (!newZoneName.trim() || !user) return;
    
    try {
      const created = await createZone.mutateAsync({
        city_id: cityId,
        name: newZoneName.trim(),
        created_by: user.id,
      });
      
      onSelect(created.id, created.name);
      setNewZoneName('');
      setShowNewZoneForm(false);
      setIsOpen(false);
      toast({ title: 'Zona creata e selezionata!' });
    } catch {
      toast({ title: 'Errore', description: 'Impossibile creare la zona', variant: 'destructive' });
    }
  };
  
  const handleQuickCreate = async () => {
    if (!searchQuery.trim() || !user) return;
    
    try {
      const created = await createZone.mutateAsync({
        city_id: cityId,
        name: searchQuery.trim(),
        created_by: user.id,
      });
      
      onSelect(created.id, created.name);
      setSearchQuery('');
      setIsOpen(false);
      toast({ title: `"${created.name}" creata e selezionata!` });
    } catch {
      toast({ title: 'Errore', variant: 'destructive' });
    }
  };
  
  const selectedZone = zones?.find(z => z.id === selectedZoneId);
  
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-terracotta" />
        Zona / Quartiere
      </Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between bg-card text-left font-normal"
          >
            {selectedZone ? (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta" />
                <span>{selectedZone.name}</span>
                {selectedZone.vibe_primary && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {selectedZone.vibe_primary}
                  </Badge>
                )}
              </div>
            ) : selectedZoneName ? (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{selectedZoneName}</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  Testo libero
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">Seleziona o crea zona...</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder="Cerca o scrivi nuova zona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background"
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Caricamento zone...
              </div>
            ) : (
              <>
                {/* Existing zones */}
                {filteredZones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => handleSelectZone(zone)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-terracotta shrink-0" />
                    <span className="flex-1 truncate">{zone.name}</span>
                    {zone.vibe_primary && (
                      <Badge variant="secondary" className="text-xs">
                        {zone.vibe_primary}
                      </Badge>
                    )}
                    {selectedZoneId === zone.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
                
                {/* No matching zones - offer to create */}
                {noMatchingZones && (
                  <button
                    onClick={handleQuickCreate}
                    disabled={createZone.isPending}
                    className="w-full flex items-center gap-2 px-3 py-3 text-left bg-primary/5 hover:bg-primary/10 border-t transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary shrink-0" />
                    <span className="flex-1">
                      Crea "<strong>{searchQuery}</strong>"
                    </span>
                    {createZone.isPending && (
                      <span className="text-xs text-muted-foreground">Creazione...</span>
                    )}
                  </button>
                )}
                
                {/* Empty state */}
                {!isLoading && zones?.length === 0 && !searchQuery && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p>Nessuna zona definita</p>
                    <p className="text-xs mt-1">Scrivi per crearne una nuova</p>
                  </div>
                )}
                
                {/* Show all zones prompt when searching */}
                {searchQuery && filteredZones.length > 0 && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="w-full px-3 py-2 text-xs text-center text-muted-foreground hover:bg-secondary"
                  >
                    Mostra tutte le zone
                  </button>
                )}
              </>
            )}
          </div>
          
          {/* Create new zone form */}
          <AnimatePresence>
            {showNewZoneForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t"
              >
                <div className="p-3 space-y-3">
                  <Input
                    placeholder="Nome nuova zona..."
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    className="bg-background"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setShowNewZoneForm(false);
                        setNewZoneName('');
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Annulla
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={handleCreateZone}
                      disabled={!newZoneName.trim() || createZone.isPending}
                    >
                      {createZone.isPending ? 'Creazione...' : 'Crea'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Footer actions */}
          {!showNewZoneForm && (
            <div className="border-t p-2 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setShowNewZoneForm(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Nuova zona
              </Button>
              {(selectedZoneId || selectedZoneName) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearZone}
                >
                  <X className="w-4 h-4 mr-1" />
                  Rimuovi
                </Button>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
      
      <p className="text-xs text-muted-foreground">
        Collega questo luogo a un quartiere per organizzare meglio gli itinerari
      </p>
    </div>
  );
}

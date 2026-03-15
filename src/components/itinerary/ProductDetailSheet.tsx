import { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  X, 
  Globe,
  Ticket,
  ChefHat,
  Camera,
  Car,
  Palette,
  Wine,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import type { ProductSuggestion } from '@/hooks/useGenerateItinerary';

interface ProductDetailSheetProps {
  product: ProductSuggestion | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (quantity: number, preferredTime?: string) => void;
  isAdding?: boolean;
  slotContext?: {
    placeName?: string;
    userRhythm?: string;
  };
}

const getProductIcon = (type?: string) => {
  switch (type) {
    case 'guided_tour': return Ticket;
    case 'tasting': return Wine;
    case 'workshop': return Palette;
    case 'dining_experience': return ChefHat;
    case 'transport': return Car;
    case 'photo_experience': return Camera;
    case 'ticket': return Ticket;
    default: return Ticket;
  }
};

const getProductTypeLabel = (type?: string) => {
  switch (type) {
    case 'guided_tour': return 'Tour Guidato';
    case 'tasting': return 'Degustazione';
    case 'workshop': return 'Workshop';
    case 'dining_experience': return 'Esperienza Culinaria';
    case 'transport': return 'Trasporto';
    case 'photo_experience': return 'Photo Experience';
    case 'ticket': return 'Biglietto';
    default: return 'Esperienza';
  }
};

// Generate available time slots based on product type
const getAvailableTimeSlots = (productType?: string): string[] => {
  const morning = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  const afternoon = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  const evening = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

  switch (productType) {
    case 'dining_experience':
      return [...afternoon.slice(3), ...evening];
    case 'tasting':
      return [...morning.slice(2), ...afternoon, ...evening.slice(0, 4)];
    default:
      return [...morning, ...afternoon, ...evening.slice(0, 5)];
  }
};

export function ProductDetailSheet({
  product,
  isOpen,
  onClose,
  onAdd,
  isAdding = false,
  slotContext,
}: ProductDetailSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [preferredTime, setPreferredTime] = useState<string>('');

  if (!product) return null;

  const Icon = getProductIcon(product.product_type);
  const unitPrice = product.price_cents || 0;
  const totalPrice = unitPrice * quantity;
  const formattedUnitPrice = unitPrice ? `€${(unitPrice / 100).toFixed(0)}` : 'Prezzo su richiesta';
  const formattedTotalPrice = totalPrice ? `€${(totalPrice / 100).toFixed(0)}` : 'Prezzo su richiesta';

  const availableSlots = getAvailableTimeSlots(product.product_type);

  const getWhatYouWillDo = (): string[] => {
    return [
      'Esplora con una guida esperta locale',
      'Scopri storie e dettagli nascosti',
      'Accesso prioritario senza code',
      'Foto ricordo nei punti migliori',
    ];
  };

  const handleAdd = () => {
    onAdd(quantity, preferredTime || undefined);
  };

  const handleClose = () => {
    setQuantity(1);
    setPreferredTime('');
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="max-h-[90vh]">
        {/* Header */}
        <DrawerHeader className="relative pb-2 border-b border-border">
          <DrawerClose className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </DrawerClose>
          
          <div className="flex items-start gap-3 pr-10">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                {getProductTypeLabel(product.product_type)}
              </span>
              <DrawerTitle className="font-display text-xl font-semibold mt-0.5 text-foreground">
                {product.title}
              </DrawerTitle>
              <p className="text-sm text-muted-foreground mt-1">
                A partire da <span className="font-semibold text-foreground">{formattedUnitPrice}</span> / persona
              </p>
            </div>
          </div>
        </DrawerHeader>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-4 py-5 space-y-6 max-h-[50vh]">
          {/* Short pitch */}
          <p className="text-sm text-foreground/90 leading-relaxed">
            {product.short_pitch}
          </p>

          {/* Quantity & Time selection */}
          <section className="bg-secondary/50 rounded-xl p-4 space-y-4">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <span className="text-base">🎟️</span>
              Configura la tua esperienza
            </h4>
            
            {/* Quantity */}
            <div className="space-y-2">
              <Label className="text-sm text-foreground/80">Numero partecipanti</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= 20) setQuantity(val);
                  }}
                  className="w-16 text-center font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setQuantity(Math.min(20, quantity + 1))}
                  disabled={quantity >= 20}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground ml-1">
                  {quantity === 1 ? 'persona' : 'persone'}
                </span>
              </div>
            </div>

            {/* Preferred Time */}
            <div className="space-y-2">
              <Label className="text-sm text-foreground/80">Orario preferito</Label>
              <Select value={preferredTime} onValueChange={setPreferredTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona un orario disponibile" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                L'orario definitivo verrà confermato dal Tour Operator in base alla disponibilità.
              </p>
            </div>
          </section>

          {/* Cosa farai */}
          <section>
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <span className="text-base">✨</span>
              Cosa farai
            </h4>
            <ul className="space-y-2">
              {getWhatYouWillDo().map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Perché è perfetta per questo momento */}
          {slotContext?.placeName && (
            <section className="bg-secondary/50 rounded-xl p-4">
              <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                <span className="text-base">💡</span>
                Perché è perfetta per questo momento
              </h4>
              <p className="text-sm text-foreground/80">
                Si integra perfettamente con la visita a <span className="font-medium">{slotContext.placeName}</span> senza stravolgere i tempi.
                {slotContext.userRhythm && (
                  <> Rientra nel tuo ritmo "<span className="font-medium">{slotContext.userRhythm}</span>".</>
                )}
              </p>
            </section>
          )}

          {/* Dettagli pratici */}
          <section>
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <span className="text-base">📋</span>
              Dettagli pratici
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {product.duration_minutes && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{product.duration_minutes} minuti</span>
                </div>
              )}
              {product.meeting_point && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{product.meeting_point}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>Italiano, Inglese</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>Max 15 persone</span>
              </div>
            </div>
          </section>

          {/* Include / Non include */}
          <section className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Include
              </h5>
              <ul className="space-y-1">
                <li className="flex items-center gap-1.5 text-xs text-foreground/80">
                  <Check className="w-3 h-3 text-primary" />
                  Guida locale
                </li>
                <li className="flex items-center gap-1.5 text-xs text-foreground/80">
                  <Check className="w-3 h-3 text-primary" />
                  Biglietto ingresso
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Non include
              </h5>
              <ul className="space-y-1">
                <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <X className="w-3 h-3" />
                  Pranzo
                </li>
                <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <X className="w-3 h-3" />
                  Trasporto
                </li>
              </ul>
            </div>
          </section>

          {/* Compatibilità col piano */}
          <section className="bg-olive/10 rounded-xl p-4 border border-olive/20">
            <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
              <Check className="w-4 h-4 text-olive" />
              Compatibile col tuo piano
            </h4>
            <ul className="space-y-1">
              <li className="text-xs text-foreground/80 flex items-center gap-1.5">
                <Check className="w-3 h-3 text-olive" />
                Arricchisce la visita senza sostituirla
              </li>
              {slotContext?.userRhythm && (
                <li className="text-xs text-foreground/80 flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-olive" />
                  Rientra nel tuo ritmo "{slotContext.userRhythm}"
                </li>
              )}
            </ul>
          </section>
        </div>

        {/* Fixed footer */}
        <div className="border-t border-border p-4 bg-background">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-lg font-bold text-foreground">{formattedTotalPrice}</span>
              {quantity > 1 && (
                <span className="text-xs text-muted-foreground ml-1.5">
                  ({formattedUnitPrice} × {quantity})
                </span>
              )}
              {product.duration_minutes && (
                <span className="text-sm text-muted-foreground ml-2">· {product.duration_minutes} min</span>
              )}
            </div>
            <Button 
              onClick={handleAdd}
              disabled={isAdding}
              className="flex-1 max-w-[200px]"
              size="lg"
            >
              {isAdding ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Aggiunta...
                </>
              ) : (
                'Aggiungi al piano'
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
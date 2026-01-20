import { motion } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Plus, 
  ExternalLink,
  Star,
  Ticket,
  Wine,
  Palette,
  UtensilsCrossed,
  Car,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product, ProductType } from '@/types/database';
import { PRODUCT_TYPE_OPTIONS } from '@/types/database';

interface ProductAddOnCardProps {
  product: Product;
  onAdd: () => void;
  isAdding?: boolean;
  variant?: 'inline' | 'card' | 'minimal';
}

const getProductIcon = (type: ProductType) => {
  switch (type) {
    case 'guided_tour': return <Ticket className="w-4 h-4" />;
    case 'tasting': return <Wine className="w-4 h-4" />;
    case 'workshop': return <Palette className="w-4 h-4" />;
    case 'dining_experience': return <UtensilsCrossed className="w-4 h-4" />;
    case 'transport': return <Car className="w-4 h-4" />;
    case 'photo_experience': return <Camera className="w-4 h-4" />;
    case 'ticket': return <Ticket className="w-4 h-4" />;
    default: return <Star className="w-4 h-4" />;
  }
};

const formatPrice = (cents: number | null, currency: string = 'EUR') => {
  if (!cents) return 'Gratis';
  const amount = cents / 100;
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
  }).format(amount);
};

const getProductTypeLabel = (type: ProductType) => {
  return PRODUCT_TYPE_OPTIONS.find(opt => opt.id === type)?.label || type;
};

export function ProductAddOnCard({ 
  product, 
  onAdd, 
  isAdding = false,
  variant = 'card' 
}: ProductAddOnCardProps) {
  
  // Minimal variant - just a suggestion line
  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-lg border border-primary/10"
      >
        <div className="flex items-center gap-2">
          <span className="text-primary">{getProductIcon(product.product_type)}</span>
          <span className="text-sm font-medium">{product.title}</span>
          {product.price_cents && (
            <Badge variant="secondary" className="text-xs">
              {formatPrice(product.price_cents, product.currency)}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onAdd}
          disabled={isAdding}
          className="h-7 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Aggiungi
        </Button>
      </motion.div>
    );
  }

  // Inline variant - fits inside timeline slot
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 p-3 bg-gradient-to-r from-primary/5 to-gold/5 rounded-lg border border-primary/20"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {getProductIcon(product.product_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                Upgrade disponibile
              </span>
            </div>
            <h5 className="font-medium text-foreground mt-0.5">{product.title}</h5>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.short_pitch}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {product.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {product.duration_minutes} min
                </span>
              )}
              <span className="font-semibold text-primary">
                {formatPrice(product.price_cents, product.currency)}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={onAdd}
            disabled={isAdding}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Aggiungi
          </Button>
        </div>
      </motion.div>
    );
  }

  // Full card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border shadow-soft overflow-hidden"
    >
      {/* Header with image or gradient */}
      <div className="relative h-32 bg-gradient-to-br from-primary/20 to-gold/20">
        {product.photo_url && (
          <img 
            src={product.photo_url} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-background/90 text-foreground">
            {getProductIcon(product.product_type)}
            <span className="ml-1">{getProductTypeLabel(product.product_type)}</span>
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="default" className="bg-primary text-primary-foreground font-semibold">
            {formatPrice(product.price_cents, product.currency)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-display text-lg font-semibold text-foreground">
          {product.title}
        </h4>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {product.short_pitch}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          {product.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {product.duration_minutes} min
            </span>
          )}
          {product.vendor_name && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-gold" />
              {product.vendor_name}
            </span>
          )}
          {product.meeting_point && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Punto d'incontro
            </span>
          )}
        </div>

        {/* Description preview */}
        {product.description && (
          <p className="text-sm text-foreground/80 mt-3 line-clamp-3">
            {product.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex border-t border-border">
        <Button
          variant="ghost"
          className="flex-1 rounded-none h-12"
          onClick={() => product.booking_url && window.open(product.booking_url, '_blank')}
          disabled={!product.booking_url}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Dettagli
        </Button>
        <div className="w-px bg-border" />
        <Button
          variant="ghost"
          className="flex-1 rounded-none h-12 text-primary hover:text-primary hover:bg-primary/10"
          onClick={onAdd}
          disabled={isAdding}
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi al piano
        </Button>
      </div>
    </motion.div>
  );
}

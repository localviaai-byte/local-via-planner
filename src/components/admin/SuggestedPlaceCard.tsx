import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles } from 'lucide-react';
import { PLACE_TYPE_OPTIONS } from '@/types/database';
import type { SuggestedPlace } from '@/lib/api/discovery';

interface SuggestedPlaceCardProps {
  place: SuggestedPlace;
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export function SuggestedPlaceCard({ place, onAccept, onReject, isLoading }: SuggestedPlaceCardProps) {
  const typeConfig = PLACE_TYPE_OPTIONS.find(t => t.id === place.place_type);
  const confidencePercent = Math.round(place.confidence * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <Card className="border-2 border-dashed border-gold/50 bg-gold/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Type icon */}
            <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-2xl shrink-0">
              {typeConfig?.icon || '📍'}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold truncate">{place.name}</h4>
                <Badge variant="outline" className="text-xs shrink-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {confidencePercent}%
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {typeConfig?.label || place.place_type}
                </Badge>
                {place.zone && (
                  <Badge variant="outline" className="text-xs">
                    📍 {place.zone}
                  </Badge>
                )}
              </div>
              
              {place.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {place.description}
                </p>
              )}
              
              {/* Why people go */}
              {place.why_people_go && place.why_people_go.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {place.why_people_go.slice(0, 3).map((why, i) => (
                    <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                      {why}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Best times */}
              {place.best_times && place.best_times.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  🕐 {place.best_times.join(', ')}
                </p>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 border-olive text-olive hover:bg-olive hover:text-white"
                onClick={onAccept}
                disabled={isLoading}
              >
                <Check className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
                onClick={onReject}
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

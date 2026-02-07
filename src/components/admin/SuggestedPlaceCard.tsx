import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, Star, ExternalLink } from 'lucide-react';
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
  const hasTripAdvisor = place.tripadvisor_rating || place.tripadvisor_ranking;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <Card className="border-2 border-dashed border-gold/50 bg-gold/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Type icon or TripAdvisor image */}
            <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
              {place.tripadvisor_image_url ? (
                <img 
                  src={place.tripadvisor_image_url} 
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                typeConfig?.icon || '📍'
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
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
              
              {/* TripAdvisor data */}
              {hasTripAdvisor && (
                <div className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-background/50 rounded-lg border border-border/50">
                  {place.tripadvisor_rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{place.tripadvisor_rating}</span>
                      {place.tripadvisor_reviews_count && (
                        <span className="text-muted-foreground text-xs">
                          ({place.tripadvisor_reviews_count.toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                  {place.tripadvisor_ranking && (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                      #{place.tripadvisor_ranking}
                      {place.tripadvisor_ranking_category && (
                        <span className="ml-1 opacity-70">
                          {place.tripadvisor_ranking_category.slice(0, 20)}
                        </span>
                      )}
                    </Badge>
                  )}
                  {place.tripadvisor_price_level && (
                    <span className="text-xs text-muted-foreground">
                      {place.tripadvisor_price_level}
                    </span>
                  )}
                  {place.tripadvisor_url && (
                    <a 
                      href={place.tripadvisor_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      TripAdvisor
                    </a>
                  )}
                </div>
              )}
              
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

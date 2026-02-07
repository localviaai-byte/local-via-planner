import { Star, ExternalLink, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TripAdvisorBadgeProps {
  rating?: number | null;
  reviewsCount?: number | null;
  ranking?: number | null;
  rankingCategory?: string | null;
  url?: string | null;
  enrichedAt?: string | null;
}

export function TripAdvisorBadge({
  rating,
  reviewsCount,
  ranking,
  rankingCategory,
  url,
  enrichedAt,
}: TripAdvisorBadgeProps) {
  const hasData = rating || ranking;
  
  if (!hasData) {
    return null;
  }

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <img 
          src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_logoset_solid_green.svg" 
          alt="TripAdvisor" 
          className="h-5"
        />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Dati TripAdvisor
        </span>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1.5 bg-white dark:bg-background rounded-lg px-3 py-1.5 shadow-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-lg">{rating}</span>
            {reviewsCount && (
              <span className="text-xs text-muted-foreground">
                ({reviewsCount.toLocaleString()} recensioni)
              </span>
            )}
          </div>
        )}
        
        {/* Ranking */}
        {ranking && (
          <Badge 
            variant="outline" 
            className="bg-white dark:bg-background text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 gap-1"
          >
            <TrendingUp className="w-3 h-3" />
            #{ranking}
            {rankingCategory && (
              <span className="opacity-70 ml-1">
                {rankingCategory.length > 25 ? rankingCategory.slice(0, 25) + '...' : rankingCategory}
              </span>
            )}
          </Badge>
        )}
        
        {/* Link */}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Vedi su TripAdvisor
          </a>
        )}
      </div>
      
      {enrichedAt && (
        <p className="text-xs text-muted-foreground mt-2">
          Aggiornato: {new Date(enrichedAt).toLocaleDateString('it-IT')}
        </p>
      )}
    </div>
  );
}

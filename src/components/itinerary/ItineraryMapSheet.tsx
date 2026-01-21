import { useRef, useEffect, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { type GeneratedItinerary } from '@/hooks/useGenerateItinerary';

interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'attraction' | 'restaurant' | 'bar' | 'club' | 'experience' | 'view' | 'zone';
  slotIndex: number;
  dayIndex: number;
  time: string;
}

interface ItineraryMapSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  generatedData: GeneratedItinerary;
  activeDay: number;
  onDayChange: (day: number) => void;
}

// Color palette for different place types
const typeColors: Record<string, string> = {
  attraction: '#E85D04', // Orange
  restaurant: '#2DC653', // Green
  bar: '#9D4EDD', // Purple
  club: '#F72585', // Pink
  experience: '#4361EE', // Blue
  view: '#4CC9F0', // Cyan
  zone: '#FF9F1C', // Amber
};

export function ItineraryMapSheet({ 
  isOpen, 
  onOpenChange, 
  generatedData,
  activeDay,
  onDayChange 
}: ItineraryMapSheetProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const { token, isLoading: tokenLoading, error: tokenError } = useMapboxToken();
  const [mapLoaded, setMapLoaded] = useState(false);

  const { itinerary, city } = generatedData;

  // Extract points for the current day
  const dayPoints = useMemo<MapPoint[]>(() => {
    const currentDay = itinerary[activeDay];
    if (!currentDay) return [];

    const points: MapPoint[] = [];
    let slotIndex = 1;

    currentDay.slots.forEach((slot) => {
      if (slot.place && slot.place.latitude && slot.place.longitude) {
        points.push({
          id: slot.place.id,
          name: slot.place.name,
          lat: slot.place.latitude,
          lng: slot.place.longitude,
          type: slot.place.type as MapPoint['type'] || 'attraction',
          slotIndex,
          dayIndex: activeDay,
          time: slot.startTime,
        });
        slotIndex++;
      }
    });

    return points;
  }, [itinerary, activeDay]);

  // Calculate estimated walking times between points
  const walkingSegments = useMemo(() => {
    if (dayPoints.length < 2) return [];

    return dayPoints.slice(0, -1).map((point, i) => {
      const next = dayPoints[i + 1];
      // Haversine formula for distance
      const R = 6371; // km
      const dLat = ((next.lat - point.lat) * Math.PI) / 180;
      const dLon = ((next.lng - point.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((point.lat * Math.PI) / 180) *
          Math.cos((next.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;
      
      // ~5 km/h walking speed
      const walkingMinutes = Math.round((distanceKm / 5) * 60);
      
      return {
        from: point,
        to: next,
        distanceKm: Math.round(distanceKm * 100) / 100,
        walkingMinutes,
      };
    });
  }, [dayPoints]);

  // Initialize map
  useEffect(() => {
    if (!isOpen || !token || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;

    const initialCenter: [number, number] = city.longitude && city.latitude 
      ? [city.longitude, city.latitude] 
      : [14.268124, 40.851799]; // Default to Naples area

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: initialCenter,
      zoom: 14,
      attributionControl: false,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, [isOpen, token, city]);

  // Update markers and route when day changes
  useEffect(() => {
    if (!map.current || !mapLoaded || dayPoints.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove existing route layer
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    // Add markers
    dayPoints.forEach((point) => {
      const color = typeColors[point.type] || typeColors.attraction;
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">${point.slotIndex}</div>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        className: 'custom-popup'
      }).setHTML(`
        <div style="padding: 8px; min-width: 150px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${point.name}</div>
          <div style="font-size: 12px; color: #666;">${point.time}</div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([point.lng, point.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Draw connecting line
    if (dayPoints.length >= 2) {
      const coordinates = dayPoints.map(p => [p.lng, p.lat]);
      
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#6366F1',
          'line-width': 3,
          'line-opacity': 0.7,
          'line-dasharray': [2, 1],
        },
      });
    }

    // Fit bounds to show all points
    if (dayPoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      dayPoints.forEach(p => bounds.extend([p.lng, p.lat]));
      
      map.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 120, left: 40, right: 40 },
        maxZoom: 16,
        duration: 500,
      });
    }
  }, [dayPoints, mapLoaded]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-2xl overflow-hidden">
        <SheetHeader className="p-4 pb-2 border-b bg-background">
          <SheetTitle className="flex items-center gap-2 text-left">
            <MapPin className="w-5 h-5 text-primary" />
            Mappa del piano
          </SheetTitle>
          
          {/* Day Toggle */}
          {itinerary.length > 1 && (
            <div className="flex gap-2 mt-3">
              {itinerary.map((day, index) => (
                <Button
                  key={day.dayNumber}
                  variant={activeDay === index ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onDayChange(index)}
                  className="flex-1"
                >
                  Giorno {day.dayNumber}
                </Button>
              ))}
            </div>
          )}
        </SheetHeader>

        <div className="relative h-full">
          {/* Map Container */}
          {tokenLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tokenError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-destructive">Errore caricamento mappa</p>
            </div>
          ) : (
            <div ref={mapContainer} className="w-full h-full" />
          )}

          {/* Walking Times Summary */}
          {mapLoaded && walkingSegments.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur rounded-xl p-3 shadow-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Spostamenti</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {walkingSegments.map((seg, i) => (
                  <div 
                    key={i}
                    className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    <span className="font-semibold">{seg.from.slotIndex}→{seg.to.slotIndex}</span>
                    <span className="text-muted-foreground">
                      {seg.walkingMinutes < 1 
                        ? '< 1 min' 
                        : `${seg.walkingMinutes} min`
                      }
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Spostamenti brevi e coerenti
              </p>
            </div>
          )}

          {/* Empty State */}
          {mapLoaded && dayPoints.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <p className="text-muted-foreground">Nessun punto con coordinate per questo giorno</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

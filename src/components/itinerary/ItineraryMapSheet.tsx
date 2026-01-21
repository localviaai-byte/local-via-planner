import { useRef, useEffect, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Navigation, AlertCircle } from 'lucide-react';
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

// Fallback coordinates for known places (Pompei area)
const POMPEI_CENTER = { lat: 40.7509, lng: 14.4869 };

// Known location coordinates for fallback
const knownLocations: Record<string, { lat: number; lng: number }> = {
  'scavi di pompei': { lat: 40.7509, lng: 14.4869 },
  'santuario della beata vergine del santo rosario di pompei': { lat: 40.7489, lng: 14.4999 },
  'santuario': { lat: 40.7489, lng: 14.4999 },
  'president': { lat: 40.7485, lng: 14.4972 },
  'il circolo': { lat: 40.7502, lng: 14.4892 },
  'the roof': { lat: 40.7498, lng: 14.4885 },
  'centro storico e street art': { lat: 40.7495, lng: 14.4950 },
  'anfiteatro': { lat: 40.7517, lng: 14.4922 },
  'villa dei misteri': { lat: 40.7538, lng: 14.4779 },
  'foro': { lat: 40.7493, lng: 14.4846 },
};

// Get coordinates for a place, with fallback logic
function getPlaceCoordinates(
  place: { latitude?: number | null; longitude?: number | null; name: string },
  index: number,
  cityCenter: { lat: number; lng: number }
): { lat: number; lng: number } | null {
  // If DB coordinates exist but are clearly wrong (e.g. Pompei -> Trento),
  // ignore them and use name-based / city-center fallbacks.
  if (place.latitude && place.longitude) {
    const R = 6371;
    const dLat = ((place.latitude - cityCenter.lat) * Math.PI) / 180;
    const dLon = ((place.longitude - cityCenter.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((cityCenter.lat * Math.PI) / 180) *
        Math.cos((place.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    // Very generous threshold: only discard coordinates that are "obviously" outside the city.
    if (distanceKm <= 200) {
      return { lat: place.latitude, lng: place.longitude };
    }
  }

  // Check known locations by name (case-insensitive)
  const normalizedName = place.name.toLowerCase().trim();
  if (knownLocations[normalizedName]) {
    return knownLocations[normalizedName];
  }

  // Check for partial matches
  for (const [key, coords] of Object.entries(knownLocations)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return coords;
    }
  }

  // Fallback: spread points around city center
  const angle = (index * 72 + 30) * (Math.PI / 180); // 72 degrees apart
  const distance = 0.003 + (index * 0.001); // Small radius around center
  return {
    lat: cityCenter.lat + Math.sin(angle) * distance,
    lng: cityCenter.lng + Math.cos(angle) * distance,
  };
}

export function ItineraryMapSheet({ 
  isOpen, 
  onOpenChange, 
  generatedData,
  activeDay,
  onDayChange 
}: ItineraryMapSheetProps) {
  const [mapContainerEl, setMapContainerEl] = useState<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const { token, isLoading: tokenLoading, error: tokenError } = useMapboxToken();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const { itinerary, city } = generatedData;

  // City center for fallback
  const cityCenter = useMemo(() => {
    if (city.latitude && city.longitude) {
      return { lat: city.latitude, lng: city.longitude };
    }
    // Default to Pompei
    return POMPEI_CENTER;
  }, [city]);

  // Extract points for the current day (with fallback coordinates)
  const dayPoints = useMemo<MapPoint[]>(() => {
    const currentDay = itinerary[activeDay];
    if (!currentDay) return [];

    const points: MapPoint[] = [];
    let slotIndex = 1;

    currentDay.slots.forEach((slot, idx) => {
      if (slot.place) {
        const coords = getPlaceCoordinates(slot.place, idx, cityCenter);
        if (coords) {
          points.push({
            id: slot.place.id,
            name: slot.place.name,
            lat: coords.lat,
            lng: coords.lng,
            type: (slot.place.type as MapPoint['type']) || 'attraction',
            slotIndex,
            dayIndex: activeDay,
            time: slot.startTime,
          });
          slotIndex++;
        }
      }
    });

    return points;
  }, [itinerary, activeDay, cityCenter]);

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
        walkingMinutes: Math.max(1, walkingMinutes), // Minimum 1 min
      };
    });
  }, [dayPoints]);

  // Initialize map
  useEffect(() => {
    if (!isOpen || !token || !mapContainerEl || map.current) return;

    mapboxgl.accessToken = token;

    setMapError(null);
    map.current = new mapboxgl.Map({
      container: mapContainerEl,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [cityCenter.lng, cityCenter.lat],
      zoom: 15,
      attributionControl: false,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
      // The Sheet animates and can cause the map to initialize with a 0x0 size.
      // Force a resize on the next frames to avoid a blank map.
      requestAnimationFrame(() => map.current?.resize());
      setTimeout(() => map.current?.resize(), 250);
    });

    map.current.on('error', (e) => {
      const message = (e as any)?.error?.message || 'Errore caricamento mappa';
      console.error('Mapbox error:', (e as any)?.error || e);
      setMapError(message);
    });

    return () => {
      map.current?.remove();
      map.current = null;
      setMapLoaded(false);
      setMapError(null);
    };
  }, [isOpen, token, cityCenter, mapContainerEl]);

  // Ensure map resizes correctly when the Sheet opens (after layout/animation)
  useEffect(() => {
    if (!isOpen || !map.current) return;
    const t = setTimeout(() => map.current?.resize(), 250);
    return () => clearTimeout(t);
  }, [isOpen]);

  // ResizeObserver: keep Mapbox in sync with the Sheet's animated height changes
  useEffect(() => {
    if (!isOpen || !map.current || !mapContainerEl) return;
    const ro = new ResizeObserver(() => {
      map.current?.resize();
    });
    ro.observe(mapContainerEl);
    return () => ro.disconnect();
  }, [isOpen, mapContainerEl]);

  // Update markers and route when day changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const m = map.current;

    const render = () => {
      // Guard against rare races during style load (Mapbox can throw if we add sources too early)
      if (!m || !m.isStyleLoaded()) return;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Remove existing route layer safely
      try {
        if (m.getLayer('route')) {
          m.removeLayer('route');
        }
        if (m.getSource('route')) {
          m.removeSource('route');
        }
        if (m.getLayer('route-arrows')) {
          m.removeLayer('route-arrows');
        }
      } catch (e) {
        console.warn('Error removing layers:', e);
      }

      if (dayPoints.length === 0) {
        // Center on city if no points
        m.flyTo({
          center: [cityCenter.lng, cityCenter.lat],
          zoom: 14,
          duration: 500,
        });
        return;
      }

      // Add markers
      dayPoints.forEach((point) => {
        const color = typeColors[point.type] || typeColors.attraction;
        
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.cssText = `
          width: 36px;
          height: 36px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          cursor: pointer;
        `;
        el.innerHTML = `${point.slotIndex}`;

        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          className: 'custom-popup'
        }).setHTML(`
          <div style="padding: 12px; min-width: 180px; font-family: system-ui, sans-serif;">
            <div style="font-weight: 600; margin-bottom: 6px; font-size: 15px;">${point.name}</div>
            <div style="font-size: 13px; color: #666; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; border-radius: 50%;"></span>
              ${point.time} · ${point.type}
            </div>
          </div>
        `);

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([point.lng, point.lat])
          .setPopup(popup)
          .addTo(m);

        markersRef.current.push(marker);
      });

      // Draw connecting line (dashed)
      if (dayPoints.length >= 2) {
        const coordinates = dayPoints.map(p => [p.lng, p.lat]);
        
        m.addSource('route', {
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

        // Dashed line
        m.addLayer({
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
            'line-opacity': 0.8,
            'line-dasharray': [2, 2],
          },
        });
      }

      // Fit bounds to show all points
      const bounds = new mapboxgl.LngLatBounds();
      dayPoints.forEach(p => bounds.extend([p.lng, p.lat]));
      
      m.fitBounds(bounds, {
        padding: { top: 80, bottom: 140, left: 50, right: 50 },
        maxZoom: 16,
        duration: 500,
      });
    };

    // If the style isn't ready yet, wait until the map is idle to avoid
    // "Style is not done loading" crashes (common race in Mapbox GL).
    if (!m.isStyleLoaded()) {
      m.once('idle', render);
      return () => {
        try {
          m.off('idle', render);
        } catch {
          // ignore
        }
      };
    }

    render();
  }, [dayPoints, mapLoaded, cityCenter]);

  const totalWalkingTime = walkingSegments.reduce((acc, seg) => acc + seg.walkingMinutes, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-2xl overflow-hidden flex flex-col">
        <SheetHeader className="p-4 pb-2 border-b bg-background">
          <SheetTitle className="flex items-center gap-2 text-left">
            <MapPin className="w-5 h-5 text-primary" />
            Mappa del piano
          </SheetTitle>
          <SheetDescription className="text-left text-sm text-muted-foreground">
            Visualizza gli spostamenti del giorno
          </SheetDescription>
          
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

        <div className="relative flex-1" style={{ minHeight: 'calc(85vh - 140px)' }}>
          {/* Map Container */}
          {tokenLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tokenError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-2">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <p className="text-destructive text-sm">Errore caricamento mappa</p>
            </div>
          ) : mapError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-2 p-4 text-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <p className="text-destructive text-sm">Errore caricamento mappa</p>
              <p className="text-xs text-muted-foreground break-words">{mapError}</p>
            </div>
          ) : (
            <div ref={setMapContainerEl} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
          )}

          {/* Walking Times Summary */}
          {mapLoaded && dayPoints.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur rounded-xl p-4 shadow-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Spostamenti</span>
                </div>
                {totalWalkingTime > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Totale: ~{totalWalkingTime} min a piedi
                  </span>
                )}
              </div>
              
              {walkingSegments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {walkingSegments.map((seg, i) => (
                    <div 
                      key={i}
                      className="text-xs bg-muted px-3 py-1.5 rounded-full flex items-center gap-1.5"
                    >
                      <span 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: typeColors[seg.from.type] || typeColors.attraction }}
                      >
                        {seg.from.slotIndex}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: typeColors[seg.to.type] || typeColors.attraction }}
                      >
                        {seg.to.slotIndex}
                      </span>
                      <span className="text-foreground font-medium ml-1">
                        {seg.walkingMinutes} min
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Un solo punto per questo giorno
                </p>
              )}
              
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                Spostamenti brevi e coerenti
              </p>
            </div>
          )}

          {/* Empty State - No coordinates */}
          {mapLoaded && dayPoints.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 gap-2">
              <MapPin className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Nessun punto per questo giorno</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

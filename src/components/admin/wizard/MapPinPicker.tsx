import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Crosshair, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapPinPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  placeName?: string;
  cityName?: string;
  cityLatitude?: number | null;
  cityLongitude?: number | null;
}

export function MapPinPicker({
  latitude,
  longitude,
  onChange,
  placeName,
  cityName,
  cityLatitude,
  cityLongitude,
}: MapPinPickerProps) {
  const { token, isLoading: tokenLoading } = useMapboxToken();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const hasCoords = latitude !== null && longitude !== null;

  // Default center: place coords > city coords > Italy center
  const defaultLat = latitude ?? (cityLatitude ? Number(cityLatitude) : 41.9);
  const defaultLng = longitude ?? (cityLongitude ? Number(cityLongitude) : 12.5);
  const defaultZoom = hasCoords ? 16 : (cityLatitude ? 13 : 6);

  const updateMarker = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new mapboxgl.Marker({ color: '#E07A5F', draggable: true })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current!.getLngLat();
        onChange(Number(lngLat.lat.toFixed(6)), Number(lngLat.lng.toFixed(6)));
      });
    }
  }, [onChange]);

  // Init map
  useEffect(() => {
    if (!isExpanded || !token || !mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [defaultLng, defaultLat],
      zoom: defaultZoom,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      mapRef.current = map;

      if (hasCoords) {
        updateMarker(latitude!, longitude!);
      }

      // Click to place/move marker
      map.on('click', (e) => {
        const lat = Number(e.lngLat.lat.toFixed(6));
        const lng = Number(e.lngLat.lng.toFixed(6));
        updateMarker(lat, lng);
        onChange(lat, lng);
      });
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [isExpanded, token]);

  // Geocode search
  const handleSearch = async () => {
    if (!token || !searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const query = `${searchQuery}, ${cityName || ''}, Italia`;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1&country=IT&language=it${cityLatitude ? `&proximity=${cityLongitude},${cityLatitude}` : ''}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;
        const roundedLat = Number(lat.toFixed(6));
        const roundedLng = Number(lng.toFixed(6));

        updateMarker(roundedLat, roundedLng);
        onChange(roundedLat, roundedLng);

        mapRef.current?.flyTo({ center: [roundedLng, roundedLat], zoom: 17, duration: 1000 });
      }
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  if (tokenLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-xl">
        <Loader2 className="w-4 h-4 animate-spin" />
        Caricamento mappa...
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Posizione sulla mappa
      </Label>

      {/* Coordinates display */}
      {hasCoords && (
        <p className="text-xs text-muted-foreground">
          📍 {latitude!.toFixed(5)}, {longitude!.toFixed(5)}
        </p>
      )}

      {!isExpanded ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsExpanded(true)}
          className="w-full gap-2"
        >
          <Crosshair className="w-4 h-4" />
          {hasCoords ? 'Modifica posizione' : 'Posiziona sulla mappa'}
        </Button>
      ) : (
        <div className="space-y-2">
          {/* Search bar */}
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={placeName || 'Cerca indirizzo o luogo...'}
              className="bg-card text-sm"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Map container */}
          <div
            ref={mapContainer}
            className="w-full h-64 rounded-xl overflow-hidden border border-border"
          />

          <p className="text-xs text-muted-foreground text-center">
            Clicca sulla mappa o trascina il pin per posizionare il luogo
          </p>
        </div>
      )}
    </div>
  );
}

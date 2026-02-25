import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import type { TripPlan } from '@/types/database';

interface MyPlansMapProps {
  plans: TripPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (id: string) => void;
}

export function MyPlansMap({ plans, selectedPlanId, onSelectPlan }: MyPlansMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { token, isLoading, error } = useMapboxToken();

  useEffect(() => {
    if (!token || !mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [12.5, 41.9], // Italy center
      zoom: 5,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // Update markers when plans change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasPoints = false;

    plans.forEach(plan => {
      const city = (plan as any).city;
      if (!city?.latitude || !city?.longitude) return;

      const isSelected = plan.id === selectedPlanId;
      
      const el = document.createElement('div');
      el.className = 'plans-map-marker';
      el.style.cssText = `
        width: ${isSelected ? '36px' : '28px'};
        height: ${isSelected ? '36px' : '28px'};
        border-radius: 50%;
        background: ${isSelected ? 'hsl(15, 52%, 53%)' : 'hsl(15, 52%, 53%, 0.7)'};
        border: 3px solid ${isSelected ? 'white' : 'rgba(255,255,255,0.7)'};
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 600;
      `;
      el.textContent = String(plan.days || 1);
      el.addEventListener('click', () => onSelectPlan(plan.id));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([Number(city.longitude), Number(city.latitude)])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(`<div style="font-family: inherit; padding: 4px;">
              <strong>${plan.title || city.name}</strong>
              <br/><span style="font-size: 11px; color: #666;">${plan.days || 1} giorni</span>
            </div>`)
        )
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([Number(city.longitude), Number(city.latitude)]);
      hasPoints = true;
    });

    if (hasPoints) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: 500 });
    }
  }, [plans, selectedPlanId, onSelectPlan]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Caricamento mappa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Mappa non disponibile</p>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full" />;
}

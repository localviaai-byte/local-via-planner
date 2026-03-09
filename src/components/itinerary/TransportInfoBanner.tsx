import { Plane, TrainFront, Bus, Ship, ExternalLink, Clock, Navigation } from 'lucide-react';
import { useTransportHubs, type HubType } from '@/hooks/useTransportHubs';
import { Button } from '@/components/ui/button';

interface TransportInfoBannerProps {
  cityId: string;
}

const HUB_ICONS: Record<HubType, React.ReactNode> = {
  airport: <Plane className="w-3.5 h-3.5" />,
  train_station: <TrainFront className="w-3.5 h-3.5" />,
  bus_station: <Bus className="w-3.5 h-3.5" />,
  port: <Ship className="w-3.5 h-3.5" />,
};

export function TransportInfoBanner({ cityId }: TransportInfoBannerProps) {
  const { data: hubs = [] } = useTransportHubs(cityId);

  if (hubs.length === 0) return null;

  return (
    <div className="bg-muted/50 rounded-xl p-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        🚏 Come arrivare
      </p>
      <div className="space-y-1.5">
        {hubs.map((hub) => (
          <div key={hub.id} className="flex items-start gap-2 text-sm">
            <div className="mt-0.5 text-muted-foreground">{HUB_ICONS[hub.hub_type]}</div>
            <div className="flex-1 min-w-0">
              <span className="font-medium">{hub.name}</span>
              {hub.code && <span className="text-muted-foreground ml-1">({hub.code})</span>}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {hub.distance_from_center_km && (
                  <span className="flex items-center gap-0.5">
                    <Navigation className="w-2.5 h-2.5" />
                    {hub.distance_from_center_km} km
                  </span>
                )}
                {hub.travel_time_to_center_minutes && (
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {hub.travel_time_to_center_minutes} min
                  </span>
                )}
                {hub.transport_to_center && (
                  <span>{hub.transport_to_center}</span>
                )}
              </div>
              {hub.ncc_contact_url && (
                <a
                  href={hub.ncc_contact_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                >
                  🚕 Prenota NCC/Taxi
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              {hub.ncc_taxi_note && !hub.ncc_contact_url && (
                <p className="text-xs text-warning mt-0.5">🚕 {hub.ncc_taxi_note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { 
  Building2, 
  MapPin, 
  Link2, 
  Trash2, 
  Edit2, 
  Plus,
  Users,
  Loader2
} from 'lucide-react';
import type { ReactNode } from 'react';

interface ActivityLogsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTION_CONFIG: Record<string, { icon: ReactNode; color: string; label: string }> = {
  create: { icon: <Plus className="w-4 h-4" />, color: 'bg-olive/20 text-olive', label: 'Creazione' },
  update: { icon: <Edit2 className="w-4 h-4" />, color: 'bg-gold/20 text-gold', label: 'Modifica' },
  delete: { icon: <Trash2 className="w-4 h-4" />, color: 'bg-destructive/20 text-destructive', label: 'Eliminazione' },
  link: { icon: <Link2 className="w-4 h-4" />, color: 'bg-terracotta/20 text-terracotta', label: 'Collegamento' },
};

const ENTITY_CONFIG: Record<string, { icon: ReactNode; label: string }> = {
  city: { icon: <Building2 className="w-4 h-4" />, label: 'Città' },
  place: { icon: <MapPin className="w-4 h-4" />, label: 'Luogo' },
  connection: { icon: <Link2 className="w-4 h-4" />, label: 'Collegamento' },
  zone: { icon: <MapPin className="w-4 h-4" />, label: 'Zona' },
  invite: { icon: <Users className="w-4 h-4" />, label: 'Invito' },
  contributor: { icon: <Users className="w-4 h-4" />, label: 'Contributor' },
  user_role: { icon: <Users className="w-4 h-4" />, label: 'Ruolo utente' },
};

export function ActivityLogsSheet({ open, onOpenChange }: ActivityLogsSheetProps) {
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const { data: logs, isLoading } = useActivityLogs(entityFilter === 'all' ? undefined : entityFilter);
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="font-display text-xl">
            Storico Attività
          </SheetTitle>
          <SheetDescription>
            Tutte le azioni degli admin e contributors
          </SheetDescription>
        </SheetHeader>
        
        {/* Filter */}
        <div className="mb-4">
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Filtra per tipo" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="city">Città</SelectItem>
              <SelectItem value="place">Luoghi</SelectItem>
              <SelectItem value="connection">Collegamenti</SelectItem>
              <SelectItem value="zone">Zone</SelectItem>
              <SelectItem value="invite">Inviti</SelectItem>
              <SelectItem value="contributor">Contributors</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <ScrollArea className="h-[calc(100vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map(log => {
                const actionConfig = ACTION_CONFIG[log.action_type] || ACTION_CONFIG.update;
                const entityConfig = ENTITY_CONFIG[log.entity_type] || { icon: null, label: log.entity_type };
                const details = log.details as Record<string, unknown> | null;
                
                return (
                  <div 
                    key={log.id}
                    className="p-3 rounded-xl border bg-card/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${actionConfig.color}`}>
                        {actionConfig.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {entityConfig.label}
                          </Badge>
                          <Badge className={`text-xs ${actionConfig.color}`}>
                            {actionConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">
                          {(details?.name as string) || (details?.title as string) || 'Elemento'}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{log.user_email || 'Utente sconosciuto'}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(log.created_at), 'dd MMM HH:mm', { locale: it })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nessuna attività registrata</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

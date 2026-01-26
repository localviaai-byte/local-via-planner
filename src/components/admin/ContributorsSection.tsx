import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Mail, 
  MapPin, 
  Copy, 
  Check,
  Trash2,
  Edit2,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContributors, useDeleteInvite, useDeleteContributor } from '@/hooks/useContributors';
import { useCitiesWithStats } from '@/hooks/useCities';
import { InviteContributorSheet } from './InviteContributorSheet';
import { toast } from 'sonner';
import type { AppRole } from '@/types/database';

const ROLE_CONFIG: Record<AppRole, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-terracotta/20 text-terracotta' },
  editor: { label: 'Editor', color: 'bg-olive/20 text-olive' },
  local_contributor: { label: 'Local', color: 'bg-gold/20 text-gold' },
};

const PERMISSION_LABELS: Record<string, string> = {
  classify_attractions: 'Classificare attrazioni',
  add_places: 'Aggiungere luoghi',
  edit_places: 'Modificare luoghi',
  manage_zones: 'Gestire zone',
};

export function ContributorsSection() {
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const { data: contributors, isLoading } = useContributors();
  const { data: cities } = useCitiesWithStats();
  const deleteInvite = useDeleteInvite();
  const deleteContributor = useDeleteContributor();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const handleCopyLink = async (inviteCode: string) => {
    const url = `${window.location.origin}/admin/invite/${inviteCode}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(inviteCode);
    toast.success('Link copiato!');
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const handleDeleteInvite = async (inviteId: string) => {
    if (confirm('Vuoi eliminare questo invito?')) {
      try {
        await deleteInvite.mutateAsync(inviteId);
        toast.success('Invito eliminato');
      } catch {
        toast.error('Errore nell\'eliminazione');
      }
    }
  };
  
  const handleDeleteContributor = async (userId: string, email: string) => {
    if (confirm(`Vuoi eliminare definitivamente l'account di ${email}? Questa azione è irreversibile.`)) {
      try {
        await deleteContributor.mutateAsync(userId);
        toast.success('Contributor eliminato definitivamente');
      } catch (error: any) {
        toast.error(error.message || 'Errore nell\'eliminazione');
      }
    }
  };
  
  const getCityName = (cityId: string | null) => {
    if (!cityId || !cities) return 'Tutte le città';
    const city = cities.find(c => c.id === cityId);
    return city?.name || 'Città sconosciuta';
  };
  
  return (
    <div>
      {/* Section header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-terracotta" />
            Contributors
          </h2>
          <p className="text-muted-foreground mt-1">
            Gestisci chi può contribuire a quali città.
          </p>
        </div>
        <Button onClick={() => setInviteSheetOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Invita
        </Button>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl skeleton-sand" />
          ))}
        </div>
      )}
      
      {/* Active Contributors */}
      {!isLoading && contributors?.activeUsers && contributors.activeUsers.length > 0 && (
        <div className="mb-8">
          <h3 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
            Contributors Attivi ({contributors.activeUsers.length})
          </h3>
          <div className="space-y-3">
            {contributors.activeUsers.map(user => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.email}</p>
                            <Badge className={ROLE_CONFIG[user.role]?.color || ''}>
                              {ROLE_CONFIG[user.role]?.label || user.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {getCityName(user.assigned_city_id)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteContributor(user.user_id, user.email || 'questo contributor')}
                        disabled={deleteContributor.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Pending Invites */}
      {!isLoading && contributors?.pendingInvites && contributors.pendingInvites.length > 0 && (
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
            Inviti in attesa ({contributors.pendingInvites.length})
          </h3>
          <div className="space-y-3">
            {contributors.pendingInvites.map(invite => (
              <motion.div
                key={invite.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{invite.email}</p>
                            <Badge className={ROLE_CONFIG[invite.role]?.color || ''}>
                              {ROLE_CONFIG[invite.role]?.label || invite.role}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              In attesa
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Building2 className="w-3 h-3" />
                            {getCityName(invite.assigned_city_id)}
                          </div>
                          {invite.permissions && invite.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {invite.permissions.map(perm => (
                                <Badge key={perm} variant="secondary" className="text-xs">
                                  {PERMISSION_LABELS[perm] || perm}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyLink(invite.invite_code)}
                        >
                          {copiedId === invite.invite_code ? (
                            <Check className="w-4 h-4 text-olive" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteInvite(invite.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && 
        (!contributors?.activeUsers || contributors.activeUsers.length === 0) &&
        (!contributors?.pendingInvites || contributors.pendingInvites.length === 0) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-medium mb-2">
            Nessun contributor ancora
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Invita locals a contribuire alla mappatura delle città
          </p>
          <Button onClick={() => setInviteSheetOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Invita contributor
          </Button>
        </div>
      )}
      
      {/* Invite Sheet */}
      <InviteContributorSheet 
        open={inviteSheetOpen} 
        onOpenChange={setInviteSheetOpen}
        cities={cities || []}
      />
    </div>
  );
}

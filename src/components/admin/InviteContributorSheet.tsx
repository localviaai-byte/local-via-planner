import { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateInvite } from '@/hooks/useContributors';
import { toast } from 'sonner';
import { Copy, Check, Mail } from 'lucide-react';
import type { AppRole } from '@/types/database';

interface City {
  id: string;
  name: string;
}

interface InviteContributorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cities: City[];
}

const ROLE_OPTIONS = [
  { id: 'local_contributor', label: 'Local Contributor', description: 'Può aggiungere e modificare luoghi' },
  { id: 'editor', label: 'Editor', description: 'Può revisionare e approvare contenuti' },
] as const;

const PERMISSION_OPTIONS = [
  { id: 'classify_attractions', label: 'Classificare attrazioni' },
  { id: 'add_places', label: 'Aggiungere luoghi' },
  { id: 'edit_places', label: 'Modificare luoghi' },
  { id: 'manage_zones', label: 'Gestire zone' },
] as const;

export function InviteContributorSheet({ open, onOpenChange, cities }: InviteContributorSheetProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AppRole>('local_contributor');
  const [cityId, setCityId] = useState<string>('all');
  const [permissions, setPermissions] = useState<string[]>(['add_places', 'classify_attractions']);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const createInvite = useCreateInvite();
  
  const handlePermissionChange = (permId: string, checked: boolean) => {
    if (checked) {
      setPermissions(prev => [...prev, permId]);
    } else {
      setPermissions(prev => prev.filter(p => p !== permId));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Inserisci un\'email');
      return;
    }
    
    try {
      const result = await createInvite.mutateAsync({
        email,
        role,
        assigned_city_id: cityId === 'all' ? null : cityId,
        permissions,
      });
      
      const link = `${window.location.origin}/admin/invite/${result.invite_code}`;
      setGeneratedLink(link);
      toast.success('Invito creato!');
    } catch (error) {
      toast.error('Errore nella creazione dell\'invito');
    }
  };
  
  const handleCopyLink = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Link copiato!');
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleClose = () => {
    setEmail('');
    setRole('local_contributor');
    setCityId('all');
    setPermissions(['add_places', 'classify_attractions']);
    setGeneratedLink(null);
    setCopied(false);
    onOpenChange(false);
  };
  
  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="font-display text-xl">
            Invita Contributor
          </SheetTitle>
          <SheetDescription>
            Crea un link di invito per un nuovo contributor
          </SheetDescription>
        </SheetHeader>
        
        {!generatedLink ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contributor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {/* Role */}
            <div className="space-y-2">
              <Label>Ruolo</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {ROLE_OPTIONS.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>
                      <div>
                        <p className="font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* City */}
            <div className="space-y-2">
              <Label>Città assegnata</Label>
              <Select value={cityId} onValueChange={setCityId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Seleziona città" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">Tutte le città</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se selezioni una città, il contributor potrà operare solo su quella
              </p>
            </div>
            
            {/* Permissions */}
            <div className="space-y-3">
              <Label>Permessi specifici</Label>
              <div className="space-y-2">
                {PERMISSION_OPTIONS.map(perm => (
                  <div key={perm.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={perm.id}
                      checked={permissions.includes(perm.id)}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(perm.id, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={perm.id}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {perm.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={createInvite.isPending}
            >
              {createInvite.isPending ? 'Creazione...' : 'Crea invito'}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-olive/10 flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-olive" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">
                Invito creato!
              </h3>
              <p className="text-muted-foreground text-sm">
                Condividi questo link con {email}
              </p>
            </div>
            
            <div className="p-4 bg-secondary rounded-xl">
              <p className="text-sm font-mono break-all">{generatedLink}</p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="flex-1"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiato!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copia link
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handleClose}
              >
                Chiudi
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

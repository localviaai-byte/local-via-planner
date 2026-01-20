import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Package,
  Clock,
  Euro,
  Edit3,
  Trash2,
  Check,
  X,
  Eye,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  useProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useUpdateProductStatus,
  useDeleteProduct 
} from '@/hooks/useProducts';
import { useCityZones } from '@/hooks/useCities';
import type { 
  Product, 
  ProductFormData, 
  ProductType, 
  PlaceStatus,
  TimeBucket 
} from '@/types/database';
import { 
  PRODUCT_TYPE_OPTIONS, 
  DEFAULT_PRODUCT_FORM_DATA,
  TIME_BUCKET_OPTIONS 
} from '@/types/database';

interface ProductsPanelProps {
  cityId: string;
  cityName: string;
}

const STATUS_CONFIG: Record<PlaceStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'Bozza', color: 'bg-muted text-muted-foreground', icon: '📝' },
  pending_review: { label: 'In revisione', color: 'bg-gold/20 text-gold', icon: '👀' },
  approved: { label: 'Attivo', color: 'bg-olive/20 text-olive', icon: '✅' },
  rejected: { label: 'Rifiutato', color: 'bg-destructive/20 text-destructive', icon: '❌' },
  archived: { label: 'Archiviato', color: 'bg-muted text-muted-foreground', icon: '📦' },
};

export function ProductsPanel({ cityId, cityName }: ProductsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PlaceStatus | 'all'>('all');
  
  const { data: products, isLoading } = useProducts(cityId);
  const { data: zones } = useCityZones(cityId);
  const deleteProductMutation = useDeleteProduct();
  
  // Filter products
  const filteredProducts = products?.filter(p => 
    statusFilter === 'all' || p.status === statusFilter
  ) || [];
  
  // Count by status
  const draftCount = products?.filter(p => p.status === 'draft').length || 0;
  const activeCount = products?.filter(p => p.status === 'approved').length || 0;
  
  const handleDelete = async () => {
    if (deleteProductId) {
      await deleteProductMutation.mutateAsync(deleteProductId);
      setDeleteProductId(null);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-medium flex items-center gap-2">
              Esperienze & Add-on
              {draftCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {draftCount} bozze
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeCount} attive • Tour, degustazioni, ticket...
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      
      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 pb-4 space-y-4">
              {/* Filters and actions */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('all')}
                  >
                    Tutti ({products?.length || 0})
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'draft' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('draft')}
                  >
                    📝 Bozze ({draftCount})
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'approved' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('approved')}
                  >
                    ✅ Attive ({activeCount})
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsCreating(true)}
                  disabled={isCreating}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nuovo
                </Button>
              </div>
              
              {/* Create form */}
              {isCreating && (
                <ProductForm
                  cityId={cityId}
                  zones={zones || []}
                  onCancel={() => setIsCreating(false)}
                  onSaved={() => setIsCreating(false)}
                />
              )}
              
              {/* Products list */}
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="h-20 rounded-lg skeleton-sand" />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="space-y-2">
                  {filteredProducts.map(product => (
                    <div key={product.id}>
                      {editingProductId === product.id ? (
                        <ProductForm
                          cityId={cityId}
                          zones={zones || []}
                          product={product}
                          onCancel={() => setEditingProductId(null)}
                          onSaved={() => setEditingProductId(null)}
                        />
                      ) : (
                        <ProductRow
                          product={product}
                          onEdit={() => setEditingProductId(product.id)}
                          onDelete={() => setDeleteProductId(product.id)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nessuna esperienza {statusFilter !== 'all' ? 'in questo stato' : 'ancora'}</p>
                  <p className="text-sm">Aggiungi tour guidati, degustazioni, ticket...</p>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Delete confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questa esperienza?</AlertDialogTitle>
            <AlertDialogDescription>
              L'azione non può essere annullata. Tutti i dati associati verranno persi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// =====================================================
// PRODUCT ROW
// =====================================================

interface ProductRowProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

function ProductRow({ product, onEdit, onDelete }: ProductRowProps) {
  const updateStatusMutation = useUpdateProductStatus();
  const typeConfig = PRODUCT_TYPE_OPTIONS.find(t => t.id === product.product_type);
  const statusConfig = STATUS_CONFIG[product.status];
  
  const handleStatusChange = async (newStatus: PlaceStatus) => {
    await updateStatusMutation.mutateAsync({
      productId: product.id,
      status: newStatus,
    });
  };
  
  const formatPrice = (cents: number | null) => {
    if (!cents) return 'Gratis';
    return `€${(cents / 100).toFixed(2)}`;
  };
  
  return (
    <div className="p-3 bg-secondary/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl shrink-0">
          {typeConfig?.icon || '📦'}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium">{product.title}</h4>
            <Badge className={`text-xs ${statusConfig.color}`}>
              {statusConfig.icon} {statusConfig.label}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
            {product.short_pitch}
          </p>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {product.duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {product.duration_minutes} min
              </span>
            )}
            <span className="flex items-center gap-1 font-medium text-primary">
              <Euro className="w-3 h-3" />
              {formatPrice(product.price_cents)}
            </span>
            {product.vendor_name && (
              <span className="truncate">
                👤 {product.vendor_name}
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {product.status === 'draft' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStatusChange('approved')}
              className="h-8 text-olive hover:text-olive"
              title="Attiva"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          {product.status === 'approved' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStatusChange('draft')}
              className="h-8 text-muted-foreground"
              title="Disattiva"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="h-8"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PRODUCT FORM
// =====================================================

interface ProductFormProps {
  cityId: string;
  zones: { id: string; name: string }[];
  product?: Product;
  onCancel: () => void;
  onSaved: () => void;
}

function ProductForm({ cityId, zones, product, onCancel, onSaved }: ProductFormProps) {
  const isEditing = !!product;
  
  const [formData, setFormData] = useState<ProductFormData>(() => {
    if (product) {
      return {
        city_id: product.city_id,
        zone_id: product.zone_id,
        product_type: product.product_type,
        title: product.title,
        short_pitch: product.short_pitch,
        description: product.description || '',
        duration_minutes: product.duration_minutes,
        price_cents: product.price_cents,
        currency: product.currency,
        meeting_point: product.meeting_point || '',
        latitude: product.latitude,
        longitude: product.longitude,
        capacity_note: product.capacity_note || '',
        booking_url: product.booking_url || '',
        vendor_name: product.vendor_name || '',
        vendor_contact: product.vendor_contact || '',
        photo_url: product.photo_url || '',
        preferred_time_buckets: product.preferred_time_buckets || [],
      };
    }
    return { ...DEFAULT_PRODUCT_FORM_DATA, city_id: cityId };
  });
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  
  const handleSubmit = async (status: PlaceStatus = 'draft') => {
    if (isEditing) {
      await updateMutation.mutateAsync({
        productId: product.id,
        formData: { ...formData },
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    onSaved();
  };
  
  const updateField = <K extends keyof ProductFormData>(
    field: K, 
    value: ProductFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const toggleTimeBucket = (bucket: TimeBucket) => {
    const current = formData.preferred_time_buckets;
    if (current.includes(bucket)) {
      updateField('preferred_time_buckets', current.filter(b => b !== bucket));
    } else {
      updateField('preferred_time_buckets', [...current, bucket]);
    }
  };
  
  const isValid = formData.product_type && formData.title && formData.short_pitch;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-secondary/50 rounded-lg border border-primary/20 space-y-4"
    >
      <h4 className="font-medium">
        {isEditing ? 'Modifica esperienza' : 'Nuova esperienza'}
      </h4>
      
      {/* Type selector */}
      <div className="space-y-2">
        <Label>Tipo *</Label>
        <div className="grid grid-cols-4 gap-2">
          {PRODUCT_TYPE_OPTIONS.map(type => (
            <button
              key={type.id}
              type="button"
              onClick={() => updateField('product_type', type.id as ProductType)}
              className={`p-2 rounded-lg border text-center transition-all ${
                formData.product_type === type.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-xl block">{type.icon}</span>
              <span className="text-xs">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Title & Pitch */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Titolo *</Label>
          <Input
            value={formData.title}
            onChange={e => updateField('title', e.target.value)}
            placeholder="es. Tour Guidato Pompei"
          />
        </div>
        <div className="space-y-2">
          <Label>Zona</Label>
          <Select
            value={formData.zone_id || ''}
            onValueChange={v => updateField('zone_id', v || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona zona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nessuna zona</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Pitch breve * (max 100 caratteri)</Label>
        <Input
          value={formData.short_pitch}
          onChange={e => updateField('short_pitch', e.target.value.slice(0, 100))}
          placeholder="es. Scopri Pompei con un archeologo locale"
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.short_pitch.length}/100
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Descrizione completa</Label>
        <Textarea
          value={formData.description}
          onChange={e => updateField('description', e.target.value)}
          placeholder="Descrizione dettagliata dell'esperienza..."
          rows={3}
        />
      </div>
      
      {/* Price & Duration */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Prezzo (€)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.price_cents ? (formData.price_cents / 100).toFixed(2) : ''}
            onChange={e => {
              const euros = parseFloat(e.target.value);
              updateField('price_cents', isNaN(euros) ? null : Math.round(euros * 100));
            }}
            placeholder="es. 25.00"
          />
        </div>
        <div className="space-y-2">
          <Label>Durata (minuti)</Label>
          <Input
            type="number"
            min="15"
            max="1440"
            value={formData.duration_minutes || ''}
            onChange={e => updateField('duration_minutes', parseInt(e.target.value) || null)}
            placeholder="es. 120"
          />
        </div>
        <div className="space-y-2">
          <Label>Valuta</Label>
          <Select
            value={formData.currency}
            onValueChange={v => updateField('currency', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Preferred times */}
      <div className="space-y-2">
        <Label>Orari consigliati</Label>
        <div className="flex flex-wrap gap-2">
          {TIME_BUCKET_OPTIONS.map(bucket => (
            <button
              key={bucket.id}
              type="button"
              onClick={() => toggleTimeBucket(bucket.id as TimeBucket)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                formData.preferred_time_buckets.includes(bucket.id as TimeBucket)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {bucket.icon} {bucket.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Vendor info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nome fornitore</Label>
          <Input
            value={formData.vendor_name}
            onChange={e => updateField('vendor_name', e.target.value)}
            placeholder="es. ArcheoTour Napoli"
          />
        </div>
        <div className="space-y-2">
          <Label>Contatto</Label>
          <Input
            value={formData.vendor_contact}
            onChange={e => updateField('vendor_contact', e.target.value)}
            placeholder="Email o telefono"
          />
        </div>
      </div>
      
      {/* Booking URL */}
      <div className="space-y-2">
        <Label>URL prenotazione</Label>
        <Input
          type="url"
          value={formData.booking_url}
          onChange={e => updateField('booking_url', e.target.value)}
          placeholder="https://..."
        />
      </div>
      
      {/* Meeting point */}
      <div className="space-y-2">
        <Label>Punto d'incontro</Label>
        <Input
          value={formData.meeting_point}
          onChange={e => updateField('meeting_point', e.target.value)}
          placeholder="es. Ingresso Porta Marina, Pompei"
        />
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          <X className="w-4 h-4 mr-1" />
          Annulla
        </Button>
        <Button 
          variant="outline"
          onClick={() => handleSubmit('draft')}
          disabled={!isValid || isSaving}
        >
          <Save className="w-4 h-4 mr-1" />
          {isEditing ? 'Salva bozza' : 'Salva come bozza'}
        </Button>
        <Button 
          onClick={() => handleSubmit('approved')}
          disabled={!isValid || isSaving}
        >
          <Check className="w-4 h-4 mr-1" />
          {isEditing ? 'Salva e attiva' : 'Salva e attiva'}
        </Button>
      </div>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Clock, Trash2, ChevronRight, Map as MapIcon, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTripPlans, useDeleteTripPlan, usePlanItems } from '@/hooks/useTripPlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { MyPlansMap } from '@/components/plans/MyPlansMap';

export default function MyPlans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: plans, isLoading } = useTripPlans();
  const deletePlan = useDeleteTripPlan();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  if (!user) {
    navigate('/auth?redirect=/my-plans');
    return null;
  }

  const selectedPlan = plans?.find(p => p.id === selectedPlanId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-hero text-primary-foreground">
        <div className="container max-w-2xl py-4 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-xl font-bold">I miei piani</h1>
              <p className="text-xs opacity-80">{plans?.length || 0} itinerari salvati</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl py-6 px-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : !plans?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">🗺️</div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Nessun piano salvato
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Crea il tuo primo itinerario e salvalo qui!
            </p>
            <Button onClick={() => navigate('/')} variant="hero">
              Inizia a pianificare
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Map toggle */}
            <div className="mb-4">
              <Button
                variant={showMap ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="w-full"
              >
                <MapIcon className="w-4 h-4 mr-2" />
                {showMap ? 'Nascondi mappa' : 'Mostra mappa'}
              </Button>
            </div>

            {/* Interactive Map */}
            <AnimatePresence>
              {showMap && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 320, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 rounded-2xl overflow-hidden border border-border"
                >
                  <MyPlansMap
                    plans={plans}
                    selectedPlanId={selectedPlanId}
                    onSelectPlan={setSelectedPlanId}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Plan Cards */}
            <div className="space-y-3">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPlanId === plan.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedPlanId(selectedPlanId === plan.id ? null : plan.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-foreground truncate">
                            {plan.title || `Piano ${(plan as any).city?.name || ''}`}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            {(plan as any).city?.name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {(plan as any).city.name}
                              </span>
                            )}
                            {plan.days && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {plan.days} {plan.days === 1 ? 'giorno' : 'giorni'}
                              </span>
                            )}
                            {plan.start_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(plan.start_date), 'd MMM', { locale: it })}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground/60 mt-2">
                            Creato {format(new Date(plan.created_at), 'd MMM yyyy', { locale: it })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/my-plans/${plan.id}`);
                            }}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-muted-foreground hover:text-primary"
                            title="Vedi itinerario"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Eliminare questo piano?')) {
                                deletePlan.mutate(plan.id);
                              }
                            }}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded: show plan items */}
                      <AnimatePresence>
                        {selectedPlanId === plan.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <PlanItemsList planId={plan.id} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function PlanItemsList({ planId }: { planId: string }) {
  const { data: items, isLoading } = usePlanItems(planId);

  if (isLoading) return <Skeleton className="h-16 mt-3" />;
  if (!items?.length) return (
    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
      Nessun elemento in questo piano
    </p>
  );

  // Group by day
  const byDay = items.reduce((acc, item) => {
    const day = item.day_index || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<number, typeof items>);

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-3">
      {Object.entries(byDay).map(([day, dayItems]) => (
        <div key={day}>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Giorno {day}
          </p>
          <div className="space-y-1">
            {dayItems.map(item => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-foreground truncate">
                  {(item as any).place?.name || (item as any).product?.title || item.notes || 'Elemento'}
                </span>
                {item.start_time && (
                  <span className="text-muted-foreground ml-auto flex-shrink-0">
                    {item.start_time.slice(0, 5)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

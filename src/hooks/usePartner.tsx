import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Partner = Tables<'partners'>;
type ReferralClick = Tables<'referral_clicks'>;
type ReferralConversion = Tables<'referral_conversions'>;

export interface PartnerStats {
  totalClicks: number;
  totalConversions: number;
  pendingCommission: number;
  paidCommission: number;
  clicksThisMonth: number;
  conversionsThisMonth: number;
}

export function usePartner() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [stats, setStats] = useState<PartnerStats>({
    totalClicks: 0, totalConversions: 0, pendingCommission: 0,
    paidCommission: 0, clicksThisMonth: 0, conversionsThisMonth: 0,
  });
  const [recentClicks, setRecentClicks] = useState<ReferralClick[]>([]);
  const [conversions, setConversions] = useState<ReferralConversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [linkedPlace, setLinkedPlace] = useState<Tables<'places'> | null>(null);

  useEffect(() => {
    if (user) fetchPartnerData();
  }, [user]);

  const fetchPartnerData = async () => {
    if (!user) return;
    try {
      const { data: partnerData } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!partnerData) { setIsLoading(false); return; }
      setPartner(partnerData);

      // Fetch linked place for affiliates
      if (partnerData.linked_place_id) {
        const { data: place } = await supabase
          .from('places')
          .select('*')
          .eq('id', partnerData.linked_place_id)
          .maybeSingle();
        setLinkedPlace(place);
      }

      // Fetch referral stats (only for referral partners)
      if (partnerData.partner_type === 'referral' && partnerData.referral_code) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [clicksRes, conversionsRes] = await Promise.all([
          supabase
            .from('referral_clicks')
            .select('*')
            .eq('partner_id', partnerData.id)
            .order('created_at', { ascending: false })
            .limit(50),
          supabase
            .from('referral_conversions')
            .select('*')
            .eq('partner_id', partnerData.id)
            .order('created_at', { ascending: false }),
        ]);

        const clicks = clicksRes.data || [];
        const convs = conversionsRes.data || [];
        setRecentClicks(clicks);
        setConversions(convs);

        setStats({
          totalClicks: clicks.length,
          totalConversions: convs.length,
          pendingCommission: convs
            .filter(c => c.status === 'pending')
            .reduce((sum, c) => sum + (c.commission_cents || 0), 0),
          paidCommission: convs
            .filter(c => c.status === 'paid')
            .reduce((sum, c) => sum + (c.commission_cents || 0), 0),
          clicksThisMonth: clicks.filter(c => new Date(c.created_at) >= startOfMonth).length,
          conversionsThisMonth: convs.filter(c => new Date(c.created_at) >= startOfMonth).length,
        });
      }
    } catch (err) {
      console.error('Error fetching partner data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Partner>) => {
    if (!partner) return;
    const { error } = await supabase
      .from('partners')
      .update(updates)
      .eq('id', partner.id);
    if (!error) {
      setPartner(prev => prev ? { ...prev, ...updates } : null);
    }
    return { error };
  };

  return { partner, stats, recentClicks, conversions, linkedPlace, isLoading, updateProfile, refetch: fetchPartnerData };
}

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type MembershipTier = 'free' | 'basic' | 'premium' | 'vip';

export interface UserMembership {
  tier: MembershipTier;
  expiresAt: string | null;
}

export const MEMBERSHIP_FEATURES = {
  free: {
    aiReadings: 3,
    exportPdf: false,
    exportImage: true,
    customReading: false,
    priority: 0,
  },
  basic: {
    aiReadings: 20,
    exportPdf: true,
    exportImage: true,
    customReading: false,
    priority: 1,
  },
  premium: {
    aiReadings: 100,
    exportPdf: true,
    exportImage: true,
    customReading: true,
    priority: 2,
  },
  vip: {
    aiReadings: -1, // unlimited
    exportPdf: true,
    exportImage: true,
    customReading: true,
    priority: 3,
  },
};

export const useMembership = () => {
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMembership = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMembership(null);
        return;
      }

      const { data, error } = await supabase
        .from('user_memberships')
        .select('tier, expires_at')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Check if membership is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        // Update to free tier if expired
        await supabase
          .from('user_memberships')
          .update({ tier: 'free', expires_at: null })
          .eq('user_id', user.id);
        
        setMembership({ tier: 'free', expiresAt: null });
      } else {
        setMembership({
          tier: data.tier as MembershipTier,
          expiresAt: data.expires_at,
        });
      }
    } catch (error) {
      console.error('Failed to fetch membership:', error);
      setMembership({ tier: 'free', expiresAt: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchMembership();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const hasFeature = (feature: keyof typeof MEMBERSHIP_FEATURES.free) => {
    if (!membership) return false;
    return MEMBERSHIP_FEATURES[membership.tier][feature];
  };

  const canUseFeature = (feature: keyof typeof MEMBERSHIP_FEATURES.free, count?: number) => {
    if (!membership) return false;
    const featureValue = MEMBERSHIP_FEATURES[membership.tier][feature];
    
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    
    if (typeof featureValue === 'number' && typeof count === 'number') {
      return featureValue === -1 || count < featureValue;
    }
    
    return false;
  };

  return {
    membership,
    loading,
    hasFeature,
    canUseFeature,
    refetch: fetchMembership,
  };
};
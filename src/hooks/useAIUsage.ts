import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAIUsage = () => {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchUsageCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUsageCount(0);
        return;
      }

      // 获取本月使用次数
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('ai_usage_records')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('usage_type', 'ai_reading')
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      setUsageCount(data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch AI usage:', error);
      setUsageCount(0);
    } finally {
      setLoading(false);
    }
  };

  const recordUsage = async (baziRecordId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('ai_usage_records')
        .insert({
          user_id: user.id,
          usage_type: 'ai_reading',
          bazi_record_id: baziRecordId,
        });

      if (error) throw error;

      await fetchUsageCount();
      return true;
    } catch (error) {
      console.error('Failed to record AI usage:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchUsageCount();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUsageCount();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    usageCount,
    loading,
    recordUsage,
    refetch: fetchUsageCount,
  };
};

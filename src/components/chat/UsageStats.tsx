import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Zap, TrendingUp } from 'lucide-react';
import { useMembership } from '@/hooks/useMembership';

export const UsageStats = () => {
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { membership } = useMembership();

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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
        console.error('获取使用统计失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  if (loading) return null;

  const monthlyLimits: Record<string, number> = {
    free: 3,
    basic: 20,
    premium: 100,
    vip: -1
  };

  const tier = membership?.tier || 'free';
  const limit = monthlyLimits[tier];
  const percentage = limit === -1 ? 0 : (usageCount / limit) * 100;

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">本月使用</h3>
        </div>
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">AI解读次数</span>
          <span className="font-bold">
            {usageCount} / {limit === -1 ? '∞' : limit}
          </span>
        </div>
        
        {limit !== -1 && (
          <Progress value={percentage} className="h-2" />
        )}
        
        <p className="text-xs text-muted-foreground">
          {tier === 'free' && '升级会员可获得更多次数'}
          {tier === 'basic' && '基础会员每月20次'}
          {tier === 'premium' && '高级会员每月100次'}
          {tier === 'vip' && '尊享会员无限使用'}
        </p>
      </div>
    </Card>
  );
};

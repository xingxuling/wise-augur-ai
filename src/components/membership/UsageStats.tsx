import { useMembership } from '@/hooks/useMembership';
import { useAIUsage } from '@/hooks/useAIUsage';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const UsageStats = () => {
  const { membership, loading: membershipLoading } = useMembership();
  const { usageCount, loading: usageLoading } = useAIUsage();
  const navigate = useNavigate();

  if (membershipLoading || usageLoading) {
    return null;
  }

  if (!membership) return null;

  const limit = membership.tier === 'free' ? 3 : 
                membership.tier === 'basic' ? 20 : 
                membership.tier === 'premium' ? 100 : -1;
  
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 100 : Math.min((usageCount / limit) * 100, 100);
  const remaining = isUnlimited ? '无限' : Math.max(0, limit - usageCount);

  const tierColors = {
    free: 'text-muted-foreground',
    basic: 'text-blue-500',
    premium: 'text-purple-500',
    vip: 'text-amber-500',
  };

  const tierLabels = {
    free: '免费版',
    basic: '基础版',
    premium: '进阶版',
    vip: '尊享版',
  };

  return (
    <Card className="p-6 space-y-4 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${tierColors[membership.tier]}`} />
          <h3 className="font-semibold">本月使用情况</h3>
        </div>
        <span className={`text-sm font-medium ${tierColors[membership.tier]}`}>
          {tierLabels[membership.tier]}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">AI 解读次数</span>
          <span className="font-medium">
            {usageCount} / {isUnlimited ? '∞' : limit}
          </span>
        </div>
        
        {!isUnlimited && (
          <Progress 
            value={percentage} 
            className="h-2"
          />
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              剩余 <span className="font-semibold text-foreground">{remaining}</span> 次
            </span>
          </div>
          
          {membership.tier === 'free' && usageCount >= limit && (
            <Button 
              size="sm" 
              variant="default"
              onClick={() => navigate('/pricing')}
              className="h-8"
            >
              升级会员
            </Button>
          )}
        </div>
      </div>

      {membership.expiresAt && (
        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            会员有效期至：{new Date(membership.expiresAt).toLocaleDateString('zh-CN')}
          </p>
        </div>
      )}
    </Card>
  );
};

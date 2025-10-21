import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, CreditCard, Calendar, AlertCircle, Crown, Sparkles, Zap } from 'lucide-react';
import { useMembership } from '@/hooks/useMembership';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const tierIcons = {
  free: Sparkles,
  basic: Zap,
  premium: Crown,
  vip: Crown,
};

const tierNames = {
  free: '免费版',
  basic: '基础版',
  premium: '进阶版',
  vip: '尊享版',
};

const tierColors = {
  free: 'bg-gray-500/20 text-gray-700',
  basic: 'bg-blue-500/20 text-blue-700',
  premium: 'bg-purple-500/20 text-purple-700',
  vip: 'bg-amber-500/20 text-amber-700',
};

interface MembershipFeature {
  feature_name: string;
  feature_value: string;
  description: string;
}

const SubscriptionManage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { membership, loading } = useMembership();
  const [features, setFeatures] = useState<MembershipFeature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    fetchFeatures();
  }, [membership]);

  const fetchFeatures = async () => {
    if (!membership) return;
    
    try {
      const { data, error } = await supabase
        .from('membership_features')
        .select('feature_name, feature_value, description')
        .eq('tier', membership.tier)
        .order('display_order');

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('获取权益失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载会员权益信息',
        variant: 'destructive',
      });
    } finally {
      setLoadingFeatures(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">未登录</h2>
          <p className="text-muted-foreground mb-4">请先登录查看订阅信息</p>
          <Button onClick={() => navigate('/auth')}>前往登录</Button>
        </Card>
      </div>
    );
  }

  const TierIcon = tierIcons[membership.tier];
  const isExpiringSoon = membership.expiresAt && 
    new Date(membership.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
          <h1 className="text-3xl font-bold">订阅管理</h1>
          <p className="text-muted-foreground">查看和管理您的会员订阅</p>
        </div>

        {/* Current Plan Card */}
        <Card className="p-6 mb-6 bg-card/80 backdrop-blur-md border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${tierColors[membership.tier]}`}>
                <TierIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{tierNames[membership.tier]}</h2>
                <p className="text-sm text-muted-foreground">当前订阅计划</p>
              </div>
            </div>
            {membership.tier !== 'free' && membership.tier !== 'vip' && (
              <Button onClick={handleUpgrade}>
                升级套餐
              </Button>
            )}
          </div>

          {membership.expiresAt && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 mb-4">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">到期时间</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(membership.expiresAt), 'yyyy年MM月dd日', { locale: zhCN })}
                </p>
              </div>
              {isExpiringSoon && (
                <Badge variant="destructive">即将到期</Badge>
              )}
            </div>
          )}

          {membership.tier === 'free' && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <p className="font-medium mb-2">升级会员，解锁更多功能</p>
              <p className="text-sm text-muted-foreground mb-3">
                立即升级，享受更多AI解读次数、专业功能和优质服务
              </p>
              <Button onClick={handleUpgrade} className="w-full">
                查看会员方案
              </Button>
            </div>
          )}
        </Card>

        {/* Features Card */}
        <Card className="p-6 mb-6 bg-card/80 backdrop-blur-md border-primary/20">
          <h3 className="text-xl font-bold mb-4">会员权益</h3>
          {loadingFeatures ? (
            <div className="text-center py-4">加载权益中...</div>
          ) : (
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">{feature.feature_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {feature.feature_value}
                      </Badge>
                      {feature.description && (
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Payment History Notice */}
        <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">支付记录</h3>
              <p className="text-sm text-muted-foreground">
                如需查看详细的支付记录和发票，请联系客服
              </p>
            </div>
          </div>
        </Card>

        {isExpiringSoon && membership.tier !== 'free' && (
          <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">订阅即将到期</p>
                <p className="text-sm text-muted-foreground mt-1">
                  您的订阅将在7天内到期，续费以继续享受会员权益
                </p>
                <Button 
                  onClick={handleUpgrade} 
                  variant="outline" 
                  className="mt-3 border-destructive/50"
                >
                  立即续费
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManage;
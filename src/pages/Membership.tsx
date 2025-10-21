import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useMembership, MEMBERSHIP_FEATURES } from '@/hooks/useMembership';
import { useAIUsage } from '@/hooks/useAIUsage';
import { useUserRole } from '@/hooks/useUserRole';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  Sparkles, 
  Star, 
  Check, 
  X, 
  ArrowLeft,
  Calendar,
  TrendingUp,
  Zap,
  Calculator,
  BookOpen,
  Gift,
  Share2,
  MessageSquare,
  Settings,
  Shield
} from 'lucide-react';


const Membership = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { membership, loading: membershipLoading, refetch } = useMembership();
  const { usageCount, loading: usageLoading } = useAIUsage();
  const { isAdmin } = useUserRole();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      fetchSubscriptions();
    };
    checkAuth();
  }, [navigate]);

  const fetchSubscriptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  if (membershipLoading || usageLoading || loadingSubscriptions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!membership) {
    return null;
  }

  const tierIcons = {
    free: null,
    basic: Sparkles,
    premium: Star,
    vip: Crown,
  };

  const tierColors = {
    free: 'bg-muted text-muted-foreground',
    basic: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    premium: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    vip: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };

  const tierLabels = {
    free: '免费版',
    basic: '基础版',
    premium: '进阶版',
    vip: '尊享版',
  };

  const TierIcon = tierIcons[membership.tier];
  const features = MEMBERSHIP_FEATURES[membership.tier];
  const limit = features.aiReadings;
  const isUnlimited = limit === -1;
  const remaining = isUnlimited ? '无限' : Math.max(0, limit - usageCount);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">会员中心</h1>
              <p className="text-muted-foreground">管理您的会员权益和订阅</p>
            </div>
            
            <Badge variant="outline" className={`gap-2 px-4 py-2 ${tierColors[membership.tier]}`}>
              {TierIcon && <TierIcon className="w-5 h-5" />}
              <span className="text-lg font-semibold">{tierLabels[membership.tier]}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">当前方案</h2>
                {membership.tier !== 'vip' && (
                  <Button onClick={() => navigate('/pricing')} size="sm">
                    <Zap className="w-4 h-4 mr-2" />
                    升级会员
                  </Button>
                )}
              </div>

              <Separator />

              {/* Features List */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">您的权益</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">AI 解读</p>
                      <p className="text-xs text-muted-foreground">
                        {isUnlimited ? '无限次使用' : `${limit}次/月`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    {features.exportPdf ? (
                      <Check className="w-5 h-5 text-primary mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">PDF 导出</p>
                      <p className="text-xs text-muted-foreground">
                        {features.exportPdf ? '支持' : '不支持'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    {features.customReading ? (
                      <Check className="w-5 h-5 text-primary mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">定制化解读</p>
                      <p className="text-xs text-muted-foreground">
                        {features.customReading ? '支持' : '不支持'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">优先级</p>
                      <p className="text-xs text-muted-foreground">
                        级别 {features.priority}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {membership.expiresAt && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">有效期至</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(membership.expiresAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Subscription History */}
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">订阅记录</h2>
              <Separator />
              
              {subscriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">暂无订阅记录</p>
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {sub.plan === 'basic' ? '基础版' : 
                           sub.plan === 'advanced' ? '进阶版' : '尊享版'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sub.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                        {sub.status === 'active' ? '进行中' : 
                         sub.status === 'cancelled' ? '已取消' : '已结束'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Usage Stats */}
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold">使用统计</h2>
              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">本月已使用</p>
                    <p className="text-3xl font-bold">{usageCount}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">剩余次数</p>
                    <p className="text-2xl font-bold">{remaining}</p>
                  </div>
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
              </div>

              {membership.tier === 'free' && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      升级会员解锁更多功能
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/pricing')}
                    >
                      查看会员方案
                    </Button>
                  </div>
                </>
              )}
            </Card>

            {/* Admin Area */}
            {isAdmin && (
              <Card className="p-6 space-y-4 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">管理员专区</h2>
                </div>
                <Separator />
                
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/admin/features')}
                >
                  <Settings className="w-4 h-4" />
                  会员权益管理
                </Button>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">快捷操作</h2>
              <Separator />
              
              <div className="space-y-2">
                {membership.tier !== 'free' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => navigate('/subscription')}
                  >
                    <Settings className="w-4 h-4" />
                    订阅管理
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/bazi')}
                >
                  <Calculator className="w-4 h-4" />
                  开始新的测算
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/learning')}
                >
                  <BookOpen className="w-4 h-4" />
                  学习命理知识
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/referral')}
                >
                  <Gift className="w-4 h-4" />
                  邀请好友得奖励
                </Button>
                {membership.tier !== 'vip' && (
                  <Button
                    variant="default"
                    className="w-full justify-start gap-2"
                    onClick={() => navigate('/pricing')}
                  >
                    <Crown className="w-4 h-4" />
                    升级会员方案
                  </Button>
                )}
              </div>
            </Card>

            {/* Referral Promotion Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">邀请好友，共享福利</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    邀请好友注册，双方各得好礼！您获赠免费解读次数，好友享8折优惠。
                  </p>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate('/referral')}
                    className="gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    立即邀请
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;

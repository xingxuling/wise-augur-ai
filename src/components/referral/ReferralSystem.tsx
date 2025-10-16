import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Share2, Copy, Gift } from 'lucide-react';
import { toast } from 'sonner';

export const ReferralSystem = () => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrCreateReferralCode();
    fetchRewards();
  }, []);

  const fetchOrCreateReferralCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 检查是否已有邀请码
      const { data: existingCode } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .single();

      if (existingCode) {
        setReferralCode(existingCode.code);
      } else {
        // 生成新邀请码
        const code = generateReferralCode();
        const { data, error } = await supabase
          .from('referral_codes')
          .insert({ 
            user_id: user.id, 
            code 
          })
          .select('code')
          .single();

        if (error) throw error;
        setReferralCode(data.code);
      }
    } catch (error) {
      console.error('获取邀请码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('获取奖励失败:', error);
    }
  };

  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('邀请码已复制');
  };

  const shareUrl = `${window.location.origin}?ref=${referralCode}`;

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('分享链接已复制');
  };

  const availableRewards = rewards.filter(r => r.used_count < r.reward_count);
  const totalRewards = rewards.reduce((sum, r) => sum + r.reward_count, 0);
  const usedRewards = rewards.reduce((sum, r) => sum + r.used_count, 0);

  if (loading) {
    return <div className="text-center py-4">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">我的邀请码</h3>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={referralCode} 
              readOnly 
              className="text-center text-2xl font-bold tracking-wider"
            />
            <Button onClick={copyToClipboard} variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">分享链接</p>
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="text-xs"
              />
              <Button onClick={copyShareUrl} size="sm">
                复制
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">{rewards.length}</p>
              <p className="text-xs text-muted-foreground">成功邀请</p>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">{totalRewards - usedRewards}</p>
              <p className="text-xs text-muted-foreground">可用奖励</p>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">{usedRewards}</p>
              <p className="text-xs text-muted-foreground">已使用</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">邀请奖励</h3>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium mb-2">🎁 邀请好友，双方得礼</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 好友通过您的邀请码开通会员</li>
              <li>• 您获得：1次免费定制解读（进阶版+）或 3次案例查看权限（基础版）</li>
              <li>• 好友获得：首次开通8折优惠</li>
            </ul>
          </div>

          {availableRewards.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">我的可用奖励</p>
              {availableRewards.map((reward) => (
                <div 
                  key={reward.id}
                  className="p-3 bg-muted/30 rounded-lg mb-2 flex justify-between items-center"
                >
                  <span className="text-sm">
                    {reward.reward_type === 'custom_reading' ? '定制解读' : '案例查看'} 
                    x{reward.reward_count - reward.used_count}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(reward.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

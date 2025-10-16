import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, Share2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Share() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shareCode) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchShare = async () => {
      try {
        const { data, error } = await supabase
          .from('reading_shares')
          .select('*')
          .eq('share_code', shareCode)
          .single();

        if (error || !data) {
          setNotFound(true);
          return;
        }

        // 检查是否过期
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setNotFound(true);
          toast({
            title: '分享已过期',
            description: '该分享链接已失效',
            variant: 'destructive',
          });
          return;
        }

        setShareData(data);

        // 增加查看次数
        await supabase
          .from('reading_shares')
          .update({ views_count: data.views_count + 1 })
          .eq('id', data.id);

      } catch (error) {
        console.error('Failed to fetch share:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchShare();
  }, [shareCode, toast]);

  const getReadingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      basic: '基础解读',
      professional: '专业解读',
      scenario: '场景建议',
      career: '事业运势',
      love: '感情运势',
      wealth: '财富运势',
      health: '健康运势',
      general: '综合运势',
    };
    return labels[type] || '命理解读';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !shareData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/50 py-12">
        <div className="container px-4 mx-auto max-w-2xl">
          <Card className="p-12 text-center">
            <Share2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">分享不存在或已过期</h1>
            <p className="text-muted-foreground mb-6">
              该分享链接可能已失效或不存在
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-12">
      <div className="container px-4 mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>已被查看 {shareData.views_count} 次</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">
            {getReadingTypeLabel(shareData.reading_type)}
          </h1>
          <p className="text-muted-foreground">
            分享时间：{format(new Date(shareData.created_at), 'PPP', { locale: zhCN })}
          </p>
        </div>

        {/* Content */}
        <Card className="p-8 bg-card/80 backdrop-blur-md border-primary/20">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed">
              {shareData.content.text}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                以上内容仅供参考，人生走向取决于自身选择与努力
              </p>
              {shareData.expires_at && (
                <p className="text-xs text-muted-foreground">
                  有效期至：{format(new Date(shareData.expires_at), 'PPP', { locale: zhCN })}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-lg font-semibold mb-2">想要获得专属的命理解读？</h3>
            <p className="text-sm text-muted-foreground mb-4">
              立即注册，获取您的八字分析和AI命理解读
            </p>
            <Button onClick={() => navigate('/auth')} size="lg">
              立即注册
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

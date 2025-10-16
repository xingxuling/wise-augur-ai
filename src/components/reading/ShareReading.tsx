import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Share2, Copy, Loader2, Check } from 'lucide-react';

interface ShareReadingProps {
  baziRecordId: string;
  content: string;
  readingType: string;
}

export const ShareReading = ({ baziRecordId, content, readingType }: ShareReadingProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState('30');
  const { toast } = useToast();

  const generateShareCode = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleCreateShare = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');

      const shareCode = generateShareCode();
      const expiresAt = expiryDays === 'never' 
        ? null 
        : new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('reading_shares')
        .insert({
          user_id: user.id,
          bazi_record_id: baziRecordId,
          share_code: shareCode,
          reading_type: readingType,
          content: { text: content },
          expires_at: expiresAt,
        });

      if (error) throw error;

      const url = `${window.location.origin}/share/${shareCode}`;
      setShareUrl(url);

      toast({
        title: '分享链接已创建',
        description: '您可以复制链接分享给朋友',
      });
    } catch (error) {
      console.error('Failed to create share:', error);
      toast({
        title: '创建失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: '已复制',
        description: '分享链接已复制到剪贴板',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: '复制失败',
        description: '请手动复制链接',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          分享
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>分享解读结果</DialogTitle>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">链接有效期</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger id="expiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1天</SelectItem>
                  <SelectItem value="7">7天</SelectItem>
                  <SelectItem value="30">30天</SelectItem>
                  <SelectItem value="90">90天</SelectItem>
                  <SelectItem value="never">永久</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                过期后链接将自动失效
              </p>
            </div>

            <Button
              onClick={handleCreateShare}
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  创建分享链接
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>分享链接</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {expiryDays === 'never' ? '永久有效' : `有效期${expiryDays}天`}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setShareUrl('');
                setOpen(false);
              }}
              className="w-full"
            >
              关闭
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

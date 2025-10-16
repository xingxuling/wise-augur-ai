import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface ReadingBookmarkProps {
  baziRecordId: string;
  readingType: string;
  content: string;
  isBookmarked?: boolean;
  onBookmarkChange?: () => void;
}

export const ReadingBookmark = ({
  baziRecordId,
  readingType,
  content,
  isBookmarked = false,
  onBookmarkChange,
}: ReadingBookmarkProps) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleBookmark = async () => {
    if (isBookmarked) {
      // Remove bookmark
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('reading_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('bazi_record_id', baziRecordId)
          .eq('reading_type', readingType);

        if (error) throw error;

        toast({
          title: '已取消收藏',
          description: '解读已从收藏库中移除',
        });

        onBookmarkChange?.();
      } catch (error) {
        console.error('Failed to remove bookmark:', error);
        toast({
          title: '取消收藏失败',
          description: '请稍后重试',
          variant: 'destructive',
        });
      }
    } else {
      setOpen(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('reading_bookmarks')
        .insert({
          user_id: user.id,
          bazi_record_id: baziRecordId,
          reading_type: readingType,
          content,
          note,
        });

      if (error) throw error;

      toast({
        title: '收藏成功',
        description: '解读已保存到您的收藏库',
      });

      setOpen(false);
      setNote('');
      onBookmarkChange?.();
    } catch (error) {
      console.error('Failed to bookmark:', error);
      toast({
        title: '收藏失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className="gap-2"
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck className="w-4 h-4" />
              已收藏
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              收藏
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>收藏解读</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">添加笔记（可选）</label>
            <Textarea
              placeholder="记录您的想法或补充信息..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
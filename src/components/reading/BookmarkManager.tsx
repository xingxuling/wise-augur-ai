import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bookmark, Loader2, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface BookmarkItem {
  id: string;
  reading_type: string;
  content: string;
  note: string | null;
  highlight_text: string | null;
  created_at: string;
}

export const BookmarkManager = () => {
  const [open, setOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkItem | null>(null);
  const { toast } = useToast();

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reading_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      toast({
        title: '加载失败',
        description: '无法获取收藏记录',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchBookmarks();
    }
  }, [open]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个收藏吗？')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reading_bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '删除成功',
        description: '收藏已移除',
      });

      fetchBookmarks();
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      toast({
        title: '删除失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const getReadingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      basic: '基础解读',
      professional: '专业解读',
      scenario: '场景建议',
      career: '事业运势',
      love: '感情运势',
      wealth: '财富运势',
      health: '健康运势',
    };
    return labels[type] || type;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Bookmark className="w-4 h-4" />
            我的收藏
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>我的收藏</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">暂无收藏</p>
              <p className="text-sm text-muted-foreground">
                在AI解读页面点击"收藏"按钮保存您感兴趣的内容
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
              {bookmarks.map((bookmark) => (
                <Card
                  key={bookmark.id}
                  className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedBookmark(bookmark)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {getReadingTypeLabel(bookmark.reading_type)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(bookmark.created_at), 'PPP', { locale: zhCN })}
                        </span>
                      </div>
                      
                      {bookmark.highlight_text && (
                        <p className="text-sm font-medium mb-1 text-primary">
                          {bookmark.highlight_text}
                        </p>
                      )}
                      
                      {bookmark.note && (
                        <p className="text-xs text-muted-foreground mb-2">
                          备注：{bookmark.note}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {bookmark.content}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBookmark(bookmark);
                        }}
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        查看
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(bookmark.id, e)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 收藏详情弹窗 */}
      {selectedBookmark && (
        <Dialog open={!!selectedBookmark} onOpenChange={() => setSelectedBookmark(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{getReadingTypeLabel(selectedBookmark.reading_type)}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedBookmark.highlight_text && (
                <div className="p-3 rounded-lg bg-primary/5 border-l-4 border-primary">
                  <p className="text-sm font-medium">{selectedBookmark.highlight_text}</p>
                </div>
              )}
              
              {selectedBookmark.note && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">我的备注</h4>
                  <p className="text-sm">{selectedBookmark.note}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">完整内容</h4>
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedBookmark.content}
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground pt-4 border-t">
                收藏时间：{format(new Date(selectedBookmark.created_at), 'PPP HH:mm', { locale: zhCN })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

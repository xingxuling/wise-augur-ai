import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface Feature {
  id: string;
  tier: string;
  feature_key: string;
  feature_name: string;
  feature_value: string;
  description: string;
  display_order: number;
}

const tierLabels = {
  free: '免费版',
  basic: '基础版',
  premium: '进阶版',
  vip: '尊享版',
};

const AdminFeatures = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [formData, setFormData] = useState({
    tier: 'free',
    feature_key: '',
    feature_name: '',
    feature_value: '',
    description: '',
    display_order: 0,
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: '权限不足',
        description: '只有管理员可以访问此页面',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchFeatures();
    }
  }, [isAdmin]);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_features')
        .select('*')
        .order('tier')
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
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingFeature(null);
    setFormData({
      tier: 'free',
      feature_key: '',
      feature_name: '',
      feature_value: '',
      description: '',
      display_order: 0,
    });
    setDialogOpen(true);
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      tier: feature.tier,
      feature_key: feature.feature_key,
      feature_name: feature.feature_name,
      feature_value: feature.feature_value,
      description: feature.description || '',
      display_order: feature.display_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个权益吗？')) return;

    try {
      const { error } = await supabase
        .from('membership_features')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '删除成功',
        description: '权益已删除',
      });
      fetchFeatures();
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '无法删除权益',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      if (editingFeature) {
        // 更新
        const { error } = await supabase
          .from('membership_features')
          .update({
            feature_name: formData.feature_name,
            feature_value: formData.feature_value,
            description: formData.description,
            display_order: formData.display_order,
          })
          .eq('id', editingFeature.id);

        if (error) throw error;
        toast({ title: '更新成功' });
      } else {
        // 新增
        const { error } = await supabase
          .from('membership_features')
          .insert([formData]);

        if (error) throw error;
        toast({ title: '添加成功' });
      }

      setDialogOpen(false);
      fetchFeatures();
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '操作失败',
        variant: 'destructive',
      });
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.tier]) acc[feature.tier] = [];
    acc[feature.tier].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">会员权益管理</h1>
            </div>
            <p className="text-muted-foreground">管理各会员等级的权益配置</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            添加权益
          </Button>
        </div>

        {/* Features by Tier */}
        <div className="space-y-6">
          {Object.entries(groupedFeatures).map(([tier, tierFeatures]) => (
            <Card key={tier} className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
              <h2 className="text-xl font-bold mb-4">{tierLabels[tier as keyof typeof tierLabels]}</h2>
              <div className="space-y-2">
                {tierFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{feature.feature_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-primary font-medium">
                          {feature.feature_value}
                        </span>
                        {feature.description && (
                          <span className="text-xs text-muted-foreground">
                            · {feature.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(feature)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(feature.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFeature ? '编辑权益' : '添加权益'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tier">会员等级</Label>
                <Select
                  value={formData.tier}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tier: value })
                  }
                  disabled={!!editingFeature}
                >
                  <SelectTrigger id="tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">免费版</SelectItem>
                    <SelectItem value="basic">基础版</SelectItem>
                    <SelectItem value="premium">进阶版</SelectItem>
                    <SelectItem value="vip">尊享版</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="feature_key">权益标识</Label>
                <Input
                  id="feature_key"
                  value={formData.feature_key}
                  onChange={(e) =>
                    setFormData({ ...formData, feature_key: e.target.value })
                  }
                  placeholder="如: ai_readings"
                  disabled={!!editingFeature}
                />
              </div>

              <div>
                <Label htmlFor="feature_name">权益名称</Label>
                <Input
                  id="feature_name"
                  value={formData.feature_name}
                  onChange={(e) =>
                    setFormData({ ...formData, feature_name: e.target.value })
                  }
                  placeholder="如: AI解读次数"
                />
              </div>

              <div>
                <Label htmlFor="feature_value">权益值</Label>
                <Input
                  id="feature_value"
                  value={formData.feature_value}
                  onChange={(e) =>
                    setFormData({ ...formData, feature_value: e.target.value })
                  }
                  placeholder="如: 20 或 无限"
                />
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="权益的详细说明"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="display_order">显示顺序</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSave}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminFeatures;
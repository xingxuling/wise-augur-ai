import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Heart, DollarSign, GraduationCap, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMembership } from '@/hooks/useMembership';

interface Scene {
  type: string;
  label: string;
  icon: any;
  description: string;
  isFree: boolean;
}

const scenes: Scene[] = [
  {
    type: 'career',
    label: '职场发展',
    icon: Briefcase,
    description: '跳槽晋升·考公考编',
    isFree: true
  },
  {
    type: 'love',
    label: '感情婚姻',
    icon: Heart,
    description: '脱单桃花·挽回复合',
    isFree: true
  },
  {
    type: 'health',
    label: '健康养生',
    icon: Activity,
    description: '调理养护·体质分析',
    isFree: true
  },
  {
    type: 'wealth',
    label: '财运财富',
    icon: DollarSign,
    description: '投资理财·副业开拓',
    isFree: false
  },
  {
    type: 'education',
    label: '学业深造',
    icon: GraduationCap,
    description: '考研升学·留学规划',
    isFree: false
  }
];

interface QuickSceneEntryProps {
  onSceneSelect: (sceneType: string) => void;
  disabled?: boolean;
}

export const QuickSceneEntry = ({ onSceneSelect, disabled }: QuickSceneEntryProps) => {
  const [showAll, setShowAll] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, number>>({});
  const { membership } = useMembership();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_scene_preferences')
        .select('scene_type, usage_count')
        .eq('user_id', user.id);

      if (data) {
        const prefs: Record<string, number> = {};
        data.forEach(p => {
          prefs[p.scene_type] = p.usage_count;
        });
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  };

  const handleSceneClick = async (scene: Scene) => {
    if (disabled) return;

    // 检查会员权限
    if (!scene.isFree && (!membership || membership.tier === 'free')) {
      toast.error('此场景需要进阶版及以上会员', {
        description: '请升级会员解锁更多场景',
        action: {
          label: '升级会员',
          onClick: () => window.location.href = '/pricing'
        }
      });
      return;
    }

    // 记录场景使用
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 更新或插入场景偏好
        const currentCount = preferences[scene.type] || 0;
        await supabase
          .from('user_scene_preferences')
          .upsert({
            user_id: user.id,
            scene_type: scene.type,
            usage_count: currentCount + 1,
            last_used_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,scene_type',
            ignoreDuplicates: false
          });

        // 更新本地状态
        setPreferences(prev => ({
          ...prev,
          [scene.type]: currentCount + 1
        }));
      }
    } catch (error) {
      console.error('Failed to record scene usage:', error);
    }

    // 触发场景选择
    onSceneSelect(scene.type);
  };

  // 按使用频率排序
  const sortedScenes = [...scenes].sort((a, b) => {
    const countA = preferences[a.type] || 0;
    const countB = preferences[b.type] || 0;
    return countB - countA;
  });

  const displayedScenes = showAll ? sortedScenes : sortedScenes.slice(0, 3);

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-md border-primary/20">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">🎯 我想重点了解</h3>
        <p className="text-sm text-muted-foreground">
          选择场景后将自动生成定制解读（无需重复输入生日）
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {displayedScenes.map((scene) => {
          const Icon = scene.icon;
          const usageCount = preferences[scene.type] || 0;
          const isLocked = !scene.isFree && (!membership || membership.tier === 'free');

          return (
            <Card
              key={scene.type}
              className={`
                p-4 cursor-pointer transition-all relative
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:shadow-md'}
                ${isLocked ? 'border-muted' : 'border-primary/20'}
              `}
              onClick={() => handleSceneClick(scene)}
            >
              {/* 使用热度标记 */}
              {usageCount > 0 && (
                <div className="absolute top-2 right-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  常用
                </div>
              )}

              {/* 会员锁定标记 */}
              {isLocked && (
                <div className="absolute top-2 right-2 text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-0.5 rounded-full">
                  会员
                </div>
              )}

              <div className="flex flex-col items-center text-center gap-2">
                <div className={`p-3 rounded-full ${isLocked ? 'bg-muted' : 'bg-primary/10'}`}>
                  <Icon className={`w-6 h-6 ${isLocked ? 'text-muted-foreground' : 'text-primary'}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{scene.label}</p>
                  <p className="text-xs text-muted-foreground">{scene.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {!showAll && sortedScenes.length > 3 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAll(true)}
        >
          查看更多场景 ({sortedScenes.length - 3})
        </Button>
      )}

      {showAll && (
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setShowAll(false)}
        >
          收起
        </Button>
      )}
    </Card>
  );
};

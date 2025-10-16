import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ScenePreference {
  scene_type: string;
  usage_count: number;
  last_used_at: string;
}

export const useScenePreferences = () => {
  const [preferences, setPreferences] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_scene_preferences')
        .select('scene_type, usage_count')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (error) throw error;

      if (data) {
        const prefs: Record<string, number> = {};
        data.forEach((p: ScenePreference) => {
          prefs[p.scene_type] = p.usage_count;
        });
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Failed to fetch scene preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordSceneUsage = async (sceneType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const currentCount = preferences[sceneType] || 0;
      
      const { error } = await supabase
        .from('user_scene_preferences')
        .upsert({
          user_id: user.id,
          scene_type: sceneType,
          usage_count: currentCount + 1,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,scene_type',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // 更新本地状态
      setPreferences(prev => ({
        ...prev,
        [sceneType]: currentCount + 1
      }));

      return true;
    } catch (error) {
      console.error('Failed to record scene usage:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    recordSceneUsage,
    refetch: fetchPreferences
  };
};

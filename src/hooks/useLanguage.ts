import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Language = 'zh-CN' | 'zh-TW' | 'en';

export const LANGUAGES = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('zh-CN');
  const [loading, setLoading] = useState(true);

  const fetchLanguage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLanguage('zh-CN');
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('language')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setLanguage(data.language as Language);
      }
    } catch (error) {
      console.error('Failed to fetch language:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLanguage = async (newLanguage: Language) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_preferences')
        .update({ language: newLanguage })
        .eq('user_id', user.id);

      if (error) throw error;
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  useEffect(() => {
    fetchLanguage();
  }, []);

  return {
    language,
    loading,
    updateLanguage,
  };
};
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'user' | 'vip' | 'admin';

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  const fetchRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole('user');
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Failed to fetch role:', error);
        setRole('user');
      } else {
        setRole((data?.role as UserRole) || 'user');
      }
    } catch (error) {
      console.error('Failed to fetch role:', error);
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = role === 'admin';
  const isVip = role === 'vip' || role === 'admin';

  return {
    role,
    loading,
    isAdmin,
    isVip,
    refetch: fetchRole,
  };
};

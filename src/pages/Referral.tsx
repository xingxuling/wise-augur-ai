import { ReferralSystem } from '@/components/referral/ReferralSystem';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Referral = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">邀请有礼</h1>
          <p className="text-muted-foreground">
            邀请好友使用通胜AI，双方均可获得专属奖励
          </p>
        </div>
        <ReferralSystem />
      </div>
    </div>
  );
};

export default Referral;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthForm from "@/components/auth/AuthForm";
import heroBackground from "@/assets/hero-background.jpg";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/");
      }
    };

    checkAuth();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/90" />
      </div>

      {/* Gradient glow overlay */}
      <div className="absolute inset-0 opacity-30" style={{ background: 'var(--gradient-glow)' }} />

      {/* Content */}
      <div className="container relative z-10 px-4 py-16 mx-auto flex items-center justify-center">
        <AuthForm />
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default Auth;

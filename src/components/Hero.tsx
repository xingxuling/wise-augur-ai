import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Star } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";
import { supabase } from "@/integrations/supabase/client";
import { MembershipBadge } from "@/components/MembershipBadge";
import { LanguageSelector } from "@/components/LanguageSelector";

const Hero = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 检查认证状态
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartClick = () => {
    if (isAuthenticated) {
      // 跳转到八字测算页面（稍后创建）
      navigate("/bazi");
    } else {
      // 跳转到登录页面
      navigate("/auth");
    }
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Gradient glow overlay */}
      <div className="absolute inset-0 opacity-40" style={{ background: 'var(--gradient-glow)' }} />

      {/* Top right corner badges */}
      {isAuthenticated && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <MembershipBadge />
          <LanguageSelector />
        </div>
      )}

      {/* Content */}
      <div className="container relative z-10 px-4 py-32 mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-1000">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/30 backdrop-blur-md border border-primary/30 text-sm animate-in slide-in-from-top duration-700">
            <Star className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-muted-foreground">AI赋能 · 传统智慧</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-in slide-in-from-bottom duration-700 delay-100">
            <span className="text-gradient glow-effect">通胜智慧</span>
            <br />
            <span className="text-foreground">开启命运新篇章</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom duration-700 delay-200">
            融合千年命理文化与前沿AI技术，为您提供精准的命理分析与人生指引
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-in slide-in-from-bottom duration-700 delay-300">
            <Button variant="hero" size="xl" className="group" onClick={handleStartClick}>
              <Sparkles className="w-5 h-5 group-hover:animate-spin" />
              {isAuthenticated ? "开始测算" : "立即体验"}
            </Button>
            <Button variant="mystical" size="xl">
              了解更多
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto animate-in fade-in duration-700 delay-500">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-gradient">100万+</div>
              <div className="text-sm text-muted-foreground">信赖用户</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-gradient">98%</div>
              <div className="text-sm text-muted-foreground">准确率</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-gradient">24/7</div>
              <div className="text-sm text-muted-foreground">AI在线</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
    </section>
  );
};

export default Hero;

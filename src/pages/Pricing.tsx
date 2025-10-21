import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { REGIONS, getRegionByValue } from "@/lib/regions";

type PlanType = 'basic' | 'advanced' | 'premium';

interface Plan {
  name: string;
  price: { CNY: number; HKD: number; MOP: number; TWD: number };
  description: string;
  features: string[];
  icon: typeof Sparkles;
  popular?: boolean;
  type: PlanType;
}

const plans: Plan[] = [
  {
    name: "基础版",
    price: { CNY: 88, HKD: 128, MOP: 128, TWD: 380 },
    description: "适合初次测算，了解命理基础",
    features: [
      "八字排盘（精准到分钟）",
      "五行分析",
      "AI基础解读",
      "保存1次测算记录",
      "公历/农历切换",
      "全地区支持",
    ],
    icon: Sparkles,
    type: 'basic',
  },
  {
    name: "进阶版",
    price: { CNY: 288, HKD: 388, MOP: 388, TWD: 1180 },
    description: "深度专业解读，洞察命运密码",
    features: [
      "基础版全部功能",
      "十神分析",
      "格局判断",
      "用神分析",
      "大运流年解读",
      "AI专业解读（事业/感情/财富/健康）",
      "保存10次测算记录",
      "AI命理教练（每日指导）",
      "月度桃花方位图",
    ],
    icon: Zap,
    popular: true,
    type: 'advanced',
  },
  {
    name: "尊享版",
    price: { CNY: 888, HKD: 1188, MOP: 1188, TWD: 3680 },
    description: "尊贵服务，大师级体验",
    features: [
      "进阶版全部功能",
      "无限次测算记录",
      "风水测算",
      "1对1大师咨询（1次/月）",
      "专属命理报告（月度）",
      "优先客服支持",
      "终身会员专属社群",
    ],
    icon: Crown,
    type: 'premium',
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRegion, setUserRegion] = useState('beijing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [planFeatures, setPlanFeatures] = useState<Record<string, string[]>>({
    basic: [],
    advanced: [],
    premium: [],
  });

  useEffect(() => {
    // 检查用户登录状态
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });

    // 从localStorage获取用户偏好地区
    const savedRegion = localStorage.getItem('user_region');
    if (savedRegion) {
      setUserRegion(savedRegion);
    }

    // 获取会员权益配置
    fetchPlanFeatures();
  }, []);

  const fetchPlanFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_features')
        .select('tier, feature_name, feature_value')
        .order('display_order');

      if (error) throw error;

      const featuresMap: Record<string, string[]> = {
        basic: [],
        advanced: [],
        premium: [],
      };

      data?.forEach((item) => {
        const tierMap: Record<string, string> = {
          basic: 'basic',
          premium: 'advanced',
          vip: 'premium',
        };
        
        const mappedTier = tierMap[item.tier];
        if (mappedTier) {
          const featureText = `${item.feature_name}${item.feature_value !== 'true' && item.feature_value !== 'false' ? ` (${item.feature_value})` : ''}`;
          featuresMap[mappedTier].push(featureText);
        }
      });

      setPlanFeatures(featuresMap);
    } catch (error) {
      console.error('获取权益配置失败:', error);
      // 使用默认配置
    }
  };

  const handleSubscribe = async (planType: PlanType) => {
    // 检查登录状态
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "请先登录",
        description: "订阅会员需要先登录账号",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // 保存订阅意向并跳转到支付页面
    localStorage.setItem('pending_subscription', JSON.stringify({
      planType,
      region: userRegion,
      timestamp: Date.now(),
    }));

    navigate("/checkout");
  };

  const regionData = getRegionByValue(userRegion);
  const currencySymbol = regionData.displayCurrency;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/30 backdrop-blur-md border border-primary/30 text-sm">
            <Crown className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">会员计划</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-gradient">选择适合您的方案</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            安全支付 · 随时可取消
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card
                key={index}
                className={`relative overflow-hidden transition-all duration-500 hover:scale-105 ${
                  plan.popular
                    ? "bg-card/80 border-primary shadow-[0_0_40px_hsl(280_85%_65%/0.3)] md:-translate-y-4"
                    : "bg-card/50 border-border hover:border-primary/50"
                } backdrop-blur-sm`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold rounded-bl-lg">
                    最受欢迎
                  </div>
                )}

                <div className="p-8 space-y-6">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${plan.popular ? 'bg-gradient-to-br from-primary/20 to-accent/20' : 'bg-card/80'} backdrop-blur-sm border border-primary/30 flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${plan.popular ? 'text-accent' : 'text-primary'}`} />
                  </div>

                  {/* Plan details */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-4xl font-bold text-gradient mb-2">
                    {currencySymbol}{plan.price[regionData.currency as keyof typeof plan.price]}
                    <span className="text-lg font-normal text-muted-foreground">/月</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 py-6">
                    {(planFeatures[plan.type] && planFeatures[plan.type].length > 0 
                      ? planFeatures[plan.type] 
                      : plan.features
                    ).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 ${plan.popular ? 'text-accent' : 'text-primary'} flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSubscribe(plan.type)}
                  >
                    立即订阅
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Additional info */}
        <div className="text-center mt-12 space-y-2">
          <p className="text-sm text-muted-foreground">
            支持多种支付方式，按地区自动优化
          </p>
          <p className="text-xs text-muted-foreground">
            * 命理内容仅供参考，请理性看待
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

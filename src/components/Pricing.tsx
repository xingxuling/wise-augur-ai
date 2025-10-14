import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, Sparkles, Star } from "lucide-react";

const plans = [
  {
    name: "基础版",
    price: "¥88",
    period: "/月",
    description: "适合初次探索命理的用户",
    features: [
      "每月5次八字排盘",
      "基础命理报告",
      "每日运势推送",
      "AI聊天咨询（限时）",
    ],
    icon: Sparkles,
    popular: false,
  },
  {
    name: "进阶版",
    price: "¥288",
    period: "/月",
    description: "深度命理分析与指导",
    features: [
      "无限次八字排盘",
      "紫微斗数完整解析",
      "风水布局建议",
      "AI深度咨询",
      "专属命理课程",
      "月度运势详报",
    ],
    icon: Star,
    popular: true,
  },
  {
    name: "尊享版",
    price: "¥888",
    period: "/月",
    description: "VIP专属尊贵体验",
    features: [
      "进阶版全部功能",
      "1对1大师指导",
      "定制化命理方案",
      "线下活动优先权",
      "风水商品专属折扣",
      "全年运势详报",
      "优先客服支持",
    ],
    icon: Crown,
    popular: false,
  },
];

const Pricing = () => {
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
            7天无理由退款 · 随时可取消
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
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-bold ${plan.popular ? 'text-gradient' : 'text-foreground'}`}>
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 py-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 ${plan.popular ? 'text-accent' : 'text-primary'} flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    variant={plan.popular ? "hero" : "mystical"}
                    size="lg"
                    className="w-full"
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
            所有套餐均支持支付宝、微信支付、银联
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

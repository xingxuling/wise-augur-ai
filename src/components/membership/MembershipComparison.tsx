import { Card } from "@/components/ui/card";
import { Check, X, Sparkles, Zap, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Feature {
  name: string;
  free: boolean | string;
  basic: boolean | string;
  premium: boolean | string;
  vip: boolean | string;
}

const features: Feature[] = [
  {
    name: "AI解读次数/月",
    free: "3次",
    basic: "20次",
    premium: "100次",
    vip: "无限制",
  },
  {
    name: "八字排盘",
    free: true,
    basic: true,
    premium: true,
    vip: true,
  },
  {
    name: "五行分析",
    free: true,
    basic: true,
    premium: true,
    vip: true,
  },
  {
    name: "十神分析",
    free: false,
    basic: true,
    premium: true,
    vip: true,
  },
  {
    name: "格局判断",
    free: false,
    basic: true,
    premium: true,
    vip: true,
  },
  {
    name: "用神分析",
    free: false,
    basic: true,
    premium: true,
    vip: true,
  },
  {
    name: "大运流年",
    free: false,
    basic: false,
    premium: true,
    vip: true,
  },
  {
    name: "自定义问答",
    free: false,
    basic: false,
    premium: true,
    vip: true,
  },
  {
    name: "导出PDF",
    free: false,
    basic: true,
    premium: true,
    vip: true,
  },
  {
    name: "导出图片",
    free: true,
    basic: true,
    premium: true,
    vip: true,
  },
  {
    name: "历史记录保存",
    free: "3条",
    basic: "20条",
    premium: "100条",
    vip: "无限制",
  },
  {
    name: "AI聊天助手",
    free: false,
    basic: false,
    premium: true,
    vip: true,
  },
  {
    name: "专属客服",
    free: false,
    basic: false,
    premium: false,
    vip: true,
  },
  {
    name: "优先处理",
    free: false,
    basic: false,
    premium: true,
    vip: true,
  },
];

const tierConfig = {
  free: {
    name: "免费版",
    icon: Star,
    color: "text-muted-foreground",
    bgColor: "bg-muted/20",
  },
  basic: {
    name: "基础版",
    icon: Sparkles,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  premium: {
    name: "进阶版",
    icon: Zap,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  vip: {
    name: "尊享版",
    icon: Crown,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
};

const renderCell = (value: boolean | string) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-green-500 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
};

export const MembershipComparison = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">会员权益对比</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            选择最适合您的会员等级，解锁更多专属功能
          </p>
        </div>

        <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 min-w-[200px]">
                    <span className="text-sm font-semibold text-muted-foreground">
                      功能/权益
                    </span>
                  </th>
                  {(["free", "basic", "premium", "vip"] as const).map((tier) => {
                    const config = tierConfig[tier];
                    const Icon = config.icon;
                    return (
                      <th key={tier} className="text-center p-4 min-w-[140px]">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}
                          >
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <span className={`text-sm font-bold ${config.color}`}>
                            {config.name}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/30 hover:bg-muted/5 transition-colors"
                  >
                    <td className="p-4 text-sm text-foreground font-medium">
                      {feature.name}
                    </td>
                    <td className="p-4 text-center">
                      {renderCell(feature.free)}
                    </td>
                    <td className="p-4 text-center">
                      {renderCell(feature.basic)}
                    </td>
                    <td className="p-4 text-center">
                      {renderCell(feature.premium)}
                    </td>
                    <td className="p-4 text-center">
                      {renderCell(feature.vip)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="p-4"></td>
                  {(["free", "basic", "premium", "vip"] as const).map((tier) => (
                    <td key={tier} className="p-4 text-center">
                      {tier !== "free" && (
                        <Button
                          variant={tier === "premium" ? "default" : "outline"}
                          size="sm"
                          onClick={() => navigate("/pricing")}
                          className="w-full"
                        >
                          {tier === "premium" ? "立即升级" : "选择此方案"}
                        </Button>
                      )}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            所有付费会员均支持 7 天无理由退款
          </p>
          <Button variant="link" onClick={() => navigate("/pricing")}>
            查看详细定价 →
          </Button>
        </div>
      </div>
    </section>
  );
};

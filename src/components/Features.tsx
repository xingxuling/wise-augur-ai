import { Card } from "@/components/ui/card";
import { Sparkles, BookOpen, Compass } from "lucide-react";
import baziIcon from "@/assets/bazi-icon.png";

const features = [
  {
    icon: baziIcon,
    title: "八字排盘",
    description: "基于《三命通会》精准算法，深度解析您的命理格局",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: null,
    lucideIcon: Compass,
    title: "风水测算",
    description: "家居、办公风水布局指导，助力运势提升",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: null,
    lucideIcon: BookOpen,
    title: "AI命理解读",
    description: "Google Gemini 2.5 Flash 驱动的智能分析，提供个性化建议",
    color: "from-green-500/20 to-teal-500/20",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/50" />
      
      <div className="container relative z-10 px-4 mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/30 backdrop-blur-md border border-primary/30 text-sm">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">核心功能</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-gradient">全方位命理服务</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            传统文化与AI技术的完美融合
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_hsl(280_85%_65%/0.2)] cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient overlay */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              
              <div className="relative p-6 space-y-4">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  {feature.icon ? (
                    <img src={feature.icon} alt={feature.title} className="w-12 h-12 object-contain" />
                  ) : feature.lucideIcon ? (
                    <feature.lucideIcon className="w-8 h-8 text-primary" />
                  ) : null}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-gradient transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover effect shimmer */}
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

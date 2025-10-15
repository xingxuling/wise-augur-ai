import { Shield, Users, Sparkles, Award } from "lucide-react";
import { useEffect, useState } from "react";

const trustPoints = [
  { icon: Users, text: "100万+用户信赖", color: "text-primary" },
  { icon: Shield, text: "98%准确率认证", color: "text-accent" },
  { icon: Award, text: "传统命理古籍认证", color: "text-primary" },
  { icon: Sparkles, text: "GPT-5智能驱动", color: "text-accent" },
];

const TrustBanner = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev - 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-md border-t border-primary/20 py-3 overflow-hidden">
      <div 
        className="flex gap-12 whitespace-nowrap"
        style={{ transform: `translateX(${scrollPosition}%)` }}
      >
        {/* Duplicate items for seamless loop */}
        {[...trustPoints, ...trustPoints, ...trustPoints].map((point, index) => {
          const Icon = point.icon;
          return (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-4"
            >
              <Icon className={`w-4 h-4 ${point.color}`} />
              <span className="text-sm font-medium text-muted-foreground">
                {point.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustBanner;

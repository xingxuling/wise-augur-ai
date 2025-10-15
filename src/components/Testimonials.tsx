import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "张先生",
    age: "32岁 · 创业者",
    avatar: "👨‍💼",
    rating: 5,
    content: "AI算出我适合的行业方向后，3个月内成功转型，收入提升40%。特别是格局分析准确率真的很高！",
    highlight: "事业转型",
  },
  {
    name: "李女士",
    age: "28岁 · 设计师",
    avatar: "👩‍🎨",
    rating: 5,
    content: "感情运势解读让我重新认识自己，用神分析帮助我调整生活节奏，现在工作生活平衡多了。",
    highlight: "感情&健康",
  },
  {
    name: "王女士",
    age: "45岁 · 企业高管",
    avatar: "👩‍💼",
    rating: 5,
    content: "传统命理结合AI分析，既有深度又易懂。大运流年的建议帮我规避了一次重大决策失误。",
    highlight: "决策参考",
  },
  {
    name: "陈先生",
    age: "26岁 · 程序员",
    avatar: "👨‍💻",
    rating: 5,
    content: "作为理科生，我本来不信这些，但八字十神分析的逻辑性让我惊讶。现在每天都会看看建议。",
    highlight: "理性认可",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
      
      <div className="container relative z-10 px-4 mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/30 backdrop-blur-md border border-primary/30 text-sm">
            <Quote className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">用户故事</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-gradient">真实改变·可见未来</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            100万+用户的命运探索之旅
          </p>
        </div>

        {/* Testimonials carousel */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-500 p-6 ${
                  index === currentIndex ? "ring-2 ring-primary/50 shadow-[0_0_30px_hsl(280_85%_65%/0.3)]" : ""
                }`}
              >
                {/* Highlight badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 text-xs font-semibold text-accent">
                  {testimonial.highlight}
                </div>

                <div className="space-y-4">
                  {/* User info */}
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.age}</div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    "{testimonial.content}"
                  </p>
                </div>

                {/* Quote decoration */}
                <Quote className="absolute bottom-4 right-4 w-16 h-16 text-primary/10" />
              </Card>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

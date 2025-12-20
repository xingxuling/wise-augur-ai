import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, Compass, MessageSquare, BookOpen, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

const Guide = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sections = [
    {
      icon: Calculator,
      title: t('guide.section1.title'),
      content: t('guide.section1.content'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Compass,
      title: t('guide.section2.title'),
      content: t('guide.section2.content'),
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: MessageSquare,
      title: t('guide.section3.title'),
      content: t('guide.section3.content'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: BookOpen,
      title: t('guide.section4.title'),
      content: t('guide.section4.content'),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Crown,
      title: t('guide.section5.title'),
      content: t('guide.section5.content'),
      color: 'text-amber-600',
      bgColor: 'bg-amber-600/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('back')}
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('guide.title')}</h1>
          <p className="text-muted-foreground">{t('guide.subtitle')}</p>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={index} className="border-primary/20 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${section.bgColor}`}>
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {section.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guide;

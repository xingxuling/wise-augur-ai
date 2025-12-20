import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

const Terms = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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

        <Card className="border-primary/20">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl font-bold text-foreground">
              {t('terms.title')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('terms.lastUpdated')}: 2025-01-01
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6 text-foreground/90">
            <section>
              <h2 className="text-lg font-semibold mb-2">{t('terms.section1.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.section1.content')}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t('terms.section2.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.section2.content')}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t('terms.section3.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.section3.content')}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t('terms.section4.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.section4.content')}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t('terms.section5.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.section5.content')}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t('terms.section6.title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('terms.section6.content')}
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;

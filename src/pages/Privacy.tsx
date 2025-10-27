import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/LanguageSelector";

const Privacy = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </Button>
          <LanguageSelector />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-16 max-w-4xl">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="text-3xl font-bold text-gradient text-center">
              {t('privacy.title')}
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              {t('privacy.lastUpdated')}: 2024-01-01
            </p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t('privacy.section1.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.section1.content')}
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t('privacy.section2.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t('privacy.section2.intro')}
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                <li>{t('privacy.section2.item1')}</li>
                <li>{t('privacy.section2.item2')}</li>
                <li>{t('privacy.section2.item3')}</li>
                <li>{t('privacy.section2.item4')}</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t('privacy.section3.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t('privacy.section3.intro')}
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                <li>{t('privacy.section3.item1')}</li>
                <li>{t('privacy.section3.item2')}</li>
                <li>{t('privacy.section3.item3')}</li>
                <li>{t('privacy.section3.item4')}</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t('privacy.section4.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.section4.content')}
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t('privacy.section5.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {t('privacy.section5.intro')}
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                <li>{t('privacy.section5.item1')}</li>
                <li>{t('privacy.section5.item2')}</li>
                <li>{t('privacy.section5.item3')}</li>
                <li>{t('privacy.section5.item4')}</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t('privacy.section6.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.section6.content')}
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t('privacy.section7.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.section7.content')}
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t('privacy.section8.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.section8.content')}
              </p>
            </section>

            {/* Contact */}
            <section className="bg-accent/5 rounded-lg p-6 border border-primary/10">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {t('privacy.contact.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('privacy.contact.content')}
              </p>
              <p className="text-foreground mt-4 font-medium">
                Email: ryan599884@gmail.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;

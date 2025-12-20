import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative border-t border-border bg-card/30 backdrop-blur-sm">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">{t('app.title')}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('app.subtitle')}
            </p>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/bazi" className="hover:text-primary transition-colors">{t('nav.bazi')}</Link></li>
              <li><Link to="/fengshui" className="hover:text-primary transition-colors">{t('nav.fengshui')}</Link></li>
              <li><Link to="/learning" className="hover:text-primary transition-colors">{t('nav.learning')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.about')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/pricing" className="hover:text-primary transition-colors">{t('nav.pricing')}</Link></li>
              <li><Link to="/referral" className="hover:text-primary transition-colors">{t('features.referral.title')}</Link></li>
              <li><Link to="/membership" className="hover:text-primary transition-colors">{t('nav.membership')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.help')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/guide" className="hover:text-primary transition-colors">{t('footer.guide')}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
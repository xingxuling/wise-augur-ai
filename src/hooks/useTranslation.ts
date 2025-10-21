import { useLanguage } from './useLanguage';
import { t as translate } from '@/lib/i18n';

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key: string) => translate(key, language);
  
  return { t, language };
};
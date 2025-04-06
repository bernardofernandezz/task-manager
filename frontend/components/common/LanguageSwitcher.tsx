'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
      title={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
    >
      <Globe className="h-5 w-5" />
      <span className="ml-2 text-sm font-medium">{language.toUpperCase()}</span>
    </Button>
  );
} 
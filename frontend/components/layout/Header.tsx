'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ModeToggle } from '@/components/theme/mode-toggle';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ showMenuButton, onMenuClick, isSidebarOpen }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold truncate">{t('app.title')}</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <NotificationCenter />
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
} 
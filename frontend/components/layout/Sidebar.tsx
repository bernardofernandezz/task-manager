import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  UserCircle,
  ListTodo,
  LogOut,
  Menu,
  X,
  Home,
  ChevronRight,
  ChevronLeft,
  Settings,
  Bell,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const menuItems = [
  // {
  //   title: 'Início',
  //   href: '/',
  //   icon: Home
  // },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Tarefas',
    href: '/tasks',
    icon: ListTodo
  },
  {
    title: 'Perfil',
    href: '/profile',
    icon: UserCircle
  }
];

const bottomMenuItems = [
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings
  },
  {
    title: 'Notificações',
    href: '/notifications',
    icon: Bell,
    badge: 3
  },
  {
    title: 'Ajuda',
    href: '/help',
    icon: HelpCircle
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Fechar sidebar ao mudar de rota em dispositivos móveis
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 md:hidden shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Toggle Button for Desktop */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="hidden md:block"
          >
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => setIsOpen(true)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        className="fixed left-0 top-0 h-full w-64 bg-background border-r z-40 shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full p-4">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => setIsOpen(false)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* User Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            {session?.user && (
              <div className="flex items-center gap-3 mb-8 p-2">
                <Avatar>
                  <AvatarImage src={session.user.image || ''} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{session.user.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {session.user.email}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation Links */}
          <nav className="space-y-2 flex-1">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                      {
                        'bg-primary text-primary-foreground scale-105': isActive,
                        'hover:bg-accent hover:scale-102': !isActive,
                      }
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className={cn('h-5 w-5 transition-transform duration-200', {
                      'rotate-0': !isHovered,
                      'rotate-12': isHovered && isActive,
                    })} />
                    <span>{item.title}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Bottom Menu Items */}
          <div className="space-y-2 mt-auto">
            {bottomMenuItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (index * 0.1) }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                      {
                        'bg-accent': isActive,
                        'hover:bg-accent/50': !isActive,
                      }
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Logout Button */}
          {session && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="ghost"
                className="flex items-center gap-3 w-full mt-4 group"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Sair</span>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
} 
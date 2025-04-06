'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useTaskStore } from '@/lib/store';
import { NotificationService } from '@/lib/services/notificationService';
import { Task } from '@/types';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskState {
  tasks: Task[];
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const tasks = useTaskStore((state: TaskState) => state.tasks);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Check for notifications when tasks change
    NotificationService.checkTaskDueDates(tasks);
    NotificationService.checkTaskCompletion(tasks);
    NotificationService.checkStreaks(tasks);

    // Set up interval to check notifications every hour
    const interval = setInterval(() => {
      NotificationService.checkTaskDueDates(tasks);
      NotificationService.checkTaskCompletion(tasks);
      NotificationService.checkStreaks(tasks);
    }, 3600000); // 1 hour in milliseconds

    return () => clearInterval(interval);
  }, [tasks]);

  // Handle sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768); // 768px is the md breakpoint
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed md:sticky top-0 z-40 h-screen w-64
          md:translate-x-0 transition-transform duration-200 ease-in-out
          border-r bg-background
        `}
      >
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-0">
        <Header 
          showMenuButton={true}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
} 
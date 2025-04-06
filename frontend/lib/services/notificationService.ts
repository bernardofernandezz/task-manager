import { useNotificationStore, Notification } from '@/lib/store/notificationStore';
import { Task } from '@/types';

export class NotificationService {
  static checkTaskDueDates(tasks: Task[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach((task) => {
      if (!task.dueDate) return;

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      // Check for overdue tasks
      if (dueDate < today && task.status !== 'completed') {
        this.addNotification({
          title: 'Tarefa Atrasada',
          message: `A tarefa "${task.title}" está atrasada.`,
          type: 'warning',
          link: `/tasks`,
        });
      }

      // Check for tasks due today
      if (dueDate.getTime() === today.getTime() && task.status !== 'completed') {
        this.addNotification({
          title: 'Tarefa Vence Hoje',
          message: `A tarefa "${task.title}" vence hoje.`,
          type: 'info',
          link: `/tasks`,
        });
      }

      // Check for tasks due tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (dueDate.getTime() === tomorrow.getTime() && task.status !== 'completed') {
        this.addNotification({
          title: 'Tarefa Vence Amanhã',
          message: `A tarefa "${task.title}" vence amanhã.`,
          type: 'info',
          link: `/tasks`,
        });
      }
    });
  }

  static checkTaskCompletion(tasks: Task[]) {
    const completedTasks = tasks.filter((task) => task.status === 'completed');
    const recentlyCompleted = completedTasks.filter((task) => {
      const completedDate = new Date(task.updatedAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60);
      return hoursDiff <= 24; // Tasks completed in the last 24 hours
    });

    recentlyCompleted.forEach((task) => {
      this.addNotification({
        title: 'Tarefa Concluída',
        message: `Parabéns! Você completou a tarefa "${task.title}".`,
        type: 'success',
        link: `/tasks`,
      });
    });
  }

  static checkStreaks(tasks: Task[]) {
    const completedTasks = tasks.filter((task) => task.status === 'completed');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for 3-day streak
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const hasThreeDayStreak = completedTasks.every((task) => {
      const completedDate = new Date(task.updatedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate >= threeDaysAgo;
    });

    if (hasThreeDayStreak) {
      this.addNotification({
        title: 'Sequência de 3 Dias!',
        message: 'Você completou tarefas por 3 dias seguidos. Continue assim!',
        type: 'success',
        link: `/dashboard`,
      });
    }

    // Check for 7-day streak
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const hasSevenDayStreak = completedTasks.every((task) => {
      const completedDate = new Date(task.updatedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate >= sevenDaysAgo;
    });

    if (hasSevenDayStreak) {
      this.addNotification({
        title: 'Sequência de 7 Dias!',
        message: 'Incrível! Você completou tarefas por 7 dias seguidos!',
        type: 'success',
        link: `/dashboard`,
      });
    }
  }

  static addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    useNotificationStore.getState().addNotification(notification);
  }

  static clearAll() {
    useNotificationStore.getState().clearAll();
  }

  static markAsRead(id: string) {
    useNotificationStore.getState().markAsRead(id);
  }

  static markAllAsRead() {
    useNotificationStore.getState().markAllAsRead();
  }

  static deleteNotification(id: string) {
    useNotificationStore.getState().deleteNotification(id);
  }
} 
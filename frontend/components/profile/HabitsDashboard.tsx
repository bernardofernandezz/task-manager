import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, Trophy, Clock, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Habit {
  id: string;
  name: string;
  frequency: string;
  completed: boolean;
  goal: string;
  streak: number;
  longest_streak: number;
  createdAt: string;
}

interface HabitsDashboardProps {
  habits: Habit[];
}

export function HabitsDashboard({ habits }: HabitsDashboardProps) {
  const { t } = useLanguage();
  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completed).length;
  const currentStreak = Math.max(...habits.map(h => h.streak));
  const longestStreak = Math.max(...habits.map(h => h.longest_streak || 0));
  const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  const getFrequencyCount = (frequency: string) => {
    return habits.filter(h => h.frequency === frequency).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">{t('profile.stats.totalHabits')}</h3>
          </div>
          <p className="text-2xl font-bold">{totalHabits}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-green-500" />
            <h3 className="font-medium">{t('profile.stats.completedHabits')}</h3>
          </div>
          <p className="text-2xl font-bold">{completedHabits}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <h3 className="font-medium">{t('profile.stats.currentStreak')}</h3>
          </div>
          <p className="text-2xl font-bold">{currentStreak} {t('profile.habits.streak')}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium">{t('profile.stats.longestStreak')}</h3>
          </div>
          <p className="text-2xl font-bold">{longestStreak} {t('profile.habits.streak')}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-medium mb-4">{t('profile.stats.completionRate')}</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('profile.stats.completionRate')}</span>
              <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('profile.stats.daily')}</p>
              <p className="text-2xl font-bold">{getFrequencyCount('daily')}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('profile.stats.weekly')}</p>
              <p className="text-2xl font-bold">{getFrequencyCount('weekly')}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('profile.stats.monthly')}</p>
              <p className="text-2xl font-bold">{getFrequencyCount('monthly')}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-medium mb-4">{t('profile.habits.title')}</h3>
        <div className="space-y-4">
          {habits
            .filter(h => h.streak > 0)
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 3)
            .map(habit => (
              <div key={habit.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{habit.name}</p>
                  <p className="text-sm text-muted-foreground">{habit.goal}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{habit.streak} {t('profile.habits.streak')}</span>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
} 
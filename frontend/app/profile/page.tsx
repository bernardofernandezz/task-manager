'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trophy, Target, Trash2, Edit2, Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AvatarCustomizer } from '@/components/profile/AvatarCustomizer';
import { HabitsDashboard } from '@/components/profile/HabitsDashboard';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { Label } from '@/components/ui/label';

// Schemas de validação
const profileSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email deve ter pelo menos 5 caracteres')
    .max(50, 'Email deve ter no máximo 50 caracteres'),
  bio: z.string()
    .max(200, 'Bio deve ter no máximo 200 caracteres')
    .optional(),
  phone: z.string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone deve estar no formato (99) 99999-9999')
    .optional(),
});

const habitSchema = z.object({
  name: z.string()
    .min(3, 'Nome do hábito deve ter pelo menos 3 caracteres')
    .max(50, 'Nome do hábito deve ter no máximo 50 caracteres'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  goal: z.string()
    .min(3, 'Meta deve ter pelo menos 3 caracteres')
    .max(100, 'Meta deve ter no máximo 100 caracteres'),
});

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

type ProfileFormData = z.infer<typeof profileSchema>;
type HabitFormData = z.infer<typeof habitSchema>;

interface Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export default function Profile() {
  const router = useRouter();
  const { data: session } = useSession() as { data: Session | null };
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { toast: useToastToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: habitRegister,
    handleSubmit: handleHabitSubmit,
    formState: { errors: habitErrors },
    reset: resetHabitForm,
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
  });

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    avatar: '',
    habits: [] as Habit[],
    stats: {
      totalHabits: 0,
      completedHabits: 0,
      currentStreak: 0,
      longestStreak: 0,
    }
  });

  useEffect(() => {
    setIsClient(true);
    if (session?.user) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    try {
      const [userResponse, habitsResponse] = await Promise.all([
        api.get('/users/me'),
        api.get('/habits')
      ]);
      setUser(userResponse.data);
      setHabits(habitsResponse.data);
      setProfile(prev => ({
        ...prev,
        name: userResponse.data.name || session?.user?.name || '',
        email: userResponse.data.email || session?.user?.email || '',
        bio: userResponse.data.bio || '',
        phone: userResponse.data.phone || '',
        avatar: userResponse.data.avatar_url || '',
      }));
      if (userResponse.data.avatar_url) {
        setImagePreview(userResponse.data.avatar_url);
      }

      // Carregar hábitos
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', session?.user?.id);

      if (habitsError) throw habitsError;

      if (habitsData) {
        setProfile(prev => ({
          ...prev,
          habits: habitsData,
          stats: {
            totalHabits: habitsData.length,
            completedHabits: habitsData.filter(h => h.completed).length,
            currentStreak: Math.max(...habitsData.map(h => h.streak)),
            longestStreak: Math.max(...habitsData.map(h => h.longest_streak || 0)),
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      useToastToast({
        title: t('errors.fetchFailed'),
        description: t('errors.tryAgain'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append('avatar', imageFile);

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(prev => prev ? { ...prev, avatar_url: response.data.avatar_url } : null);
      useToastToast({
        title: t('profile.avatarUpdated'),
        description: t('profile.avatarUpdateSuccess')
      });
      loadProfile();
    } catch (error) {
      useToastToast({
        title: t('errors.uploadFailed'),
        description: t('errors.tryAgain'),
        variant: 'destructive'
      });
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email
      };

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          useToastToast({
            title: t('errors.passwordMismatch'),
            variant: 'destructive'
          });
          return;
        }
        updateData.current_password = formData.currentPassword;
        updateData.new_password = formData.newPassword;
      }

      const response = await api.put('/users/me', updateData);
      setUser(response.data);
      useToastToast({
        title: t('profile.updated'),
        description: t('profile.updateSuccess')
      });
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      loadProfile();
    } catch (error) {
      useToastToast({
        title: t('errors.updateFailed'),
        description: t('errors.tryAgain'),
        variant: 'destructive'
      });
    }
  };

  const onHabitSubmit = async (data: HabitFormData) => {
    try {
      const newHabit = {
        name: data.name,
        frequency: data.frequency,
        completed: false,
        goal: data.goal,
        streak: 0,
        longest_streak: 0,
        user_id: session?.user?.id,
        created_at: new Date().toISOString(),
      };

      const response = await api.post('/habits', {
        name: newHabit.name,
        frequency: newHabit.frequency,
        goal: newHabit.goal
      });
      
      setHabits(prev => [...prev, response.data]);
      resetHabitForm();
      useToastToast({
        title: t('habits.created'),
        description: t('habits.createSuccess')
      });
      loadProfile();
    } catch (error) {
      useToastToast({
        title: t('errors.createFailed'),
        description: t('errors.tryAgain'),
        variant: 'destructive'
      });
    }
  };

  const toggleHabit = async (habitId: string) => {
    try {
      const habit = profile.habits.find(h => h.id === habitId);
      if (!habit) return;

      const response = await api.put(`/habits/${habit.id}/toggle`);
      setHabits(prev => prev.map(h => h.id === habit.id ? response.data : h));
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error);
      useToastToast({
        title: t('errors.updateFailed'),
        description: t('errors.tryAgain'),
        variant: 'destructive'
      });
    }
  };

  if (!isClient || loading) return null;

  return (
    <AppLayout>
      <div className="container mx-auto max-w-6xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            <AvatarCustomizer
              userId={session?.user?.id || ''}
              currentAvatar={profile.avatar}
              onAvatarUpdate={(url: string) => setProfile(prev => ({ ...prev, avatar: url }))}
            />

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('profile.personalInfo')}</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('profile.name')}</label>
                  <Input
                    {...profileRegister('name')}
                    defaultValue={profile.name}
                    placeholder={t('profile.name')}
                  />
                  {profileErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.name.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('profile.email')}</label>
                  <Input
                    {...profileRegister('email')}
                    defaultValue={profile.email}
                    placeholder={t('profile.email')}
                  />
                  {profileErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.email.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('profile.bio')}</label>
                  <Input
                    {...profileRegister('bio')}
                    defaultValue={profile.bio}
                    placeholder={t('profile.bio')}
                  />
                  {profileErrors.bio && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.bio.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('profile.phone')}</label>
                  <Input
                    {...profileRegister('phone')}
                    defaultValue={profile.phone}
                    placeholder="(99) 99999-9999"
                  />
                  {profileErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.phone.message as string}</p>
                  )}
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>{t('profile.changeAvatar')}</span>
                    </Button>
                  </Label>
                  {imageFile && (
                    <Button onClick={handleImageUpload}>
                      {t('profile.uploadAvatar')}
                    </Button>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  {t('profile.saveChanges')}
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Column - Habits Dashboard */}
          <div className="md:col-span-2 space-y-6">
            <HabitsDashboard habits={profile.habits} />

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('profile.habits.addNew')}</h2>
              <form onSubmit={handleHabitSubmit(onHabitSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('profile.habits.name')}</label>
                  <Input
                    {...habitRegister('name')}
                    placeholder={t('profile.habits.name')}
                  />
                  {habitErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{habitErrors.name.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('profile.habits.frequency')}</label>
                  <select
                    {...habitRegister('frequency')}
                    className="w-full p-2 border rounded"
                  >
                    <option value="daily">{t('profile.habits.frequencyOptions.daily')}</option>
                    <option value="weekly">{t('profile.habits.frequencyOptions.weekly')}</option>
                    <option value="monthly">{t('profile.habits.frequencyOptions.monthly')}</option>
                  </select>
                  {habitErrors.frequency && (
                    <p className="text-red-500 text-sm mt-1">{habitErrors.frequency.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('profile.habits.goal')}</label>
                  <Input
                    {...habitRegister('goal')}
                    placeholder={t('profile.habits.goal')}
                  />
                  {habitErrors.goal && (
                    <p className="text-red-500 text-sm mt-1">{habitErrors.goal.message as string}</p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  {t('profile.habits.addNew')}
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">{t('profile.habits.title')}</h2>
              <div className="space-y-4">
                {profile.habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{habit.name}</h3>
                        <Badge variant="outline">{t(`profile.habits.frequencyOptions.${habit.frequency}`)}</Badge>
                        {habit.streak > 0 && (
                          <Badge variant="secondary">
                            <Trophy className="h-3 w-3 mr-1" />
                            {habit.streak} {t('profile.habits.streak')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{habit.goal}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleHabit(habit.id)}
                        className={habit.completed ? 'bg-green-100' : ''}
                        title={habit.completed ? t('profile.habits.completed') : t('profile.habits.notCompleted')}
                      >
                        <Trophy className={`h-4 w-4 ${habit.completed ? 'text-green-500' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingHabit(habit.id)}
                        title={t('profile.habits.edit')}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => {
                          setHabits(prev => prev.filter(h => h.id !== habit.id));
                          useToastToast({
                            title: t('profile.habits.delete'),
                            description: t('profile.habits.deleteSuccess')
                          });
                        }}
                        title={t('profile.habits.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 
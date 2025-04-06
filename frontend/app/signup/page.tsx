'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { API_ENDPOINTS } from '@/lib/config';
import { api } from '@/lib/api';

const signupSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters'),
  email: z.string()
    .email('Invalid email')
    .min(5, 'Email must be at least 5 characters')
    .max(50, 'Email must be at most 50 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be at most 50 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      
      // Create user in backend
      const response = await api.post(API_ENDPOINTS.auth.signup, {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast.success('Account created successfully!');
      router.push('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t('auth.signup.title')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.signup.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('auth.signup.name')}
            </label>
            <Input
              {...register('name')}
              type="text"
              placeholder={t('auth.signup.namePlaceholder')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('auth.signup.email')}
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder={t('auth.signup.emailPlaceholder')}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('auth.signup.password')}
            </label>
            <Input
              {...register('password')}
              type="password"
              placeholder={t('auth.signup.passwordPlaceholder')}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('auth.signup.confirmPassword')}
            </label>
            <Input
              {...register('confirmPassword')}
              type="password"
              placeholder={t('auth.signup.confirmPasswordPlaceholder')}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">{t('auth.signup.loading')}</span>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
            ) : (
              t('auth.signup.submit')
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">
            {t('auth.signup.alreadyHaveAccount')}{' '}
          </span>
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            {t('auth.signup.loginLink')}
          </Link>
        </div>
      </Card>
    </div>
  );
} 
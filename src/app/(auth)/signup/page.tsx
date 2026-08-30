'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { signupSchema } from '@/lib/validators/schemas';
import { slugify } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    business_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0];
      toast.error(firstError || 'Invalid input');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();

      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (authData.user) {
        // Create business
        const slug = slugify(formData.business_name);
        const { error: businessError } = await supabase
          .from('businesses')
          .insert({
            owner_id: authData.user.id,
            name: formData.business_name,
            slug: slug + '-' + Date.now().toString(36).slice(-4),
            notification_email: formData.email,
          });

        if (businessError) {
          console.error('Business creation error:', businessError);
          toast.error('Account created but failed to set up business. Please contact support.');
        }
      }

      toast.success('Account created successfully!');
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[420px]"
    >
      <Card className="border-[#E5E7EB] shadow-xl shadow-gray-100/50 rounded-2xl">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" fill="white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#111827]">
            Create your account
          </CardTitle>
          <CardDescription className="text-[#4B5563]">
            Start collecting Google reviews in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium text-[#111827]">
                Full Name
              </Label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                className="h-12 rounded-xl border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5] bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_name" className="text-sm font-medium text-[#111827]">
                Business Name
              </Label>
              <Input
                id="business_name"
                type="text"
                placeholder="StyleHub Fashion"
                value={formData.business_name}
                onChange={(e) => updateField('business_name', e.target.value)}
                className="h-12 rounded-xl border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5] bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-sm font-medium text-[#111827]">
                Email
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="h-12 rounded-xl border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5] bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-sm font-medium text-[#111827]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="h-12 rounded-xl border-[#E5E7EB] focus:border-[#4F46E5] focus:ring-[#4F46E5] bg-white pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl transition-all duration-200"
              id="signup-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#9CA3AF]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#4F46E5] hover:text-[#4338CA] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

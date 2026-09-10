'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Loader2,
  Store,
  Globe,
  Bell,
  Palette,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { businessSettingsSchema } from '@/lib/validators/schemas';
import { slugify } from '@/lib/utils';
import { toast } from 'sonner';

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  google_review_url: string | null;
  review_threshold: number;
  welcome_message: string;
  notification_email: string | null;
  primary_color: string;
  ai_review_enabled: boolean;
}

export default function SettingsPage() {
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    google_review_url: '',
    review_threshold: 5,
    welcome_message: 'How was your shopping experience today?',
    notification_email: '',
    primary_color: '#4F46E5',
    ai_review_enabled: true,
  });

  useEffect(() => {
    async function fetchBusiness() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (data) {
        setBusiness(data);
        setFormData({
          name: data.name,
          logo_url: data.logo_url || '',
          google_review_url: data.google_review_url || '',
          review_threshold: data.review_threshold,
          welcome_message: data.welcome_message || 'How was your shopping experience today?',
          notification_email: data.notification_email || '',
          primary_color: data.primary_color || '#4F46E5',
          ai_review_enabled: data.ai_review_enabled ?? true,
        });
      }
      setIsLoading(false);
    }
    fetchBusiness();
  }, []);

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate business name
    if (!formData.name.trim()) {
      toast.error('Business name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You are not logged in. Please log in again.');
        return;
      }

      const businessPayload = {
        name: formData.name.trim(),
        logo_url: formData.logo_url.trim() || null,
        google_review_url: formData.google_review_url.trim() || null,
        review_threshold: formData.review_threshold,
        welcome_message: formData.welcome_message.trim() || 'How was your shopping experience today?',
        notification_email: formData.notification_email.trim() || user.email || null,
        primary_color: formData.primary_color || '#4F46E5',
        ai_review_enabled: formData.ai_review_enabled,
      };

      if (!business) {
        // Create business record if it doesn't exist yet
        const slug = slugify(formData.name) + '-' + Date.now().toString(36).slice(-4);
        const { data: newBusiness, error: insertError } = await supabase
          .from('businesses')
          .insert({
            owner_id: user.id,
            slug,
            ...businessPayload,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Settings create business error:', insertError);
          toast.error(`Failed to create business: ${insertError.message}`);
          return;
        }

        setBusiness(newBusiness);
        toast.success('Business created & settings saved! ✓');
        return;
      }

      const { error } = await supabase
        .from('businesses')
        .update(businessPayload)
        .eq('id', business.id);

      if (error) {
        console.error('Settings save error:', error);
        toast.error(`Failed to save: ${error.message}`);
        return;
      }

      toast.success('Settings saved successfully! ✓');
    } catch (err) {
      console.error('Settings save exception:', err);
      toast.error('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Business Settings</h1>
          <p className="text-[#4B5563] mt-1">Manage your store configuration</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl h-11 px-6 hidden sm:flex"
          id="save-settings-btn"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Business Info */}
      <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#4F46E5]" />
            <CardTitle className="text-base">Business Information</CardTitle>
          </div>
          <CardDescription>Your store&apos;s basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-name" className="text-sm font-medium">Business Name</Label>
              <Input
                id="business-name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="StyleHub Fashion"
                className="h-12 rounded-xl border-[#E5E7EB] bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-slug" className="text-sm font-medium">Store URL</Label>
              <div className="flex items-center h-12 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] overflow-hidden">
                <span className="px-3 text-sm text-[#9CA3AF] border-r border-[#E5E7EB] bg-[#F3F4F6] h-full flex items-center">
                  /r/
                </span>
                <span className="px-3 text-sm text-[#4B5563]">{business?.slug || '—'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome-message" className="text-sm font-medium">Welcome Message</Label>
            <Textarea
              id="welcome-message"
              value={formData.welcome_message}
              onChange={(e) => updateField('welcome_message', e.target.value)}
              placeholder="How was your shopping experience today?"
              className="min-h-[80px] rounded-xl border-[#E5E7EB] bg-white resize-none"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-url" className="text-sm font-medium">Logo URL</Label>
            <div className="flex gap-3">
              <Input
                id="logo-url"
                value={formData.logo_url}
                onChange={(e) => updateField('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="h-12 rounded-xl border-[#E5E7EB] bg-white"
              />
              {formData.logo_url && (
                <div className="w-12 h-12 rounded-xl border border-[#E5E7EB] overflow-hidden flex-shrink-0">
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Review */}
      <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#4F46E5]" />
            <CardTitle className="text-base">Google Review Settings</CardTitle>
          </div>
          <CardDescription>Configure how reviews are collected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-url" className="text-sm font-medium">Google Review URL</Label>
            <Input
              id="google-url"
              value={formData.google_review_url}
              onChange={(e) => updateField('google_review_url', e.target.value)}
              placeholder="https://g.page/r/..."
              className="h-12 rounded-xl border-[#E5E7EB] bg-white"
            />
            <p className="text-xs text-[#9CA3AF]">
              This is the link where customers will be redirected to leave their Google review.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold" className="text-sm font-medium">Review Threshold</Label>
            <select
              id="threshold"
              value={formData.review_threshold.toString()}
              onChange={(e) => updateField('review_threshold', parseInt(e.target.value))}
              className="h-12 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] w-full sm:w-48"
            >
              <option value="5">5 Stars only</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
            <p className="text-xs text-[#9CA3AF]">
              Ratings below this threshold will be collected as private feedback instead.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Review Generation Toggle */}
      <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#4F46E5]" />
            <CardTitle className="text-base">AI Review Generation</CardTitle>
          </div>
          <CardDescription>Control how reviews are created by customers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
            <div className="space-y-1 mr-4">
              <p className="text-sm font-medium text-[#111827]">Enable AI Review Generation</p>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                When enabled, AI generates a review from selected tags. When disabled,
                customers write their own review in a text field.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.ai_review_enabled}
              onClick={() => updateField('ai_review_enabled', !formData.ai_review_enabled)}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 ${
                formData.ai_review_enabled ? 'bg-[#4F46E5]' : 'bg-[#D1D5DB]'
              }`}
              id="ai-toggle"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  formData.ai_review_enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className={`p-4 rounded-xl border transition-all duration-200 ${
            formData.ai_review_enabled
              ? 'bg-[#EEF2FF] border-[#C7D2FE]'
              : 'bg-[#F9FAFB] border-[#E5E7EB]'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                formData.ai_review_enabled ? 'bg-[#4F46E5]' : 'bg-[#9CA3AF]'
              }`}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">
                  {formData.ai_review_enabled ? 'AI Mode Active' : 'Manual Mode Active'}
                </p>
                <p className="text-xs text-[#4B5563] mt-0.5 leading-relaxed">
                  {formData.ai_review_enabled
                    ? 'Customers select tags and AI generates a natural-sounding review for them to copy and post on Google.'
                    : 'Customers select tags and write their own review in a text field, then copy and post on Google.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#4F46E5]" />
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
          <CardDescription>Where to receive alerts about feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notification-email" className="text-sm font-medium">Notification Email</Label>
            <Input
              id="notification-email"
              type="email"
              value={formData.notification_email}
              onChange={(e) => updateField('notification_email', e.target.value)}
              placeholder="owner@yourbusiness.com"
              className="h-12 rounded-xl border-[#E5E7EB] bg-white"
            />
            <p className="text-xs text-[#9CA3AF]">
              You&apos;ll receive email alerts when customers submit private feedback.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#4F46E5]" />
            <CardTitle className="text-base">Branding</CardTitle>
          </div>
          <CardDescription>Customize the look of your review page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="brand-color" className="text-sm font-medium">Brand Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="brand-color"
                value={formData.primary_color}
                onChange={(e) => updateField('primary_color', e.target.value)}
                className="w-12 h-12 rounded-xl border border-[#E5E7EB] cursor-pointer"
              />
              <Input
                value={formData.primary_color}
                onChange={(e) => updateField('primary_color', e.target.value)}
                className="h-12 rounded-xl border-[#E5E7EB] bg-white w-40"
                maxLength={7}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom save button (visible on all screens) */}
      <div className="pb-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:hidden bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl h-14 text-base font-medium"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

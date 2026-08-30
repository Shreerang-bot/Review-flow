import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | ReviewFlow AI',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Get user's business
  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('owner_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AdminSidebar
        businessName={business?.name || 'My Business'}
        userEmail={user.email || ''}
      />
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

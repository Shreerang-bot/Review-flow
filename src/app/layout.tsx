import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ReviewFlow AI – Smart Google Review Management',
  description:
    'Help your retail clothing store collect more Google reviews effortlessly. AI-powered review generation, QR codes, and real-time feedback management.',
  keywords: ['google reviews', 'retail', 'clothing store', 'review management', 'AI'],
  openGraph: {
    title: 'ReviewFlow AI',
    description: 'AI-powered Google Review Management for Retail Stores',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

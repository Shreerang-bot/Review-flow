import Link from 'next/link';
import {
  Star,
  QrCode,
  Sparkles,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  MessageSquareText,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: QrCode,
    title: 'QR Code Generation',
    description: 'Generate printable QR codes that customers can scan to leave reviews instantly.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Reviews',
    description: 'Generate natural-sounding reviews from simple tag selections. No typing needed.',
  },
  {
    icon: Shield,
    title: 'Protect Your Reputation',
    description: 'Negative feedback is captured privately and sent to management, never on Google.',
  },
  {
    icon: Zap,
    title: '15-Second Reviews',
    description: 'Customers leave a complete Google review in under 15 seconds. Three taps is all it takes.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analytics',
    description: 'Track ratings, review volume, and feedback trends from a beautiful admin dashboard.',
  },
  {
    icon: MessageSquareText,
    title: 'Real-Time Notifications',
    description: 'Get instant email alerts when customers submit negative feedback.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Customer Scans QR',
    description: 'Place the QR code at your store. Customers scan it with their phone camera.',
  },
  {
    step: '02',
    title: 'Select Rating & Tags',
    description: 'Customers tap a star rating and select what they liked — no typing required.',
  },
  {
    step: '03',
    title: 'Copy & Post Review',
    description: 'AI generates a review. One tap copies it and opens Google for posting.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#4F46E5] rounded-xl flex items-center justify-center">
              <Star className="w-4.5 h-4.5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-[#111827] tracking-tight">ReviewFlow AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-[#4B5563] hover:text-[#111827] rounded-xl h-10"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl h-10 px-5">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EEF2FF] via-white to-[#F5F3FF] -z-10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-sm font-medium mb-6 border border-indigo-100">
              <Sparkles className="w-4 h-4" />
              AI-Powered Review Management
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111827] tracking-tight leading-tight">
              Get More Google Reviews{' '}
              <span className="text-[#4F46E5]">Effortlessly</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-[#4B5563] leading-relaxed max-w-2xl mx-auto">
              Help your retail clothing store collect 5-star Google reviews in under 15 seconds.
              AI generates the review — your customers just tap and post.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl h-14 px-8 text-base font-medium shadow-lg shadow-indigo-200">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/r/demo">
                <Button
                  variant="outline"
                  className="border-[#E5E7EB] text-[#4B5563] rounded-2xl h-14 px-8 text-base"
                >
                  See Demo
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-[#9CA3AF]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                Setup in 2 minutes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-24 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
              Three Steps. Fifteen Seconds.
            </h2>
            <p className="mt-4 text-lg text-[#4B5563]">
              The fastest way to collect Google reviews
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.step}
                className="relative bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-5xl font-bold text-[#EEF2FF]">{step.step}</span>
                <h3 className="mt-3 text-xl font-semibold text-[#111827]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[#4B5563] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-[#4B5563]">
              Built specifically for retail clothing stores
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl border border-[#E5E7EB] bg-white hover:border-[#C7D2FE] hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#4F46E5] transition-colors duration-200">
                    <Icon className="w-6 h-6 text-[#4F46E5] group-hover:text-white transition-colors duration-200" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#111827]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[#4B5563] leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-[#4F46E5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to Boost Your Google Reviews?
          </h2>
          <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">
            Join retail clothing stores that use ReviewFlow AI to collect more 5-star reviews
            and manage customer feedback effortlessly.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button className="bg-white text-[#4F46E5] hover:bg-gray-50 rounded-2xl h-14 px-8 text-base font-medium shadow-lg">
                Get Started for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-sm font-semibold text-[#111827]">ReviewFlow AI</span>
            </div>
            <p className="text-sm text-[#9CA3AF]">
              © {new Date().getFullYear()} ReviewFlow AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

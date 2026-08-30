import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mx-auto">
          <Star className="w-8 h-8 text-[#4F46E5]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#111827]">Page Not Found</h1>
          <p className="text-[#4B5563]">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link href="/">
          <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl h-11 px-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

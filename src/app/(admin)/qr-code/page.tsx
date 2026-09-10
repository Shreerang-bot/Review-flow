'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode as QrCodeIcon, Download, Printer, Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import QRCode from 'qrcode';

export default function QRCodePage() {
  const [business, setBusiness] = useState<{ slug: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [reviewUrl, setReviewUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function fetchBusiness() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('businesses')
        .select('slug, name')
        .eq('owner_id', user.id)
        .single();

      if (data) {
        setBusiness(data);
        const origin = window.location.origin;
        setReviewUrl(`${origin}/r/${data.slug}`);
      }
      setIsLoading(false);
    }
    fetchBusiness();
  }, []);

  useEffect(() => {
    if (!reviewUrl) return;

    QRCode.toDataURL(reviewUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then(setQrDataUrl)
      .catch((err) => {
        console.error('QR generation error:', err);
        toast.error('Failed to generate QR code');
      });
  }, [reviewUrl]);

  const handleDownloadPNG = async () => {
    if (!reviewUrl) return;
    try {
      const dataUrl = await QRCode.toDataURL(reviewUrl, {
        width: 1024,
        margin: 2,
        color: { dark: '#111827', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      });

      const link = document.createElement('a');
      link.download = `${business?.slug || 'qrcode'}-review-qr.png`;
      link.href = dataUrl;
      link.click();
      toast.success('QR code downloaded as PNG');
    } catch {
      toast.error('Failed to generate QR code');
    }
  };

  const handleDownloadSVG = async () => {
    if (!reviewUrl) return;
    try {
      const svgString = await QRCode.toString(reviewUrl, {
        type: 'svg',
        width: 400,
        margin: 2,
        color: { dark: '#111827', light: '#FFFFFF' },
        errorCorrectionLevel: 'H',
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${business?.slug || 'qrcode'}-review-qr.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('QR code downloaded as SVG');
    } catch {
      toast.error('Failed to generate SVG');
    }
  };

  const handleCopyUrl = async () => {
    if (!reviewUrl) return;
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const handlePrint = () => {
    window.print();
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
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">QR Code</h1>
        <p className="text-[#4B5563] mt-1">Generate and download your review QR code</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Preview */}
        <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-base">Your Review QR Code</CardTitle>
            <CardDescription>Customers scan this to leave a review</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 pb-8">
            {qrDataUrl ? (
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <img
                  src={qrDataUrl}
                  alt="Review QR Code"
                  className="w-64 h-64"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-[#F3F4F6] rounded-2xl flex items-center justify-center">
                <QrCodeIcon className="w-16 h-16 text-[#9CA3AF]" />
              </div>
            )}

            <div className="w-full max-w-sm">
              <div className="flex items-center gap-2 p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                <span className="text-sm text-[#4B5563] truncate flex-1">
                  {reviewUrl || 'Loading...'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="flex-shrink-0 rounded-lg"
                  id="copy-url-btn"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#16A34A]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#9CA3AF]" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <Button
                onClick={handleDownloadPNG}
                className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl h-11"
                id="download-png-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
              <Button
                onClick={handleDownloadSVG}
                variant="outline"
                className="flex-1 border-[#E5E7EB] rounded-xl h-11"
                id="download-svg-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Download SVG
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Print-ready poster preview */}
        <Card className="border-[#E5E7EB] shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Print-Ready Poster</CardTitle>
            <CardDescription>A4 format ready for printing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Poster Preview */}
            <div className="aspect-[210/297] bg-white rounded-xl border border-[#E5E7EB] shadow-inner overflow-hidden p-8 flex flex-col items-center justify-center text-center relative print:shadow-none print:border-0">
              <div className="space-y-6 max-w-[80%]">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#111827]">
                    {business?.name || 'Your Store'}
                  </h2>
                  <p className="text-[#4B5563] text-sm">
                    We&apos;d love your feedback!
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="text-5xl">⭐⭐⭐⭐⭐</div>
                </div>

                {qrDataUrl && (
                  <div className="bg-white p-4 rounded-xl inline-block mx-auto border border-[#E5E7EB]">
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="w-40 h-40"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-lg font-semibold text-[#111827]">
                    Scan to Rate Us
                  </p>
                  <p className="text-sm text-[#4B5563]">
                    Leave a Google review in seconds
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB]">
                  <p className="text-xs text-[#9CA3AF]">Powered by ReviewFlow AI</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="w-full border-[#E5E7EB] rounded-xl h-11"
              id="print-poster-btn"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Poster
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Hidden print canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .aspect-\\[210\\/297\\],
          .aspect-\\[210\\/297\\] * {
            visibility: visible;
          }
          .aspect-\\[210\\/297\\] {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

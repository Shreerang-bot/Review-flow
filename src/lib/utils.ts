import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

// ============================================================
// Class Name Utility
// ============================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// Date Utilities
// ============================================================

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy · h:mm a');
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ============================================================
// Rating Utilities
// ============================================================

export function getRatingLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };
  return labels[rating] || '';
}

export function getRatingColor(rating: number): string {
  if (rating >= 4) return 'text-success';
  if (rating >= 3) return 'text-warning';
  return 'text-error';
}

// ============================================================
// Status Utilities
// ============================================================

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-warning-light text-warning',
    approved: 'bg-success-light text-success',
    rejected: 'bg-error-light text-error',
    resolved: 'bg-indigo-light text-indigo',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}

export function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ============================================================
// String Utilities
// ============================================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// ============================================================
// Clipboard Utility
// ============================================================

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

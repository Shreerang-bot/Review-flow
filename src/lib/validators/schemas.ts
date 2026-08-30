import { z } from 'zod';

// ============================================================
// Review Submission (Customer - Public)
// ============================================================

export const reviewSubmissionSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().max(2000).optional(),
  feedback: z.string().max(2000).optional(),
  customer_name: z.string().max(100).optional(),
  tag_ids: z.array(z.string().uuid()).default([]),
  is_private: z.boolean().default(false),
});

export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;

// ============================================================
// AI Review Generation
// ============================================================

export const generateReviewSchema = z.object({
  tags: z.array(z.string()).min(1, 'Select at least one tag'),
  rating: z.number().int().min(1).max(5),
  businessName: z.string().min(1),
});

export type GenerateReviewInput = z.infer<typeof generateReviewSchema>;

// ============================================================
// Business Settings
// ============================================================

export const businessSettingsSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(200),
  logo_url: z.string().url().optional().or(z.literal('')),
  google_review_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  review_threshold: z.number().int().min(1).max(5).default(5),
  welcome_message: z.string().max(500).default('How was your shopping experience today?'),
  notification_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').default('#4F46E5'),
  ai_review_enabled: z.boolean().default(true),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;

// ============================================================
// Authentication
// ============================================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Name is required').max(100),
  business_name: z.string().min(1, 'Business name is required').max(200),
});

export type SignupInput = z.infer<typeof signupSchema>;

// ============================================================
// Admin Note
// ============================================================

export const adminNoteSchema = z.object({
  review_id: z.string().uuid(),
  note: z.string().min(1, 'Note cannot be empty').max(2000),
});

export type AdminNoteInput = z.infer<typeof adminNoteSchema>;

// ============================================================
// Review Status Update
// ============================================================

export const reviewStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'resolved']),
});

export type ReviewStatusInput = z.infer<typeof reviewStatusSchema>;

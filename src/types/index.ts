// ============================================================
// ReviewFlow AI - TypeScript Types
// ============================================================

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'resolved';
export type TagType = 'positive' | 'negative';

// ============================================================
// Database Types
// ============================================================

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  google_review_url: string | null;
  review_threshold: number;
  welcome_message: string;
  notification_email: string | null;
  primary_color: string;
  ai_review_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  rating: number;
  review_text: string | null;
  feedback: string | null;
  customer_name: string | null;
  status: ReviewStatus;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewTag {
  id: string;
  name: string;
  type: TagType;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface ReviewTagMapping {
  id: string;
  review_id: string;
  tag_id: string;
}

export interface AdminNote {
  id: string;
  review_id: string;
  author_id: string;
  note: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Extended Types (with relations)
// ============================================================

export interface ReviewWithTags extends Review {
  tags: ReviewTag[];
  notes?: AdminNote[];
  business?: Business;
}

// ============================================================
// API Types
// ============================================================

export interface ReviewSubmission {
  business_id: string;
  rating: number;
  review_text?: string;
  feedback?: string;
  customer_name?: string;
  tag_ids: string[];
  is_private: boolean;
}

export interface GenerateReviewRequest {
  tags: string[];
  rating: number;
  businessName: string;
}

export interface GenerateReviewResponse {
  review: string;
}

export interface DashboardStats {
  totalReviews: number;
  fiveStarReviews: number;
  privateFeedback: number;
  pendingReviews: number;
  averageRating: number;
}

export interface ReviewFilters {
  status?: ReviewStatus;
  rating?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// Form Types
// ============================================================

export interface BusinessSettingsForm {
  name: string;
  logo_url?: string;
  google_review_url: string;
  review_threshold: number;
  welcome_message: string;
  notification_email: string;
  primary_color: string;
  ai_review_enabled: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
}

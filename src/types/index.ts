
export type Campaign = {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  category: string;
  is_verified: boolean;
  is_urgent: boolean;
  target_amount: number;
  raised_amount: number;
  donors_count: number;
  created_at: string;
  expires_at: string;
  user_id: string;
};

export type Donation = {
  id: string;
  campaign_id: string;
  user_id?: string;
  amount: number;
  message?: string;
  is_anonymous: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  total_donated: number;
  campaigns_created: number;
  created_at: string;
};

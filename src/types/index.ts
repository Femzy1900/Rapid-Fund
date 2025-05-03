
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

export type WithdrawalRequest = {
  id: string;
  campaign_id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  notes?: string;
  campaign?: {
    title: string;
  };
  profiles?: {
    full_name?: string;
  };
};

export type CryptoDonation = {
  id: string;
  campaign_id: string;
  user_id?: string;
  wallet_address: string;
  token_type: string;
  amount: number;
  tx_hash: string;
  message?: string;
  is_anonymous: boolean;
  usd_value_at_time?: number;
  created_at: string;
};

export type CryptoWithdrawal = {
  id: string;
  campaign_id: string;
  user_id: string;
  wallet_address: string;
  token_type: string;
  amount: number;
  tx_hash?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  campaign_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    full_name?: string;
    avatar_url?: string;
  };
};

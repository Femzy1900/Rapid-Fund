
import { supabase } from '@/integrations/supabase/client';

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
};

export const createWithdrawalRequest = async (withdrawalRequest: Omit<WithdrawalRequest, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .insert([withdrawalRequest])
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as WithdrawalRequest;
};

export const getWithdrawalRequestsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select(`
      *,
      campaign:campaign_id (
        title
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as WithdrawalRequest[];
};

export const getAllWithdrawalRequests = async () => {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select(`
      *,
      campaign:campaign_id (
        title
      ),
      profiles:user_id (
        full_name
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const updateWithdrawalRequestStatus = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .update({ 
      status, 
      notes,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as WithdrawalRequest;
};

export const checkIfUserIsAdmin = async (userId: string) => {
  const { data, error } = await supabase.rpc('is_admin', {
    user_id: userId
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return !!data;
};

export const getWithdrawalRequestsByCampaign = async (campaignId: string) => {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as WithdrawalRequest[];
};

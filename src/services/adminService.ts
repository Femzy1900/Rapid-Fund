
import { supabase } from '@/integrations/supabase/client';
import { CryptoWithdrawal } from '@/types';

export const getAllCryptoWithdrawals = async () => {
  const { data, error } = await supabase
    .from('crypto_withdrawals')
    .select(`
      *,
      campaign:campaign_id (title),
      profiles:user_id (full_name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as (CryptoWithdrawal & {
    campaign: { title: string },
    profiles: { full_name: string | null }
  })[];
};

export const updateCryptoWithdrawalStatus = async (id: string, status: 'approved' | 'rejected', txHash?: string, notes?: string) => {
  const updateData: any = { 
    status, 
    updated_at: new Date().toISOString()
  };
  
  if (notes) {
    updateData.notes = notes;
  }
  
  if (txHash && status === 'approved') {
    updateData.tx_hash = txHash;
  }
  
  const { data, error } = await supabase
    .from('crypto_withdrawals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

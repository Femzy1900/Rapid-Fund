
import { supabase } from '@/integrations/supabase/client';
import { Donation } from '@/types';

export const getDonationsByCampaign = async (campaignId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Donation[];
};

export const createDonation = async (donation: Omit<Donation, 'id' | 'created_at'>) => {
  // First create the donation
  const { data, error } = await supabase
    .from('donations')
    .insert([donation])
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Then update the campaign's raised amount and donors count using RPC
  await supabase.rpc('update_campaign_stats', { 
    campaign_id: donation.campaign_id,
    donation_amount: donation.amount
  }).then(null);
  
  // If user is authenticated, update their total donated amount
  if (donation.user_id) {
    await supabase.rpc('update_user_donation_stats', { 
      user_id: donation.user_id,
      donation_amount: donation.amount
    }).then(null);
  }
  
  return data as Donation;
};

export const getDonationsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('donations')
    .select(`
      *,
      campaigns (
        title,
        image_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const createStripeCheckoutSession = async (
  campaignId: string, 
  amount: number, 
  message?: string, 
  isAnonymous?: boolean,
  donorInfo?: { userId: string }
) => {
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: { campaignId, amount, message, isAnonymous, donorInfo }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as { url: string };
};

export const processDonationFromStripe = async (sessionId: string) => {
  const { data, error } = await supabase.functions.invoke('process-donation', {
    body: { sessionId }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

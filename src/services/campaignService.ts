import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/types';

export const getCampaigns = async () => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Campaign[];
};

export const getCampaignById = async (id: string) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Campaign;
};

export const createCampaign = async (campaign: Omit<Campaign, 'id' | 'created_at' | 'donors_count' | 'raised_amount'>) => {
  const { data, error } = await supabase
    .from('campaigns')
    .insert([campaign])
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Campaign;
};

export const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Campaign;
};

export const deleteCampaign = async (campaignId: string) => {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
};


import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/types';

export const getCampaigns = async (filters?: { 
  category?: string, 
  isUrgent?: boolean,
  isVerified?: boolean,
  userId?: string,
  limit?: number,
  offset?: number,
  sortBy?: 'newest' | 'oldest' | 'most_funded' | 'least_funded'
}) => {
  let query = supabase.from('campaigns').select('*');
  
  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }
  
  if (filters?.isUrgent !== undefined) {
    query = query.eq('is_urgent', filters.isUrgent);
  }
  
  if (filters?.isVerified !== undefined) {
    query = query.eq('is_verified', filters.isVerified);
  }
  
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  
  if (filters?.sortBy) {
    switch(filters.sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'most_funded':
        query = query.order('raised_amount', { ascending: false });
        break;
      case 'least_funded':
        query = query.order('raised_amount', { ascending: true });
        break;
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters?.offset !== undefined) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  
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

export const createCampaign = async (campaign: Omit<Campaign, 'id' | 'created_at' | 'raised_amount' | 'donors_count'>) => {
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

export const deleteCampaign = async (id: string) => {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
};

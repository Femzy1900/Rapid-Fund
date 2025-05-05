
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

// Subscribe to new donations for a campaign
export const subscribeToNewDonations = (campaignId: string, onNewDonation: (donation: any) => void) => {
  const channel = supabase
    .channel(`campaign-donations-${campaignId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'donations',
        filter: `campaign_id=eq.${campaignId}`
      }, 
      payload => {
        onNewDonation(payload.new);
      })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};

// Add similar function for crypto donations
export const subscribeToCryptoDonations = (campaignId: string, onNewDonation: (donation: any) => void) => {
  const channel = supabase
    .channel(`campaign-crypto-donations-${campaignId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'crypto_donations',
        filter: `campaign_id=eq.${campaignId}`
      }, 
      payload => {
        onNewDonation(payload.new);
      })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};

// Get all unread notifications for a user
export const getUnreadDonationNotifications = async (userId: string) => {
  // First get campaigns owned by the user
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('user_id', userId);
  
  if (campaignsError) {
    throw new Error(campaignsError.message);
  }
  
  if (!campaigns?.length) {
    return [];
  }
  
  const campaignIds = campaigns.map(campaign => campaign.id);
  
  // Get recent donations for these campaigns
  const { data: donations, error: donationsError } = await supabase
    .from('donations')
    .select(`
      id,
      amount,
      is_anonymous,
      message,
      created_at,
      campaign_id,
      user_id,
      campaigns (
        title
      ),
      profiles (
        full_name
      )
    `)
    .in('campaign_id', campaignIds)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (donationsError) {
    throw new Error(donationsError.message);
  }
  
  return donations;
};

// Use proper return type for the subscription function
export const subscribeToOwnedCampaignDonations = (userId: string, onNewDonation: (donation: any) => void) => {
  // First get campaigns owned by the user
  const campaignsPromise = supabase
    .from('campaigns')
    .select('id')
    .eq('user_id', userId);
  
  campaignsPromise.then(({ data: campaigns, error }) => {
    if (error) {
      console.error('Error fetching campaigns:', error);
      return;
    }
    
    if (!campaigns?.length) {
      return;
    }
    
    const campaignIds = campaigns.map(campaign => campaign.id);
    
    // Now set up subscription for each campaign
    const channels = campaignIds.map(campaignId => {
      const channel = supabase
        .channel(`owner-donations-${campaignId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'donations',
            filter: `campaign_id=eq.${campaignId}`
          }, 
          async payload => {
            // Get full donation details
            const { data, error } = await supabase
              .from('donations')
              .select(`
                id,
                amount,
                is_anonymous,
                message,
                created_at,
                campaign_id,
                user_id,
                campaigns (
                  title
                ),
                profiles (
                  full_name
                )
              `)
              .eq('id', payload.new.id)
              .single();
            
            if (!error && data) {
              onNewDonation(data);
            } else {
              onNewDonation(payload.new);
            }
          })
        .subscribe();
        
      return channel;
    });
    
    // Return cleanup function
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  });
  
  // Return a function that cleans up any resources
  return () => {
    // Cleanup will be handled by the promise
  };
};

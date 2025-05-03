
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types';

export const addComment = async (
  campaignId: string, 
  content: string
): Promise<Comment> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    throw new Error('You must be logged in to comment');
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      campaign_id: campaignId,
      user_id: userData.user.id,
      content
    })
    .select('*, profiles(full_name, avatar_url)')
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as Comment;
};

export const getCommentsByCampaign = async (campaignId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(full_name, avatar_url)')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as unknown as Comment[];
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    throw error;
  }
};

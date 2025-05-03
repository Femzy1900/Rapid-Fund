
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { addComment } from '@/services/commentService';
import { toast } from '@/components/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface AddCommentFormProps {
  campaignId: string;
}

const AddCommentForm = ({ campaignId }: AddCommentFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth', { state: { from: `/campaigns/${campaignId}` } });
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addComment(campaignId, content);
      setContent('');
      toast.success('Comment added successfully');
      queryClient.invalidateQueries({ queryKey: ['comments', campaignId] });
    } catch (error) {
      toast.error('Failed to add comment');
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts or words of support..."
        className="min-h-[100px]"
      />
      <Button 
        type="submit" 
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Posting...
          </>
        ) : 'Post Comment'}
      </Button>
    </form>
  );
};

export default AddCommentForm;

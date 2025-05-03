
import React from 'react';
import { Comment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import { deleteComment } from '@/services/commentService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';

interface CommentsListProps {
  comments: Comment[];
  campaignId: string;
  isLoading?: boolean;
}

const CommentsList = ({ comments, campaignId, isLoading }: CommentsListProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast.success('Comment deleted');
      queryClient.invalidateQueries({ queryKey: ['comments', campaignId] });
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error('Error deleting comment:', error);
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }
  
  if (!comments?.length) {
    return <div className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</div>;
  }
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={comment.user?.avatar_url || ''} alt={comment.user?.full_name || 'User'} />
                <AvatarFallback>{getInitials(comment.user?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">
                    {comment.user?.full_name || 'Anonymous User'}
                  </p>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                    {(user?.id === comment.user_id) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 ml-2"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mt-1 whitespace-pre-line">{comment.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommentsList;

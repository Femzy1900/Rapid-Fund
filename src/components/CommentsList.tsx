
import React, { useState } from 'react';
import { Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { deleteComment } from '@/services/commentService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from '@/components/ui/sonner';

interface CommentsListProps {
  comments: Comment[];
  campaignId: string;
  isLoading: boolean;
}

const CommentsList = ({ comments, campaignId, isLoading }: CommentsListProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', campaignId] });
      toast.success('Comment deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to delete comment', {
        description: error.message
      });
    }
  });

  const handleDelete = async () => {
    if (commentToDelete) {
      deleteMutation.mutate(commentToDelete);
    }
  };

  const openDeleteDialog = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  if (comments.length === 0) {
    return <div className="text-center py-4 text-gray-500">No comments yet. Be the first to leave a message!</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Comments ({comments.length})</h3>
      {comments.map((comment) => (
        <div key={comment.id} className="pb-4 border-b last:border-b-0">
          <div className="flex justify-between">
            <span className="font-medium">
              {(comment as any).profiles?.full_name || 'Anonymous'}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="mt-2 text-gray-700">{comment.content}</p>
          
          {user?.id === comment.user_id && (
            <div className="mt-2 flex justify-end">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => openDeleteDialog(comment.id)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      ))}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommentsList;

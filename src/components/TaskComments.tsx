
import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Reply, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskCommentsProps {
  taskId?: string;
  projectId?: string;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ taskId, projectId }) => {
  const { comments, fetchComments, createComment, updateComment, deleteComment } = useTaskStore();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskId || projectId) {
      fetchComments(taskId, projectId);
    }
  }, [taskId, projectId, fetchComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      await createComment({
        content: newComment,
        task_id: taskId,
        project_id: projectId,
        parent_id: replyingTo,
      });
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    try {
      await updateComment(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const topLevelComments = comments.filter(comment => !comment.parent_id);
  const getReplies = (parentId: string) => comments.filter(comment => comment.parent_id === parentId);

  const CommentItem = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => {
    const replies = getReplies(comment.id);
    
    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-slate-200 pl-4' : ''} mb-4`}>
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="text-xs">
              {comment.user_id.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">User</span>
                  <Badge variant="outline" className="text-xs">
                    {formatDistanceToNow(comment.created_at, { addSuffix: true })}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px]"
                    placeholder="Edit your comment..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditComment(comment.id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">{comment.content}</p>
              )}
            </div>
            
            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={loading || !newComment.trim()}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setNewComment('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {/* Replies */}
            {replies.length > 0 && (
              <div className="mt-3">
                {replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New comment form */}
        {!replyingTo && (
          <div className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[80px]"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={loading || !newComment.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Post Comment
            </Button>
          </div>
        )}
        
        {/* Comments list */}
        <div className="space-y-4">
          {topLevelComments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            topLevelComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

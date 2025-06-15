
import React from 'react';
import { Task, useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Eye, Play, Check, MessageCircle, Users, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface TaskCardProps {
  task: Task;
  onViewDetails: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onViewDetails }) => {
  const { completeTask, startPomodoro } = useTaskStore();

  const handleComplete = async () => {
    try {
      await completeTask(task.id);
      toast({
        title: "Task completed",
        description: "Great work! Your task has been marked as completed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartPomodoro = () => {
    startPomodoro(task.id);
    toast({
      title: "Pomodoro started",
      description: `Started a ${task.estimated_duration} minute session for "${task.title}"`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'project': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'next-action': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'waiting-for': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'someday-maybe': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const isOverdue = task.deadline && task.deadline < new Date() && task.status !== 'completed';

  return (
    <Card className="group bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-blue-700 transition-colors">
            {task.title}
          </CardTitle>
          <div className="flex gap-1 items-center">
            {task.priority === 'urgent' && (
              <Star className="h-3 w-3 text-red-500 fill-red-500" />
            )}
            <Badge className={getPriorityColor(task.priority)} variant="outline">
              {task.priority}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className={getStatusColor(task.status)} variant="outline">
            {task.status.replace('-', ' ')}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {task.description && (
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-blue-500" />
            <span>{task.estimated_duration}m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-green-500" />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {task.deadline ? formatDistanceToNow(task.deadline, { addSuffix: true }) : 'No deadline'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-3 w-3 text-purple-500" />
            <span>Comments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 text-orange-500" />
            <span>Team</span>
          </div>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-slate-100 text-slate-600">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(task)}
            className="flex-1 text-xs hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
          
          {task.status !== 'completed' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleStartPomodoro}
                className="text-xs hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                title="Start Pomodoro"
              >
                <Play className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleComplete}
                className="text-xs hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
                title="Mark Complete"
              >
                <Check className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

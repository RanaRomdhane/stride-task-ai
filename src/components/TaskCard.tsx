
import React from 'react';
import { Task, useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Eye, Play, Check, MessageCircle, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onViewDetails: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onViewDetails }) => {
  const { completeTask, startPomodoro } = useTaskStore();

  const handleComplete = async () => {
    await completeTask(task.id);
  };

  const handleStartPomodoro = () => {
    startPomodoro(task.id);
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

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-medium line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex gap-1">
            <Badge className={getPriorityColor(task.priority)} variant="outline">
              {task.priority}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(task.status)} variant="outline">
            {task.status.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {task.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.estimated_duration}m
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {task.deadline ? formatDistanceToNow(task.deadline, { addSuffix: true }) : 'No deadline'}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            Comments
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Team
          </div>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(task)}
            className="flex-1 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          
          {task.status !== 'completed' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleStartPomodoro}
                className="text-xs"
              >
                <Play className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleComplete}
                className="text-xs"
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

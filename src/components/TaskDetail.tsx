
import React, { useState } from 'react';
import { Task } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskComments } from '@/components/TaskComments';
import { TaskCollaborators } from '@/components/TaskCollaborators';
import { Calendar, Clock, User, Users, MessageCircle, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskDetailProps {
  task: Task;
  onBack: () => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onBack }) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Button>
      </div>

      {/* Task Overview */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{task.title}</CardTitle>
              {task.description && (
                <p className="text-slate-600">{task.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(task.priority)} variant="outline">
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)} variant="outline">
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">
                {task.estimated_duration} min
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">
                {task.deadline ? formatDistanceToNow(task.deadline, { addSuffix: true }) : 'No deadline'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">
                {task.pomodoro_sessions} sessions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">
                Created {formatDistanceToNow(task.created_at, { addSuffix: true })}
              </span>
            </div>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collaborative Features Tabs */}
      <Tabs defaultValue="comments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl">
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaborators
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="animate-fade-in">
          <TaskComments taskId={task.id} />
        </TabsContent>

        <TabsContent value="collaborators" className="animate-fade-in">
          <TaskCollaborators taskId={task.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

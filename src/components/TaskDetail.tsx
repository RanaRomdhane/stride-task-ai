
import React from 'react';
import { Task } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskComments } from '@/components/TaskComments';
import { TaskCollaborators } from '@/components/TaskCollaborators';
import { Calendar, Clock, User, Users, MessageCircle, ArrowLeft, Star, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

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

  const isOverdue = task.deadline && task.deadline < new Date() && task.status !== 'completed';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Task Overview */}
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold text-slate-900">{task.title}</CardTitle>
                {task.priority === 'urgent' && (
                  <Star className="h-5 w-5 text-red-500 fill-red-500" />
                )}
              </div>
              {task.description && (
                <p className="text-slate-600 leading-relaxed max-w-3xl">{task.description}</p>
              )}
              {isOverdue && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">This task is overdue</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Badge className={getPriorityColor(task.priority)} variant="outline">
                {task.priority.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(task.status)} variant="outline">
                {task.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Duration</p>
                <p className="text-lg font-semibold text-blue-700">{task.estimated_duration} min</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Deadline</p>
                <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-green-700'}`}>
                  {task.deadline ? (
                    <>
                      <span className="block">{format(task.deadline, 'MMM dd, yyyy')}</span>
                      <span className="text-xs opacity-75">
                        {formatDistanceToNow(task.deadline, { addSuffix: true })}
                      </span>
                    </>
                  ) : (
                    'No deadline'
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Sessions</p>
                <p className="text-lg font-semibold text-purple-700">{task.pomodoro_sessions}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">Created</p>
                <p className="text-sm font-semibold text-orange-700">
                  {formatDistanceToNow(task.created_at, { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
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
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
          <TabsTrigger 
            value="comments" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
          >
            <MessageCircle className="h-4 w-4" />
            Comments & Discussion
          </TabsTrigger>
          <TabsTrigger 
            value="collaborators" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
          >
            <Users className="h-4 w-4" />
            Team & Collaborators
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="animate-scale-in">
          <TaskComments taskId={task.id} />
        </TabsContent>

        <TabsContent value="collaborators" className="animate-scale-in">
          <TaskCollaborators taskId={task.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

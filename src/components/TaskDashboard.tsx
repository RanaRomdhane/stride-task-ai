
import React, { useState } from 'react';
import { useTaskStore, Task } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskCard } from '@/components/TaskCard';
import { TaskDetail } from '@/components/TaskDetail';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Clock, AlertCircle, Search, Filter, Plus, Archive, TrendingUp } from 'lucide-react';

export const TaskDashboard = () => {
  const { tasks, loading } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleViewTaskDetails = (task: Task) => {
    setSelectedTask(task);
  };

  const handleBackToList = () => {
    setSelectedTask(null);
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.getTime() - b.deadline.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Group tasks by status for dashboard view
  const tasksByStatus = {
    inbox: filteredTasks.filter(task => task.status === 'inbox'),
    'next-action': filteredTasks.filter(task => task.status === 'next-action'),
    'waiting-for': filteredTasks.filter(task => task.status === 'waiting-for'),
    project: filteredTasks.filter(task => task.status === 'project'),
    'someday-maybe': filteredTasks.filter(task => task.status === 'someday-maybe'),
    completed: filteredTasks.filter(task => task.status === 'completed'),
  };

  const stats = {
    total: tasks.length,
    completed: tasksByStatus.completed.length,
    inProgress: tasksByStatus['next-action'].length + tasksByStatus.project.length,
    overdue: tasks.filter(task => 
      task.deadline && 
      task.deadline < new Date() && 
      task.status !== 'completed'
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (selectedTask) {
    return <TaskDetail task={selectedTask} onBack={handleBackToList} />;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Search */}
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-blue-600" />
            Search & Filter Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tasks, descriptions, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-slate-300 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-slate-300 focus:border-blue-400">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="inbox">📥 Inbox</SelectItem>
                <SelectItem value="next-action">⚡ Next Action</SelectItem>
                <SelectItem value="waiting-for">⏳ Waiting For</SelectItem>
                <SelectItem value="project">📁 Project</SelectItem>
                <SelectItem value="someday-maybe">💭 Someday Maybe</SelectItem>
                <SelectItem value="completed">✅ Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="border-slate-300 focus:border-blue-400">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                <SelectItem value="high">🟠 High</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-slate-300 focus:border-blue-400">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">📅 Created Date</SelectItem>
                <SelectItem value="priority">⭐ Priority</SelectItem>
                <SelectItem value="deadline">⏰ Deadline</SelectItem>
                <SelectItem value="title">🔤 Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Task Lists */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            📊 Overview
          </TabsTrigger>
          <TabsTrigger 
            value="active"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            🎯 Active Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            ✅ Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Next Actions */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Next Actions ({tasksByStatus['next-action'].length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tasksByStatus['next-action'].slice(0, 5).map(task => (
                    <TaskCard key={task.id} task={task} onViewDetails={handleViewTaskDetails} />
                  ))}
                  {tasksByStatus['next-action'].length === 0 && (
                    <EmptyState
                      icon={Clock}
                      title="No next actions"
                      description="You don't have any immediate actions to take. Great job staying on top of things!"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Projects ({tasksByStatus.project.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tasksByStatus.project.slice(0, 5).map(task => (
                    <TaskCard key={task.id} task={task} onViewDetails={handleViewTaskDetails} />
                  ))}
                  {tasksByStatus.project.length === 0 && (
                    <EmptyState
                      icon={TrendingUp}
                      title="No active projects"
                      description="Start a new project to organize your multi-step initiatives and goals."
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.filter(task => task.status !== 'completed').map(task => (
              <TaskCard key={task.id} task={task} onViewDetails={handleViewTaskDetails} />
            ))}
            {filteredTasks.filter(task => task.status !== 'completed').length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={Archive}
                  title="No active tasks found"
                  description="All caught up! Consider adding new tasks or adjusting your filters."
                  action={{
                    label: "Add New Task",
                    onClick: () => {} // This would typically open a task creation modal
                  }}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasksByStatus.completed.map(task => (
              <TaskCard key={task.id} task={task} onViewDetails={handleViewTaskDetails} />
            ))}
            {tasksByStatus.completed.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={CheckSquare}
                  title="No completed tasks yet"
                  description="Complete some tasks to see your achievements here. You've got this!"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

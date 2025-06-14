
import { useTaskStore } from "@/store/taskStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle, Archive, Inbox, Play, Pause, FolderOpen } from "lucide-react";

export const GTDMatrix = () => {
  const { tasks, completeTask, updateTask } = useTaskStore();

  const categorizedTasks = {
    'Do First': tasks.filter(t => t.urgent && t.important && t.status !== 'completed'),
    'Schedule': tasks.filter(t => !t.urgent && t.important && t.status !== 'completed'),
    'Delegate': tasks.filter(t => t.urgent && !t.important && t.status !== 'completed'),
    'Eliminate': tasks.filter(t => !t.urgent && !t.important && t.status !== 'completed'),
  };

  const statusGroups = {
    'inbox': { title: 'Inbox', icon: Inbox, color: 'bg-gray-500' },
    'next-action': { title: 'Next Actions', icon: Play, color: 'bg-blue-500' },
    'waiting-for': { title: 'Waiting For', icon: Pause, color: 'bg-yellow-500' },
    'project': { title: 'Projects', icon: FolderOpen, color: 'bg-purple-500' },
    'someday-maybe': { title: 'Someday/Maybe', icon: Archive, color: 'bg-gray-400' },
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'Do First': return 'from-red-500 to-red-600';
      case 'Schedule': return 'from-blue-500 to-blue-600';
      case 'Delegate': return 'from-yellow-500 to-yellow-600';
      case 'Eliminate': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Eisenhower Matrix */}
      <div>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
          Eisenhower Matrix
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(categorizedTasks).map(([quadrant, quadrantTasks]) => (
            <Card key={quadrant} className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className={`bg-gradient-to-r ${getQuadrantColor(quadrant)} text-white rounded-t-lg`}>
                <CardTitle className="flex items-center gap-2">
                  {quadrant === 'Do First' && <AlertTriangle className="h-5 w-5" />}
                  {quadrant === 'Schedule' && <Clock className="h-5 w-5" />}
                  {quadrant === 'Delegate' && <Play className="h-5 w-5" />}
                  {quadrant === 'Eliminate' && <Archive className="h-5 w-5" />}
                  {quadrant}
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                    {quadrantTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {quadrantTasks.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No tasks in this quadrant</p>
                  ) : (
                    quadrantTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate mb-1">{task.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                            {task.estimatedDuration && (
                              <span className="text-xs text-slate-500">
                                {task.estimatedDuration}min
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => completeTask(task.id)}
                          className="ml-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                  {quadrantTasks.length > 5 && (
                    <p className="text-sm text-slate-500 text-center">
                      +{quadrantTasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* GTD Status Groups */}
      <div>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
          GTD Status Groups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(statusGroups).map(([status, config]) => {
            const statusTasks = tasks.filter(t => t.status === status);
            const Icon = config.icon;
            
            return (
              <Card key={status} className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${config.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {config.title}
                    <Badge variant="secondary" className="ml-auto">
                      {statusTasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {statusTasks.length === 0 ? (
                      <p className="text-slate-500 text-center py-4 text-sm">No tasks</p>
                    ) : (
                      statusTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{task.title}</h4>
                            <Badge className={`text-xs mt-1 ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => completeTask(task.id)}
                            className="ml-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                    {statusTasks.length > 3 && (
                      <p className="text-xs text-slate-500 text-center">
                        +{statusTasks.length - 3} more
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

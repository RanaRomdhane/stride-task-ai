
import { useTaskStore } from "@/store/taskStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, Play, CheckCircle, BarChart3, Zap } from "lucide-react";

export const TaskBatches = () => {
  const { tasks, batches, batchSimilarTasks, completeTask } = useTaskStore();

  const getBatchProgress = (batch: any) => {
    const batchTasks = tasks.filter(t => batch.tasks.includes(t.id));
    const completedTasks = batchTasks.filter(t => t.status === 'completed');
    return batchTasks.length > 0 ? (completedTasks.length / batchTasks.length) * 100 : 0;
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

  const getBatchStats = () => {
    const totalBatches = batches.length;
    const completedBatches = batches.filter(batch => getBatchProgress(batch) === 100).length;
    const totalTasks = batches.reduce((sum, batch) => sum + batch.tasks.length, 0);
    const avgEfficiency = batches.length > 0 
      ? batches.reduce((sum, batch) => sum + getBatchProgress(batch), 0) / batches.length 
      : 0;

    return { totalBatches, completedBatches, totalTasks, avgEfficiency };
  };

  const stats = getBatchStats();

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
            AI Task Batches
          </h2>
          <p className="text-slate-600 mt-1">Intelligently grouped tasks for maximum efficiency</p>
        </div>
        <Button 
          onClick={batchSimilarTasks}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
        >
          <Zap className="h-4 w-4 mr-2" />
          Auto-Batch Tasks
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Batches</p>
                <p className="text-2xl font-bold">{stats.totalBatches}</p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <p className="text-2xl font-bold">{stats.completedBatches}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Batched Tasks</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Avg Efficiency</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgEfficiency)}%</p>
              </div>
              <Zap className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {batches.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Batches Yet</h3>
                <p className="text-slate-600 mb-4">
                  Create tasks and let AI automatically group similar ones for better efficiency.
                </p>
                <Button 
                  onClick={batchSimilarTasks}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Create AI Batches
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          batches.map((batch) => {
            const batchTasks = tasks.filter(t => batch.tasks.includes(t.id));
            const progress = getBatchProgress(batch);
            const activeTasks = batchTasks.filter(t => t.status !== 'completed');
            
            return (
              <Card key={batch.id} className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg">
                        <Users className="h-4 w-4" />
                      </div>
                      {batch.name}
                    </CardTitle>
                    <Badge className={getPriorityColor(batch.priority)}>{batch.priority}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Batch Info */}
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {batch.total_duration}min
                        </span>
                        <span>{batch.tasks.length} tasks</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {batch.context}
                      </Badge>
                    </div>

                    {/* Tasks in Batch */}
                    <div className="space-y-2">
                      {activeTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {task.estimated_duration}min
                              </span>
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
                      ))}
                      
                      {activeTasks.length > 3 && (
                        <p className="text-xs text-slate-500 text-center">
                          +{activeTasks.length - 3} more active tasks
                        </p>
                      )}
                      
                      {activeTasks.length === 0 && (
                        <p className="text-sm text-green-600 text-center py-2">
                          ✅ All tasks completed!
                        </p>
                      )}
                    </div>

                    {/* Batch Actions */}
                    {activeTasks.length > 0 && (
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Batch Session
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};


import { useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, User, Calendar } from "lucide-react";
import { Task } from "@/store/taskStore";

const statusColumns = [
  { id: 'inbox', title: 'To Do', color: 'bg-gray-100' },
  { id: 'next-action', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'waiting-for', title: 'Waiting For', color: 'bg-yellow-100' },
  { id: 'project', title: 'Projects', color: 'bg-purple-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' },
  { id: 'approved', title: 'Approved', color: 'bg-emerald-100' },
];

export const KanbanBoard = () => {
  const { tasks, updateTask } = useTaskStore();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTask) {
      updateTask(draggedTask.id, { 
        status: newStatus as Task['status'],
        ...(newStatus === 'completed' ? { completed_at: new Date() } : {})
      });
      setDraggedTask(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTasksForStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
          Task Board
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Drag & drop tasks to change status</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[600px]">
        {statusColumns.map((column) => {
          const columnTasks = getTasksForStatus(column.id);
          
          return (
            <Card 
              key={column.id} 
              className={`${column.color} border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>{column.title}</span>
                  <Badge variant="secondary" className="bg-white/60">
                    {columnTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className="p-3 bg-white rounded-lg shadow-sm border cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm truncate flex-1">{task.title}</h4>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} ml-2 mt-1`} />
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-slate-600 mb-2 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimated_duration}min</span>
                      </div>
                      {task.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="text-xs bg-slate-100 text-slate-700">
                        {task.category}
                      </Badge>
                      {task.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {task.tags.length > 2 && (
                        <span className="text-xs text-slate-500">+{task.tags.length - 2}</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <span className="text-2xl">📋</span>
                    <p className="text-sm mt-2">No tasks</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

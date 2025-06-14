
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, Users } from "lucide-react";
import { Task } from "@/store/taskStore";

interface DepartmentTaskViewProps {
  isAdmin: boolean;
  currentUserDepartment?: string;
}

export const DepartmentTaskView = ({ isAdmin, currentUserDepartment }: DepartmentTaskViewProps) => {
  const [departmentTasks, setDepartmentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentTasks();
  }, [isAdmin, currentUserDepartment]);

  const fetchDepartmentTasks = async () => {
    try {
      setLoading(true);
      
      let tasksQuery = supabase
        .from('tasks')
        .select('*');

      // If sub-admin, filter by department users
      if (!isAdmin && currentUserDepartment) {
        // First get users in the department
        const { data: departmentUsers } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('department', currentUserDepartment);

        const userIds = departmentUsers?.map(u => u.user_id) || [];
        if (userIds.length > 0) {
          tasksQuery = tasksQuery.in('user_id', userIds);
        }
      }

      const { data: tasks, error } = await tasksQuery.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks = tasks?.map(task => ({
        ...task,
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
        completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
      })) || [];

      setDepartmentTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching department tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStats = () => {
    const total = departmentTasks.length;
    const completed = departmentTasks.filter(task => task.status === 'completed').length;
    const urgent = departmentTasks.filter(task => task.urgent && task.status !== 'completed').length;
    const overdue = departmentTasks.filter(task => 
      task.deadline && 
      new Date(task.deadline) < new Date() && 
      task.status !== 'completed'
    ).length;
    
    return { total, completed, urgent, overdue, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Overview */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isAdmin ? "System-wide Task Overview" : `${currentUserDepartment} Department Overview`}
          </CardTitle>
          <CardDescription>
            Task performance and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600">Total Tasks</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.urgent}</div>
              <div className="text-sm text-orange-600">Urgent</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-red-600">Overdue</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span>{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>
            Latest task activity in your scope
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departmentTasks.slice(0, 10).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg bg-white/50">
                <div className="flex items-center space-x-3">
                  {task.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : task.urgent ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      {task.category} • {task.estimated_duration} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={task.priority === 'urgent' ? 'destructive' : 'secondary'}>
                    {task.priority}
                  </Badge>
                  <Badge variant="outline">
                    {task.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
            
            {departmentTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tasks found in your scope.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

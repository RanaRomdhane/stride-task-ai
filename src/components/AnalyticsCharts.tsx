
import { useTaskStore } from "@/store/taskStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316'];

export const AnalyticsCharts = () => {
  const { tasks, projects, pomodoroSessions, userRole } = useTaskStore();

  // Task completion data by priority
  const priorityData = [
    { name: 'Low', completed: tasks.filter(t => t.priority === 'low' && t.status === 'completed').length, total: tasks.filter(t => t.priority === 'low').length },
    { name: 'Medium', completed: tasks.filter(t => t.priority === 'medium' && t.status === 'completed').length, total: tasks.filter(t => t.priority === 'medium').length },
    { name: 'High', completed: tasks.filter(t => t.priority === 'high' && t.status === 'completed').length, total: tasks.filter(t => t.priority === 'high').length },
    { name: 'Urgent', completed: tasks.filter(t => t.priority === 'urgent' && t.status === 'completed').length, total: tasks.filter(t => t.priority === 'urgent').length },
  ];

  // Task status distribution
  const statusData = [
    { name: 'Inbox', value: tasks.filter(t => t.status === 'inbox').length },
    { name: 'Next Action', value: tasks.filter(t => t.status === 'next-action').length },
    { name: 'Waiting For', value: tasks.filter(t => t.status === 'waiting-for').length },
    { name: 'Projects', value: tasks.filter(t => t.status === 'project').length },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length },
  ].filter(item => item.value > 0);

  // Productivity trend (last 7 days)
  const productivityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayTasks = tasks.filter(t => 
      t.completed_at && 
      new Date(t.completed_at).toDateString() === date.toDateString()
    );
    const dayPomodoros = pomodoroSessions.filter(p => 
      p.completed && 
      new Date(p.started_at).toDateString() === date.toDateString()
    );
    
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      tasks: dayTasks.length,
      pomodoros: dayPomodoros.length,
      efficiency: dayTasks.length > 0 ? Math.round((dayPomodoros.length / dayTasks.length) * 100) : 0
    };
  });

  // Project progress data (for admins/sub-admins)
  const projectData = projects.map(project => {
    const projectTasks = tasks.filter(t => t.project_id === project.id);
    const completedTasks = projectTasks.filter(t => t.status === 'completed');
    const completion = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
    
    return {
      name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
      completion,
      budget: project.budget || 0,
      expenses: project.expenses || 0
    };
  });

  const chartConfig = {
    completed: { label: "Completed", color: "#10b981" },
    total: { label: "Total", color: "#e5e7eb" },
    tasks: { label: "Tasks", color: "#3b82f6" },
    pomodoros: { label: "Pomodoros", color: "#ef4444" },
    efficiency: { label: "Efficiency %", color: "#f59e0b" },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
        Analytics Dashboard
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion by Priority */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Task Completion by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="total" fill="#e5e7eb" name="Total" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Task Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Productivity Trend */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              7-Day Productivity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} name="Tasks Completed" />
                <Line type="monotone" dataKey="pomodoros" stroke="#ef4444" strokeWidth={2} name="Pomodoros" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Project Progress (for managers) */}
        {(userRole?.role === 'admin' || userRole?.role === 'sub_admin') && (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completion" fill="#8b5cf6" name="Completion %" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Avg. Task Duration</p>
                <p className="text-2xl font-bold">
                  {tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.estimated_duration, 0) / tasks.length) : 0}min
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Active Projects</p>
                <p className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pomodoro Sessions</p>
                <p className="text-2xl font-bold">{pomodoroSessions.filter(p => p.completed).length}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

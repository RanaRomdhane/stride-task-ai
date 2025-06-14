
import { useTaskStore } from "@/store/taskStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BarChart3, Settings, Target, Clock, TrendingUp } from "lucide-react";

export const RoleBasedDashboard = () => {
  const { userRole, tasks, projects } = useTaskStore();

  if (!userRole) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <p className="text-slate-600">Loading role information...</p>
        </CardContent>
      </Card>
    );
  }

  const isAdmin = userRole.role === 'admin';
  const isSubAdmin = userRole.role === 'sub_admin';
  const isEmployee = userRole.role === 'employee';

  const userTasks = tasks.filter(task => task.user_id === userRole.user_id);
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const urgentTasks = userTasks.filter(task => task.urgent && task.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* Role Badge */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Welcome, {userRole.role.replace('_', ' ').charAt(0).toUpperCase() + userRole.role.replace('_', ' ').slice(1)}
              </CardTitle>
              <CardDescription>
                {userRole.department && `Department: ${userRole.department}`}
              </CardDescription>
            </div>
            <Badge className={
              isAdmin ? 'bg-red-100 text-red-800' :
              isSubAdmin ? 'bg-orange-100 text-orange-800' :
              'bg-green-100 text-green-800'
            }>
              {userRole.role.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Role-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isEmployee && (
          <>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userTasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {completedTasks.length} completed
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{urgentTasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  Requires immediate attention
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Task completion rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active projects
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {(isSubAdmin || isAdmin) && (
          <>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isAdmin ? "All Users" : `${userRole.department} Dept.`}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "System-wide access" : "Department access"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Management</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isAdmin ? "Admin" : "Sub-Admin"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "Full system control" : "Department management"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">All Tasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "System-wide tasks" : "Department tasks"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "All projects" : "Department projects"}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Role-specific instructions */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          {isEmployee && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                As an <strong>Employee</strong>, you can:
              </p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4">
                <li>• Create and manage your personal tasks</li>
                <li>• Use the Pomodoro timer for focused work sessions</li>
                <li>• View your tasks in different views (Kanban, Calendar, GTD Matrix)</li>
                <li>• Track your productivity with analytics</li>
              </ul>
            </div>
          )}

          {isSubAdmin && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                As a <strong>Sub-Admin</strong>, you can:
              </p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4">
                <li>• Manage users in your department</li>
                <li>• View department-wide task analytics</li>
                <li>• Oversee project progress in your department</li>
                <li>• All employee features plus management tools</li>
              </ul>
            </div>
          )}

          {isAdmin && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                As an <strong>Admin</strong>, you can:
              </p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4">
                <li>• Manage all users and assign roles</li>
                <li>• View system-wide analytics and reports</li>
                <li>• Configure system settings and permissions</li>
                <li>• Full access to all features and data</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

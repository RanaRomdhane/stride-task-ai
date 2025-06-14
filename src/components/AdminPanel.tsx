
import { useTaskStore } from "@/store/taskStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagementPanel } from "@/components/UserManagementPanel";
import { DepartmentTaskView } from "@/components/DepartmentTaskView";
import { Users, BarChart3, Settings, Database } from "lucide-react";

export const AdminPanel = () => {
  const { userRole, tasks, projects } = useTaskStore();

  if (!userRole) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading role information...</p>
        </div>
      </div>
    );
  }

  const isAdmin = userRole.role === 'admin';
  const isSubAdmin = userRole.role === 'sub_admin';
  const currentUserDepartment = userRole.department;

  if (!isAdmin && !isSubAdmin) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-600">Access denied. Admin or Sub-admin role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Task Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Access Level</p>
                  <p className="text-2xl font-bold">
                    {isAdmin ? 'System Admin' : 'Department Admin'}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scope</p>
                  <p className="text-2xl font-bold">
                    {isAdmin ? 'All Users' : currentUserDepartment || 'Department'}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Role Capabilities</h3>
            <div className="space-y-3">
              {isAdmin ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">✓ Admin Privileges</h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• View and manage all users system-wide</li>
                    <li>• Assign any role to any user</li>
                    <li>• Create and manage departments</li>
                    <li>• Access all tasks and projects</li>
                    <li>• System configuration and settings</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600">✓ Sub-Admin Privileges</h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• View and manage users in {currentUserDepartment} department</li>
                    <li>• Assign employee and sub-admin roles within department</li>
                    <li>• Access department tasks and projects</li>
                    <li>• Department-level analytics and reporting</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagementPanel 
            isAdmin={isAdmin} 
            currentUserDepartment={currentUserDepartment} 
          />
        </TabsContent>

        <TabsContent value="tasks">
          <DepartmentTaskView 
            isAdmin={isAdmin} 
            currentUserDepartment={currentUserDepartment} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

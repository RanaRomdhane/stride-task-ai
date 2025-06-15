
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { TaskDashboard } from "@/components/TaskDashboard";
import { TaskInput } from "@/components/TaskInput";
import { GTDMatrix } from "@/components/GTDMatrix";
import { CalendarView } from "@/components/CalendarView";
import { TaskBatches } from "@/components/TaskBatches";
import { AuthForm } from "@/components/AuthForm";
import { AdminPanel } from "@/components/AdminPanel";
import { StickyNotesWidget } from "@/components/StickyNotesWidget";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { GoogleIntegration } from "@/components/GoogleIntegration";
import { RoleBasedDashboard } from "@/components/RoleBasedDashboard";
import { DraggablePomodoroTimer } from "@/components/DraggablePomodoroTimer";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Logo } from "@/components/Logo";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Users, BarChart, Calendar, Kanban, Timer, Plus, LayoutDashboard, Grid, Clock, Layers, Bell } from "lucide-react";
import { authService, User as MySQLUser } from "@/services/authService";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<MySQLUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Check for existing user session
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
    setShowFloatingTimer(false);
    toast({
      title: "Signed out successfully",
      description: "Thanks for using our platform. See you soon!",
    });
  };

  const handleAuthSuccess = (authenticatedUser: MySQLUser) => {
    setUser(authenticatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center animate-fade-in">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your workspace...</p>
          <p className="text-slate-500 text-sm mt-2">Setting up your professional task management environment</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Logo />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                TaskMaster Pro
              </h1>
            </div>
            <p className="text-slate-600">Professional Task Management Platform</p>
          </div>
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  // For now, assume all users are employees since role management will be added later
  const isAdmin = false;
  const isSubAdmin = false;
  const canAccessAdminFeatures = isAdmin || isSubAdmin;

  const tabItems = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-600" },
    { value: "add-task", label: "Add Task", icon: Plus, color: "text-green-600" },
    { value: "kanban", label: "Kanban", icon: Kanban, color: "text-purple-600" },
    { value: "gtd", label: "GTD Matrix", icon: Grid, color: "text-orange-600" },
    { value: "batches", label: "Batches", icon: Layers, color: "text-indigo-600" },
    { value: "calendar", label: "Calendar", icon: Calendar, color: "text-red-600" },
    { value: "analytics", label: "Analytics", icon: BarChart, color: "text-teal-600" },
    { value: "google", label: "Integrations", icon: Settings, color: "text-slate-600" },
    ...(canAccessAdminFeatures ? [{ value: "admin", label: isAdmin ? "Admin Panel" : "Sub-Admin", icon: Users, color: "text-amber-600" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 transition-all duration-300">
      {/* Floating Timer */}
      {showFloatingTimer && (
        <div className="animate-scale-in">
          <DraggablePomodoroTimer onClose={() => setShowFloatingTimer(false)} />
        </div>
      )}

      {/* Professional Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-shrink-0">
              <Logo />
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  TaskMaster Pro
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-slate-600">
                    Professional Task Management Platform
                  </p>
                  <span className="px-2 py-1 text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full border border-blue-200 font-medium">
                    EMPLOYEE
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Timer Toggle */}
              <Button
                onClick={() => setShowFloatingTimer(!showFloatingTimer)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:bg-blue-50 hover:border-blue-200"
              >
                <Timer className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {showFloatingTimer ? 'Hide Timer' : 'Pomodoro'}
                </span>
              </Button>
              
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Professional Tab Navigation */}
          <div className="relative">
            <TabsList className="grid w-full bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl p-2 shadow-lg overflow-x-auto" 
                      style={{ gridTemplateColumns: `repeat(${tabItems.length}, minmax(0, 1fr))` }}>
              {tabItems.map((item) => (
                <TabsTrigger 
                  key={item.value}
                  value={item.value}
                  className="flex items-center gap-2 rounded-xl transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:scale-105 hover:bg-white/50 min-w-0"
                >
                  <item.icon className={`h-4 w-4 ${item.color || 'text-slate-500'}`} />
                  <span className="hidden lg:inline text-sm font-medium truncate">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Enhanced Tab Content */}
          <div className="animate-fade-in">
            <TabsContent value="dashboard" className="space-y-6 animate-scale-in">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 transition-all duration-300">
                  <TaskDashboard />
                </div>
                <div className="lg:col-span-1 transition-all duration-300">
                  <StickyNotesWidget />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="add-task" className="animate-scale-in">
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
                <TaskInput />
              </Card>
            </TabsContent>

            <TabsContent value="kanban" className="animate-scale-in">
              <KanbanBoard />
            </TabsContent>

            <TabsContent value="gtd" className="animate-scale-in">
              <GTDMatrix />
            </TabsContent>

            <TabsContent value="batches" className="animate-scale-in">
              <TaskBatches />
            </TabsContent>

            <TabsContent value="calendar" className="animate-scale-in">
              <CalendarView />
            </TabsContent>

            <TabsContent value="analytics" className="animate-scale-in">
              <AnalyticsCharts />
            </TabsContent>

            <TabsContent value="google" className="animate-scale-in">
              <GoogleIntegration />
            </TabsContent>

            {canAccessAdminFeatures && (
              <TabsContent value="admin" className="animate-scale-in">
                <AdminPanel />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>

      {/* Enhanced Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <Button
          onClick={() => setActiveTab("add-task")}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
          size="sm"
        >
          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
      </div>
    </div>
  );
};

export default Index;

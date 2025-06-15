
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Users, BarChart, Calendar, Kanban, Timer, Plus, LayoutDashboard, Grid, Clock, Layers } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { fetchTasks, fetchBatches, fetchUserRole, fetchProjects, fetchStickyNotes, userRole } = useTaskStore();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Fetch data when user logs in
          setTimeout(() => {
            fetchTasks();
            fetchBatches();
            fetchUserRole();
            fetchProjects();
            fetchStickyNotes();
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTasks();
        fetchBatches();
        fetchUserRole();
        fetchProjects();
        fetchStickyNotes();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchTasks, fetchBatches, fetchUserRole, fetchProjects, fetchStickyNotes]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowFloatingTimer(false);
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  const handleAuthSuccess = () => {
    // Auth state change will handle the rest
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-scale-in">
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  const isAdmin = userRole?.role === 'admin';
  const isSubAdmin = userRole?.role === 'sub_admin';
  const canAccessAdminFeatures = isAdmin || isSubAdmin;

  const tabItems = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "add-task", label: "Add Task", icon: Plus },
    { value: "kanban", label: "Kanban", icon: Kanban },
    { value: "gtd", label: "GTD Matrix", icon: Grid },
    { value: "batches", label: "Batches", icon: Layers },
    { value: "calendar", label: "Calendar", icon: Calendar },
    { value: "analytics", label: "Analytics", icon: BarChart },
    { value: "google", label: "Google API", icon: Settings },
    ...(canAccessAdminFeatures ? [{ value: "admin", label: isAdmin ? "Admin" : "Sub-Admin", icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 transition-all duration-300">
      {/* Floating Timer */}
      {showFloatingTimer && (
        <div className="animate-scale-in">
          <DraggablePomodoroTimer onClose={() => setShowFloatingTimer(false)} />
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Logo />
              <div>
                <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Task Management Platform
                </h1>
                <p className="text-xs text-slate-600">
                  Professional Task Management System
                  {userRole && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full animate-fade-in">
                      {userRole.role.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Notification Center */}
              <NotificationCenter />
              
              {/* Timer Toggle */}
              <Button
                onClick={() => setShowFloatingTimer(!showFloatingTimer)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <Timer className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {showFloatingTimer ? 'Hide Timer' : 'Show Timer'}
                </span>
              </Button>
              
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs px-3 transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:border-red-200"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Enhanced Tab Navigation */}
          <div className="relative">
            <TabsList className="grid w-full bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-1 shadow-sm" 
                      style={{ gridTemplateColumns: `repeat(${tabItems.length}, minmax(0, 1fr))` }}>
              {tabItems.map((item) => (
                <TabsTrigger 
                  key={item.value}
                  value={item.value}
                  className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:scale-105 hover:bg-white/50"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content with Animations */}
          <div className="animate-fade-in">
            <TabsContent value="dashboard" className="space-y-6 animate-scale-in">
              <RoleBasedDashboard />
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 transition-all duration-300 hover:scale-[1.01]">
                  <TaskDashboard />
                </div>
                <div className="lg:col-span-1 transition-all duration-300 hover:scale-[1.01]">
                  <StickyNotesWidget />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="add-task" className="animate-scale-in">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg transition-all duration-300 hover:shadow-xl">
                <TaskInput />
              </Card>
            </TabsContent>

            <TabsContent value="kanban" className="animate-scale-in">
              <div className="transition-all duration-300 hover:scale-[1.01]">
                <KanbanBoard />
              </div>
            </TabsContent>

            <TabsContent value="gtd" className="animate-scale-in">
              <div className="transition-all duration-300 hover:scale-[1.01]">
                <GTDMatrix />
              </div>
            </TabsContent>

            <TabsContent value="batches" className="animate-scale-in">
              <div className="transition-all duration-300 hover:scale-[1.01]">
                <TaskBatches />
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="animate-scale-in">
              <div className="transition-all duration-300 hover:scale-[1.01]">
                <CalendarView />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="animate-scale-in">
              <div className="transition-all duration-300 hover:scale-[1.01]">
                <AnalyticsCharts />
              </div>
            </TabsContent>

            <TabsContent value="google" className="animate-scale-in">
              <div className="transition-all duration-300 hover:scale-[1.01]">
                <GoogleIntegration />
              </div>
            </TabsContent>

            {canAccessAdminFeatures && (
              <TabsContent value="admin" className="animate-scale-in">
                <div className="transition-all duration-300 hover:scale-[1.01]">
                  <AdminPanel />
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>

      {/* Floating Action Button for Quick Actions */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="flex flex-col gap-3 items-end">
          {/* Quick Add Task Button */}
          <Button
            onClick={() => setActiveTab("add-task")}
            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            size="sm"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

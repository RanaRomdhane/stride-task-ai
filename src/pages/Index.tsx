
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
import { DemoAccountsPanel } from "@/components/DemoAccountsPanel";
import { DraggablePomodoroTimer } from "@/components/DraggablePomodoroTimer";
import { Logo } from "@/components/Logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Users, BarChart, Calendar, Kanban, Timer } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Logo />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                TaskMaster AI
              </h1>
            </div>
            <p className="text-slate-600 mb-8">
              AI-Powered Task Management with GTD
            </p>
          </div>
          
          <div className="grid gap-8 max-w-4xl mx-auto">
            <DemoAccountsPanel />
            <div className="flex justify-center">
              <div className="text-center">
                <p className="text-slate-600 mb-4">Or create your own account:</p>
                <div className="max-w-md">
                  <AuthForm onAuthSuccess={handleAuthSuccess} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = userRole?.role === 'admin';
  const isSubAdmin = userRole?.role === 'sub_admin';
  const canAccessAdminFeatures = isAdmin || isSubAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Floating Timer */}
      {showFloatingTimer && (
        <DraggablePomodoroTimer onClose={() => setShowFloatingTimer(false)} />
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Logo />
              <div>
                <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  TaskMaster AI
                </h1>
                <p className="text-xs text-slate-600">
                  AI-Powered Task Management
                  {userRole && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {userRole.role.replace('_', ' ').toUpperCase()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Timer Toggle */}
              <Button
                onClick={() => setShowFloatingTimer(!showFloatingTimer)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
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
                className="flex items-center gap-1 text-xs px-3"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="add-task">Add Task</TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="gtd">GTD Matrix</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="google">Google API</TabsTrigger>
            {canAccessAdminFeatures && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {isAdmin ? 'Admin' : 'Sub-Admin'}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <RoleBasedDashboard />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <TaskDashboard />
              </div>
              <div className="lg:col-span-1">
                <StickyNotesWidget />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="add-task">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
              <TaskInput />
            </Card>
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanBoard />
          </TabsContent>

          <TabsContent value="gtd">
            <GTDMatrix />
          </TabsContent>

          <TabsContent value="batches">
            <TaskBatches />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsCharts />
          </TabsContent>

          <TabsContent value="google">
            <GoogleIntegration />
          </TabsContent>

          {canAccessAdminFeatures && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

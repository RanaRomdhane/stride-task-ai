
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { TaskDashboard } from "@/components/TaskDashboard";
import { TaskInput } from "@/components/TaskInput";
import { GTDMatrix } from "@/components/GTDMatrix";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { CalendarView } from "@/components/CalendarView";
import { TaskBatches } from "@/components/TaskBatches";
import { AuthForm } from "@/components/AuthForm";
import { AdminPanel } from "@/components/AdminPanel";
import { StickyNotesWidget } from "@/components/StickyNotesWidget";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { GoogleIntegration } from "@/components/GoogleIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Users, BarChart, Calendar, Kanban, Timer } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
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
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  const isAdmin = userRole?.role === 'admin';
  const isSubAdmin = userRole?.role === 'sub_admin';
  const canAccessAdminFeatures = isAdmin || isSubAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                TaskMaster AI
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                AI-Powered Task Management with GTD
                {userRole && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {userRole.role.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Timer Toggle for Mobile */}
              <Button
                onClick={() => setShowTimer(!showTimer)}
                variant="outline"
                size="sm"
                className="lg:hidden flex items-center gap-2"
              >
                <Timer className="h-4 w-4" />
              </Button>
              
              {/* Desktop Timer */}
              <div className="hidden lg:block">
                <PomodoroTimer />
              </div>
              
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-4"
              >
                <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
          
          {/* Mobile Timer */}
          {showTimer && (
            <div className="lg:hidden mt-4 flex justify-center">
              <PomodoroTimer />
            </div>
          )}
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

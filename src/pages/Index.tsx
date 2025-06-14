
import { useState } from "react";
import { TaskDashboard } from "@/components/TaskDashboard";
import { TaskInput } from "@/components/TaskInput";
import { GTDMatrix } from "@/components/GTDMatrix";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { CalendarView } from "@/components/CalendarView";
import { TaskBatches } from "@/components/TaskBatches";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useTaskStore } from "@/store/taskStore";

const Index = () => {
  const { tasks, batches } = useTaskStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                TaskMaster AI
              </h1>
              <p className="text-sm text-slate-600">AI-Powered Task Management with GTD</p>
            </div>
            <div className="flex items-center space-x-4">
              <PomodoroTimer />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="add-task">Add Task</TabsTrigger>
            <TabsTrigger value="gtd">GTD Matrix</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <TaskDashboard />
          </TabsContent>

          <TabsContent value="add-task">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
              <TaskInput />
            </Card>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Index;


import { useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { CalendarIcon, Clock, Plus, Filter } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const CalendarView = () => {
  const { tasks, batches } = useTaskStore();
  const [view, setView] = useState('month');

  // Convert tasks to calendar events
  const events = tasks
    .filter(task => task.deadline && task.status !== 'completed')
    .map(task => ({
      id: task.id,
      title: task.title,
      start: task.deadline,
      end: new Date(task.deadline.getTime() + (task.estimatedDuration * 60000)),
      resource: task,
    }));

  // Add batch events
  const batchEvents = batches
    .filter(batch => batch.scheduled)
    .map(batch => ({
      id: batch.id,
      title: `📦 ${batch.name}`,
      start: batch.scheduled,
      end: new Date(batch.scheduled.getTime() + (batch.totalDuration * 60000)),
      resource: { type: 'batch', ...batch },
    }));

  const allEvents = [...events, ...batchEvents];

  const eventStyleGetter = (event: any) => {
    const task = event.resource;
    
    if (task.type === 'batch') {
      return {
        style: {
          backgroundColor: '#8B5CF6',
          borderColor: '#7C3AED',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
        }
      };
    }

    const colors = {
      urgent: { bg: '#EF4444', border: '#DC2626' },
      high: { bg: '#F97316', border: '#EA580C' },
      medium: { bg: '#EAB308', border: '#CA8A04' },
      low: { bg: '#22C55E', border: '#16A34A' },
    };

    const color = colors[task.priority] || colors.medium;

    return {
      style: {
        backgroundColor: color.bg,
        borderColor: color.border,
        color: 'white',
        border: 'none',
        borderRadius: '6px',
      }
    };
  };

  const CustomEvent = ({ event }: any) => {
    const task = event.resource;
    
    return (
      <div className="p-1">
        <div className="font-medium text-xs truncate">{event.title}</div>
        {task.type !== 'batch' && (
          <div className="text-xs opacity-90">{task.estimatedDuration}min</div>
        )}
      </div>
    );
  };

  const upcomingDeadlines = tasks
    .filter(task => {
      if (!task.deadline || task.status === 'completed') return false;
      const daysUntil = Math.ceil((task.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    })
    .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
            Calendar Integration
          </h2>
          <p className="text-slate-600 mt-1">Visualize deadlines and scheduled task batches</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Upcoming Deadlines Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-slate-500 text-center py-4 text-sm">No upcoming deadlines</p>
                ) : (
                  upcomingDeadlines.map((task) => {
                    const daysUntil = Math.ceil((task.deadline!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate mb-1">{task.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={daysUntil === 0 ? "destructive" : daysUntil <= 2 ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {format(task.deadline!, 'MMM d')}
                              </span>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            task.priority === 'urgent' ? 'bg-red-500' :
                            task.priority === 'high' ? 'bg-orange-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Calendar Stats */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Scheduled Tasks</span>
                  <span className="font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Scheduled Batches</span>
                  <span className="font-medium">{batchEvents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">This Week</span>
                  <span className="font-medium">
                    {allEvents.filter(e => {
                      const eventDate = new Date(e.start);
                      const now = new Date();
                      const weekStart = startOfWeek(now);
                      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
                      return eventDate >= weekStart && eventDate < weekEnd;
                    }).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-6">
              <div style={{ height: '600px' }}>
                <Calendar
                  localizer={localizer}
                  events={allEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  eventPropGetter={eventStyleGetter}
                  components={{
                    event: CustomEvent,
                  }}
                  views={['month', 'week', 'day']}
                  step={30}
                  showMultiDayTimes
                  popup
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

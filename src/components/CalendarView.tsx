
import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useTaskStore } from "@/store/taskStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "react-big-calendar/lib/css/react-big-calendar.css";

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
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const taskEvents = tasks
      .filter(task => task.deadline)
      .map(task => ({
        id: task.id,
        title: `${task.title} (${task.estimated_duration}min)`,
        start: new Date(task.deadline!),
        end: new Date(new Date(task.deadline!).getTime() + (task.estimated_duration * 60000)),
        resource: { type: 'task', data: task }
      }));

    const batchEvents = batches
      .filter(batch => batch.scheduled)
      .map(batch => ({
        id: batch.id,
        title: `Batch: ${batch.name} (${batch.total_duration}min)`,
        start: new Date(batch.scheduled!),
        end: new Date(new Date(batch.scheduled!).getTime() + (batch.total_duration * 60000)),
        resource: { type: 'batch', data: batch }
      }));

    setEvents([...taskEvents, ...batchEvents]);
  }, [tasks, batches]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
      <CardHeader>
        <CardTitle>Task Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

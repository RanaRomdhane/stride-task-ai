
import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Timer, Coffee } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const PomodoroTimer = () => {
  const { tasks, currentPomodoro, startPomodoro, completePomodoro, pausePomodoro } = useTaskStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [duration, setDuration] = useState(25);
  const [isBreak, setIsBreak] = useState(false);

  const availableTasks = tasks.filter(t => t.status !== 'completed');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            handleComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedTaskId && !isBreak) {
      toast({
        title: "Select a task",
        description: "Please select a task to work on during this Pomodoro session.",
        variant: "destructive",
      });
      return;
    }

    const sessionDuration = isBreak ? 5 : duration;
    setTimeLeft(sessionDuration * 60);
    setIsRunning(true);

    if (!isBreak && selectedTaskId) {
      startPomodoro(selectedTaskId, sessionDuration);
    }

    toast({
      title: isBreak ? "Break started!" : "Pomodoro started!",
      description: `Focus for ${sessionDuration} minutes. You've got this! 🍅`,
    });
  };

  const handlePause = () => {
    setIsRunning(false);
    if (currentPomodoro) {
      pausePomodoro();
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(0);
    if (currentPomodoro) {
      pausePomodoro();
    }
  };

  const handleComplete = () => {
    setIsRunning(false);
    
    if (isBreak) {
      setIsBreak(false);
      toast({
        title: "Break complete!",
        description: "Ready to start another focused session? 💪",
      });
    } else {
      if (currentPomodoro) {
        completePomodoro();
      }
      
      // Auto-start break
      setIsBreak(true);
      setTimeLeft(5 * 60);
      setIsRunning(true);
      
      toast({
        title: "Pomodoro complete!",
        description: "Great work! Taking a 5-minute break. ☕",
      });
    }
  };

  const progress = duration > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm w-full max-w-xs">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Timer Display */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {isBreak ? (
                <Coffee className="h-3 w-3 text-green-500" />
              ) : (
                <Timer className="h-3 w-3 text-blue-500" />
              )}
              <span className="font-medium text-xs text-slate-700">
                {isBreak ? 'Break' : 'Focus'}
              </span>
            </div>
            
            <div className="text-xl font-mono font-bold text-slate-800 mb-2">
              {formatTime(timeLeft)}
            </div>
            
            {isRunning && (
              <Progress 
                value={progress} 
                className="h-1 mb-2 bg-slate-200"
              />
            )}
          </div>

          {/* Task Selection - Compact */}
          {!isBreak && !isRunning && (
            <div className="space-y-2">
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger className="w-full text-xs border-slate-300 bg-white/70 h-8">
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {availableTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          task.priority === 'urgent' ? 'bg-red-500' :
                          task.priority === 'high' ? 'bg-orange-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span className="truncate max-w-[120px]">{task.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger className="w-full text-xs border-slate-300 bg-white/70 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15m</SelectItem>
                  <SelectItem value="25">25m</SelectItem>
                  <SelectItem value="35">35m</SelectItem>
                  <SelectItem value="45">45m</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Controls - Compact */}
          <div className="flex justify-center gap-1">
            {!isRunning ? (
              <Button 
                onClick={handleStart}
                className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 h-7"
                size="sm"
              >
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handlePause} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs px-2 h-7 border-slate-300"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
                <Button 
                  onClick={handleStop} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs px-2 h-7 border-slate-300"
                >
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              </>
            )}
          </div>

          {/* Current Session Info - Compact */}
          {currentPomodoro && !isBreak && (
            <div className="text-center p-2 bg-blue-50/80 rounded border border-blue-200/50">
              <div className="text-xs font-medium text-blue-900 truncate">
                {tasks.find(t => t.id === currentPomodoro.task_id)?.title}
              </div>
              <div className="text-xs text-blue-600">
                Session #{(tasks.find(t => t.id === currentPomodoro.task_id)?.pomodoro_sessions || 0) + 1}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

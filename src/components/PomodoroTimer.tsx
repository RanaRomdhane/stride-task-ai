
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
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200 min-w-[300px]">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Timer Display */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isBreak ? (
                <Coffee className="h-5 w-5 text-green-500" />
              ) : (
                <Timer className="h-5 w-5 text-blue-500" />
              )}
              <span className="font-medium text-sm">
                {isBreak ? 'Break Time' : 'Focus Time'}
              </span>
            </div>
            
            <div className="text-3xl font-mono font-bold text-slate-900 mb-2">
              {formatTime(timeLeft)}
            </div>
            
            {isRunning && (
              <Progress 
                value={progress} 
                className="h-2 mb-3"
              />
            )}
          </div>

          {/* Task Selection */}
          {!isBreak && !isRunning && (
            <div className="space-y-2">
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a task to focus on" />
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
                        <span className="truncate max-w-[200px]">{task.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="25">25 minutes (Classic)</SelectItem>
                  <SelectItem value="35">35 minutes (Extended)</SelectItem>
                  <SelectItem value="45">45 minutes (Deep Work)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <Button 
                onClick={handleStart}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <>
                <Button onClick={handlePause} variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button onClick={handleStop} variant="outline">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>

          {/* Current Session Info */}
          {currentPomodoro && !isBreak && (
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                Working on: {tasks.find(t => t.id === currentPomodoro.taskId)?.title}
              </div>
              <div className="text-xs text-blue-600">
                Session #{tasks.find(t => t.id === currentPomodoro.taskId)?.pomodoroSessions + 1}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

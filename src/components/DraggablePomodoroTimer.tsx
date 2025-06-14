
import { useState, useRef, useEffect } from "react";
import { PomodoroTimer } from "./PomodoroTimer";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Move, X } from "lucide-react";

interface Position {
  x: number;
  y: number;
}

interface DraggablePomodoroTimerProps {
  onClose?: () => void;
}

export const DraggablePomodoroTimer = ({ onClose }: DraggablePomodoroTimerProps) => {
  const [position, setPosition] = useState<Position>({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const timerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timerRef.current) return;
    
    const rect = timerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={timerRef}
      className={`fixed z-50 transition-all duration-200 ${
        isDragging ? "cursor-grabbing" : "cursor-auto"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isExpanded ? "scale(1.2)" : "scale(1)",
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm border border-slate-300 rounded-xl shadow-lg">
        {/* Header with controls */}
        <div className="flex items-center justify-between p-2 border-b border-slate-200 bg-slate-50/80 rounded-t-xl">
          <div
            className="flex items-center gap-2 flex-1 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <Move className="h-3 w-3 text-slate-500" />
            <span className="text-xs font-medium text-slate-700">Pomodoro</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-slate-200"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
            
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-100 text-red-500"
                onClick={onClose}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Timer content */}
        <div className="p-1">
          <PomodoroTimer />
        </div>
      </div>
    </div>
  );
};

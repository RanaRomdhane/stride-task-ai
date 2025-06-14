
import { useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export const TaskInput = () => {
  const { addTask } = useTaskStore();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    status: "inbox" as const,
    category: "",
    estimatedDuration: 30,
    deadline: undefined as Date | undefined,
    urgent: false,
    important: false,
    context: "",
    tags: [] as string[],
    dependencies: [] as string[],
  });

  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    addTask(formData);
    
    // Reset form
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "inbox",
      category: "",
      estimatedDuration: 30,
      deadline: undefined,
      urgent: false,
      important: false,
      context: "",
      tags: [],
      dependencies: [],
    });

    toast({
      title: "Success",
      description: "Task created successfully! AI is analyzing for dependencies and batching.",
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What needs to be done?"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add more details about this task..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Work, Personal, Health"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="context">Context</Label>
              <Input
                id="context"
                value={formData.context}
                onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                placeholder="e.g., @office, @home, @computer"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button type="button" onClick={addTag} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                  >
                    {tag}
                    <Button
                      type="button"
                      onClick={() => removeTag(tag)}
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-blue-200"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">GTD Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbox">Inbox</SelectItem>
                  <SelectItem value="next-action">Next Action</SelectItem>
                  <SelectItem value="waiting-for">Waiting For</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="someday-maybe">Someday/Maybe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
              min="5"
              max="480"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !formData.deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline ? format(formData.deadline, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Eisenhower Matrix */}
          <div className="space-y-3">
            <Label>Eisenhower Matrix</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="urgent" className="text-sm">Urgent</Label>
                <Switch
                  id="urgent"
                  checked={formData.urgent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, urgent: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="important" className="text-sm">Important</Label>
                <Switch
                  id="important"
                  checked={formData.important}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, important: checked }))}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">✨ AI Features</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Auto-dependency detection</li>
              <li>• Smart task batching</li>
              <li>• Priority optimization</li>
              <li>• Context-based grouping</li>
            </ul>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
      >
        Create Task
      </Button>
    </form>
  );
};


import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Trash2, Crown, User, Wrench } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TaskCollaboratorsProps {
  taskId: string;
}

export const TaskCollaborators: React.FC<TaskCollaboratorsProps> = ({ taskId }) => {
  const { taskAssignments, fetchTaskAssignments, assignUserToTask, removeUserFromTask } = useTaskStore();
  const [isAssigning, setIsAssigning] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserRole, setNewUserRole] = useState<'owner' | 'assignee' | 'collaborator'>('assignee');

  useEffect(() => {
    fetchTaskAssignments(taskId);
  }, [taskId, fetchTaskAssignments]);

  const taskCollaborators = taskAssignments.filter(assignment => assignment.task_id === taskId);

  const handleAssignUser = async () => {
    if (!newUserId.trim()) return;
    
    try {
      await assignUserToTask(taskId, newUserId, newUserRole);
      setNewUserId('');
      setIsAssigning(false);
    } catch (error) {
      console.error('Error assigning user:', error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (confirm('Are you sure you want to remove this collaborator?')) {
      try {
        await removeUserFromTask(taskId, userId);
      } catch (error) {
        console.error('Error removing user:', error);
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3" />;
      case 'assignee':
        return <User className="h-3 w-3" />;
      case 'collaborator':
        return <Wrench className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'assignee':
        return 'bg-blue-100 text-blue-800';
      case 'collaborator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaborators ({taskCollaborators.length})
          </CardTitle>
          <Dialog open={isAssigning} onOpenChange={setIsAssigning}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Collaborator</DialogTitle>
                <DialogDescription>
                  Assign a user to this task with a specific role.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User ID</label>
                  <Input
                    placeholder="Enter user ID..."
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="assignee">Assignee</SelectItem>
                      <SelectItem value="collaborator">Collaborator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAssignUser} className="flex-1">
                    Assign User
                  </Button>
                  <Button variant="outline" onClick={() => setIsAssigning(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {taskCollaborators.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No collaborators assigned yet</p>
            <p className="text-sm">Add team members to collaborate on this task</p>
          </div>
        ) : (
          <div className="space-y-3">
            {taskCollaborators.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {assignment.user_id.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      User {assignment.user_id.slice(0, 8)}...
                    </p>
                    <Badge
                      className={`text-xs ${getRoleColor(assignment.role)}`}
                      variant="secondary"
                    >
                      {getRoleIcon(assignment.role)}
                      <span className="ml-1 capitalize">{assignment.role}</span>
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveUser(assignment.user_id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

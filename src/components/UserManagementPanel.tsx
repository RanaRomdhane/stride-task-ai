import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTaskStore } from "@/store/taskStore";

interface UserWithRole {
  id: string;
  full_name?: string;
  email?: string;
  role?: 'admin' | 'sub_admin' | 'employee';
  department?: string;
  created_at: Date;
}

interface UserManagementPanelProps {
  isAdmin: boolean;
  currentUserDepartment?: string;
}

export const UserManagementPanel = ({ isAdmin, currentUserDepartment }: UserManagementPanelProps) => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'sub_admin' | 'employee'>('employee');
  const [newDepartment, setNewDepartment] = useState("");
  const { userRole } = useTaskStore();

  useEffect(() => {
    fetchManagedUsers();
  }, [userRole]);

  const fetchManagedUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch user roles that this user can see. RLS policies on the server
      // will handle filtering for admins and sub-admins automatically.
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, department, created_at');
      
      if (rolesError) throw rolesError;

      // Then get profiles for these users
      const userIds = roles?.map(role => role.user_id) || [];
      
      if (userIds.length === 0) {
        setUsers([]);
        return;
      }

      // The RLS policy on 'profiles' will ensure that only profiles the current
      // user is allowed to see are returned.
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(role => role.user_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: `user-${profile.id.slice(0, 8)}@domain.com`, // Placeholder email
          role: userRole?.role,
          department: userRole?.department,
          created_at: new Date(userRole?.created_at || Date.now()),
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching managed users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'sub_admin' | 'employee', department?: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role,
          department: department || currentUserDepartment,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      fetchManagedUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const deleteUserRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role removed successfully",
      });

      fetchManagedUsers();
    } catch (error) {
      console.error('Error deleting user role:', error);
      toast({
        title: "Error",
        description: "Failed to remove user role",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'sub_admin':
        return 'bg-orange-100 text-orange-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditUser = (user: UserWithRole) => {
    if (isAdmin) return true;
    if (!currentUserDepartment) return false;
    return user.department === currentUserDepartment && user.role !== 'admin';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          {isAdmin 
            ? "Manage all users in the system" 
            : `Manage users in ${currentUserDepartment} department`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/50">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium">{user.full_name || 'No name'}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role ? user.role.replace('_', ' ').toUpperCase() : 'NO ROLE'}
                    </Badge>
                    {user.department && (
                      <Badge variant="outline" className="text-xs">
                        {user.department}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {canEditUser(user) && (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setNewRole(user.role || 'employee');
                            setNewDepartment(user.department || '');
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User Role</DialogTitle>
                          <DialogDescription>
                            Update the role and department for {user.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="employee">Employee</SelectItem>
                                {(isAdmin || currentUserDepartment) && (
                                  <SelectItem value="sub_admin">Sub-admin</SelectItem>
                                )}
                                {isAdmin && (
                                  <SelectItem value="admin">Admin</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {isAdmin && (
                            <div>
                              <Label htmlFor="department">Department</Label>
                              <Input
                                value={newDepartment}
                                onChange={(e) => setNewDepartment(e.target.value)}
                                placeholder="Enter department"
                              />
                            </div>
                          )}
                          
                          <Button
                            onClick={() => updateUserRole(user.id, newRole, newDepartment)}
                            className="w-full"
                          >
                            Update Role
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUserRole(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found in your scope.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, Check, CheckCheck, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    notificationSettings,
    fetchNotifications,
    fetchNotificationSettings,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateNotificationSettings,
  } = useTaskStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchNotificationSettings();
  }, [fetchNotifications, fetchNotificationSettings]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_update':
        return '📝';
      case 'deadline_reminder':
        return '⏰';
      case 'comment':
        return '💬';
      case 'assignment':
        return '👤';
      case 'mention':
        return '📢';
      default:
        return '🔔';
    }
  };

  const NotificationItem = ({ notification }: { notification: any }) => (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        notification.read ? 'bg-slate-50' : 'bg-blue-50 border border-blue-200'
      }`}
      onClick={() => handleMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`text-sm font-medium truncate ${
              notification.read ? 'text-slate-700' : 'text-slate-900'
            }`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className={`text-xs truncate ${
            notification.read ? 'text-slate-500' : 'text-slate-600'
          }`}>
            {notification.message}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {formatDistanceToNow(notification.created_at, { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );

  const NotificationSettings = () => (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Notification Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Configure how you want to receive notifications.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={notificationSettings?.email_notifications ?? true}
              onCheckedChange={(checked) =>
                updateNotificationSettings({ email_notifications: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="in-app-notifications">In-App Notifications</Label>
            <Switch
              id="in-app-notifications"
              checked={notificationSettings?.in_app_notifications ?? true}
              onCheckedChange={(checked) =>
                updateNotificationSettings({ in_app_notifications: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="task-updates">Task Updates</Label>
            <Switch
              id="task-updates"
              checked={notificationSettings?.task_updates ?? true}
              onCheckedChange={(checked) =>
                updateNotificationSettings({ task_updates: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
            <Switch
              id="deadline-reminders"
              checked={notificationSettings?.deadline_reminders ?? true}
              onCheckedChange={(checked) =>
                updateNotificationSettings({ deadline_reminders: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="comments">Comments</Label>
            <Switch
              id="comments"
              checked={notificationSettings?.comments ?? true}
              onCheckedChange={(checked) =>
                updateNotificationSettings({ comments: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="assignments">Task Assignments</Label>
            <Switch
              id="assignments"
              checked={notificationSettings?.assignments ?? true}
              onCheckedChange={(checked) =>
                updateNotificationSettings({ assignments: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="mentions">Mentions</Label>
            <Switch
              id="mentions"
              checked={notificationSettings?.mentions ?? true}
              onCheckedChange={(checked) =>
                updateNotificationSettings({ mentions: checked })
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="w-fit">
                {unreadCount} unread
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="text-center py-8 px-4 text-slate-500">
                  <BellOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-3">
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              )}
            </ScrollArea>
            <Separator />
            <div className="p-3">
              <NotificationSettings />
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

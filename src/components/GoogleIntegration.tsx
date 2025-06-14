
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Table, ExternalLink, Sync } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const GoogleIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [sheets, setSheets] = useState<any[]>([]);
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    try {
      // Mock Google OAuth integration
      // In a real implementation, this would use Google's OAuth 2.0 flow
      toast({
        title: "Google Integration",
        description: "Google OAuth integration would be implemented here with proper API keys",
      });
      setIsConnected(true);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google services",
        variant: "destructive",
      });
    }
  };

  const syncCalendar = async () => {
    if (!isConnected) return;
    
    // Mock calendar sync
    const mockEvents = [
      { id: '1', summary: 'Team Meeting', start: '2024-01-20T10:00:00Z', end: '2024-01-20T11:00:00Z' },
      { id: '2', summary: 'Project Review', start: '2024-01-20T14:00:00Z', end: '2024-01-20T15:00:00Z' },
    ];
    
    setCalendarEvents(mockEvents);
    toast({
      title: "Calendar Synced",
      description: `Imported ${mockEvents.length} events from Google Calendar`,
    });
  };

  const syncDocs = async () => {
    if (!isConnected) return;
    
    // Mock docs sync
    const mockDocs = [
      { id: '1', name: 'Project Plan.docx', modifiedTime: '2024-01-19T12:00:00Z' },
      { id: '2', name: 'Meeting Notes.docx', modifiedTime: '2024-01-18T15:30:00Z' },
    ];
    
    setDocuments(mockDocs);
    toast({
      title: "Documents Synced",
      description: `Found ${mockDocs.length} Google Docs`,
    });
  };

  const syncSheets = async () => {
    if (!isConnected) return;
    
    // Mock sheets sync
    const mockSheets = [
      { id: '1', name: 'Task Tracking.xlsx', modifiedTime: '2024-01-19T09:00:00Z' },
      { id: '2', name: 'Budget Planning.xlsx', modifiedTime: '2024-01-17T11:20:00Z' },
    ];
    
    setSheets(mockSheets);
    toast({
      title: "Sheets Synced",
      description: `Found ${mockSheets.length} Google Sheets`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
          Google Workspace Integration
        </h2>
        <Badge variant={isConnected ? "default" : "secondary"} className="px-3 py-1">
          {isConnected ? "Connected" : "Not Connected"}
        </Badge>
      </div>

      {!isConnected ? (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle>Connect to Google Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              Connect your Google account to sync calendars, documents, and sheets with your task management system.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Features include:</p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4">
                <li>• Sync calendar events to create tasks automatically</li>
                <li>• Import and export task data via Google Sheets</li>
                <li>• Link Google Docs to projects and tasks</li>
                <li>• Real-time collaboration with team members</li>
              </ul>
            </div>
            <Button onClick={handleGoogleAuth} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Google Account
            </Button>
            <p className="text-xs text-slate-500">
              Note: This is a demo. In production, proper Google OAuth 2.0 credentials would be required.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Google Calendar */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Google Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={syncCalendar} variant="outline" className="w-full">
                <Sync className="h-4 w-4 mr-2" />
                Sync Calendar
              </Button>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recent Events</h4>
                {calendarEvents.length === 0 ? (
                  <p className="text-slate-500 text-sm">No events synced yet</p>
                ) : (
                  calendarEvents.map((event) => (
                    <div key={event.id} className="p-2 bg-blue-50 rounded-lg">
                      <p className="font-medium text-sm">{event.summary}</p>
                      <p className="text-xs text-slate-600">
                        {new Date(event.start).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Google Docs */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Google Docs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={syncDocs} variant="outline" className="w-full">
                <Sync className="h-4 w-4 mr-2" />
                Sync Documents
              </Button>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recent Documents</h4>
                {documents.length === 0 ? (
                  <p className="text-slate-500 text-sm">No documents synced yet</p>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="p-2 bg-blue-50 rounded-lg">
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-slate-600">
                        Modified: {new Date(doc.modifiedTime).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Google Sheets */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5 text-green-600" />
                Google Sheets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={syncSheets} variant="outline" className="w-full">
                <Sync className="h-4 w-4 mr-2" />
                Sync Sheets
              </Button>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recent Sheets</h4>
                {sheets.length === 0 ? (
                  <p className="text-slate-500 text-sm">No sheets synced yet</p>
                ) : (
                  sheets.map((sheet) => (
                    <div key={sheet.id} className="p-2 bg-green-50 rounded-lg">
                      <p className="font-medium text-sm">{sheet.name}</p>
                      <p className="text-xs text-slate-600">
                        Modified: {new Date(sheet.modifiedTime).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Integration Tips */}
      {isConnected && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Integration Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 text-sm space-y-2">
            <p>• Calendar events can be automatically converted to tasks</p>
            <p>• Use Google Sheets to bulk import/export task data</p>
            <p>• Link Google Docs to projects for centralized documentation</p>
            <p>• Set up automatic syncing for real-time updates</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Table, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export const GoogleIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [sheets, setSheets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with actual client ID
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/drive.readonly';

  useEffect(() => {
    initializeGoogleAPI();
  }, []);

  const initializeGoogleAPI = async () => {
    if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
      console.log("Google Client ID not configured");
      return;
    }

    try {
      // Load Google API script
      if (!window.gapi) {
        await loadGoogleScript();
      }

      await window.gapi.load('auth2', initAuth);
      await window.gapi.load('client', initClient);
    } catch (error) {
      console.error('Error initializing Google API:', error);
    }
  };

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  };

  const initAuth = async () => {
    try {
      await window.gapi.auth2.init({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES
      });
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
    }
  };

  const initClient = async () => {
    try {
      await window.gapi.client.init({
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES
      });
    } catch (error) {
      console.error('Error initializing Google Client:', error);
    }
  };

  const handleGoogleAuth = async () => {
    if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
      toast({
        title: "Configuration Required",
        description: "Please configure your Google OAuth 2.0 credentials in the GoogleIntegration component",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      const authResult = await authInstance.signIn();
      
      if (authResult.isSignedIn()) {
        const profile = authResult.getBasicProfile();
        setUser({
          id: profile.getId(),
          name: profile.getName(),
          email: profile.getEmail(),
          imageUrl: profile.getImageUrl()
        });
        setIsConnected(true);
        
        toast({
          title: "Connected to Google",
          description: `Welcome, ${profile.getName()}!`,
        });
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      setIsConnected(false);
      setUser(null);
      setCalendarEvents([]);
      setDocuments([]);
      setSheets([]);
      
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Google services",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const syncCalendar = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime'
      });

      const events = response.result.items || [];
      setCalendarEvents(events);
      
      toast({
        title: "Calendar Synced",
        description: `Imported ${events.length} events from Google Calendar`,
      });
    } catch (error) {
      console.error('Calendar sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync calendar events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncDocs = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const response = await window.gapi.client.request({
        path: 'https://www.googleapis.com/drive/v3/files',
        params: {
          q: "mimeType='application/vnd.google-apps.document'",
          fields: 'files(id,name,modifiedTime)',
          orderBy: 'modifiedTime desc',
          pageSize: 10
        }
      });

      const docs = response.result.files || [];
      setDocuments(docs);
      
      toast({
        title: "Documents Synced",
        description: `Found ${docs.length} Google Docs`,
      });
    } catch (error) {
      console.error('Docs sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync Google Docs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncSheets = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const response = await window.gapi.client.request({
        path: 'https://www.googleapis.com/drive/v3/files',
        params: {
          q: "mimeType='application/vnd.google-apps.spreadsheet'",
          fields: 'files(id,name,modifiedTime)',
          orderBy: 'modifiedTime desc',
          pageSize: 10
        }
      });

      const spreadsheets = response.result.files || [];
      setSheets(spreadsheets);
      
      toast({
        title: "Sheets Synced",
        description: `Found ${spreadsheets.length} Google Sheets`,
      });
    } catch (error) {
      console.error('Sheets sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync Google Sheets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
          Google Workspace Integration
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"} className="px-3 py-1">
            {isConnected ? "Connected" : "Not Connected"}
          </Badge>
          {isConnected && user && (
            <Button onClick={handleSignOut} variant="outline" size="sm">
              Sign Out
            </Button>
          )}
        </div>
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
            <Button 
              onClick={handleGoogleAuth} 
              className="w-full" 
              disabled={isLoading || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID"}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {isLoading ? "Connecting..." : "Connect Google Account"}
            </Button>
            {GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID" && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">Configuration Required</p>
                <p className="text-xs text-yellow-700 mt-1">
                  To enable Google OAuth 2.0 integration:
                </p>
                <ol className="text-xs text-yellow-700 mt-2 ml-4 space-y-1">
                  <li>1. Go to Google Cloud Console</li>
                  <li>2. Create OAuth 2.0 credentials</li>
                  <li>3. Add your domain to authorized origins</li>
                  <li>4. Replace GOOGLE_CLIENT_ID in the code</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {user && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={user.imageUrl} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                <Button onClick={syncCalendar} variant="outline" className="w-full" disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
                          {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : 'All day'}
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
                <Button onClick={syncDocs} variant="outline" className="w-full" disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
                <Button onClick={syncSheets} variant="outline" className="w-full" disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
        </>
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

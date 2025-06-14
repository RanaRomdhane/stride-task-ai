
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Shield, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  description: string;
  icon: React.ReactNode;
}

const demoAccounts: DemoAccount[] = [
  {
    email: "admin@taskmaster.ai",
    password: "Admin123!",
    role: "Admin",
    description: "Full system access, user management, all features",
    icon: <Crown className="h-4 w-4 text-yellow-500" />
  },
  {
    email: "subadmin@taskmaster.ai", 
    password: "SubAdmin123!",
    role: "Sub-Admin",
    description: "Department management, limited admin features",
    icon: <Shield className="h-4 w-4 text-blue-500" />
  },
  {
    email: "employee@taskmaster.ai",
    password: "Employee123!",
    role: "Employee",
    description: "Standard user access, task management",
    icon: <User className="h-4 w-4 text-green-500" />
  }
];

export const DemoAccountsPanel = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = async (account: DemoAccount) => {
    setLoading(account.email);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) throw error;

      toast({
        title: "Signed in successfully!",
        description: `Welcome back, ${account.role}!`,
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-6 w-6 text-blue-500" />
          <CardTitle className="text-xl">Demo Accounts</CardTitle>
        </div>
        <CardDescription>
          Try different role-based dashboards with these pre-configured accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {demoAccounts.map((account) => (
          <div
            key={account.email}
            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {account.icon}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-slate-900">{account.email}</h3>
                  <Badge variant="outline" className="text-xs">
                    {account.role}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{account.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Password: <code className="bg-slate-100 px-1 rounded">{account.password}</code>
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => handleSignIn(account)}
              disabled={loading === account.email}
              className="ml-4"
            >
              {loading === account.email ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Role Differences:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Admin:</strong> Access to admin panel, user management, all analytics</li>
            <li>• <strong>Sub-Admin:</strong> Department-level management, limited admin features</li>
            <li>• <strong>Employee:</strong> Personal task management, basic analytics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

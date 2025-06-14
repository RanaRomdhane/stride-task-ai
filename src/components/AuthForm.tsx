
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, User, Shield } from "lucide-react";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Account created successfully. You can now sign in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      onAuthSuccess();
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10"></div>
        <CardHeader className="text-center relative z-10 pb-8 pt-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            TaskMaster AI
          </CardTitle>
          <CardDescription className="text-slate-600 text-lg">
            AI-Powered Task Management with GTD
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 px-8 pb-8">
          <Tabs defaultValue="signin" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100/80 backdrop-blur-sm p-1 rounded-xl">
              <TabsTrigger 
                value="signin" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-0">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-slate-700 font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-11 h-12 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-slate-700 font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-11 h-12 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-0">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-slate-700 font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-11 h-12 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-700 font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-11 h-12 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-700 font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="pl-11 h-12 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-select" className="text-slate-700 font-medium">Role</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200 rounded-xl">
                      <SelectItem value="admin" className="rounded-lg">Admin</SelectItem>
                      <SelectItem value="sub_admin" className="rounded-lg">Sub Admin</SelectItem>
                      <SelectItem value="employee" className="rounded-lg">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

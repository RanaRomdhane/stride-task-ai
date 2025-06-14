
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [activeTab, setActiveTab] = useState("signin");

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
        title: "Account Created Successfully! ✨",
        description: "Welcome aboard! You can now access your personalized workspace.",
      });
      
      setActiveTab("signin");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
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
        title: "Welcome Back! 🎉",
        description: "Ready to boost your productivity today?",
      });
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-gradient-to-br from-indigo-300/20 to-blue-300/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
      
      <Card className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl shadow-2xl border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30"></div>
        
        <CardHeader className="relative text-center pb-8 pt-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">
            TaskMaster AI
          </CardTitle>
          <p className="text-slate-600 mt-3 text-lg font-medium">
            Where productivity meets intelligence
          </p>
        </CardHeader>
        
        <CardContent className="relative px-10 pb-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-2xl h-14">
              <TabsTrigger 
                value="signin" 
                className="rounded-xl h-11 text-base font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Welcome Back
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="rounded-xl h-11 text-base font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                Join Today
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-0">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signin-email" className="text-slate-800 font-semibold">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-600" />
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="pl-12 h-14 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-base transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signin-password" className="text-slate-800 font-semibold">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-600" />
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-12 h-14 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-base transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] text-base group" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing you in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>Access Dashboard</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-0">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signup-name" className="text-slate-800 font-semibold">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-emerald-600" />
                    <Input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="pl-12 h-14 bg-white/80 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-base transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="text-slate-800 font-semibold">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-emerald-600" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="pl-12 h-14 bg-white/80 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-base transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="text-slate-800 font-semibold">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-emerald-600" />
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-12 h-14 bg-white/80 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-base transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="role-select" className="text-slate-800 font-semibold">Professional Role</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger className="h-14 bg-white/80 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-base">
                      <SelectValue placeholder="Choose your position" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 rounded-xl shadow-2xl">
                      <SelectItem value="admin" className="rounded-lg hover:bg-emerald-50 p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div className="font-semibold">Administrator</div>
                            <div className="text-sm text-slate-500">Complete system control</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="sub_admin" className="rounded-lg hover:bg-blue-50 p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-semibold">Team Manager</div>
                            <div className="text-sm text-slate-500">Department oversight</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="employee" className="rounded-lg hover:bg-purple-50 p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <div>
                            <div className="font-semibold">Team Member</div>
                            <div className="text-sm text-slate-500">Individual contributor</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] text-base group" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating your workspace...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>Start Your Journey</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

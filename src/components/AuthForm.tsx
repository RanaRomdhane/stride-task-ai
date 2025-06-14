
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight, Shield, CheckCircle } from "lucide-react";

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
        title: "Account Created Successfully",
        description: "Your account has been created. Please check your email to verify your account.",
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
        title: "Authentication Successful",
        description: "You have been successfully signed in to your account.",
      });
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-slate-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <Card className="relative w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/40"></div>
        
        <CardHeader className="relative text-center pb-6 pt-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
            Secure Access Portal
          </CardTitle>
          <p className="text-slate-600 font-medium">
            Please authenticate to continue
          </p>
        </CardHeader>
        
        <CardContent className="relative px-8 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl h-12">
              <TabsTrigger 
                value="signin" 
                className="rounded-lg h-10 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="rounded-lg h-10 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-0">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-slate-700 font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10 h-12 bg-white border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 rounded-lg"
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
                      className="pl-10 h-12 bg-white border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Authenticating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-0">
              <form onSubmit={handleSignUp} className="space-y-5">
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
                      className="pl-10 h-12 bg-white border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-700 font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10 h-12 bg-white border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 rounded-lg"
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
                      placeholder="Create a secure password"
                      className="pl-10 h-12 bg-white border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-select" className="text-slate-700 font-medium">Role</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger className="h-12 bg-white border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 rounded-lg">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 rounded-lg shadow-xl">
                      <SelectItem value="admin" className="rounded-md hover:bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-slate-600" />
                          <div>
                            <div className="font-medium">Administrator</div>
                            <div className="text-sm text-slate-500">Full system access</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="sub_admin" className="rounded-md hover:bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-slate-600" />
                          <div>
                            <div className="font-medium">Manager</div>
                            <div className="text-sm text-slate-500">Department management</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="employee" className="rounded-md hover:bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-slate-600" />
                          <div>
                            <div className="font-medium">Employee</div>
                            <div className="text-sm text-slate-500">Standard access</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
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

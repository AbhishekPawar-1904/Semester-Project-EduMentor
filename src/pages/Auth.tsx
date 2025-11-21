import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "mentor">("student");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

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
      toast.success("Account created! You can now sign in.");
    } catch (error: any) {
      toast.error(error.message);
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
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero bg-grid-pattern p-4">
      <Card className="w-full max-w-md shadow-glow animate-scale-in hover-lift">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4 animate-bounce-in">
            <div className="bg-gradient-primary p-4 rounded-2xl shadow-glow">
              <GraduationCap className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl animate-slide-in-left bg-gradient-primary bg-clip-text text-transparent">
            Welcome to EduMentor
          </CardTitle>
          <CardDescription className="text-base animate-slide-in-right" style={{animationDelay: '0.2s'}}>
            Your AI-powered career guidance platform
          </CardDescription>
        </CardHeader>
        <CardContent className="animate-fade-in" style={{animationDelay: '0.3s'}}>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin" className="transition-all">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="transition-all">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.1s'}}>
                  <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
                  <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="transition-all focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full hover:scale-105 transition-transform hover-glow animate-slide-up" 
                  style={{animationDelay: '0.3s'}}
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.1s'}}>
                  <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="transition-all focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.3s'}}>
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="transition-all focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-3 animate-slide-up" style={{animationDelay: '0.4s'}}>
                  <Label className="text-sm font-medium">I am a...</Label>
                  <RadioGroup value={role} onValueChange={(v) => setRole(v as "student" | "mentor")}>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent/5 transition-all cursor-pointer">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="cursor-pointer flex-1">Student</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent/5 transition-all cursor-pointer">
                      <RadioGroupItem value="mentor" id="mentor" />
                      <Label htmlFor="mentor" className="cursor-pointer flex-1">Mentor (Apply)</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button 
                  type="submit" 
                  className="w-full hover:scale-105 transition-transform hover-glow animate-slide-up" 
                  style={{animationDelay: '0.5s'}}
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

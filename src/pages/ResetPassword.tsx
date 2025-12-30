import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap, KeyRound } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Invalid or expired reset link. Please request a new one.");
        navigate("/auth");
      }
    };
    checkSession();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      
      toast.success("Password updated successfully!");
      navigate("/auth");
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
              <KeyRound className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl animate-slide-in-left bg-gradient-primary bg-clip-text text-transparent">
            Set New Password
          </CardTitle>
          <CardDescription className="text-base animate-slide-in-right" style={{animationDelay: '0.2s'}}>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="animate-fade-in" style={{animationDelay: '0.3s'}}>
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full hover:scale-105 transition-transform hover-glow animate-slide-up" 
              style={{animationDelay: '0.3s'}}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

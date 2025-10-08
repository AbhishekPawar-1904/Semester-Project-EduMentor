import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, LogOut, Shield, User } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const { user, isAdmin, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "Error signing out");
    }
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 animate-slide-down">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl group">
            <div className="animate-bounce-in">
              <GraduationCap className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-slide-in-left group-hover:tracking-wide transition-all">
              EduMentor
            </span>
          </Link>

          <div className="flex items-center gap-2 animate-slide-in-right">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="hover:scale-105 transition-transform">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/careers">
                  <Button variant="ghost" className="hover:scale-105 transition-transform">
                    Careers
                  </Button>
                </Link>
                <Link to="/mentors">
                  <Button variant="ghost" className="hover:scale-105 transition-transform">
                    Mentors
                  </Button>
                </Link>
                <Link to="/colleges">
                  <Button variant="ghost" className="hover:scale-105 transition-transform">
                    Colleges
                  </Button>
                </Link>
                <Link to="/scholarships">
                  <Button variant="ghost" className="hover:scale-105 transition-transform">
                    Scholarships
                  </Button>
                </Link>
                <Link to="/resources">
                  <Button variant="ghost" className="hover:scale-105 transition-transform">
                    Resources
                  </Button>
                </Link>
                <Link to="/quiz">
                  <Button variant="ghost" className="hover:scale-105 transition-transform">
                    Quiz
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="hover-lift hover-glow">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-lift">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{profile?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button className="hover-lift hover-glow">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  isMentor: boolean;
  isStudent: boolean;
  profile: any;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userRole: null,
  isMentor: false,
  isStudent: false,
  profile: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [hasApprovedMentorProfile, setHasApprovedMentorProfile] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role and profile when session changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
            fetchUserProfile(session.user.id);
            checkMentorProfile(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setProfile(null);
          setHasApprovedMentorProfile(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchUserProfile(session.user.id);
        checkMentorProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setUserRole(data?.role || "student");
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole("student");
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfile(null);
    }
  };

  const checkMentorProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      setHasApprovedMentorProfile(data?.status === "approved");
    } catch (error) {
      console.error("Error checking mentor profile:", error);
      setHasApprovedMentorProfile(false);
    }
  };

  const isMentor = userRole === "mentor" || hasApprovedMentorProfile;
  const isStudent = !isMentor;

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, isMentor, isStudent, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, UserCheck, Calendar, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface MentorProfile {
  id: string;
  user_id: string;
  bio: string;
  company: string;
  education: string;
  hourly_rate: number;
  expertise: string[];
  experience_years: number;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Appointment {
  id: string;
  scheduled_at: string;
  status: string;
  student_id: string;
  mentor_id: string;
  student: {
    full_name: string;
    email: string;
  };
  mentor: {
    full_name: string;
    email: string;
  };
}

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingMentors, setPendingMentors] = useState<MentorProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) throw roleError;

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const { data: mentorsData, error: mentorsError } = await supabase
        .from("mentor_profiles")
        .select("*, profiles(full_name, email)")
        .eq("status", "pending");

      if (mentorsError) throw mentorsError;
      setPendingMentors(mentorsData || []);

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          *,
          student:profiles!appointments_student_id_fkey(full_name, email),
          mentor:profiles!appointments_mentor_id_fkey(full_name, email)
        `)
        .order("scheduled_at", { ascending: false })
        .limit(10);

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMentorApproval = async (mentorId: string, status: "approved" | "rejected") => {
    try {
      // Find the mentor to get user_id
      const mentor = pendingMentors.find(m => m.id === mentorId);
      if (!mentor) throw new Error("Mentor not found");

      // Update mentor profile status
      const { error: mentorError } = await supabase
        .from("mentor_profiles")
        .update({ status })
        .eq("id", mentorId);

      if (mentorError) throw mentorError;

      // If approved, add mentor role and update profile
      if (status === "approved") {
        // Add mentor role to user_roles
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({
            user_id: mentor.user_id,
            role: "mentor"
          }, {
            onConflict: "user_id,role"
          });

        if (roleError) throw roleError;

        // Update profile role
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ role: "mentor" })
          .eq("id", mentor.user_id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Success",
        description: `Mentor ${status} successfully.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center gap-4 animate-slide-up">
            <div className="p-3 rounded-2xl bg-gradient-primary shadow-glow animate-bounce-in">
              <Shield className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-lg text-muted-foreground">Manage mentors, users, and platform content</p>
            </div>
          </div>

          <Tabs defaultValue="mentors" className="space-y-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-grid">
              <TabsTrigger value="mentors" className="transition-all">
                <UserCheck className="mr-2 h-4 w-4" />
                Pending Mentors
              </TabsTrigger>
              <TabsTrigger value="appointments" className="transition-all">
                <Calendar className="mr-2 h-4 w-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="users" className="transition-all">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mentors" className="space-y-4">
              <Card className="shadow-glow animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl">Mentor Applications</CardTitle>
                  <CardDescription className="text-base">
                    Review and approve mentor applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingMentors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12 text-lg">
                      No pending mentor applications
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {pendingMentors.map((mentor, idx) => (
                        <Card 
                          key={mentor.id} 
                          className="hover-lift animate-slide-in-left border-2 border-transparent hover:border-primary transition-all"
                          style={{animationDelay: `${idx * 0.1}s`}}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-xl">{mentor.profiles.full_name}</CardTitle>
                                <CardDescription className="text-base">{mentor.profiles.email}</CardDescription>
                              </div>
                              <Badge variant="secondary" className="capitalize px-3 py-1">{mentor.status}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-semibold mb-1 text-muted-foreground">Company</p>
                                <p className="text-base">{mentor.company}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-1 text-muted-foreground">Experience</p>
                                <p className="text-base">{mentor.experience_years} years</p>
                              </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-semibold mb-1 text-muted-foreground">Education</p>
                                <p className="text-base">{mentor.education}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-1 text-muted-foreground">Hourly Rate</p>
                                <p className="text-base">${mentor.hourly_rate}/hour</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-semibold mb-2 text-muted-foreground">Expertise</p>
                              <div className="flex flex-wrap gap-2">
                                {mentor.expertise.map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-semibold mb-1 text-muted-foreground">Bio</p>
                              <p className="text-base text-muted-foreground">{mentor.bio}</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button
                                onClick={() => handleMentorApproval(mentor.id, "approved")}
                                className="flex-1 hover:scale-105 transition-transform hover-glow"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleMentorApproval(mentor.id, "rejected")}
                                variant="destructive"
                                className="flex-1 hover:scale-105 transition-transform"
                              >
                                Reject
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <Card className="shadow-glow animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl">Recent Appointments</CardTitle>
                  <CardDescription className="text-base">Latest mentorship session bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12 text-lg">
                      No appointments found
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((appointment, idx) => (
                        <div
                          key={appointment.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-2 rounded-lg hover-lift hover:border-primary transition-all animate-slide-in-right"
                          style={{animationDelay: `${idx * 0.1}s`}}
                        >
                          <div className="space-y-1 mb-3 sm:mb-0">
                            <p className="font-semibold text-base">
                              {appointment.student.full_name} → {appointment.mentor.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appointment.scheduled_at).toLocaleString()}
                            </p>
                          </div>
                          <Badge
                            className="capitalize px-3 py-1"
                            variant={
                              appointment.status === "completed"
                                ? "default"
                                : appointment.status === "accepted"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="shadow-glow animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl">User Management</CardTitle>
                  <CardDescription className="text-base">View and manage platform users</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-12 text-lg">
                    User management features coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

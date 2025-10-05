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
      const { error } = await supabase
        .from("mentor_profiles")
        .update({ status })
        .eq("id", mentorId);

      if (error) throw error;

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage mentors, users, and platform content</p>
            </div>
          </div>

          <Tabs defaultValue="mentors" className="space-y-6">
            <TabsList>
              <TabsTrigger value="mentors">
                <UserCheck className="mr-2 h-4 w-4" />
                Pending Mentors
              </TabsTrigger>
              <TabsTrigger value="appointments">
                <Calendar className="mr-2 h-4 w-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mentors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mentor Applications</CardTitle>
                  <CardDescription>
                    Review and approve mentor applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingMentors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No pending mentor applications
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {pendingMentors.map((mentor) => (
                        <Card key={mentor.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>{mentor.profiles.full_name}</CardTitle>
                                <CardDescription>{mentor.profiles.email}</CardDescription>
                              </div>
                              <Badge variant="secondary">{mentor.status}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Company</p>
                              <p className="text-sm text-muted-foreground">{mentor.company}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Experience</p>
                              <p className="text-sm text-muted-foreground">
                                {mentor.experience_years} years
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Expertise</p>
                              <div className="flex flex-wrap gap-2">
                                {mentor.expertise.map((skill, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Bio</p>
                              <p className="text-sm text-muted-foreground">{mentor.bio}</p>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => handleMentorApproval(mentor.id, "approved")}
                                className="flex-1"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleMentorApproval(mentor.id, "rejected")}
                                variant="destructive"
                                className="flex-1"
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
              <Card>
                <CardHeader>
                  <CardTitle>Recent Appointments</CardTitle>
                  <CardDescription>Latest mentorship session bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No appointments found
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">
                              {appointment.student.full_name} → {appointment.mentor.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appointment.scheduled_at).toLocaleString()}
                            </p>
                          </div>
                          <Badge
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
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage platform users</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
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

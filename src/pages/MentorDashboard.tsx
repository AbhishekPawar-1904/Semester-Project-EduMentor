import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Users, Clock, DollarSign, Loader2, CheckCircle, XCircle, User, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  scheduled_at: string;
  status: string;
  duration_minutes: number;
  notes: string | null;
  meeting_link: string | null;
  student: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface MentorProfile {
  id: string;
  status: string;
  experience_years: number;
  hourly_rate: number;
  expertise: string[];
  bio: string;
  company: string;
  education: string;
}

export default function MentorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, navigate]);

  const loadDashboardData = async () => {
    try {
      // Load mentor profile
      const { data: profileData, error: profileError } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profileData) {
        navigate("/mentor-application");
        return;
      }

      setMentorProfile(profileData);

      // Load appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          *,
          student:profiles!appointments_student_id_fkey(id, full_name, email)
        `)
        .eq("mentor_id", user?.id)
        .order("scheduled_at", { ascending: false });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId: string, status: "accepted" | "completed" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Appointment ${status} successfully.`,
      });

      loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mentorProfile?.status === "pending") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Application Pending
              </CardTitle>
              <CardDescription>
                Your mentor application is under review by our admin team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We will notify you once your application has been reviewed. This usually takes 1-2 business days.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (mentorProfile?.status === "rejected") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Application Not Approved
              </CardTitle>
              <CardDescription>
                Unfortunately, your mentor application was not approved at this time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You may reapply after addressing the feedback or contact support for more information.
              </p>
              <Button onClick={() => navigate("/mentor-application")}>
                Reapply
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const pendingAppointments = appointments.filter(apt => apt.status === "pending");
  const upcomingAppointments = appointments.filter(
    apt => new Date(apt.scheduled_at) > new Date() && apt.status === "accepted"
  );
  const completedAppointments = appointments.filter(apt => apt.status === "completed");
  const cancelledAppointments = appointments.filter(apt => apt.status === "cancelled");

  const stats = {
    totalSessions: appointments.length,
    pending: pendingAppointments.length,
    upcoming: upcomingAppointments.length,
    completed: completedAppointments.length,
    earnings: completedAppointments.length * (mentorProfile?.hourly_rate || 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "accepted": return "secondary";
      case "pending": return "outline";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4 animate-slide-up">
            <div className="p-3 rounded-2xl bg-gradient-primary shadow-glow animate-bounce-in">
              <Briefcase className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Mentor Dashboard
              </h1>
              <p className="text-muted-foreground">Manage your mentoring sessions and profile</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcoming}</div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.earnings}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="pending" className="gap-2">
                Pending
                {pendingAppointments.length > 0 && (
                  <Badge variant="destructive" className="ml-1">{pendingAppointments.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="profile">My Profile</TabsTrigger>
            </TabsList>

            {/* Pending Appointments */}
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Requests</CardTitle>
                  <CardDescription>Session requests waiting for your approval</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingAppointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No pending requests</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingAppointments.map((appointment) => (
                        <Card key={appointment.id} className="border-2 hover:border-primary transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <h3 className="font-semibold">{appointment.student.full_name}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{appointment.student.email}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(appointment.scheduled_at), "PPP 'at' p")}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {appointment.duration_minutes} min
                                  </span>
                                </div>
                                {appointment.notes && (
                                  <p className="text-sm mt-2 p-2 bg-muted rounded">{appointment.notes}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAppointmentAction(appointment.id, "accepted")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAppointmentAction(appointment.id, "cancelled")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Upcoming Appointments */}
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Your scheduled mentoring sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No upcoming sessions</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold">{appointment.student.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.student.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(appointment.scheduled_at), "PPP 'at' p")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {appointment.duration_minutes} min
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Accepted</Badge>
                            <Button
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, "completed")}
                            >
                              Mark Complete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Completed Appointments */}
            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Sessions</CardTitle>
                  <CardDescription>Your past mentoring sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {completedAppointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No completed sessions yet</p>
                  ) : (
                    <div className="space-y-3">
                      {completedAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold">{appointment.student.full_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.scheduled_at), "PPP")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Completed</Badge>
                            <span className="text-sm font-medium text-green-600">
                              +${mentorProfile?.hourly_rate || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cancelled Appointments */}
            <TabsContent value="cancelled">
              <Card>
                <CardHeader>
                  <CardTitle>Cancelled Sessions</CardTitle>
                  <CardDescription>Sessions that were cancelled</CardDescription>
                </CardHeader>
                <CardContent>
                  {cancelledAppointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No cancelled sessions</p>
                  ) : (
                    <div className="space-y-3">
                      {cancelledAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg opacity-60"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold">{appointment.student.full_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.scheduled_at), "PPP")}
                            </p>
                          </div>
                          <Badge variant="destructive">Cancelled</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>My Mentor Profile</CardTitle>
                  <CardDescription>Your public mentor information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{mentorProfile?.company || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">{mentorProfile?.experience_years} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="font-medium">${mentorProfile?.hourly_rate}/hr</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Education</p>
                    <p>{mentorProfile?.education || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {mentorProfile?.expertise?.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Bio</p>
                    <p className="text-muted-foreground">{mentorProfile?.bio}</p>
                  </div>
                  <Button onClick={() => navigate("/profile")}>
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}

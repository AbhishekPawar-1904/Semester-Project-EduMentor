import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Users, Clock, DollarSign, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  scheduled_at: string;
  status: string;
  duration_minutes: number;
  notes: string | null;
  student: {
    full_name: string;
    email: string;
  };
}

interface MentorProfile {
  status: string;
  experience_years: number;
  hourly_rate: number;
  expertise: string[];
}

export default function MentorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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
          student:profiles!appointments_student_id_fkey(full_name, email)
        `)
        .eq("mentor_id", user?.id)
        .order("scheduled_at", { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
              <CardTitle>Application Pending</CardTitle>
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
      </div>
    );
  }

  if (mentorProfile?.status === "rejected") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Application Not Approved</CardTitle>
              <CardDescription>
                Unfortunately, your mentor application was not approved at this time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You may reapply after addressing the feedback or contact support for more information.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.scheduled_at) > new Date() && apt.status === "pending"
  );

  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed" || new Date(apt.scheduled_at) < new Date()
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mentor Dashboard</h1>
          <p className="text-muted-foreground">Manage your mentoring sessions and profile</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Experience</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mentorProfile?.experience_years} years</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mentorProfile?.hourly_rate}</div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled mentoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No upcoming sessions</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{appointment.student.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.student.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(appointment.scheduled_at), "PPP")}
                        </span>
                        <span className="text-sm flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.duration_minutes} min
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">{appointment.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your completed mentoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {completedAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No completed sessions yet</p>
            ) : (
              <div className="space-y-4">
                {completedAppointments.slice(0, 5).map((appointment) => (
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
                    <Badge variant="outline">{appointment.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

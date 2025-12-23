import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UserCheck, Calendar, Shield, Users, Plus, X, Activity, GraduationCap, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: string[];
}

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
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Appointment {
  id: string;
  scheduled_at: string;
  status: string;
  duration_minutes: number;
  student_id: string;
  mentor_id: string;
  created_at: string;
  student: {
    full_name: string;
    email: string;
  };
  mentor: {
    full_name: string;
    email: string;
  };
}

interface StudentActivity {
  id: string;
  full_name: string;
  email: string;
  appointments_count: number;
  quiz_count: number;
  last_active: string;
}

interface MentorActivity {
  id: string;
  full_name: string;
  email: string;
  status: string;
  appointments_count: number;
  completed_sessions: number;
  expertise: string[];
}

type AppRole = Database["public"]["Enums"]["app_role"];

const ALL_ROLES: AppRole[] = ["student", "mentor", "admin"];

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingMentors, setPendingMentors] = useState<MentorProfile[]>([]);
  const [allMentors, setAllMentors] = useState<MentorProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>([]);
  const [mentorActivities, setMentorActivities] = useState<MentorActivity[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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

      setCurrentUserId(user.id);

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
      // Fetch pending mentors
      const { data: pendingMentorsData, error: pendingMentorsError } = await supabase
        .from("mentor_profiles")
        .select("*, profiles(full_name, email)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (pendingMentorsError) throw pendingMentorsError;
      setPendingMentors(pendingMentorsData || []);

      // Fetch all mentors
      const { data: allMentorsData, error: allMentorsError } = await supabase
        .from("mentor_profiles")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });

      if (allMentorsError) throw allMentorsError;
      setAllMentors(allMentorsData || []);

      // Fetch all appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          *,
          student:profiles!appointments_student_id_fkey(full_name, email),
          mentor:profiles!appointments_mentor_id_fkey(full_name, email)
        `)
        .order("scheduled_at", { ascending: false });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

      // Fetch all users with their roles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Map roles to users
      const usersWithRoles: UserWithRoles[] = (profilesData || []).map(profile => ({
        ...profile,
        roles: (rolesData || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role)
      }));

      setUsers(usersWithRoles);

      // Fetch student activities
      const { data: quizData, error: quizError } = await supabase
        .from("quiz_results")
        .select("student_id, created_at");

      if (quizError) throw quizError;

      // Build student activity data
      const studentRoleUsers = usersWithRoles.filter(u => u.roles.includes("student"));
      const studentActivityData: StudentActivity[] = studentRoleUsers.map(student => {
        const studentAppointments = (appointmentsData || []).filter(a => a.student_id === student.id);
        const studentQuizzes = (quizData || []).filter(q => q.student_id === student.id);
        const lastAppointment = studentAppointments[0]?.scheduled_at;
        const lastQuiz = studentQuizzes[0]?.created_at;
        
        return {
          id: student.id,
          full_name: student.full_name || "Unknown",
          email: student.email,
          appointments_count: studentAppointments.length,
          quiz_count: studentQuizzes.length,
          last_active: lastAppointment || lastQuiz || student.created_at
        };
      });

      setStudentActivities(studentActivityData);

      // Build mentor activity data
      const mentorActivityData: MentorActivity[] = (allMentorsData || []).map(mentor => {
        const mentorAppointments = (appointmentsData || []).filter(a => a.mentor_id === mentor.user_id);
        const completedSessions = mentorAppointments.filter(a => a.status === "completed").length;
        
        return {
          id: mentor.user_id,
          full_name: mentor.profiles.full_name,
          email: mentor.profiles.email,
          status: mentor.status,
          appointments_count: mentorAppointments.length,
          completed_sessions: completedSessions,
          expertise: mentor.expertise || []
        };
      });

      setMentorActivities(mentorActivityData);

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
      const mentor = pendingMentors.find(m => m.id === mentorId);
      if (!mentor) throw new Error("Mentor not found");

      const { error: mentorError } = await supabase
        .from("mentor_profiles")
        .update({ status })
        .eq("id", mentorId);

      if (mentorError) throw mentorError;

      if (status === "approved") {
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({
            user_id: mentor.user_id,
            role: "mentor"
          }, {
            onConflict: "user_id,role"
          });

        if (roleError) throw roleError;

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

  const handleAddRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role "${role}" added successfully.`,
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

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    if (userId === currentUserId && role === "admin") {
      toast({
        title: "Cannot Remove",
        description: "You cannot remove your own admin role.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role "${role}" removed successfully.`,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      case "completed": return "default";
      case "accepted": return "secondary";
      case "cancelled": return "destructive";
      default: return "outline";
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

  const stats = {
    totalUsers: users.length,
    totalMentors: allMentors.length,
    pendingApplications: pendingMentors.length,
    totalAppointments: appointments.length,
    completedSessions: appointments.filter(a => a.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center gap-4 animate-slide-up">
            <div className="p-3 rounded-2xl bg-gradient-primary shadow-glow animate-bounce-in">
              <Shield className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-muted-foreground">Manage mentors, users, and platform activity</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="hover-lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Mentors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMentors}</div>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.pendingApplications}</div>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completedSessions}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending-mentors" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="pending-mentors" className="gap-2">
                <UserCheck className="h-4 w-4" />
                <span className="hidden md:inline">Pending Mentors</span>
                <span className="md:hidden">Pending</span>
                {pendingMentors.length > 0 && (
                  <Badge variant="destructive" className="ml-1">{pendingMentors.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all-mentors" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden md:inline">All Mentors</span>
                <span className="md:hidden">Mentors</span>
              </TabsTrigger>
              <TabsTrigger value="student-activity" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden md:inline">Student Activity</span>
                <span className="md:hidden">Students</span>
              </TabsTrigger>
              <TabsTrigger value="mentor-activity" className="gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden md:inline">Mentor Activity</span>
                <span className="md:hidden">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>

            {/* Pending Mentors Tab */}
            <TabsContent value="pending-mentors">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Mentor Applications</CardTitle>
                  <CardDescription>Review and approve or reject mentor applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingMentors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No pending applications</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingMentors.map((mentor) => (
                        <Card key={mentor.id} className="border-2 hover:border-primary transition-all">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>{mentor.profiles.full_name}</CardTitle>
                                <CardDescription>{mentor.profiles.email}</CardDescription>
                              </div>
                              <Badge variant="secondary">Pending</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Company</p>
                                <p className="font-medium">{mentor.company || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Experience</p>
                                <p className="font-medium">{mentor.experience_years} years</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Hourly Rate</p>
                                <p className="font-medium">${mentor.hourly_rate}/hr</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Expertise</p>
                              <div className="flex flex-wrap gap-2">
                                {mentor.expertise?.map((skill, idx) => (
                                  <Badge key={idx} variant="outline">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Bio</p>
                              <p className="text-sm mt-1">{mentor.bio}</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button onClick={() => handleMentorApproval(mentor.id, "approved")} className="flex-1">
                                Approve
                              </Button>
                              <Button onClick={() => handleMentorApproval(mentor.id, "rejected")} variant="destructive" className="flex-1">
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

            {/* All Mentors Tab */}
            <TabsContent value="all-mentors">
              <Card>
                <CardHeader>
                  <CardTitle>All Mentors</CardTitle>
                  <CardDescription>View and manage all mentors on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {allMentors.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No mentors found</p>
                  ) : (
                    <div className="space-y-3">
                      {allMentors.map((mentor) => (
                        <div key={mentor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-semibold">{mentor.profiles.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{mentor.profiles.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>{mentor.company || "No company"}</span>
                              <span>{mentor.experience_years} years exp.</span>
                              <span>${mentor.hourly_rate}/hr</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(mentor.status)} className="capitalize">
                              {mentor.status}
                            </Badge>
                            {mentor.status === "approved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMentorApproval(mentor.id, "rejected")}
                              >
                                Revoke
                              </Button>
                            )}
                            {mentor.status === "rejected" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMentorApproval(mentor.id, "approved")}
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Student Activity Tab */}
            <TabsContent value="student-activity">
              <Card>
                <CardHeader>
                  <CardTitle>Student Activity</CardTitle>
                  <CardDescription>Monitor student engagement and activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {studentActivities.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No students found</p>
                  ) : (
                    <div className="space-y-3">
                      {studentActivities.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-semibold">{student.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-bold text-lg">{student.appointments_count}</p>
                              <p className="text-muted-foreground">Sessions</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-lg">{student.quiz_count}</p>
                              <p className="text-muted-foreground">Quizzes</p>
                            </div>
                            <div className="text-center min-w-[100px]">
                              <p className="text-xs text-muted-foreground">Last Active</p>
                              <p className="text-sm">{format(new Date(student.last_active), "MMM dd, yyyy")}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mentor Activity Tab */}
            <TabsContent value="mentor-activity">
              <Card>
                <CardHeader>
                  <CardTitle>Mentor Activity</CardTitle>
                  <CardDescription>Monitor mentor performance and engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  {mentorActivities.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No mentors found</p>
                  ) : (
                    <div className="space-y-3">
                      {mentorActivities.map((mentor) => (
                        <div key={mentor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{mentor.full_name}</h3>
                              <Badge variant={getStatusColor(mentor.status)} className="capitalize">{mentor.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{mentor.email}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {mentor.expertise.slice(0, 3).map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                              ))}
                              {mentor.expertise.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{mentor.expertise.length - 3}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-bold text-lg">{mentor.appointments_count}</p>
                              <p className="text-muted-foreground">Total</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-lg text-green-600">{mentor.completed_sessions}</p>
                              <p className="text-muted-foreground">Completed</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Manage user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No users found</p>
                  ) : (
                    <div className="space-y-3">
                      {users.map((user) => {
                        const availableRoles = ALL_ROLES.filter(role => !user.roles.includes(role));
                        
                        return (
                          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                            <div className="flex-1">
                              <h3 className="font-semibold">{user.full_name || "Unknown"}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Joined: {format(new Date(user.created_at), "MMM dd, yyyy")}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {user.roles.map((role) => (
                                <Badge key={role} variant="secondary" className="capitalize flex items-center gap-1">
                                  {role}
                                  {!(user.id === currentUserId && role === "admin") && (
                                    <button
                                      onClick={() => handleRemoveRole(user.id, role as AppRole)}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </Badge>
                              ))}
                              {availableRoles.length > 0 && (
                                <div className="flex gap-1">
                                  {availableRoles.map((role) => (
                                    <Button
                                      key={role}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAddRole(user.id, role)}
                                      className="text-xs"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      {role}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

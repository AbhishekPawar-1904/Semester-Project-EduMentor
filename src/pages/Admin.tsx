import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  TrendingUp,
} from "lucide-react";
import { ManageUsers } from "@/components/admin/ManageUsers";
import { ManageCareers } from "@/components/admin/ManageCareers";
import { ManageQuizzes } from "@/components/admin/ManageQuizzes";
import { ManageAppointments } from "@/components/admin/ManageAppointments";
import { SystemStats } from "@/components/admin/SystemStats";

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalMentors: 0,
    totalAppointments: 0,
    totalCareers: 0,
    completedQuizzes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: usersCount },
        { count: studentsCount },
        { count: mentorsCount },
        { count: appointmentsCount },
        { count: careersCount },
        { count: quizzesCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('student_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('mentor_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('careers').select('*', { count: 'exact', head: true }),
        supabase.from('quiz_results').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalStudents: studentsCount || 0,
        totalMentors: mentorsCount || 0,
        totalAppointments: appointmentsCount || 0,
        totalCareers: careersCount || 0,
        completedQuizzes: quizzesCount || 0,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading statistics",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Manage the platform and monitor system activity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Students</p>
                    <p className="text-3xl font-bold">{stats.totalStudents}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-success opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mentors</p>
                    <p className="text-3xl font-bold">{stats.totalMentors}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-warning opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Appointments</p>
                    <p className="text-3xl font-bold">{stats.totalAppointments}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-secondary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Careers</p>
                    <p className="text-3xl font-bold">{stats.totalCareers}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-error opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quiz Completions</p>
                    <p className="text-3xl font-bold">{stats.completedQuizzes}</p>
                  </div>
                  <Settings className="h-8 w-8 text-info opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="careers">Careers</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <ManageUsers onUpdate={fetchStats} />
            </TabsContent>

            <TabsContent value="careers">
              <ManageCareers onUpdate={fetchStats} />
            </TabsContent>

            <TabsContent value="quizzes">
              <ManageQuizzes onUpdate={fetchStats} />
            </TabsContent>

            <TabsContent value="appointments">
              <ManageAppointments onUpdate={fetchStats} />
            </TabsContent>

            <TabsContent value="stats">
              <SystemStats stats={stats} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;

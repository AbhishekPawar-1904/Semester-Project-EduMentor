import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SystemStatsProps {
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalMentors: number;
    totalAppointments: number;
    totalCareers: number;
    completedQuizzes: number;
  };
}

export function SystemStats({ stats }: SystemStatsProps) {
  const studentPercentage = stats.totalUsers > 0
    ? (stats.totalStudents / stats.totalUsers) * 100
    : 0;
  const mentorPercentage = stats.totalUsers > 0
    ? (stats.totalMentors / stats.totalUsers) * 100
    : 0;
  const quizCompletionRate = stats.totalStudents > 0
    ? (stats.completedQuizzes / stats.totalStudents) * 100
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
          <CardDescription>Breakdown of users by role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Students</span>
              <span className="font-medium">{stats.totalStudents} ({Math.round(studentPercentage)}%)</span>
            </div>
            <Progress value={studentPercentage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Mentors</span>
              <span className="font-medium">{stats.totalMentors} ({Math.round(mentorPercentage)}%)</span>
            </div>
            <Progress value={mentorPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>Platform activity and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Quiz Completion Rate</span>
              <span className="font-medium">{Math.round(quizCompletionRate)}%</span>
            </div>
            <Progress value={quizCompletionRate} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{stats.totalAppointments}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{stats.totalCareers}</p>
              <p className="text-sm text-muted-foreground">Career Options</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Overall platform performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Database Status</span>
              <span className="text-sm font-medium text-success">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Authentication</span>
              <span className="text-sm font-medium text-success">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">API Status</span>
              <span className="text-sm font-medium text-success">Online</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

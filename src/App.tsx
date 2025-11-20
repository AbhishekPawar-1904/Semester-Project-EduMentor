import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Careers from "./pages/Careers";
import Mentors from "./pages/Mentors";
import Quiz from "./pages/Quiz";
import QuizResults from "./pages/QuizResults";
import AdminPanel from "./pages/AdminPanel";
import Scholarships from "./pages/Scholarships";
import Colleges from "./pages/Colleges";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import MentorApplication from "./pages/MentorApplication";
import MentorDashboard from "./pages/MentorDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz-results" element={<QuizResults />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mentor-application" element={<MentorApplication />} />
            <Route path="/mentor-dashboard" element={<MentorDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

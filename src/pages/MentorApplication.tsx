import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const mentorApplicationSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters").max(500, "Bio must be less than 500 characters"),
  expertise: z.string().min(3, "Please provide at least one expertise area"),
  experienceYears: z.number().min(1, "Experience must be at least 1 year").max(50, "Please enter a valid experience"),
  education: z.string().min(10, "Please provide your education details"),
  company: z.string().min(2, "Please provide your company name"),
  hourlyRate: z.number().min(0, "Rate must be positive").max(1000, "Please enter a valid hourly rate"),
});

export default function MentorApplication() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    bio: "",
    expertise: "",
    experienceYears: "",
    education: "",
    company: "",
    hourlyRate: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    if (user) {
      checkExistingApplication();
    }
  }, [user, authLoading, navigate]);

  const checkExistingApplication = async () => {
    try {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setExistingApplication(data);
      }
    } catch (error: any) {
      console.error("Error checking application:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validatedData = mentorApplicationSchema.parse({
        bio: formData.bio,
        expertise: formData.expertise,
        experienceYears: parseInt(formData.experienceYears),
        education: formData.education,
        company: formData.company,
        hourlyRate: parseFloat(formData.hourlyRate),
      });

      const expertiseArray = validatedData.expertise.split(",").map(e => e.trim()).filter(e => e);

      const { error } = await supabase
        .from("mentor_profiles")
        .insert({
          user_id: user?.id,
          bio: validatedData.bio,
          expertise: expertiseArray,
          experience_years: validatedData.experienceYears,
          education: validatedData.education,
          company: validatedData.company,
          hourly_rate: validatedData.hourlyRate,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Application submitted successfully! Waiting for admin approval.");
      navigate("/dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to submit application");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Your mentor application has been {existingApplication.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold">Status: {existingApplication.status}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {existingApplication.status === "pending" && "Your application is under review by our admin team."}
                    {existingApplication.status === "approved" && "Congratulations! You can now start mentoring students."}
                    {existingApplication.status === "rejected" && "Unfortunately, your application was not approved at this time."}
                  </p>
                </div>
                <Button onClick={() => navigate("/dashboard")} className="w-full">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Mentor Application</CardTitle>
            <CardDescription>
              Fill in your details to apply as a mentor. Your application will be reviewed by our admin team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself and your mentoring approach (50-500 characters)"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                  rows={4}
                  minLength={50}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise Areas * (comma-separated)</Label>
                <Input
                  id="expertise"
                  placeholder="e.g., Computer Science, Engineering, Career Planning"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experienceYears">Years of Experience *</Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    placeholder="10"
                    min="1"
                    max="50"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="50"
                    min="0"
                    max="1000"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education *</Label>
                <Input
                  id="education"
                  placeholder="e.g., PhD in Computer Science, MIT"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  required
                  minLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Current Company/Organization *</Label>
                <Input
                  id="company"
                  placeholder="e.g., Tech Career Advisors Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                  minLength={2}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

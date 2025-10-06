import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Award, Calendar, DollarSign, ExternalLink, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Scholarship {
  id: string;
  title: string;
  description: string;
  amount: string;
  eligibility: string;
  deadline: string;
  application_url: string;
}

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .order("deadline");

      if (error) throw error;
      setScholarships(data || []);
    } catch (error: any) {
      toast.error("Failed to load scholarships");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 30 && daysUntilDeadline > 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-warning" />
            </div>
            Scholarship Opportunities
          </h1>
          <p className="text-muted-foreground">
            Find financial aid to support your educational journey
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-warning border-r-transparent"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {scholarships.map((scholarship, index) => (
              <Card 
                key={scholarship.id} 
                className="hover:shadow-lg transition-all hover-lift border-l-4 border-l-warning animate-fade-in" 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2 flex-1">
                      <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <Award className="h-5 w-5 text-warning" />
                      </div>
                      {scholarship.title}
                    </CardTitle>
                    {isDeadlineSoon(scholarship.deadline) && (
                      <Badge variant="destructive" className="animate-pulse">
                        Deadline Soon
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{scholarship.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10">
                    <DollarSign className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Award Amount</p>
                      <p className="text-lg font-bold text-success">{scholarship.amount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Application Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(scholarship.deadline).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5" />
                      <p className="text-sm font-medium">Eligibility Requirements</p>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{scholarship.eligibility}</p>
                  </div>
                  
                  {scholarship.application_url && (
                    <Button asChild className="w-full hover-lift hover:scale-105">
                      <a 
                        href={scholarship.application_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        Apply Now
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

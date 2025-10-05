import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, DollarSign, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .order("deadline", { ascending: true });

      if (error) throw error;
      setScholarships(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Scholarship Opportunities</h1>
            <p className="text-muted-foreground">
              Find financial aid to support your educational journey
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {scholarships.map((scholarship) => (
              <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{scholarship.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {scholarship.amount}
                    </Badge>
                    {scholarship.deadline && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(scholarship.deadline).toLocaleDateString()}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{scholarship.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Eligibility</p>
                    <p className="text-sm text-muted-foreground">{scholarship.eligibility}</p>
                  </div>
                  {scholarship.application_url && (
                    <Button
                      onClick={() => window.open(scholarship.application_url, "_blank")}
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Apply Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {scholarships.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No scholarships available at the moment. Check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

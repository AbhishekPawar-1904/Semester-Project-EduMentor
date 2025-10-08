import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ExternalLink, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  career_id: string;
  created_by: string;
  language: string;
  thumbnail_url: string;
  created_at: string;
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      toast.error("Failed to load resources");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const types = [...new Set(resources.map((r) => r.type))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-primary p-4 rounded-2xl shadow-glow animate-bounce-in">
              <BookOpen className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent animate-slide-in-left">
            Career Resources
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-in-right" style={{animationDelay: '0.1s'}}>
            Explore curated resources to help you on your career journey
          </p>
        </div>

        <div className="mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 justify-center animate-fade-in" style={{animationDelay: '0.3s'}}>
          <Badge
            variant="outline"
            className={`cursor-pointer transition-all hover:scale-105 ${
              searchQuery === "" ? "bg-primary text-primary-foreground" : ""
            }`}
            onClick={() => setSearchQuery("")}
          >
            All
          </Badge>
          {types.map((type) => (
            <Badge
              key={type}
              variant="outline"
              className={`cursor-pointer transition-all hover:scale-105 ${
                searchQuery === type ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => setSearchQuery(type)}
            >
              {type}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <Card
                key={resource.id}
                className="hover-lift transition-all group animate-scale-in"
                style={{animationDelay: `${0.1 * (index % 9)}s`}}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {resource.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {resource.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-primary hover:text-primary-foreground transition-all group-hover:scale-105"
                    onClick={() => window.open(resource.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Resource
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredResources.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;

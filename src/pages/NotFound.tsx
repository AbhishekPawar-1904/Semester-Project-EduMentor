import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, SearchX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero bg-grid-pattern p-4">
      <div className="text-center max-w-2xl mx-auto animate-scale-in">
        <div className="mb-8 animate-bounce-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-primary shadow-glow mb-6">
            <SearchX className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 animate-slide-in-left">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-foreground mb-4 animate-slide-in-right" style={{animationDelay: '0.1s'}}>
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
            Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{animationDelay: '0.3s'}}>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate("/")}
            className="gap-2 hover:scale-105 transition-transform hover-glow"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

import { Link } from "react-router-dom";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-fade-in">
          {/* Brand Section */}
          <div className="space-y-4 animate-slide-in-left">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                EduMentor
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering students with AI-powered career guidance and mentorship opportunities.
            </p>
          </div>

          {/* Quick Links */}
          <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
            <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/mentors" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Find Mentors
                </Link>
              </li>
              <li>
                <Link to="/colleges" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Colleges
                </Link>
              </li>
              <li>
                <Link to="/scholarships" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Scholarships
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/resources" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Learning Resources
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Career Quiz
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="animate-slide-in-right" style={{animationDelay: '0.3s'}}>
            <h3 className="font-semibold mb-4 text-foreground">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@edumentor.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EduMentor. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

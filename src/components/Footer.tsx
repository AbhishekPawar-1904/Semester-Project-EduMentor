import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-hero rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">EduMentor</span>
            </div>
            <p className="text-muted leading-relaxed">
              Empowering students to discover their ideal career paths through personalized guidance, expert mentorship, and comprehensive educational resources.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/careers" className="block text-muted hover:text-background transition-colors">
                Career Exploration
              </Link>
              <Link to="/mentors" className="block text-muted hover:text-background transition-colors">
                Find Mentors
              </Link>
              <Link to="/colleges" className="block text-muted hover:text-background transition-colors">
                College Search
              </Link>
              <Link to="/scholarships" className="block text-muted hover:text-background transition-colors">
                Scholarships
              </Link>
              <Link to="/quiz" className="block text-muted hover:text-background transition-colors">
                Aptitude Quiz
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Resources</h3>
            <div className="space-y-3">
              <Link to="/about" className="block text-muted hover:text-background transition-colors">
                About Us
              </Link>
              <Link to="/blog" className="block text-muted hover:text-background transition-colors">
                Career Blog
              </Link>
              <Link to="/success-stories" className="block text-muted hover:text-background transition-colors">
                Success Stories
              </Link>
              <Link to="/help" className="block text-muted hover:text-background transition-colors">
                Help Center
              </Link>
              <Link to="/privacy" className="block text-muted hover:text-background transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-muted">support@edumentor.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-muted">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-muted">123 Education St, Learning City, LC 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-muted/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-muted text-sm">
            © 2024 EduMentor. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link to="/terms" className="text-muted hover:text-background transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-muted hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="text-muted hover:text-background transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
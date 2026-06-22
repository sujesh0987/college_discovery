import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 bg-primary text-white rounded-lg">
                <GraduationCap size={22} />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                CollegeDiscovery
              </span>
            </Link>
            <p className="text-sm text-secondary-text leading-relaxed">
              Empowering students across India to search, compare, and make informed choices for higher education.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="text-secondary-text hover:text-primary transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-secondary-text hover:text-primary transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="text-secondary-text hover:text-primary transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-dark-text tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-secondary-text hover:text-primary transition-colors">
                  Search Colleges
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-secondary-text hover:text-primary transition-colors">
                  Compare Tool
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-secondary-text hover:text-primary transition-colors">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Stream Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-dark-text tracking-wider uppercase mb-4">Popular Streams</h3>
            <ul className="space-y-2 text-sm text-secondary-text">
              <li>
                <Link to="/?stream=Engineering" className="hover:text-primary transition-colors">
                  Engineering (B.Tech / M.Tech)
                </Link>
              </li>
              <li>
                <Link to="/?stream=MBA" className="hover:text-primary transition-colors">
                  Management (MBA / BBA)
                </Link>
              </li>
              <li>
                <Link to="/?stream=Medical" className="hover:text-primary transition-colors">
                  Medical (MBBS / BDS)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-dark-text tracking-wider uppercase mb-4">Get In Touch</h3>
            <ul className="space-y-3 text-sm text-secondary-text">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Connaught Place, New Delhi, 110001, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary shrink-0" />
                <span>+91 11 4321 8765</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary shrink-0" />
                <a href="mailto:support@collegediscovery.in" className="hover:text-primary transition-colors">
                  support@collegediscovery.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-secondary-text">
          <p>&copy; {new Date().getFullYear()} CollegeDiscovery. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

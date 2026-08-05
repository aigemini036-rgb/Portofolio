import { Github, Linkedin, Instagram, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { profile } = usePortfolio();

  return (
    <footer className="bg-gray-950 py-12 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="text-center md:text-left">
          <a href="#home" className="text-2xl font-bold text-white tracking-tighter mb-2 block">
            Porto<span className="text-indigo-500">folio.</span>
          </a>
          <p className="text-gray-500 text-sm">
            Membangun pengalaman digital dengan sepenuh hati.
          </p>
        </div>

        <div className="flex gap-4">
          {profile?.github && (
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 transition-all">
              <Github size={20} />
            </a>
          )}
          {profile?.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 transition-all">
              <Linkedin size={20} />
            </a>
          )}
          {profile?.instagram && (
            <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 transition-all">
              <Instagram size={20} />
            </a>
          )}
          {profile?.email && (
            <a href={`mailto:${profile.email}`} className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 transition-all">
              <Mail size={20} />
            </a>
          )}
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
        <p className="text-gray-600 text-sm">
          &copy; {currentYear} Personal Portfolio. Dibuat dengan React & Tailwind.
        </p>
        <Link to="/admin" className="text-gray-700 hover:text-indigo-400 transition-colors flex items-center gap-2 text-sm">
          <Lock size={14} /> Admin
        </Link>
      </div>
    </footer>
  );
}

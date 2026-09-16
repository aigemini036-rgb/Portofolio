import { motion } from 'motion/react';
import { usePortfolio } from '../context/PortfolioContext';

export default function About() {
  const { profile } = usePortfolio();

  // Helper function to convert Google Drive share links to direct image links
  const getDirectImageUrl = (url: string | undefined) => {
    if (!url) return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200";
    
    // Check if it's a Google Drive link
    const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    
    return url;
  };

  return (
    <section id="about" className="py-24 bg-gray-950/75 backdrop-blur-[2px] relative z-10 border-t border-gray-900/60">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tentang <span className="text-indigo-400">Saya</span></h2>
          <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden relative group shadow-2xl border border-gray-800/80 bg-gray-900/50"
          >
            <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
            <img
              src={getDirectImageUrl(profile?.profileImage)}
              alt="Profile/Workspace"
              className="w-full h-[400px] sm:h-[440px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-semibold text-white mb-6">Membangun Web Modern dengan Semangat Belajar</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {profile?.bio1}
            </p>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {profile?.bio2}
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium text-lg mb-2">Pendidikan</h4>
                <p className="text-gray-400 text-sm whitespace-pre-line">{profile?.education}</p>
              </div>
              <div>
                <h4 className="text-white font-medium text-lg mb-2">Pengalaman</h4>
                <p className="text-gray-400 text-sm whitespace-pre-line">{profile?.experience}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

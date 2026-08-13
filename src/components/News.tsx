import { motion } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function News() {
  const { news } = usePortfolio();

  // Helper function to convert Google Drive share links to direct image links
  const getDirectImageUrl = (url: string | undefined) => {
    if (!url) return "";
    const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return url;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (!news || news.length === 0) {
    return null; // Don't show the section if there are no news items
  }

  return (
    <section id="news" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Berita & Update</h2>
          <div className="w-20 h-1 bg-indigo-500 mx-auto rounded-full" />
          <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
            Kabar terbaru seputar proyek, kegiatan, dan pembaruan portofolio.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-300"
            >
              {item.image && (
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img
                    src={getDirectImageUrl(item.image)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              
              <div className="p-6">
                {item.date && (
                  <div className="flex items-center text-indigo-400 text-sm mb-3">
                    <Calendar size={14} className="mr-2" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {item.summary || item.content}
                </p>
                
                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-white hover:text-indigo-400 transition-colors"
                  >
                    Baca selengkapnya <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

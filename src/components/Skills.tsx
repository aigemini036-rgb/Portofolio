import { motion } from 'motion/react';
import { usePortfolio } from '../context/PortfolioContext';
import { Layout, Server, Smartphone, PenTool, Code2 } from 'lucide-react';

const iconMap: Record<string, any> = {
  Layout, Server, Smartphone, PenTool, Code2
};

export default function Skills() {
  const { skills } = usePortfolio();
  
  return (
    <section id="skills" className="py-24 bg-gray-900/70 backdrop-blur-[2px] relative z-10 border-t border-gray-800/60">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Keahlian <span className="text-indigo-400">Teknis</span></h2>
          <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skillGroup, index) => {
            // For Firebase string icon names mapping to lucide icons
            const Icon = iconMap[skillGroup.icon as string] || Code2;
            
            return (
              <motion.div
                key={skillGroup.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-950 p-6 rounded-2xl border border-gray-800 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{skillGroup.name}</h3>
                <ul className="space-y-2">
                  {(skillGroup.items || []).map((item: string) => (
                    <li key={item} className="text-gray-400 flex items-center text-sm">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

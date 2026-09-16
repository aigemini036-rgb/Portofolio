import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Terminal } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

export default function Hero() {
  const { profile, loading } = usePortfolio();
  const [codeText, setCodeText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLines, setTerminalLines] = useState<number>(0);

  const codeSnippet = useMemo(() => {
    return `const developer = {
  name: '${profile?.name || "Developer"}',
  roles: ['${(profile?.roles || []).join("', '")}'],
  isAvailableForHire: true
};`;
  }, [profile]);

  useEffect(() => {
    if (loading) return;
    let currentIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      if (!isDeleting) {
        if (currentIndex <= codeSnippet.length) {
          setCodeText(codeSnippet.slice(0, currentIndex));
          currentIndex++;
          timeoutId = setTimeout(type, 50);
        } else {
          setShowTerminal(true);
          setTimeout(() => setTerminalLines(1), 600);
          setTimeout(() => setTerminalLines(2), 1400);
          setTimeout(() => setTerminalLines(3), 2200);
          
          timeoutId = setTimeout(() => {
            isDeleting = true;
            setShowTerminal(false);
            setTerminalLines(0);
            type();
          }, 5000);
        }
      } else {
        if (currentIndex > 0) {
          currentIndex--;
          setCodeText(codeSnippet.slice(0, currentIndex));
          timeoutId = setTimeout(type, 30);
        } else {
          isDeleting = false;
          timeoutId = setTimeout(type, 500);
        }
      }
    };

    timeoutId = setTimeout(type, 50);

    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(cursorInterval);
    };
  }, [loading, codeSnippet]);

  const highlightCode = (code: string) => {
    const html = code
      .replace(/\b(const|let|var|function|return|true|false)\b/g, '<span class="text-fuchsia-400">$1</span>')
      .replace(/\b(name|roles|passion|isAvailableForHire)(?=:)/g, '<span class="text-indigo-300">$1</span>')
      .replace(/('.*?')/g, '<span class="text-green-400">$1</span>')
      .replace(/(\[.*?\])/g, '<span class="text-yellow-200">$1</span>');
    return { __html: html };
  };

  const rolesText = (profile?.roles || []).join("  •  ") + "  •  ";

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
      {/* Hero Ambient Glow Lights */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.35, 0.55, 0.35]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[420px] h-[420px] bg-gradient-to-br from-indigo-600/40 via-cyan-500/30 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1.1, 0.9, 1.1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] bg-gradient-to-tl from-fuchsia-600/35 via-indigo-600/30 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="order-2 lg:order-1"
        >
          <span className="text-indigo-400 font-medium tracking-wider uppercase text-sm mb-4 block">
            Halo, perkenalkan saya
          </span>
          <div className="min-h-[140px] sm:min-h-[160px] md:min-h-[200px] flex flex-col justify-center mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
              Saya seorang
            </h1>
            <div className="overflow-hidden w-full relative whitespace-nowrap mask-image-gradient">
              <motion.div
                className="inline-block whitespace-nowrap text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 py-2"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ ease: "linear", duration: 30, repeat: Infinity }}
              >
                {rolesText}{rolesText}{rolesText}{rolesText}
              </motion.div>
            </div>
          </div>
          <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
            {profile?.bio1?.substring(0, 150)}...
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#projects"
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
            >
              Lihat Proyek
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-white border border-gray-700 hover:border-gray-500 hover:bg-gray-800 rounded-full transition-all"
            >
              Hubungi Saya
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="order-1 lg:order-2 flex justify-center lg:justify-end w-full"
        >
          <div className="relative w-full max-w-lg mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 blur-3xl opacity-30 animate-pulse rounded-full" />
            
            <div className="relative bg-[#0d1117] rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
              {/* Fake Window Header */}
              <div className="flex items-center px-4 py-3 bg-[#161b22] border-b border-gray-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="mx-auto flex items-center text-xs text-gray-400 gap-2 font-mono">
                  <Terminal size={14} /> developer.ts
                </div>
              </div>
              
              {/* Code Editor Body */}
              <div className="p-6 overflow-x-auto min-h-[280px]">
                <div className="flex">
                  {/* Line Numbers */}
                  <div className="pr-4 text-gray-600 text-right select-none border-r border-gray-800 mr-4 font-mono text-sm sm:text-base leading-loose">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  {/* Code */}
                  <pre className="font-mono text-sm sm:text-base leading-loose">
                    <code className="text-gray-300">
                      <span dangerouslySetInnerHTML={highlightCode(codeText)} />
                      <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} text-indigo-400 font-bold ml-1`}>|</span>
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Terminal Execution Popup */}
            <AnimatePresence>
              {showTerminal && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute -bottom-8 -left-4 md:-bottom-12 md:-left-8 bg-[#0d1117] border border-gray-800 rounded-lg shadow-2xl p-4 w-72 md:w-80 z-20"
                >
                  <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                    <Terminal size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-400 font-mono">bash</span>
                  </div>
                  <div className="font-mono text-xs space-y-2">
                    <p className="text-gray-300">
                      <span className="text-green-400">user@dev</span>
                      <span className="text-fuchsia-400">~/portfolio</span>$ node developer.ts
                    </p>
                    {terminalLines >= 1 && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400">
                        [1/3] Assembling components...
                      </motion.p>
                    )}
                    {terminalLines >= 2 && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400">
                        [2/3] Injecting caffeine... ☕
                      </motion.p>
                    )}
                    {terminalLines >= 3 && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-indigo-400 font-semibold">
                        ✓ Developer ready for hire!
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

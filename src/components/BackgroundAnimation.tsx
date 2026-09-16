import { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface TechParticle {
  id: number;
  text: string;
  x: number; // percentage 0-100
  size: string;
  colorClass: string;
  glowClass: string;
  duration: number;
  delay: number;
  driftX: number;
  rotStart: number;
  rotEnd: number;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const TECH_SYMBOLS = [
  { text: '</>', color: 'text-cyan-400', glow: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]' },
  { text: '{ code }', color: 'text-indigo-400', glow: 'drop-shadow-[0_0_8px_rgba(129,140,248,0.7)]' },
  { text: 'const dev = true;', color: 'text-fuchsia-400', glow: 'drop-shadow-[0_0_8px_rgba(232,121,249,0.7)]' },
  { text: '() => { }', color: 'text-amber-400', glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]' },
  { text: 'async/await', color: 'text-emerald-400', glow: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]' },
  { text: '0100101', color: 'text-blue-400', glow: 'drop-shadow-[0_0_8px_rgba(96,165,250,0.7)]' },
  { text: 'git push', color: 'text-purple-400', glow: 'drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]' },
  { text: 'npm run build', color: 'text-rose-400', glow: 'drop-shadow-[0_0_8px_rgba(251,113,133,0.7)]' },
  { text: '<Component />', color: 'text-cyan-300', glow: 'drop-shadow-[0_0_8px_rgba(103,232,249,0.7)]' },
  { text: '[ TypeScript ]', color: 'text-indigo-300', glow: 'drop-shadow-[0_0_8px_rgba(165,180,252,0.7)]' },
  { text: '&& || !', color: 'text-emerald-300', glow: 'drop-shadow-[0_0_8px_rgba(110,231,183,0.7)]' },
  { text: '⚡ API 200 OK', color: 'text-teal-300', glow: 'drop-shadow-[0_0_8px_rgba(94,234,212,0.7)]' },
  { text: '===', color: 'text-amber-300', glow: 'drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]' },
  { text: 'return state;', color: 'text-violet-400', glow: 'drop-shadow-[0_0_8px_rgba(167,139,250,0.7)]' },
];

export default function BackgroundAnimation() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });

  // Floating code symbols
  const techParticles: TechParticle[] = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const sample = TECH_SYMBOLS[i % TECH_SYMBOLS.length];
      const fontSizes = [
        'text-xs sm:text-sm',
        'text-sm sm:text-base',
        'text-base sm:text-lg font-semibold',
        'text-lg sm:text-xl font-bold',
        'text-xl sm:text-2xl font-black'
      ];
      return {
        id: i,
        text: sample.text,
        x: (i * 4.2 + (i % 3) * 2.5) % 94 + 3,
        size: fontSizes[i % fontSizes.length],
        colorClass: sample.color,
        glowClass: sample.glow,
        duration: 16 + (i % 5) * 3,
        delay: (i * 0.8) % 12,
        driftX: ((i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 15)),
        rotStart: ((i * 37) % 60) - 30,
        rotEnd: ((i * 43) % 80) - 40,
      };
    });
  }, []);

  // Glowing twinkle sparks
  const sparkles: SparkleParticle[] = useMemo(() => {
    const colors = [
      'bg-cyan-400 shadow-[0_0_12px_#22d3ee]',
      'bg-indigo-400 shadow-[0_0_12px_#818cf8]',
      'bg-fuchsia-400 shadow-[0_0_12px_#e879f9]',
      'bg-emerald-400 shadow-[0_0_12px_#34d399]',
      'bg-amber-400 shadow-[0_0_12px_#fbbf24]'
    ];
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      color: colors[i % colors.length],
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5,
    }));
  }, []);

  // Track mouse gently for interactive ambient lighting
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const xPercent = (e.clientX / window.innerWidth) * 100;
      const yPercent = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x: xPercent, y: yPercent });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Dynamic Aurora Gradient Orbs (Smoothly moving & breathing) */}
      <motion.div
        className="absolute w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-indigo-600/40 via-purple-600/35 to-cyan-500/30 blur-[90px] -z-10"
        animate={{
          x: ['-5vw', '35vw', '10vw', '-5vw'],
          y: ['5vh', '40vh', '15vh', '5vh'],
          scale: [1, 1.22, 0.9, 1],
          opacity: [0.45, 0.65, 0.4, 0.45],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-fuchsia-600/35 via-rose-600/25 to-indigo-600/40 blur-[95px] -z-10"
        animate={{
          x: ['5vw', '-30vw', '-5vw', '5vw'],
          y: ['30vh', '10vh', '50vh', '30vh'],
          scale: [1.1, 0.9, 1.25, 1.1],
          opacity: [0.4, 0.6, 0.35, 0.4],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-0 left-1/3 w-[480px] h-[480px] rounded-full bg-gradient-to-t from-cyan-600/30 via-emerald-600/25 to-blue-600/30 blur-[90px] -z-10"
        animate={{
          x: ['-15vw', '15vw', '-5vw', '-15vw'],
          y: ['-10vh', '-35vh', '-5vh', '-10vh'],
          scale: [0.95, 1.18, 0.85, 0.95],
          opacity: [0.35, 0.55, 0.3, 0.35],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 2. Interactive Mouse Glow Follower */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-indigo-500/15 blur-[120px] transition-all duration-700 ease-out -translate-x-1/2 -translate-y-1/2 -z-10"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
        }}
      />

      {/* 3. Tech Matrix Grid Overlay with Radial Fade */}
      <div
        className="absolute inset-0 opacity-[0.16] bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,#000_70%,transparent_100%)]"
      />

      {/* Scanning laser beam light effect */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent shadow-[0_0_15px_#22d3ee]"
        animate={{
          top: ['-5%', '105%'],
          opacity: [0, 0.8, 0.8, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 4,
        }}
      />

      {/* 4. Clearly Visible Floating Code & Dev Symbols */}
      <div className="absolute inset-0 overflow-hidden">
        {techParticles.map((item) => (
          <motion.div
            key={item.id}
            className={`absolute font-mono select-none pointer-events-none whitespace-nowrap ${item.size} ${item.colorClass} ${item.glowClass}`}
            style={{ left: `${item.x}%` }}
            initial={{
              y: '115vh',
              x: 0,
              opacity: 0,
              rotate: item.rotStart,
            }}
            animate={{
              y: '-20vh',
              x: [0, item.driftX, -item.driftX / 2, 0],
              opacity: [0, 0.55, 0.75, 0.6, 0],
              rotate: [item.rotStart, item.rotEnd, item.rotStart],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeInOut',
            }}
          >
            {item.text}
          </motion.div>
        ))}
      </div>

      {/* 5. Twinkling Starlight Dust Particles */}
      <div className="absolute inset-0">
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className={`absolute rounded-full ${sparkle.color}`}
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
            }}
            animate={{
              opacity: [0.15, 0.9, 0.15],
              scale: [0.8, 1.4, 0.8],
              y: [0, -25, 0],
            }}
            transition={{
              duration: sparkle.duration,
              repeat: Infinity,
              delay: sparkle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

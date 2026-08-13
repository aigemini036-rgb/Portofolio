import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { skillsData as defaultSkills, projectsData as defaultProjects } from '../data';

interface PortfolioData {
  profile: any;
  skills: any[];
  projects: any[];
  news: any[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioData>({
  profile: {},
  skills: [],
  projects: [],
  news: [],
  loading: true,
  refreshData: async () => {}
});

const defaultProfile = {
  name: "Siswa SMK",
  roles: ["Siswa SMK Jurusan RPL", "Junior Web Developer", "Tech Enthusiast", "Pemula React"],
  bio1: "Halo! Saya adalah siswa SMK jurusan Rekayasa Perangkat Lunak (RPL) yang sedang antusias belajar pengembangan web. Saat ini saya fokus mempelajari HTML, CSS, JavaScript, dan React.",
  bio2: "Di luar sekolah, saya suka mengerjakan proyek sederhana untuk melatih logika pemrograman, dan bermain game. Saya bercita-cita menjadi seorang Full-Stack Developer yang handal.",
  education: "SMK Jurusan Rekayasa Perangkat Lunak\n(Sedang Menempuh Pendidikan)",
  experience: "Proyek Sekolah & Latihan Mandiri\nFokus Frontend Web",
  email: "hello@example.com",
  phone: "+62 812 3456 7890",
  location: "Jakarta, Indonesia",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/",
  instagram: "https://instagram.com/",
  profileImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200"
};

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortfolioData>({
    profile: defaultProfile,
    skills: defaultSkills,
    projects: defaultProjects,
    news: [],
    loading: true
  });

  const fetchData = async () => {
    try {
      // Fetch Profile
      const { data: profileSnap, error: profileError } = await supabase.from('profile').select('*').eq('id', 'main').single();
      let profile = defaultProfile;
      if (!profileError && profileSnap) {
        profile = { ...defaultProfile, ...profileSnap };
      }

      // Fetch Skills
      const { data: skillsSnap, error: skillsError } = await supabase.from('skills').select('*').order('created_at', { ascending: true });
      let skills = defaultSkills;
      if (!skillsError && skillsSnap && skillsSnap.length > 0) {
        skills = skillsSnap;
      }

      // Fetch Projects
      const { data: projectsSnap, error: projectsError } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      let projects = defaultProjects;
      if (!projectsError && projectsSnap && projectsSnap.length > 0) {
        projects = projectsSnap;
      }

      // Fetch News
      const { data: newsSnap, error: newsError } = await supabase.from('news').select('*');
      let news: any[] = [];
      if (!newsError && newsSnap && newsSnap.length > 0) {
        news = newsSnap;
        // Sort news by date descending if they have a date
        news.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
      }

      setData(prev => ({
        ...prev,
        profile,
        skills,
        projects,
        news,
        loading: false
      }));

    } catch (error) {
      console.error("Error fetching data:", error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PortfolioContext.Provider value={{ ...data, refreshData: fetchData }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { skillsData as defaultSkills, projectsData as defaultProjects } from '../data';

interface PortfolioData {
  profile: any;
  skills: any[];
  projects: any[];
  news: any[];
  loading: boolean;
  refreshData: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioData>({
  profile: {},
  skills: [],
  projects: [],
  news: [],
  loading: true,
  refreshData: async () => {},
  deleteProject: async () => {},
  deleteSkill: async () => {},
  deleteNews: async () => {}
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
  const [data, setData] = useState<PortfolioData>(() => {
    let initialProfile = defaultProfile;
    let initialSkills = defaultSkills;
    let initialProjects = defaultProjects;
    let initialNews: any[] = [];

    try {
      const savedProfile = localStorage.getItem('portfolio_profile');
      if (savedProfile) initialProfile = { ...defaultProfile, ...JSON.parse(savedProfile) };

      const savedSkills = localStorage.getItem('portfolio_skills');
      if (savedSkills) initialSkills = JSON.parse(savedSkills);

      const savedProjects = localStorage.getItem('portfolio_projects');
      if (savedProjects) initialProjects = JSON.parse(savedProjects);

      const savedNews = localStorage.getItem('portfolio_news');
      if (savedNews) initialNews = JSON.parse(savedNews);
    } catch {
      // Ignore localStorage parse errors
    }

    return {
      profile: initialProfile,
      skills: initialSkills,
      projects: initialProjects,
      news: initialNews,
      loading: true,
      refreshData: async () => {}
    };
  });

  const fetchData = async () => {
    try {
      let currentProfile = data.profile || defaultProfile;
      let currentSkills = data.skills || defaultSkills;
      let currentProjects = data.projects || defaultProjects;
      let currentNews = data.news || [];

      // Fetch Profile from Firestore
      try {
        const profileRef = doc(db, 'profile', 'main');
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          const profileImage = profileData.profileImage || profileData.profileimage || profileData.profile_image || defaultProfile.profileImage;
          currentProfile = { 
            ...defaultProfile, 
            ...profileData,
            profileImage
          };
          localStorage.setItem('portfolio_profile', JSON.stringify(currentProfile));
        }
      } catch (err: any) {
        console.warn("Firestore profile fetch notice:", err?.message || err);
      }

      // Fetch Skills from Firestore
      try {
        const skillsCol = collection(db, 'skills');
        const skillsSnap = await getDocs(skillsCol);
        if (!skillsSnap.empty) {
          currentSkills = skillsSnap.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          localStorage.setItem('portfolio_skills', JSON.stringify(currentSkills));
        }
      } catch (err: any) {
        console.warn("Firestore skills fetch notice:", err?.message || err);
      }

      // Fetch Projects from Firestore
      try {
        const projectsCol = collection(db, 'projects');
        const projectsSnap = await getDocs(projectsCol);
        if (!projectsSnap.empty) {
          currentProjects = projectsSnap.docs.map(docSnap => {
            const p: any = docSnap.data();
            return {
              id: docSnap.id,
              ...p,
              demoUrl: p.demoUrl || p.demourl || p.demo_url || '',
              githubUrl: p.githubUrl || p.githuburl || p.github_url || ''
            };
          });
          localStorage.setItem('portfolio_projects', JSON.stringify(currentProjects));
        }
      } catch (err: any) {
        console.warn("Firestore projects fetch notice:", err?.message || err);
      }

      // Fetch News from Firestore
      try {
        const newsCol = collection(db, 'news');
        const newsSnap = await getDocs(newsCol);
        if (!newsSnap.empty) {
          currentNews = newsSnap.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          currentNews.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          });
          localStorage.setItem('portfolio_news', JSON.stringify(currentNews));
        }
      } catch (err: any) {
        console.warn("Firestore news fetch notice:", err?.message || err);
      }

      setData(prev => ({
        ...prev,
        profile: currentProfile,
        skills: currentSkills,
        projects: currentProjects,
        news: currentNews,
        loading: false
      }));

    } catch (error: any) {
      console.warn("Portfolio data fetch error, using local data:", error?.message || error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const deleteProject = async (id: string) => {
    setData(prev => {
      const updated = prev.projects.filter(p => p.id !== id);
      try {
        localStorage.setItem('portfolio_projects', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return { ...prev, projects: updated };
    });

    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err: any) {
      console.warn("Firestore delete project warning:", err?.message || err);
    }
  };

  const deleteSkill = async (id: string) => {
    setData(prev => {
      const updated = prev.skills.filter(s => s.id !== id);
      try {
        localStorage.setItem('portfolio_skills', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return { ...prev, skills: updated };
    });

    try {
      await deleteDoc(doc(db, 'skills', id));
    } catch (err: any) {
      console.warn("Firestore delete skill warning:", err?.message || err);
    }
  };

  const deleteNews = async (id: string) => {
    setData(prev => {
      const updated = prev.news.filter(n => n.id !== id);
      try {
        localStorage.setItem('portfolio_news', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return { ...prev, news: updated };
    });

    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (err: any) {
      console.warn("Firestore delete news warning:", err?.message || err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PortfolioContext.Provider value={{ 
      ...data, 
      refreshData: fetchData,
      deleteProject,
      deleteSkill,
      deleteNews
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);

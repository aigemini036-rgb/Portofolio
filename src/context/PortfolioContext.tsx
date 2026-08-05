import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { skillsData as defaultSkills, projectsData as defaultProjects } from '../data';

interface PortfolioData {
  profile: any;
  skills: any[];
  projects: any[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioData>({
  profile: {},
  skills: [],
  projects: [],
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
    loading: true
  });

  const fetchData = async () => {
    try {
      // Fetch Profile
      const profileRef = doc(db, 'profile', 'main');
      const profileSnap = await getDoc(profileRef);
      let profile = defaultProfile;
      
      if (profileSnap.exists()) {
        profile = { ...defaultProfile, ...profileSnap.data() } as any;
      }

      // Fetch Skills
      const skillsRef = collection(db, 'skills');
      const skillsSnap = await getDocs(skillsRef);
      let skills = defaultSkills;
      if (!skillsSnap.empty) {
        skills = skillsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any;
      }

      // Fetch Projects
      const projectsRef = collection(db, 'projects');
      const projectsSnap = await getDocs(projectsRef);
      let projects = defaultProjects;
      if (!projectsSnap.empty) {
        projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any;
      }

      setData(prev => ({
        ...prev,
        profile,
        skills,
        projects,
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

import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import AdminSkills from './AdminSkills';
import AdminProjects from './AdminProjects';
import AdminNews from './AdminNews';
import AdminSecurity from './AdminSecurity';
import ImageUpload from './ImageUpload';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { isSessionValid, endAdminSession } from '../../lib/authSecurity';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { profile: contextProfile, refreshData } = usePortfolio();

  const [profileData, setProfileData] = useState<any>({
    name: '',
    roles: [],
    bio1: '',
    bio2: ''
  });
  
  const [rolesText, setRolesText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // If admin has a valid session, let them in
    if (isSessionValid()) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && !isSessionValid()) {
        navigate('/admin/login');
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (contextProfile && contextProfile.name) {
      setProfileData(contextProfile);
      setRolesText((contextProfile.roles || []).join(', '));
    }
  }, [contextProfile]);

  const handleLogout = async () => {
    endAdminSession();
    await signOut(auth).catch(() => {});
    navigate('/admin/login');
  };

  const handleSaveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      const rolesArray = rolesText.split(',').map(r => r.trim()).filter(r => r !== '');
      const imageUrl = profileData.profileImage || profileData.profileimage || profileData.profile_image || '';
      
      const payload: any = {
        name: profileData.name || '',
        roles: rolesArray,
        bio1: profileData.bio1 || '',
        bio2: profileData.bio2 || '',
        education: profileData.education || '',
        experience: profileData.experience || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        github: profileData.github || '',
        linkedin: profileData.linkedin || '',
        instagram: profileData.instagram || '',
        profileImage: imageUrl
      };

      // Always save to local cache so user's edits are never lost
      try {
        localStorage.setItem('portfolio_profile', JSON.stringify({
          ...profileData,
          ...payload
        }));
      } catch {
        // Ignore localStorage error
      }

      // Save to Firebase Firestore
      let savedToCloud = false;
      try {
        await setDoc(doc(db, 'profile', 'main'), payload, { merge: true });
        savedToCloud = true;
      } catch (cloudErr: any) {
        console.warn("Firebase save warning:", cloudErr?.message || cloudErr);
      }

      await refreshData();
      if (savedToCloud) {
        setSaveMessage('Profil berhasil disimpan ke Firebase!');
      } else {
        setSaveMessage('Profil berhasil disimpan di browser (penyimpanan lokal).');
      }
    } catch (err: any) {
      console.error(err);
      setSaveMessage('Gagal menyimpan profil: ' + (err?.message || 'Error tidak diketahui'));
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex gap-4 items-center">
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300">Lihat Web &nearr;</a>
          <button onClick={handleLogout} className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-500/20 transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 md:p-12">
        <div className="flex space-x-2 mb-8 bg-gray-900 p-2 rounded-xl border border-gray-800 w-max">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Profil (Hero & About)
          </button>
          <button 
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'skills' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Keahlian
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Proyek
          </button>
          <button 
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'news' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Berita
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-amber-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Keamanan & Sandi
          </button>
        </div>

        {saveMessage && (
          <div className="bg-indigo-500/10 border border-indigo-500/50 text-indigo-300 px-4 py-3 rounded-xl mb-6">
            {saveMessage}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-white mb-6">Edit Profil</h2>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <ImageUpload
                label="Foto Profil"
                value={profileData.profileImage || ''}
                onChange={(url) => setProfileData({...profileData, profileImage: url})}
                helpText="URL gambar dari internet (Google Drive, dll) atau unggah langsung dari perangkat Anda."
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Peran (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={rolesText}
                  onChange={(e) => setRolesText(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="Frontend Developer, UI/UX Enthusiast"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bio Paragraf 1</label>
                <textarea
                  rows={4}
                  value={profileData.bio1}
                  onChange={(e) => setProfileData({...profileData, bio1: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bio Paragraf 2</label>
                <textarea
                  rows={4}
                  value={profileData.bio2}
                  onChange={(e) => setProfileData({...profileData, bio2: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Pendidikan</label>
                <textarea
                  rows={3}
                  value={profileData.education || ''}
                  onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Pengalaman</label>
                <textarea
                  rows={3}
                  value={profileData.experience || ''}
                  onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email || ''}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Telepon</label>
                  <input
                    type="text"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={profileData.location || ''}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">GitHub URL</label>
                  <input
                    type="url"
                    value={profileData.github || ''}
                    onChange={(e) => setProfileData({...profileData, github: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={profileData.linkedin || ''}
                    onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={profileData.instagram || ''}
                    onChange={(e) => setProfileData({...profileData, instagram: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-xl transition-colors disabled:opacity-70"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'skills' && (
          <AdminSkills />
        )}

        {activeTab === 'projects' && (
          <AdminProjects />
        )}

        {activeTab === 'news' && (
          <AdminNews />
        )}

        {activeTab === 'security' && (
          <AdminSecurity />
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import AdminSkills from './AdminSkills';
import AdminProjects from './AdminProjects';
import AdminNews from './AdminNews';
import ImageUpload from './ImageUpload';
import { supabase } from '../../supabase';

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
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
      } else {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/admin/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (contextProfile && contextProfile.name) {
      setProfileData(contextProfile);
      setRolesText((contextProfile.roles || []).join(', '));
    }
  }, [contextProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSaveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      const rolesArray = rolesText.split(',').map(r => r.trim()).filter(r => r !== '');
      const newData = { ...profileData, roles: rolesArray };
      const { error } = await supabase.from('profile').upsert({ id: 'main', ...newData });
      if (error) throw error;
      await refreshData();
      setSaveMessage('Profil berhasil disimpan!');
    } catch (err) {
      console.error(err);
      setSaveMessage('Gagal menyimpan profil.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 4000);
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
      </div>
    </div>
  );
}

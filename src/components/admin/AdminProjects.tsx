import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import ImageUpload from './ImageUpload';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function AdminProjects() {
  const { projects, refreshData } = usePortfolio();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({
      ...project,
      demoUrl: project.demoUrl || project.demourl || project.demo_url || '',
      githubUrl: project.githubUrl || project.githuburl || project.github_url || '',
      tags: (project.tags || []).join(', ')
    });
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({
      title: '',
      description: '',
      image: '',
      tags: '',
      demoUrl: '',
      githubUrl: ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const tagsArray = formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '');
      const demoUrl = formData.demoUrl || formData.demourl || formData.demo_url || '';
      const githubUrl = formData.githubUrl || formData.githuburl || formData.github_url || '';
      
      const payload: any = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        tags: tagsArray,
        demourl: demoUrl,
        githuburl: githubUrl
      };

      // Update local storage backup immediately
      try {
        const stored = localStorage.getItem('portfolio_projects');
        let currentProjects = stored ? JSON.parse(stored) : [...projects];
        if (editingId === 'new') {
          const newProj = { ...payload, id: 'local_' + Date.now(), demoUrl, githubUrl };
          currentProjects = [newProj, ...currentProjects];
        } else {
          currentProjects = currentProjects.map((p: any) => 
            p.id === editingId ? { ...p, ...payload, demoUrl, githubUrl } : p
          );
        }
        localStorage.setItem('portfolio_projects', JSON.stringify(currentProjects));
      } catch {
        // Ignore localStorage errors
      }

      try {
        if (editingId === 'new') {
          await addDoc(collection(db, 'projects'), payload);
        } else {
          await updateDoc(doc(db, 'projects', editingId), payload);
        }
      } catch (cloudErr: any) {
        console.warn("Firestore projects save warning:", cloudErr?.message || cloudErr);
      }

      await refreshData();
      handleCancel();
    } catch (error: any) {
      console.error(error);
      alert('Gagal menyimpan proyek: ' + (error?.message || 'Error tidak diketahui'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus proyek ini?')) return;
    try {
      try {
        const stored = localStorage.getItem('portfolio_projects');
        if (stored) {
          const current = JSON.parse(stored).filter((p: any) => p.id !== id);
          localStorage.setItem('portfolio_projects', JSON.stringify(current));
        }
      } catch {
        // Ignore
      }

      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (cloudErr: any) {
        console.warn("Firestore delete warning:", cloudErr?.message || cloudErr);
      }

      await refreshData();
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus proyek.');
    }
  };

  if (editingId) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-6">
          {editingId === 'new' ? 'Tambah Proyek Baru' : 'Edit Proyek'}
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Judul Proyek</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
              rows={3}
              required
            />
          </div>
          <ImageUpload
            label="Gambar Proyek"
            value={formData.image || ''}
            onChange={(url) => setFormData({ ...formData, image: url })}
            helpText="URL gambar dari internet (Google Drive, dll) atau unggah langsung dari perangkat Anda."
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tags (Pisahkan dengan koma)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              placeholder="HTML, CSS, React"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">URL Live Demo (Opsional)</label>
              <input
                type="text"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">URL GitHub (Opsional)</label>
              <input
                type="text"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-xl transition-colors disabled:opacity-70"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded-xl transition-colors disabled:opacity-70"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Kelola Proyek</h2>
        <button
          onClick={handleAddNew}
          className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Tambah Proyek
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p: any, index: number) => (
          <div key={p.id || index} className="p-4 border border-gray-800 rounded-lg bg-gray-950 flex flex-col">
            <img src={getDirectImageUrl(p.image)} alt={p.title} className="w-full h-32 object-cover rounded-md mb-4 bg-gray-800" />
            <h3 className="font-bold text-white mb-2">{p.title}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{p.description}</p>
            
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-800">
              <div className="flex gap-2">
                {p.demoUrl && p.demoUrl !== '#' && (
                  <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline">Demo</a>
                )}
                {p.githubUrl && p.githubUrl !== '#' && (
                  <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline">GitHub</a>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-gray-500 text-center py-4 col-span-full">Belum ada data proyek.</p>
        )}
      </div>
    </div>
  );
}

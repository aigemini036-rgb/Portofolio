import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import ImageUpload from './ImageUpload';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function AdminNews() {
  const { news, refreshData, deleteNews } = usePortfolio();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      ...item
    });
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({
      title: '',
      summary: '',
      image: '',
      date: new Date().toISOString().split('T')[0],
      link: ''
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
      const newData = { ...formData };
      delete newData.id;

      // Update local storage backup immediately
      try {
        const stored = localStorage.getItem('portfolio_news');
        let currentNews = stored ? JSON.parse(stored) : [...news];
        if (editingId === 'new') {
          const newItem = { ...newData, id: 'local_' + Date.now() };
          currentNews = [newItem, ...currentNews];
        } else {
          currentNews = currentNews.map((n: any) => 
            n.id === editingId ? { ...n, ...newData } : n
          );
        }
        localStorage.setItem('portfolio_news', JSON.stringify(currentNews));
      } catch {
        // Ignore localStorage error
      }

      try {
        if (editingId === 'new') {
          await addDoc(collection(db, 'news'), newData);
        } else {
          await updateDoc(doc(db, 'news', editingId), newData);
        }
      } catch (cloudErr: any) {
        console.warn("Firestore news save warning:", cloudErr?.message || cloudErr);
      }

      await refreshData();
      handleCancel();
    } catch (error: any) {
      console.error(error);
      alert('Gagal menyimpan berita: ' + (error?.message || 'Error tidak diketahui'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews(id);
    } catch (error) {
      console.error('Gagal menghapus berita:', error);
    }
  };

  if (editingId) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-6">
          {editingId === 'new' ? 'Tambah Berita Baru' : 'Edit Berita'}
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Judul Berita</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Ringkasan / Konten</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
              rows={4}
              required
            />
          </div>

          <ImageUpload
            label="Gambar Berita"
            value={formData.image || ''}
            onChange={(url) => setFormData({ ...formData, image: url })}
            helpText="URL gambar dari internet (Google Drive, dll) atau unggah langsung dari perangkat Anda."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Tanggal</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">URL Selengkapnya (Opsional)</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
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
        <h2 className="text-2xl font-semibold text-white">Kelola Berita</h2>
        <button
          onClick={handleAddNew}
          className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Tambah Berita
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.map((item: any, index: number) => (
          <div key={item.id || index} className="p-4 border border-gray-800 rounded-lg bg-gray-950 flex flex-col">
            {item.image && (
              <img src={getDirectImageUrl(item.image)} alt={item.title} className="w-full h-32 object-cover rounded-md mb-4 bg-gray-800" />
            )}
            
            <div className="flex-grow">
              {item.date && (
                <p className="text-xs text-indigo-400 mb-2">{new Date(item.date).toLocaleDateString('id-ID')}</p>
              )}
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.summary}</p>
            </div>
            
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-800">
              <div className="flex gap-2">
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline">Lihat Link</a>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {news.length === 0 && (
          <p className="text-gray-500 text-center py-4 col-span-full">Belum ada data berita.</p>
        )}
      </div>

      {/* In-App Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Hapus Berita?</h3>
            <p className="text-sm text-gray-400 mb-6">Apakah Anda yakin ingin menghapus berita ini dari portofolio?</p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  await handleDelete(id);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import ImageUpload from './ImageUpload';
import { supabase } from '../../supabase';

export default function AdminNews() {
  const { news, refreshData } = usePortfolio();
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

      if (editingId === 'new') {
        const { error } = await supabase.from('news').insert([newData]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('news').update(newData).eq('id', editingId);
        if (error) throw error;
      }

      await refreshData();
      handleCancel();
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan berita. Pastikan tabel news ada di Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus berita ini?')) return;
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus berita.');
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
                  onClick={() => handleDelete(item.id)}
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
    </div>
  );
}

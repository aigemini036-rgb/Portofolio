import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function AdminSkills() {
  const { skills, refreshData } = usePortfolio();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (skill: any) => {
    setEditingId(skill.id);
    setFormData({
      ...skill,
      items: (skill.items || []).join(', ')
    });
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({
      name: '',
      icon: 'Layout',
      items: ''
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
      const itemsArray = formData.items.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '');
      const newData = { ...formData, items: itemsArray };
      delete newData.id;

      // Update local storage backup immediately
      try {
        const stored = localStorage.getItem('portfolio_skills');
        let currentSkills = stored ? JSON.parse(stored) : [...skills];
        if (editingId === 'new') {
          const newSkill = { ...newData, id: 'local_' + Date.now() };
          currentSkills = [...currentSkills, newSkill];
        } else {
          currentSkills = currentSkills.map((s: any) => 
            s.id === editingId ? { ...s, ...newData } : s
          );
        }
        localStorage.setItem('portfolio_skills', JSON.stringify(currentSkills));
      } catch {
        // Ignore localStorage error
      }

      try {
        if (editingId === 'new') {
          await addDoc(collection(db, 'skills'), newData);
        } else {
          await updateDoc(doc(db, 'skills', editingId), newData);
        }
      } catch (cloudErr: any) {
        console.warn("Firestore skills save warning:", cloudErr?.message || cloudErr);
      }

      await refreshData();
      handleCancel();
    } catch (error: any) {
      console.error(error);
      alert('Gagal menyimpan keahlian: ' + (error?.message || 'Error tidak diketahui'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus keahlian ini?')) return;
    try {
      try {
        const stored = localStorage.getItem('portfolio_skills');
        if (stored) {
          const current = JSON.parse(stored).filter((s: any) => s.id !== id);
          localStorage.setItem('portfolio_skills', JSON.stringify(current));
        }
      } catch {
        // Ignore
      }

      try {
        await deleteDoc(doc(db, 'skills', id));
      } catch (cloudErr: any) {
        console.warn("Firestore delete warning:", cloudErr?.message || cloudErr);
      }

      await refreshData();
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus keahlian.');
    }
  };

  if (editingId) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-6">
          {editingId === 'new' ? 'Tambah Keahlian Baru' : 'Edit Keahlian'}
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nama Keahlian</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Ikon (lucide-react name)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Item (Pisahkan dengan koma)</label>
            <textarea
              value={formData.items}
              onChange={(e) => setFormData({ ...formData, items: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
              rows={3}
              required
            />
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
        <h2 className="text-2xl font-semibold text-white">Kelola Keahlian</h2>
        <button
          onClick={handleAddNew}
          className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Tambah Keahlian
        </button>
      </div>
      
      <div className="space-y-4">
        {skills.map((s: any, index: number) => (
          <div key={s.id || index} className="p-4 border border-gray-800 rounded-lg bg-gray-950 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-white">{s.name}</h3>
              <p className="text-sm text-gray-500">Ikon: {s.icon}</p>
              <div className="text-sm text-gray-400 mt-2">
                {(s.items || []).join(', ')}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(s)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
        {skills.length === 0 && (
          <p className="text-gray-500 text-center py-4">Belum ada data keahlian.</p>
        )}
      </div>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { ShieldCheck, Lock, KeyRound, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { getAdminPassword, updateAdminPassword } from '../../lib/authSecurity';

export default function AdminSecurity() {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!currentPass || !newPass || !confirmPass) {
      setStatusMsg({ type: 'error', text: 'Semua kolom sandi harus diisi.' });
      return;
    }

    if (newPass !== confirmPass) {
      setStatusMsg({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    if (newPass.length < 5) {
      setStatusMsg({ type: 'error', text: 'Password baru minimal 5 karakter demi keamanan.' });
      return;
    }

    setIsSaving(true);
    try {
      const realPass = await getAdminPassword();
      if (currentPass.trim() !== realPass.trim()) {
        setStatusMsg({ type: 'error', text: 'Password saat ini salah. Periksa kembali sandi Anda.' });
        setIsSaving(false);
        return;
      }

      await updateAdminPassword(newPass);
      setStatusMsg({
        type: 'success',
        text: 'Password admin berhasil diperbarui! Gunakan password baru ini untuk login berikutnya.'
      });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Gagal mengubah password.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Keamanan & Sandi Admin</h2>
            <p className="text-xs text-gray-400">
              Panel admin diproteksi sandi penuh. Tanpa sandi yang valid, pengunjung lain tidak dapat masuk.
            </p>
          </div>
        </div>

        <div className="bg-gray-950/70 border border-gray-800/80 rounded-xl p-4 mb-6 text-sm text-gray-300 flex items-start gap-3">
          <Lock className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-gray-200">Proteksi Autentikasi Aktif</p>
            <p className="text-xs text-gray-400 mt-1">
              Sandi default awal adalah <code className="bg-gray-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">admin</code>. Sangat disarankan untuk segera mengubahnya ke sandi rahasia pribadi Anda di formulir bawah ini.
            </p>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Password Saat Ini
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Masukkan password saat ini (default: admin)"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimal 5 karakter"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 pr-11 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Konfirmasi Password Baru
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <KeyRound size={16} />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Password Baru'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

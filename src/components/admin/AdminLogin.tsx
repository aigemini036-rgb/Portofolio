import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { auth } from '../../firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword 
} from 'firebase/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDirectAccess = () => {
    localStorage.setItem('admin_offline_session', 'true');
    navigate('/admin');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      localStorage.removeItem('admin_offline_session');
      navigate('/admin');
    } catch (err: any) {
      console.warn('Firebase login error:', err);
      let msg = err?.message || 'Terjadi kesalahan saat login.';
      
      if (err?.code === 'auth/operation-not-allowed') {
        msg = 'Metode Email/Password belum diaktifkan di Firebase Console. Anda dapat mengaktifkannya di Firebase Console > Authentication > Sign-in method, atau langsung klik tombol "Masuk Langsung ke Dashboard" di atas.';
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        msg = 'Email atau password belum terdaftar atau salah. Jika belum punya akun, pilih opsi "Daftar Akun Email" di bawah, atau gunakan tombol "Masuk Langsung ke Dashboard".';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = 'Email ini sudah terdaftar. Silakan ganti ke mode "Masuk dengan Email".';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password minimal 6 karakter sesuai standar Firebase.';
      } else if (err?.code === 'auth/network-request-failed') {
        msg = 'Koneksi ke Firebase gagal. Periksa jaringan Anda atau gunakan tombol "Masuk Langsung ke Dashboard".';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      localStorage.removeItem('admin_offline_session');
      navigate('/admin');
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Jendela popup Google ditutup sebelum autentikasi selesai. (Catatan: Iframe preview browser membatasi popup; Anda dapat membuka aplikasi di Tab Baru atau gunakan tombol "Masuk Langsung ke Dashboard").');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In belum diaktifkan di Firebase Console. Silakan aktifkan provider "Google" di tab Authentication Firebase Console, atau gunakan tombol "Masuk Langsung ke Dashboard".');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Domain preview ini belum terdaftar di Firebase Console > Authentication > Settings > Authorized domains.');
      } else {
        setError(err?.message || 'Gagal login via Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">
            Admin Panel
          </h2>
          <p className="text-gray-400 text-sm mt-2 text-center">
            {isRegisterMode ? 'Daftar akun admin baru.' : 'Kelola portofolio Anda dengan mudah.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm break-words">
            {error}
          </div>
        )}

        {/* Instant Access Button */}
        <button
          type="button"
          onClick={handleDirectAccess}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 mb-5 text-sm"
        >
          <ShieldCheck size={18} />
          <span>Masuk Langsung ke Dashboard Admin</span>
          <ArrowRight size={16} />
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-900 px-2 text-gray-500">atau login via Firebase</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mb-4 text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Login dengan Google
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 pr-12 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-400 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                {isRegisterMode ? 'Daftar Akun Email' : 'Masuk dengan Email'}
              </>
            )}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
            }}
            className="text-xs text-amber-400 hover:text-amber-300 underline"
          >
            {isRegisterMode ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Buat akun di sini'}
          </button>
        </div>

        {/* Firebase Info Accordion */}
        <div className="mt-5 pt-4 border-t border-gray-800">
          <div className="bg-gray-950/60 border border-gray-800/80 rounded-xl p-3 text-left">
            <h3 className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
              <span>ℹ️</span> Kenapa Login Firebase Belum Aktif?
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
              Secara default, Google Firebase menonaktifkan metode login <em>Email/Password</em> dan <em>Google</em> pada proyek baru demi keamanan hingga Anda mengaktifkannya di konsol.
            </p>
            <div className="space-y-1 text-[11px] text-gray-300 bg-gray-900/80 p-2 rounded-lg border border-gray-800">
              <p className="font-medium text-gray-200">Cara mengaktifkan:</p>
              <p>1. Buka tab <strong>Authentication &gt; Sign-in method</strong> di Firebase Console.</p>
              <p>2. Aktifkan <strong>Email/Password</strong> atau <strong>Google</strong>.</p>
              <p>3. Atau gunakan tombol <strong>Masuk Langsung ke Dashboard</strong> di atas untuk langsung mengelola konten tanpa perlu setup.</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
            &larr; Kembali ke Halaman Utama Portofolio
          </a>
        </div>
      </div>
    </div>
  );
}

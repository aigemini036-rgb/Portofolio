import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';
import { auth } from '../../firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { verifyAdminPassword, startAdminSession } from '../../lib/authSecurity';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Harap masukkan kata sandi admin.');
      return;
    }

    setLoading(true);
    try {
      let isAuthenticated = false;

      // 1. Try Firebase Authentication if an email is provided
      if (email.trim()) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          if (userCredential.user) {
            isAuthenticated = true;
            startAdminSession(userCredential.user.email || email);
          }
        } catch (fbErr: any) {
          console.warn('Firebase auth attempt info:', fbErr?.code);
        }
      }

      // 2. If not authenticated via Firebase (e.g. provider not enabled, or standard admin password used)
      if (!isAuthenticated) {
        const isMasterValid = await verifyAdminPassword(password);
        if (isMasterValid) {
          isAuthenticated = true;
          startAdminSession(email.trim() || 'admin');
        }
      }

      if (isAuthenticated) {
        navigate('/admin');
      } else {
        setError('Kata sandi admin salah! Akses ke dashboard ditolak.');
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat memverifikasi sandi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        startAdminSession(res.user.email || 'google-admin');
        navigate('/admin');
      }
    } catch (err: any) {
      console.warn('Google sign-in status:', err?.code, err?.message);
      if (err?.code === 'auth/popup-closed-by-user') {
        // Closed by user, no error
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Google Sign-In ditolak Firebase (domain pratinjau belum diotorisasi di console). Silakan gunakan formulir kata sandi di bawah untuk masuk secara aman.');
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
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
            <Lock size={30} />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">
            Login Admin Portofolio
          </h2>
          <p className="text-gray-400 text-xs mt-1.5 text-center">
            Area terbatas. Masukkan kata sandi admin untuk mengakses dashboard.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-5 text-xs flex items-start gap-2.5">
            <ShieldAlert className="shrink-0 mt-0.5 text-red-400" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Secure Credential Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Email atau Akun Admin (Opsional)
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
              placeholder="admin atau email Anda"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Kata Sandi Admin <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 pr-11 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                placeholder="Masukkan kata sandi admin"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-400 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Sandi default awal: <code className="text-amber-400 font-mono bg-gray-800/80 px-1 py-0.5 rounded">admin</code> (dapat Anda ubah di dalam Dashboard).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                <span>Masuk ke Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-gray-900 px-2 text-gray-500">atau login akun terverifikasi</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-gray-800/80 hover:bg-gray-800 border border-gray-700/80 hover:border-gray-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Login via Google
        </button>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
            &larr; Kembali ke Portofolio
          </a>
        </div>
      </div>
    </div>
  );
}

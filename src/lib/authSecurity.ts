import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_PASSWORD = 'admin';
const LOCAL_STORAGE_KEY = 'portfolio_admin_pass';
const SESSION_KEY = 'portfolio_admin_session';

export interface AdminSession {
  user: string;
  loginTime: number;
  expiresAt: number;
}

/**
 * Gets the current configured admin password
 */
export async function getAdminPassword(): Promise<string> {
  // First check local cache for immediate availability
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'admin_auth'));
    if (docSnap.exists() && docSnap.data().password) {
      const pass = docSnap.data().password;
      localStorage.setItem(LOCAL_STORAGE_KEY, pass);
      return pass;
    }
  } catch (err) {
    console.warn('Unable to fetch admin password from Firestore, using local fallback:', err);
  }

  return cached || DEFAULT_PASSWORD;
}

/**
 * Updates the admin password in Firestore and local storage
 */
export async function updateAdminPassword(newPassword: string): Promise<boolean> {
  if (!newPassword || newPassword.length < 5) {
    throw new Error('Password baru minimal 5 karakter.');
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, newPassword);

  try {
    await setDoc(doc(db, 'settings', 'admin_auth'), {
      password: newPassword,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err: any) {
    console.warn('Warning updating password in Firestore:', err?.message || err);
    // Even if firestore warning occurs, local cache is saved
    return true;
  }
}

/**
 * Verifies if the entered password matches the admin password
 */
export async function verifyAdminPassword(enteredPassword: string): Promise<boolean> {
  if (!enteredPassword) return false;
  const currentPassword = await getAdminPassword();
  return enteredPassword.trim() === currentPassword.trim();
}

/**
 * Starts a secure authenticated admin session (expires in 24 hours)
 */
export function startAdminSession(identifier: string = 'admin'): void {
  const session: AdminSession = {
    user: identifier,
    loginTime: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.removeItem('admin_offline_session'); // remove old bypass
}

/**
 * Checks if the current admin session is active and valid
 */
export function isSessionValid(): boolean {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return false;
  try {
    const session: AdminSession = JSON.parse(raw);
    if (!session || !session.expiresAt) return false;
    return Date.now() < session.expiresAt;
  } catch {
    return false;
  }
}

/**
 * Destroys the admin session on logout
 */
export function endAdminSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('admin_offline_session');
}

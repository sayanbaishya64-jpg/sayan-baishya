import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from './db';

const googleProvider = new GoogleAuthProvider();

export async function saveOrUpdateUserProfile(user: User, phone?: string): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  let existingProfile: UserProfile | null = null;

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingProfile = snap.data() as UserProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
  }

  const profile: UserProfile = {
    uid: user.uid,
    name: user.displayName || existingProfile?.name || 'Customer',
    email: user.email || existingProfile?.email || '',
    phone: phone || user.phoneNumber || existingProfile?.phone || '',
    createdAt: existingProfile?.createdAt || new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  try {
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }

  return profile;
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  return await saveOrUpdateUserProfile(result.user);
}

export async function registerWithEmail(
  email: string,
  pass: string,
  name: string,
  phone: string
): Promise<UserProfile> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (name) {
    await updateProfile(result.user, { displayName: name });
  }
  return await saveOrUpdateUserProfile(result.user, phone);
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return await saveOrUpdateUserProfile(result.user);
}

export async function createDemoCustomerSession(
  name: string,
  email: string,
  phone: string
): Promise<UserProfile> {
  const cleanEmail = email.trim() || 'customer@example.com';
  const customUid = `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const profile: UserProfile = {
    uid: customUid,
    name: name.trim() || 'Valued Customer',
    email: cleanEmail,
    phone: phone.trim() || '+91 98765 43210',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  try {
    const userRef = doc(db, 'users', customUid);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${customUid}`);
  }

  localStorage.setItem('cyberpoint_active_user', JSON.stringify(profile));
  return profile;
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem('cyberpoint_active_user');
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out error:', e);
  }
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  // Check local fallback first for instant load
  const cached = localStorage.getItem('cyberpoint_active_user');
  if (cached) {
    try {
      callback(JSON.parse(cached));
    } catch {}
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const prof = snap.data() as UserProfile;
          localStorage.setItem('cyberpoint_active_user', JSON.stringify(prof));
          callback(prof);
        } else {
          const profile = await saveOrUpdateUserProfile(firebaseUser);
          localStorage.setItem('cyberpoint_active_user', JSON.stringify(profile));
          callback(profile);
        }
      } catch (e) {
        const fallbackProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Customer',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        localStorage.setItem('cyberpoint_active_user', JSON.stringify(fallbackProfile));
        callback(fallbackProfile);
      }
    } else {
      if (!localStorage.getItem('cyberpoint_active_user')) {
        callback(null);
      }
    }
  });
}


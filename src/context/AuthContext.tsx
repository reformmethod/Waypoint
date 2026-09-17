import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
import { verifyTOTPCode, generate2FASecret, generateBackupCodes } from '../utils/twoFactor';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  is2FAPending: boolean;
  pendingUser: User | null;
  pendingProfile: UserProfile | null;
  signIn: (email: string, pass: string) => Promise<{ requires2FA: boolean }>;
  signInWithGoogle: () => Promise<{ requires2FA: boolean }>;
  signInWithApple: () => Promise<{ requires2FA: boolean }>;
  signUp: (
    email: string,
    pass: string,
    name?: string,
    enable2FAOnSignup?: boolean
  ) => Promise<{ initialSecret: string; initialBackupCodes: string[]; requires2FA: boolean }>;
  sendPasswordReset: (email: string) => Promise<void>;
  verify2FA: (code: string) => Promise<boolean>;
  verifyBackupCode: (code: string) => Promise<boolean>;
  cancel2FA: () => Promise<void>;
  enable2FA: (secret: string, backupCodes: string[]) => Promise<void>;
  disable2FA: () => Promise<void>;
  updateSponsor: (name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 2FA challenge state
  const [is2FAPending, setIs2FAPending] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setUserProfile(null);
        setIs2FAPending(false);
        setPendingUser(null);
        setPendingProfile(null);
        setLoading(false);
        return;
      }

      // User is logged into Firebase Auth. Check profile for optional 2FA requirement.
      let profile = await fetchUserProfile(firebaseUser.uid);
      if (!profile) {
        // First-time fallback create profile - 2FA is optional and defaults to false
        profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          createdAt: new Date().toISOString(),
          twoFactorEnabled: false,
          twoFactorSecret: '',
          backupCodes: [],
          sponsorName: 'Mike (Sponsor)',
          sponsorPhone: '555-019-2834',
        };
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), profile);
        } catch (e) {
          console.error('Failed to create user profile doc:', e);
        }
      }

      // Check if session has passed 2FA
      const sessionVerified = sessionStorage.getItem(`2fa_ok_${firebaseUser.uid}`);

      if (profile.twoFactorEnabled && !sessionVerified) {
        // Must complete 2FA challenge first!
        setIs2FAPending(true);
        setPendingUser(firebaseUser);
        setPendingProfile(profile);
        setUser(null);
        setUserProfile(null);
      } else {
        // Verified or 2FA not enabled
        setIs2FAPending(false);
        setPendingUser(null);
        setPendingProfile(null);
        setUser(firebaseUser);
        setUserProfile(profile);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthVerification = async (firebaseUser: User) => {
    let profile = await fetchUserProfile(firebaseUser.uid);
    if (!profile) {
      profile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        createdAt: new Date().toISOString(),
        twoFactorEnabled: false, // 2FA is an option
        twoFactorSecret: '',
        backupCodes: [],
        sponsorName: '',
        sponsorPhone: '',
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), profile);
    }

    if (profile.twoFactorEnabled) {
      const sessionVerified = sessionStorage.getItem(`2fa_ok_${firebaseUser.uid}`);
      if (!sessionVerified) {
        setIs2FAPending(true);
        setPendingUser(firebaseUser);
        setPendingProfile(profile);
        setUser(null);
        setUserProfile(null);
        return { requires2FA: true };
      }
    }

    setIs2FAPending(false);
    setPendingUser(null);
    setPendingProfile(null);
    setUser(firebaseUser);
    setUserProfile(profile);
    return { requires2FA: false };
  };

  const signIn = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return handleAuthVerification(cred.user);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    return handleAuthVerification(cred.user);
  };

  const signInWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const cred = await signInWithPopup(auth, provider);
    return handleAuthVerification(cred.user);
  };

  const signUp = async (
    email: string,
    pass: string,
    name?: string,
    enable2FAOnSignup: boolean = false
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }

    const initialSecret = enable2FAOnSignup ? generate2FASecret() : '';
    const initialBackupCodes = enable2FAOnSignup ? generateBackupCodes() : [];

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: name || '',
      createdAt: new Date().toISOString(),
      twoFactorEnabled: enable2FAOnSignup,
      twoFactorSecret: initialSecret,
      backupCodes: initialBackupCodes,
      sponsorName: '',
      sponsorPhone: '',
    };

    await setDoc(doc(db, 'users', cred.user.uid), newProfile);

    if (enable2FAOnSignup) {
      // Prompt 2FA verification code to confirm device setup
      sessionStorage.removeItem(`2fa_ok_${cred.user.uid}`);
      setIs2FAPending(true);
      setPendingUser(cred.user);
      setPendingProfile(newProfile);
      setUser(null);
      setUserProfile(null);
    } else {
      setIs2FAPending(false);
      setPendingUser(null);
      setPendingProfile(null);
      setUser(cred.user);
      setUserProfile(newProfile);
    }

    return { initialSecret, initialBackupCodes, requires2FA: enable2FAOnSignup };
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    const targetUser = pendingUser || user;
    const targetProfile = pendingProfile || userProfile;

    if (!targetUser || !targetProfile || !targetProfile.twoFactorSecret) {
      return false;
    }

    const isValid = await verifyTOTPCode(targetProfile.twoFactorSecret, code);
    if (isValid) {
      sessionStorage.setItem(`2fa_ok_${targetUser.uid}`, 'true');
      setUser(targetUser);
      setUserProfile(targetProfile);
      setIs2FAPending(false);
      setPendingUser(null);
      setPendingProfile(null);
      return true;
    }

    return false;
  };

  const verifyBackupCode = async (code: string): Promise<boolean> => {
    const targetUser = pendingUser || user;
    const targetProfile = pendingProfile || userProfile;

    if (!targetUser || !targetProfile || !targetProfile.backupCodes) {
      return false;
    }

    const normalizedCode = code.trim().toUpperCase();
    const index = targetProfile.backupCodes.findIndex(
      (c) =>
        c.toUpperCase() === normalizedCode ||
        c.replace('-', '').toUpperCase() === normalizedCode.replace('-', '')
    );

    if (index !== -1) {
      // Consume the used backup code
      const updatedCodes = [...targetProfile.backupCodes];
      updatedCodes.splice(index, 1);

      try {
        await updateDoc(doc(db, 'users', targetUser.uid), {
          backupCodes: updatedCodes,
        });
      } catch (err) {
        console.error('Failed to update backup codes:', err);
      }

      const updatedProfile = {
        ...targetProfile,
        backupCodes: updatedCodes,
      };

      sessionStorage.setItem(`2fa_ok_${targetUser.uid}`, 'true');
      setUser(targetUser);
      setUserProfile(updatedProfile);
      setIs2FAPending(false);
      setPendingUser(null);
      setPendingProfile(null);
      return true;
    }

    return false;
  };

  const cancel2FA = async () => {
    setIs2FAPending(false);
    setPendingUser(null);
    setPendingProfile(null);
    setUser(null);
    setUserProfile(null);
    await firebaseSignOut(auth);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const enable2FA = async (secret: string, backupCodes: string[]) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      backupCodes: backupCodes,
    });
    sessionStorage.setItem(`2fa_ok_${user.uid}`, 'true');
    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            twoFactorEnabled: true,
            twoFactorSecret: secret,
            backupCodes: backupCodes,
          }
        : null
    );
  };

  const disable2FA = async () => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      twoFactorEnabled: false,
      twoFactorSecret: '',
      backupCodes: [],
    });
    sessionStorage.removeItem(`2fa_ok_${user.uid}`);
    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            twoFactorEnabled: false,
            twoFactorSecret: '',
            backupCodes: [],
          }
        : null
    );
  };

  const updateSponsor = async (name: string, phone: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      sponsorName: name,
      sponsorPhone: phone,
    });
    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            sponsorName: name,
            sponsorPhone: phone,
          }
        : null
    );
  };

  const logout = async () => {
    if (user) {
      sessionStorage.removeItem(`2fa_ok_${user.uid}`);
    }
    if (pendingUser) {
      sessionStorage.removeItem(`2fa_ok_${pendingUser.uid}`);
    }
    setIs2FAPending(false);
    setPendingUser(null);
    setPendingProfile(null);
    setUser(null);
    setUserProfile(null);
    await firebaseSignOut(auth);
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.uid);
      if (profile) setUserProfile(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        is2FAPending,
        pendingUser,
        pendingProfile,
        signIn,
        signInWithGoogle,
        signInWithApple,
        signUp,
        sendPasswordReset,
        verify2FA,
        verifyBackupCode,
        cancel2FA,
        enable2FA,
        disable2FA,
        updateSponsor,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

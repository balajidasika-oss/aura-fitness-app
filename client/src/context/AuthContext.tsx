import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, UserRole } from '../types';
import { loginUser, registerUser } from '../services/api';
import { soundFx } from '../utils/audio';

interface AuthContextType {
  currentUser: IUser | null;
  isAuthenticated: boolean;
  activeRole: UserRole;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    fitnessGoal?: string;
    phone?: string;
    coachCode?: string;
    avatarUrl?: string;
    avatarFile?: File | Blob | null;
  }) => Promise<void>;
  logout: () => void;
  updateUserLocally: (user: IUser) => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'aura_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [overrideRole, setOverrideRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    if (res.user) {
      soundFx.playCheerSound();
      setCurrentUser(res.user);
      setOverrideRole(null);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    fitnessGoal?: string;
    phone?: string;
    coachCode?: string;
    avatarUrl?: string;
    avatarFile?: File | Blob | null;
  }) => {
    const res = await registerUser(payload);
    if (res.user) {
      soundFx.playSuccessChime();
      setCurrentUser(res.user);
      setOverrideRole(null);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
    }
  };

  const logout = () => {
    soundFx.playTapSound();
    setCurrentUser(null);
    setOverrideRole(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateUserLocally = (user: IUser) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  };

  const switchRole = (role: UserRole) => {
    setOverrideRole(role);
  };

  const activeRole: UserRole = overrideRole || currentUser?.role || 'client';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        activeRole,
        isLoading,
        login,
        register,
        logout,
        updateUserLocally,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

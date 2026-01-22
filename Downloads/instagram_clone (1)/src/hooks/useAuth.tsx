import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string, username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('instagram_user');
    if (savedUser) {
      setAuthState({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (email && password) {
      const user: AuthUser = {
        id: '1',
        username: email.split('@')[0],
        email,
        fullName: 'Demo User',
        avatar: '/images/profile_pics_7.jpeg',
      };

      localStorage.setItem('instagram_user', JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const signup = async (email: string, password: string, fullName: string, username: string) => {
    if (email && password && fullName && username) {
      const user: AuthUser = {
        id: Date.now().toString(),
        username,
        email,
        fullName,
        avatar: '/images/profile_pics_7.jpeg',
      };

      localStorage.setItem('instagram_user', JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    }
    return { success: false, error: 'Please fill all fields' };
  };

  const logout = () => {
    localStorage.removeItem('instagram_user');
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

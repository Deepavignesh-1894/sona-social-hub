import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, user: u } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  };

  const register = async (body) => {
    const { token, user: u } = await authApi.register(body);
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    const u = await authApi.me();
    setUser(u);
    return u;
  };

  const canPost = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'official') return user.isOfficialApproved;
    return true;
  };

  const canCreateGroup = () => user?.role === 'official' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        canPost,
        canCreateGroup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

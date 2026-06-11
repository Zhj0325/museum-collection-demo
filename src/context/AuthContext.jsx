import { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext, getRoleHome, useAuth } from './auth';

export function AuthProvider({ children }) {
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const stored = localStorage.getItem('userInfo');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  const saveAuth = useCallback((tokenVal, user) => {
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('userInfo', JSON.stringify(user));
    setToken(tokenVal);
    setUserInfo(user);
  }, []);

  const logout = useCallback(() => {
    return new Promise((resolve) => {
      if (window.confirm('确定要退出当前账号吗？')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setToken(null);
        setUserInfo(null);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ userInfo, token, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function RequireAuth({ children, role }) {
  const { userInfo } = useAuth();
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  if (role && userInfo.role !== role) {
    return <Navigate to={getRoleHome(userInfo.role)} replace />;
  }
  return children;
}

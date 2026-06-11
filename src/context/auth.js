import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

const ROLE_HOME = {
  ADMIN: '/admin/home',
  STORAGE_KEEPER: '/keeper/home',
  EXHIBITION_MANAGER: '/manager/home',
  EXPERT: '/expert/home'
};

export function getRoleHome(role) {
  return ROLE_HOME[role] || '/login';
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

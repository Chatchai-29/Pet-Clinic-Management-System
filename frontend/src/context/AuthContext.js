// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; // axios instance ที่แนบ Authorization ให้อยู่แล้ว

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // เรียกครั้งแรก: ถ้ามี token -> ดึงโปรไฟล์
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    (async () => {
      try {
        const { data } = await api.get('/api/auth/profile');
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } catch (e) {
        console.warn('Profile fetch failed:', e?.response?.data || e.message);
        setUser(null);
        localStorage.removeItem('user');
      }
    })();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

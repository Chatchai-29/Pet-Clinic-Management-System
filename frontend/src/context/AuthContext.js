// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // โหลดค่าจาก localStorage แบบปลอดภัย
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  // ถ้ามี token ให้ดึงโปรไฟล์ทันที (กันรีเฟรชแล้วเมนูหาย)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    (async () => {
      try {
        // ใช้ /api/auth/me เป็นหลัก ถ้าไม่มีค่อย fallback ไป /api/auth/profile
        let me;
        try {
          me = await api.get('/api/auth/me');
        } catch {
          me = await api.get('/api/auth/profile');
        }
        setUser(me.data);
        localStorage.setItem('user', JSON.stringify(me.data));
      } catch (err) {
        console.warn('Fetch profile failed:', err?.response?.data || err.message);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    })();
  }, []);

  const login = (userData) => {
    setUser(userData || null);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    else localStorage.removeItem('user');
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

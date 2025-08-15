// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { setToken } from '../utils/auth';

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', form);
      if (res.data?.token) setToken(res.data.token);
      nav('/profile');
    } catch (err) {
      
      const status = err?.response?.status;
      if (status === 401) {
        setErrorMsg('Invalid email or password');
      } else {
        setErrorMsg(err?.response?.data?.message || 'Error during login');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <h2>Login</h2>

      {errorMsg && (
        <div style={{ background:'#ffe9e9', color:'#a40000', padding:8, borderRadius:6, marginBottom:8 }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={submit} style={{ display:'grid', gap:8 }}>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange('email')}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange('password')}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

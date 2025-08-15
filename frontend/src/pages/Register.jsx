import React, { useState } from 'react';
import api from '../api/axios';
import { setToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.post('/api/auth/register', form);
    if (res.data?.token) setToken(res.data.token);
    nav('/profile');
  };

  return (
    <form onSubmit={submit} style={{ display:'grid', gap:8, maxWidth:360 }}>
      <h2>Register</h2>
      <input placeholder="Name" value={form.name}
             onChange={e=>setForm({...form, name:e.target.value})} required />
      <input placeholder="Email" type="email" value={form.email}
             onChange={e=>setForm({...form, email:e.target.value})} required />
      <input placeholder="Password" type="password" value={form.password}
             onChange={e=>setForm({...form, password:e.target.value})} required />
      <button type="submit">Create account</button>
    </form>
  );
}

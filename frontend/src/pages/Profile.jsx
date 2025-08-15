// frontend/src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // <- ใช้ axios instance ที่แนบ token อัตโนมัติ

export default function Profile() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
    password: '' // ใส่เฉพาะตอนต้องการเปลี่ยน
  });

  const [loading, setLoading] = useState(true);     // โหลดโปรไฟล์ครั้งแรก
  const [saving, setSaving] = useState(false);      // กดบันทึก
  const [error, setError] = useState('');           // ข้อความเออเรอร์ (ถ้ามี)

  // โหลดโปรไฟล์เมื่อเข้าเพจ
  useEffect(() => {
    (async () => {
      setError('');
      try {
        const res = await api.get('/api/auth/profile'); // GET โปรไฟล์
        const data = res.data || {};
        setForm({
          name: data.name || '',
          email: data.email || '',
          university: data.university || '',
          address: data.address || '',
          password: ''
        });
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          // ไม่มี/หมดอายุ token → กลับไปล็อกอิน
          nav('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch profile.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  const onChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        email: form.email,
        university: form.university,
        address: form.address
      };
      if (form.password) payload.password = form.password; // ส่งเฉพาะถ้ามีการเปลี่ยน
      await api.put('/api/auth/profile', payload);          // PUT อัปเดตโปรไฟล์
      alert('Profile updated successfully!');
      setForm((f) => ({ ...f, password: '' }));            // เคลียร์ช่องรหัสผ่าน
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile.';
      setError(msg);
      alert(`Failed to update profile: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    // ถ้าโปรเจ็กต์คุณมี AuthContext ให้เรียก logout context แทนได้
    localStorage.removeItem('token');
    nav('/login');
  };

  if (loading) return <p style={{ padding: 16 }}>Loading profile...</p>;

  return (
    <div style={{ padding: 16, maxWidth: 480 }}>
      <h2>Profile</h2>

      {error && (
        <div style={{ background: '#ffe9e9', color: '#a40000', padding: 8, margin: '8px 0', borderRadius: 6 }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
        <label>
          <div>Name</div>
          <input
            value={form.name}
            onChange={onChange('name')}
            required
            disabled={saving}
          />
        </label>

        <label>
          <div>Email</div>
          <input
            type="email"
            value={form.email}
            onChange={onChange('email')}
            required
            disabled={saving}
          />
        </label>

        <label>
          <div>University (optional)</div>
          <input
            value={form.university}
            onChange={onChange('university')}
            disabled={saving}
          />
        </label>

        <label>
          <div>Address (optional)</div>
          <input
            value={form.address}
            onChange={onChange('address')}
            disabled={saving}
          />
        </label>

        <label>
          <div>New password (optional)</div>
          <input
            type="password"
            value={form.password}
            onChange={onChange('password')}
            placeholder="Leave blank to keep existing"
            disabled={saving}
          />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button type="button" onClick={logout} disabled={saving}>
            Log out
          </button>
        </div>
      </form>
    </div>
  );
}

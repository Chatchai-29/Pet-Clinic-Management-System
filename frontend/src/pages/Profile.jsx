// frontend/src/pages/Profile.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Profile() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
    password: '' // ใส่เฉพาะตอนต้องการเปลี่ยน
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ชื่อย่อสำหรับ avatar
  const initials = useMemo(() => {
    const src = form.name?.trim() || form.email?.trim() || '?';
    return src
      .split(/\s+/)
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [form.name, form.email]);

  useEffect(() => {
    (async () => {
      setError('');
      try {
        const res = await api.get('/api/auth/profile');
        const data = res.data || {};
        setForm({
          name: data.name || '',
          email: data.email || '',
          university: data.university || '',
          address: data.address || '',
          password: ''
        });
      } catch (err) {
        if (err.response?.status === 401) {
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
      if (form.password) payload.password = form.password; // ส่งเมื่อมีการเปลี่ยน
      await api.put('/api/auth/profile', payload);
      alert('Profile updated successfully!');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile.';
      setError(msg);
      alert(`Failed to update profile: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    nav('/login');
  };

  if (loading) {
    return (
      <div className="container-page" style={{ maxWidth: 760 }}>
        <div className="card">
          <div className="card-body">
            <p className="helper">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page" style={{ maxWidth: 760 }}>
      {/* Header card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: 16,
              background: '#eef2ff', color: '#3730a3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 20
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{form.name || '—'}</div>
            <div className="helper">{form.email || '—'}</div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={logout}>Log out</button>
          </div>
        </div>
      </div>

      {/* Error panel */}
      {error && (
        <div
          className="card"
          style={{ marginBottom: 16, borderColor: '#fecaca', background: '#fff1f2' }}
        >
          <div className="card-body" style={{ color: '#991b1b' }}>
            {error}
          </div>
        </div>
      )}

      {/* Edit form */}
      <div className="card">
        <div className="card-header">Profile details</div>
        <div className="card-body">
          <form className="form-grid" onSubmit={onSubmit}>
            <div>
              <label>Name</label>
              <input
                className="input"
                value={form.name}
                onChange={onChange('name')}
                required
                disabled={saving}
                placeholder="Your name"
              />
            </div>

            <div>
              <label>Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={onChange('email')}
                required
                disabled={saving}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label>University (optional)</label>
              <input
                className="input"
                value={form.university}
                onChange={onChange('university')}
                disabled={saving}
                placeholder="e.g., QUT"
              />
            </div>

            <div>
              <label>Address (optional)</label>
              <input
                className="input"
                value={form.address}
                onChange={onChange('address')}
                disabled={saving}
                placeholder="Street, City"
              />
            </div>

            <div className="sm:col-span-2">
              <label>New password (optional)</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={onChange('password')}
                disabled={saving}
                placeholder="Leave blank to keep existing"
              />
            </div>

            <div className="form-actions sm:col-span-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setForm({ ...form, password: '' })} disabled={saving}>
                Clear password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

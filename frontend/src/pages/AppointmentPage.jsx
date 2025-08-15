import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_APPTS  = 'http://localhost:5001/appointments';
const API_OWNERS = 'http://localhost:5001/owners';
const API_PETS   = 'http://localhost:5001/pets';

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [owners, setOwners] = useState([]);
  const [pets, setPets] = useState([]);
  const [formData, setFormData] = useState({
    ownerId: '',
    petId: '',
    date: '',
    time: '',
    reason: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [o, p, a] = await Promise.all([
        axios.get(API_OWNERS),
        axios.get(API_PETS),
        axios.get(API_APPTS),
      ]);
      setOwners(o.data || []);
      setPets(p.data || []);
      setAppointments(a.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Error fetching initial data. See console.');
    }
  };

  // filter pets by selected owner (UX: กันเลือกผิดเจ้าของ)
  const filteredPets = useMemo(() => {
    if (!formData.ownerId) return [];
    return pets.filter((pt) => {
      const owner = pt.ownerId?._id || pt.ownerId; // support populated or ObjectId
      return String(owner) === String(formData.ownerId);
    });
  }, [pets, formData.ownerId]);

  // ------------- Validation -------------
  const validate = () => {
    const errs = [];
    if (!formData.ownerId) errs.push('Owner is required.');
    if (!formData.petId)   errs.push('Pet is required.');
    if (!formData.date)    errs.push('Date is required.');
    if (!formData.time)    errs.push('Time is required.');

    // Check pet belongs to owner
    if (formData.ownerId && formData.petId) {
      const pet = pets.find(p => String(p._id) === String(formData.petId));
      const ownerOfPet = pet?.ownerId?._id || pet?.ownerId;
      if (pet && String(ownerOfPet) !== String(formData.ownerId)) {
        errs.push('Selected pet does not belong to the selected owner.');
      }
    }

    // Not in the past (local time check)
    if (formData.date && formData.time) {
      const now = new Date();
      const dt = new Date(`${formData.date}T${formData.time}:00`);
      if (!isNaN(dt.getTime()) && dt < now) {
        errs.push('Appointment cannot be in the past.');
      }
    }

    setErrors(errs);
    return errs.length === 0;
  };

  // ------------- Handlers -------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingId) {
        // ใช้ PATCH ตาม TASK-21
        await axios.patch(`${API_APPTS}/${editingId}`, {
          ownerId: formData.ownerId,
          petId: formData.petId,
          date: formData.date,
          time: formData.time,
          reason: formData.reason,
        });
      } else {
        await axios.post(API_APPTS, {
          ownerId: formData.ownerId,
          petId: formData.petId,
          date: formData.date,
          time: formData.time,
          reason: formData.reason,
        });
      }
      clearForm();
      await refetchAppointments();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(`Save failed: ${msg}`);
      console.error(err);
    }
  };

  const refetchAppointments = async () => {
    try {
      const a = await axios.get(API_APPTS);
      setAppointments(a.data || []);
    } catch (err) {
      console.error('Error refetching appointments:', err);
    }
  };

  const handleEdit = (appt) => {
    setEditingId(appt._id);
    setFormData({
      ownerId: appt.ownerId?._id || appt.ownerId,
      petId: appt.petId?._id || appt.petId,
      date: appt.date,
      time: appt.time,
      reason: appt.reason || '',
    });
    setErrors([]);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await axios.patch(`${API_APPTS}/${id}/cancel`);
      await refetchAppointments();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(`Cancel failed: ${msg}`);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment permanently?')) return;
    try {
      await axios.delete(`${API_APPTS}/${id}`);
      await refetchAppointments();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(`Delete failed: ${msg}`);
      console.error(err);
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setFormData({ ownerId: '', petId: '', date: '', time: '', reason: '' });
    setErrors([]);
  };

  // ------------- UI -------------
  return (
    <div style={{ padding: 16 }}>
      <h1>Appointments</h1>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ background: '#ffe9e9', color: '#a40000', padding: 8, marginBottom: 8 }}>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {errors.map((er, i) => <li key={i}>{er}</li>)}
          </ul>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 520, marginBottom: 16 }}>
        <select
          value={formData.ownerId}
          onChange={(e) => {
            setFormData({ ...formData, ownerId: e.target.value, petId: '' });
          }}
          required
        >
          <option value="">Select Owner</option>
          {owners.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
        </select>

        <select
          value={formData.petId}
          onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
          required
          disabled={!formData.ownerId}
        >
          <option value="">{formData.ownerId ? 'Select Pet' : 'Select owner first'}</option>
          {filteredPets.map(p => <option key={p._id} value={p._id}>{p.name} ({p.type})</option>)}
        </select>

        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Reason (optional)"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{editingId ? 'Update Appointment' : 'Book Appointment'}</button>
          {editingId && <button type="button" onClick={clearForm}>Cancel Edit</button>}
        </div>
      </form>

      {/* Table */}
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Pet</th>
            <th>Owner</th>
            <th>Reason</th>
            <th>Status</th>
            <th style={{ width: 220 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: 12 }}>No appointments</td>
            </tr>
          ) : (
            appointments.map(appt => (
              <tr key={appt._id}>
                <td>{appt.date}</td>
                <td>{appt.time}</td>
                <td>{appt.petId?.name || '—'}</td>
                <td>{appt.ownerId?.name || '—'}</td>
                <td>{appt.reason || '—'}</td>
                <td>{appt.status}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => handleEdit(appt)}>Edit</button>
                    {appt.status === 'scheduled' && (
                      <button onClick={() => handleCancel(appt._id)}>Cancel</button>
                    )}
                    <button onClick={() => handleDelete(appt._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ------------- helpers -------------
function isDateTimeInPast(date, time) {
  if (!date || !time) return false;
  const dt = new Date(`${date}T${time}:00`);
  if (isNaN(dt.getTime())) return false;
  return dt < new Date();
}

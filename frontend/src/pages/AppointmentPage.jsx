import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_APPTS  = 'http://localhost:5001/appointments';
const API_OWNERS = 'http://localhost:5001/owners';
const API_PETS   = 'http://localhost:5001/pets';

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [owners, setOwners] = useState([]);
  const [pets, setPets] = useState([]);
  const [formData, setFormData] = useState({ ownerId:'', petId:'', date:'', time:'', reason:'' });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    try {
      const [o, p, a] = await Promise.all([axios.get(API_OWNERS), axios.get(API_PETS), axios.get(API_APPTS)]);
      setOwners(o.data||[]); setPets(p.data||[]); setAppointments(a.data||[]);
    } catch (e) { alert('Error fetching data'); console.error(e); }
  };

  const filteredPets = useMemo(() => {
    if (!formData.ownerId) return [];
    return pets.filter(pt => String(pt.ownerId?._id || pt.ownerId) === String(formData.ownerId));
  }, [pets, formData.ownerId]);

  const validate = () => {
    const errs = [];
    if (!formData.ownerId) errs.push('Owner is required.');
    if (!formData.petId)   errs.push('Pet is required.');
    if (!formData.date)    errs.push('Date is required.');
    if (!formData.time)    errs.push('Time is required.');
    const pet = pets.find(p => String(p._id) === String(formData.petId));
    const ownerOfPet = pet?.ownerId?._id || pet?.ownerId;
    if (pet && String(ownerOfPet) !== String(formData.ownerId)) errs.push('Selected pet does not belong to the owner.');
    const dt = formData.date && formData.time ? new Date(`${formData.date}T${formData.time}:00`) : null;
    if (dt && dt < new Date()) errs.push('Appointment cannot be in the past.');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editingId) {
        await axios.patch(`${API_APPTS}/${editingId}`, formData);
      } else {
        await axios.post(API_APPTS, formData);
      }
      clearForm(); await refetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed'); console.error(err);
    }
  };

  const refetchAppointments = async () => {
    const a = await axios.get(API_APPTS);
    setAppointments(a.data||[]);
  };

  const handleEdit = (appt) => {
    setEditingId(appt._id);
    setFormData({
      ownerId: appt.ownerId?._id || appt.ownerId,
      petId: appt.petId?._id || appt.petId,
      date: appt.date, time: appt.time, reason: appt.reason || ''
    });
    setErrors([]);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await axios.patch(`${API_APPTS}/${id}/cancel`); await refetchAppointments(); }
    catch (e) { alert('Cancel failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete permanently?')) return;
    try { await axios.delete(`${API_APPTS}/${id}`); await refetchAppointments(); }
    catch (e) { alert('Delete failed'); }
  };

  const clearForm = () => { setEditingId(null); setFormData({ ownerId:'', petId:'', date:'', time:'', reason:'' }); setErrors([]); };

  return (
    <div className="container-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-600">Book, edit, cancel appointments with clean UI.</p>
      </div>

      {errors.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <ul className="list-disc ml-5 text-rose-700">
              {errors.map((er,i)=><li key={i}>{er}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="card mb-6">
        <div className="card-body">
          <div className="card-title">{editingId ? 'Edit appointment' : 'New appointment'}</div>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label className="text-sm text-slate-600">Owner</label>
              <select className="select mt-1" value={formData.ownerId}
                      onChange={e=>setFormData({...formData, ownerId:e.target.value, petId:''})}>
                <option value="">Select owner</option>
                {owners.map(o=> <option key={o._id} value={o._id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Pet</label>
              <select className="select mt-1" value={formData.petId}
                      onChange={e=>setFormData({...formData, petId:e.target.value})}
                      disabled={!formData.ownerId}>
                <option value="">{formData.ownerId ? 'Select pet' : 'Select owner first'}</option>
                {filteredPets.map(p=> <option key={p._id} value={p._id}>{p.name} ({p.type})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Date</label>
              <input className="input mt-1" type="date" value={formData.date}
                     onChange={e=>setFormData({...formData, date:e.target.value})}/>
            </div>
            <div>
              <label className="text-sm text-slate-600">Time</label>
              <input className="input mt-1" type="time" value={formData.time}
                     onChange={e=>setFormData({...formData, time:e.target.value})}/>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-600">Reason</label>
              <input className="input mt-1" placeholder="(optional)" value={formData.reason}
                     onChange={e=>setFormData({...formData, reason:e.target.value})}/>
            </div>
            <div className="form-actions sm:col-span-2">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Book'} appointment
              </button>
              {editingId && <button type="button" onClick={clearForm} className="btn btn-secondary">Cancel edit</button>}
            </div>
          </form>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th><th>Time</th><th>Pet</th><th>Owner</th><th>Reason</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-6 text-slate-500">No appointments</td></tr>
            ) : appointments.map(appt => (
              <tr key={appt._id}>
                <td>{appt.date}</td>
                <td>{appt.time}</td>
                <td>{appt.petId?.name || '—'}</td>
                <td>{appt.ownerId?.name || '—'}</td>
                <td>{appt.reason || '—'}</td>
                <td>
                  <span className={`badge ${
                    appt.status === 'scheduled' ? 'badge-yellow' :
                    appt.status === 'completed' ? 'badge-green' : 'badge-red'
                  }`}>{appt.status}</span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-ghost" onClick={()=>handleEdit(appt)}>Edit</button>
                    {appt.status === 'scheduled' && (
                      <button className="btn btn-secondary" onClick={()=>handleCancel(appt._id)}>Cancel</button>
                    )}
                    <button className="btn btn-danger" onClick={()=>handleDelete(appt._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

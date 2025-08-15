import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_PETS = 'http://localhost:5001/pets';
const API_OWNERS = 'http://localhost:5001/owners';

export default function PetPage() {
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({ name:'', type:'', breed:'', dob:'', ownerId:'' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    const [p, o] = await Promise.all([axios.get(API_PETS), axios.get(API_OWNERS)]);
    setPets(p.data || []); setOwners(o.data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) await axios.put(`${API_PETS}/${editingId}`, formData);
    else await axios.post(API_PETS, formData);
    setFormData({ name:'', type:'', breed:'', dob:'', ownerId:'' }); setEditingId(null);
    fetchAll();
  };

  const handleEdit = (pet) => {
    setEditingId(pet._id);
    setFormData({
      name: pet.name, type: pet.type, breed: pet.breed || '',
      dob: pet.dob ? pet.dob.split('T')[0] : '',
      ownerId: pet.ownerId?._id || pet.ownerId || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pet?')) return;
    await axios.delete(`${API_PETS}/${id}`);
    fetchAll();
  };

  return (
    <div className="container-page">
      <div className="mb-4">
        <h1 style={{ margin: 0 }}>Pets</h1>
        <p className="helper">Manage pet records and link to an owner</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">{editingId ? 'Edit pet' : 'Add pet'}</div>
        <div className="card-body">
          <form className="form-grid" onSubmit={handleSubmit}>
            <div>
              <label>Pet name</label>
              <input className="input" value={formData.name}
                     onChange={(e)=>setFormData({ ...formData, name:e.target.value })}
                     placeholder="e.g., Lucky" required />
            </div>
            <div>
              <label>Type</label>
              <input className="input" value={formData.type}
                     onChange={(e)=>setFormData({ ...formData, type:e.target.value })}
                     placeholder="Dog, Cat..." required />
            </div>
            <div>
              <label>Breed</label>
              <input className="input" value={formData.breed}
                     onChange={(e)=>setFormData({ ...formData, breed:e.target.value })}
                     placeholder="(optional)" />
            </div>
            <div>
              <label>Date of birth</label>
              <input className="input" type="date" value={formData.dob}
                     onChange={(e)=>setFormData({ ...formData, dob:e.target.value })} />
            </div>
            <div>
              <label>Owner</label>
              <select className="select" value={formData.ownerId}
                      onChange={(e)=>setFormData({ ...formData, ownerId:e.target.value })} required>
                <option value="">Select owner</option>
                {owners.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
              </select>
            </div>
            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update pet' : 'Add pet'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setEditingId(null); setFormData({ name:'', type:'', breed:'', dob:'', ownerId:'' });
                }}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Type</th><th>Breed</th><th>DOB</th><th>Owner</th><th style={{width:200}}>Actions</th></tr>
          </thead>
          <tbody>
            {pets.length === 0 ? (
              <tr><td className="empty" colSpan="6">No pets</td></tr>
            ) : pets.map((pet) => (
              <tr key={pet._id}>
                <td>{pet.name}</td>
                <td>{pet.type}</td>
                <td>{pet.breed || '—'}</td>
                <td>{pet.dob ? pet.dob.split('T')[0] : '—'}</td>
                <td>{pet.ownerId?.name || '—'}</td>
                <td>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <button className="btn btn-ghost" onClick={()=>handleEdit(pet)}>Edit</button>
                    <button className="btn btn-danger" onClick={()=>handleDelete(pet._id)}>Delete</button>
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

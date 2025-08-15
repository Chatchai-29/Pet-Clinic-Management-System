// src/pages/OwnerPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/owners';

export default function OwnerPage() {
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const res = await axios.get(API_BASE);
      setOwners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, formData);
      } else {
        await axios.post(API_BASE, formData);
      }
      setFormData({ name: '', phone: '' });
      setEditingId(null);
      fetchOwners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (owner) => {
    setEditingId(owner._id);
    setFormData({ name: owner.name, phone: owner.phone });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this owner?')) {
      try {
        await axios.delete(`${API_BASE}/${id}`);
        fetchOwners();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <h1>Owner Management</h1>
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Owner Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
        <button type="submit">{editingId ? 'Update' : 'Add'} Owner</button>
      </form>

      {/* Table */}
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {owners.map((owner) => (
            <tr key={owner._id}>
              <td>{owner.name}</td>
              <td>{owner.phone}</td>
              <td>
                <button onClick={() => handleEdit(owner)}>Edit</button>
                <button onClick={() => handleDelete(owner._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

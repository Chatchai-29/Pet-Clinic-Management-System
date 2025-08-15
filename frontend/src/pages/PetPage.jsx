import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_PETS = 'http://localhost:5001/pets';
const API_OWNERS = 'http://localhost:5001/owners';

export default function PetPage() {
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    dob: '',
    ownerId: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPets();
    fetchOwners();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await axios.get(API_PETS);
      setPets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await axios.get(API_OWNERS);
      setOwners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_PETS}/${editingId}`, formData);
      } else {
        await axios.post(API_PETS, formData);
      }
      setFormData({ name: '', type: '', breed: '', dob: '', ownerId: '' });
      setEditingId(null);
      fetchPets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (pet) => {
    setEditingId(pet._id);
    setFormData({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      dob: pet.dob ? pet.dob.split('T')[0] : '',
      ownerId: pet.ownerId?._id || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this pet?')) {
      try {
        await axios.delete(`${API_PETS}/${id}`);
        fetchPets();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <h1>Pet Management</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Pet Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Breed"
          value={formData.breed}
          onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
        />
        <input
          type="date"
          value={formData.dob}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
        />
        <select
          value={formData.ownerId}
          onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
          required
        >
          <option value="">Select Owner</option>
          {owners.map((o) => (
            <option key={o._id} value={o._id}>
              {o.name}
            </option>
          ))}
        </select>
        <button type="submit">{editingId ? 'Update' : 'Add'} Pet</button>
      </form>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Breed</th>
            <th>DOB</th>
            <th>Owner</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pets.map((pet) => (
            <tr key={pet._id}>
              <td>{pet.name}</td>
              <td>{pet.type}</td>
              <td>{pet.breed}</td>
              <td>{pet.dob ? pet.dob.split('T')[0] : ''}</td>
              <td>{pet.ownerId?.name || 'N/A'}</td>
              <td>
                <button onClick={() => handleEdit(pet)}>Edit</button>
                <button onClick={() => handleDelete(pet._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";

// ✅ ฟังก์ชันแปลงวันที่เป็น YYYY/MM/DD
const formatYMD = (value) => {
  if (!value) return "—";
  const raw = typeof value === "string" ? value.split("T")[0] : value;
  const d = new Date(value);
  if (!isNaN(d)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}/${m}/${day}`;
  }
  const [y, m, day] = String(raw).split("-");
  if (y && m && day) return `${y}/${m}/${day}`;
  return "—";
};

export default function PetPage() {
  const [pets, setPets] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    dob: "",
  });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/pets");
      setPets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/api/pets", formData);
      setFormData({ name: "", species: "", breed: "", dob: "" });
      fetchPets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Pet Management</h2>

      {/* ฟอร์มเพิ่มสัตว์ */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          className="border p-2 w-full"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="species"
          placeholder="Species"
          className="border p-2 w-full"
          value={formData.species}
          onChange={handleChange}
        />
        <input
          type="text"
          name="breed"
          placeholder="Breed"
          className="border p-2 w-full"
          value={formData.breed}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dob"
          className="border p-2 w-full"
          value={formData.dob}
          onChange={handleChange}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Add Pet
        </button>
      </form>

      {/* ตารางสัตว์ */}
      <table className="table-auto border-collapse border border-gray-400 w-full">
        <thead>
          <tr>
            <th className="border border-gray-400 px-4 py-2">Name</th>
            <th className="border border-gray-400 px-4 py-2">Species</th>
            <th className="border border-gray-400 px-4 py-2">Breed</th>
            <th className="border border-gray-400 px-4 py-2">Date of Birth</th>
          </tr>
        </thead>
        <tbody>
          {pets.map((pet) => (
            <tr key={pet._id}>
              <td className="border border-gray-400 px-4 py-2">{pet.name}</td>
              <td className="border border-gray-400 px-4 py-2">{pet.species}</td>
              <td className="border border-gray-400 px-4 py-2">{pet.breed}</td>
              {/* ✅ ใช้ฟังก์ชันฟอร์แมตวันที่ */}
              <td className="border border-gray-400 px-4 py-2">
                {formatYMD(pet.dob)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

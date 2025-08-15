// backend/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointmentModel');

// GET /appointments  (รองรับ filter)
router.get('/', async (req, res) => {
  try {
    const { ownerId, petId, status, date } = req.query;
    const filter = {};
    if (ownerId) filter.ownerId = ownerId;
    if (petId) filter.petId = petId;
    if (status) filter.status = status;
    if (date) filter.date = date; // 'YYYY-MM-DD'

    const items = await Appointment.find(filter)
      .sort({ date: 1, time: 1 })
      .populate('ownerId', 'name phone')
      .populate('petId', 'name type');

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /appointments/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Appointment.findById(req.params.id)
      .populate('ownerId', 'name phone')
      .populate('petId', 'name type');
    if (!item) return res.status(404).json({ message: 'Appointment not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /appointments
router.post('/', async (req, res) => {
  try {
    const { petId, ownerId, date, time, reason } = req.body;
    if (!petId || !ownerId || !date || !time) {
      return res.status(400).json({ message: 'petId, ownerId, date, time are required' });
    }

    const appt = new Appointment({
      petId,
      ownerId,
      date,   // e.g. '2025-08-16'
      time,   // e.g. '10:30'
      reason, // optional
      // status default = 'scheduled' (ใน model)
    });

    const saved = await appt.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /appointments/:id  (อัปเดตทั่วไป)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Appointment not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /appointments/:id  (ลบจริง; TASK-23 จะเพิ่ม cancel แบบเปลี่ยนสถานะ)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointmentModel');

async function findConflict({ petId, date, time, excludeId }) {
  const query = { petId, date, time, status: 'scheduled' };
  if (excludeId) query._id = { $ne: excludeId };
  return Appointment.exists(query);
}

router.patch('/:id', async (req, res) => {
  try {
    const current = await Appointment.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Appointment not found' });

    // ค่าที่จะใช้ตรวจซ้ำ: ถ้า body ไม่ส่งมาก็ใช้ค่าปัจจุบัน
    const nextPetId = req.body.petId ?? String(current.petId);
    const nextDate  = req.body.date  ?? current.date;
    const nextTime  = req.body.time  ?? current.time;
    const nextStatus = req.body.status ?? current.status;

    if (nextStatus === 'scheduled') {
      const conflict = await findConflict({
        petId: nextPetId,
        date:  nextDate,
        time:  nextTime,
        excludeId: current._id
      });
      if (conflict) {
        return res.status(409).json({
          message: 'Double booking detected: this pet already has an appointment at the same date/time.'
        });
      }
    }

    Object.assign(current, req.body);
    const saved = await current.save();
    res.json(saved);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({
        message: 'Double booking detected by database constraint (pet, date, time).'
      });
    }
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/cancel', async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('ownerId', 'name phone')
     .populate('petId', 'name type');

    if (!updated) return res.status(404).json({ message: 'Appointment not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /appointments  (รองรับ filter)
router.get('/', async (req, res) => {
  try {
    const { ownerId, petId, status, date } = req.query;
    const filter = {};
    if (ownerId) filter.ownerId = ownerId;
    if (petId) filter.petId = petId;
    if (status) filter.status = status;
    if (date) filter.date = date;

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

    //(petId + date + time + status=scheduled)
    const conflict = await findConflict({ petId, date, time });
    if (conflict) {
      return res.status(409).json({
        message: 'Double booking detected: this pet already has an appointment at the same date/time.'
      });
    }

    const appt = new Appointment({ petId, ownerId, date, time, reason });
    const saved = await appt.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({
        message: 'Double booking detected by database constraint (pet, date, time).'
      });
    }
    res.status(400).json({ message: err.message });
  }
});

// PUT /appointments/:id
router.put('/:id', async (req, res) => {
  try {
    const body = req.body || {};
    const current = await Appointment.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Appointment not found' });

    const petId = body.petId || String(current.petId);
    const date = body.date || current.date;
    const time = body.time || current.time;
    const status = body.status || current.status;

    if (status === 'scheduled') {
      const conflict = await findConflict({
        petId,
        date,
        time,
        excludeId: req.params.id
      });
      if (conflict) {
        return res.status(409).json({
          message: 'Double booking detected: this pet already has an appointment at the same date/time.'
        });
      }
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({
        message: 'Double booking detected by database constraint (pet, date, time).'
      });
    }
    res.status(400).json({ message: err.message });
  }
});

// DELETE /appointments/:id
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

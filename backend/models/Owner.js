const mongoose = require('mongoose');

const OwnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Owner', OwnerSchema);

const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  licenseExpiry: { type: Date, required: true },
  status: { type: String, enum: ['available', 'on-trip', 'off-duty', 'inactive'], default: 'available' },
  address: { type: String },
  dateOfBirth: { type: Date },
  joiningDate: { type: Date, default: Date.now },
  totalTrips: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);

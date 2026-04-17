const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  type: { type: String, enum: ['car', 'truck', 'van', 'bus', 'motorcycle', 'other'], default: 'car' },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'], default: 'petrol' },
  status: { type: String, enum: ['active', 'inactive', 'maintenance', 'retired'], default: 'active' },
  color: { type: String },
  mileage: { type: Number, default: 0 },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  lastServiceDate: { type: Date },
  nextServiceDate: { type: Date },
  insuranceExpiry: { type: Date },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);

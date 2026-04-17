const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  type: { type: String, enum: ['oil-change', 'tire-rotation', 'brake-service', 'engine-repair', 'general-service', 'other'], required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  serviceDate: { type: Date, required: true },
  nextServiceDate: { type: Date },
  mileageAtService: { type: Number },
  serviceProvider: { type: String },
  status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);

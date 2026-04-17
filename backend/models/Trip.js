const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  startMileage: { type: Number, required: true },
  endMileage: { type: Number },
  distance: { type: Number },
  purpose: { type: String },
  status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },
  fuelCost: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

// Auto-calculate distance
tripSchema.pre('save', function(next) {
  if (this.endMileage && this.startMileage) {
    this.distance = this.endMileage - this.startMileage;
  }
  next();
});

module.exports = mongoose.model('Trip', tripSchema);

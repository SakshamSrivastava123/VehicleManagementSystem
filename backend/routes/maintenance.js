const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, vehicle } = req.query;
    let query = {};
    if (status) query.status = status;
    if (vehicle) query.vehicle = vehicle;
    const records = await Maintenance.find(query).populate('vehicle', 'registrationNumber make model').sort('-serviceDate');
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id).populate('vehicle');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const record = await Maintenance.create(req.body);
    // Update vehicle status if in-progress
    if (req.body.status === 'in-progress') {
      await Vehicle.findByIdAndUpdate(req.body.vehicle, { status: 'maintenance' });
    }
    res.status(201).json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const record = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    // If completed, set vehicle back to active
    if (req.body.status === 'completed') {
      await Vehicle.findByIdAndUpdate(record.vehicle, { status: 'active', lastServiceDate: record.serviceDate });
    }
    res.json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

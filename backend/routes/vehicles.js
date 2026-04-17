const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    const { status, type, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) query.$or = [
      { registrationNumber: { $regex: search, $options: 'i' } },
      { make: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
    ];
    const vehicles = await Vehicle.find(query).populate('assignedDriver', 'name phone');
    res.json(vehicles);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('assignedDriver');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create vehicle
router.post('/', async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT update vehicle
router.put('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET stats
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Vehicle.countDocuments();
    const active = await Vehicle.countDocuments({ status: 'active' });
    const maintenance = await Vehicle.countDocuments({ status: 'maintenance' });
    const inactive = await Vehicle.countDocuments({ status: 'inactive' });
    res.json({ total, active, maintenance, inactive });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

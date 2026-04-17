const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const Driver = require('../models/Driver');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, vehicle, driver } = req.query;
    let query = {};
    if (status) query.status = status;
    if (vehicle) query.vehicle = vehicle;
    if (driver) query.driver = driver;
    const trips = await Trip.find(query)
      .populate('vehicle', 'registrationNumber make model')
      .populate('driver', 'name phone')
      .sort('-startTime');
    res.json(trips);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('vehicle').populate('driver');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    if (req.body.status === 'in-progress') {
      await Driver.findByIdAndUpdate(req.body.driver, { status: 'on-trip' });
    }
    res.status(201).json(trip);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (req.body.status === 'completed') {
      await Driver.findByIdAndUpdate(trip.driver, { status: 'available', $inc: { totalTrips: 1 } });
    }
    res.json(trip);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Trip.countDocuments();
    const completed = await Trip.countDocuments({ status: 'completed' });
    const inProgress = await Trip.countDocuments({ status: 'in-progress' });
    const distanceResult = await Trip.aggregate([{ $group: { _id: null, totalDistance: { $sum: '$distance' }, totalFuelCost: { $sum: '$fuelCost' } } }]);
    const { totalDistance = 0, totalFuelCost = 0 } = distanceResult[0] || {};
    res.json({ total, completed, inProgress, totalDistance, totalFuelCost });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

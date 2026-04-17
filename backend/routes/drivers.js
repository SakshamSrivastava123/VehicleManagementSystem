const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { licenseNumber: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
    const drivers = await Driver.find(query);
    res.json(drivers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Driver.countDocuments();
    const available = await Driver.countDocuments({ status: 'available' });
    const onTrip = await Driver.countDocuments({ status: 'on-trip' });
    const offDuty = await Driver.countDocuments({ status: 'off-duty' });
    res.json({ total, available, onTrip, offDuty });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

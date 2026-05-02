const express = require('express');
const router = express.Router();
const Call = require('../models/Call');

const checkPassword = (req, res, next) => {
  const { password } = req.headers;
  if (password !== 'ggits@admin2024') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.get('/calls', checkPassword, async (req, res) => {
  try {
    const calls = await Call.find().sort({ createdAt: -1 });
    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching calls' });
  }
});

router.get('/stats', checkPassword, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalToday = await Call.countDocuments({ createdAt: { $gte: today } });
    const byType = await Call.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: '$queryType', count: { $sum: 1 } } }
    ]);

    res.json({ totalToday, byType });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
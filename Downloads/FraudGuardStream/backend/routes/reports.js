/*
 * Instagram Clone - Reports Routes
 * Created by Phumeh
 */

const express = require('express');
const Report = require('../models/Report');
const auth = require('../middleware/auth');

const router = express.Router();

// Submit report
router.post('/', auth, async (req, res) => {
  try {
    const { reportType, reportedItem, reportedUser, reason, description } = req.body;

    const report = new Report({
      reporter: req.user._id,
      reportType,
      reportedItem,
      reportedUser,
      reason,
      description
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reports (for transparency)
router.get('/my-reports', auth, async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

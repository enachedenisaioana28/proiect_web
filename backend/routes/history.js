'use strict';

const express = require('express');
const router = express.Router();
const historyService = require('../services/historyService');
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const data  = await historyService.getHistory(limit);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
});
router.get('/recent', async (req, res, next) => {
  try {
    const cities = await historyService.getRecentCities(5);
    res.json({ success: true, cities });
  } catch (err) {
    next(err);
  }
});
router.delete('/', async (req, res, next) => {
  try {
    await historyService.clearHistory();
    res.json({ success: true, message: 'Istoricul a fost șters.' });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
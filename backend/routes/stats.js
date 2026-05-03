'use strict';

const express = require('express');
const router = express.Router();
const historyService = require('../services/historyService');
router.get('/', async (req, res, next) => {
  try {
    const stats = await historyService.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
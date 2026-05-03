
const express = require('express');
const router = express.Router();
const WeatherService = require('../services/weatherService');
router.get('/', async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        error: 'Missing parameter',
        message: 'Parameter "city" is required. Example: /api/weather?city=Iași',
      });
    }

    const weather = await WeatherService.getWeather(city);
    res.json(weather);
  } catch (err) {
    next(err);
  }
});

router.get('/convert', (req, res) => {
  try {
    const { temp, unit = 'C' } = req.query;

    if (temp === undefined) {
      return res.status(400).json({
        error: 'Parametrul lipeste',
        message: 'Parametrul "temp" e obligatoriu. Optional: unit (C|F|K), C',
      });
    }

    const tempNum = parseFloat(temp);
    if (isNaN(tempNum)) {
      return res.status(400).json({ error: 'Invalid temperature value' });
    }

    const converted = WeatherService.convertTemp(tempNum, unit);
    const suffix = WeatherService.unitSuffix(unit);

    res.json({
      original: `${tempNum}°C`,
      converted: `${converted}${suffix}`,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
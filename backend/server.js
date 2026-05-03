'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');


const weatherRoutes  = require('./routes/weather');
const historyRoutes  = require('./routes/history');
const statsRoutes    = require('./routes/stats');

const logger     = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(logger);

app.get('/api/health', (req, res) => {
  res.json({
    status : 'OK',
    server : 'WeatherBuddy Backend',
    version: '1.0.0',
    port   : PORT,
    time   : new Date().toISOString(),
  });
});


app.use('/api/weather', weatherRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/stats', statsRoutes);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use(errorHandler);
const server = app.listen(PORT, () => {
  console.log('');
  console.log(`http://localhost:${PORT}`);
  console.log('');
});
module.exports = { app, server };
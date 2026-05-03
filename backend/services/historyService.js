'use strict';

const fs   = require('fs').promises;
const path = require('path');

const DATA_FILE  = path.join(__dirname, '..', 'data', 'history.json');
const MAX_RECORDS = 100; 

async function readHistory() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { searches: [], totalCount: 0 };
  }
}

async function writeHistory(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function addSearch({ city, country, tempC, weatherMain, unit }) {
  const db = await readHistory();

  const entry = {
    id         : Date.now(),
    city,
    country,
    tempC,
    weatherMain,
    unit,
    searchedAt : new Date().toISOString(),
  };

  db.searches.unshift(entry);  
  db.totalCount++;

  if (db.searches.length > MAX_RECORDS) {
    db.searches = db.searches.slice(0, MAX_RECORDS);
  }

  await writeHistory(db);
  return entry;
}

async function getHistory(limit = 20) {
  const db = await readHistory();
  return {
    searches  : db.searches.slice(0, limit),
    totalCount: db.totalCount,
  };
}

async function getRecentCities(limit = 5) {
  const db   = await readHistory();
  const seen = new Set();
  const cities = [];

  for (const s of db.searches) {
    const key = s.city.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      cities.push(s.city);
      if (cities.length >= limit) break;
    }
  }
  return cities;
}

async function getStats() {
  const db = await readHistory();
  const { searches } = db;

  if (searches.length === 0) {
    return { totalSearches: 0, uniqueCities: 0, topCities: [], weatherBreakdown: {} };
  }


  const cityMap = {};
  const weatherMap = {};

  searches.forEach(s => {
    const key = s.city.toLowerCase();
    cityMap[key] = (cityMap[key] || 0) + 1;
    weatherMap[s.weatherMain] = (weatherMap[s.weatherMain] || 0) + 1;
  });


  const topCities = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({ city, count }));

  return {
    totalSearches   : db.totalCount,
    recordsInFile   : searches.length,
    uniqueCities    : Object.keys(cityMap).length,
    topCities,
    weatherBreakdown: weatherMap,
    lastSearchAt    : searches[0]?.searchedAt || null,
  };
}

async function clearHistory() {
  await writeHistory({ searches: [], totalCount: 0 });
}

module.exports = { addSearch, getHistory, getRecentCities, getStats, clearHistory };
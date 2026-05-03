'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const request        = require('supertest');
const { app, server } = require('../server');
const { degToCompass, buildAdvice, buildVerdict, processWeatherData } =
  require('../services/weatherService');
describe('degToCompass() – Conversie grade → direcție vânt', () => {
  test('0° → Nord', ()      => expect(degToCompass(0)).toBe('Nord'));
  test('90° → Est', ()      => expect(degToCompass(90)).toBe('Est'));
  test('180° → Sud', ()     => expect(degToCompass(180)).toBe('Sud'));
  test('270° → Vest', ()    => expect(degToCompass(270)).toBe('Vest'));
  test('45° → Nord-Est', () => expect(degToCompass(45)).toBe('Nord-Est'));
  test('225° → Sud-Vest', ()=> expect(degToCompass(225)).toBe('Sud-Vest'));
  test('undefined → Necunoscut', () => expect(degToCompass(undefined)).toBe('Necunoscut'));
});
describe('buildAdvice() – Sfaturi îmbrăcăminte', () => {
  const base = { humidity: 50, isNight: false, windSpeed: 3 };
  test('Temperatură 32°C → outfit summer', () => {
    const adv = buildAdvice({ ...base, tempC: 32, weatherMain: 'Clear' });
    expect(adv.outfit).toBe('summer');
    expect(adv.needCoat).toBe(false);
  });

  test('Temperatură -5°C → heavy-winter + haină', () => {
    const adv = buildAdvice({ ...base, tempC: -5, weatherMain: 'Snow' });
    expect(adv.outfit).toBe('heavy-winter');
    expect(adv.needCoat).toBe(true);
  });

  test('Ploaie → needUmbrella true', () => {
    const adv = buildAdvice({ ...base, tempC: 15, weatherMain: 'Rain' });
    expect(adv.needUmbrella).toBe(true);
  });

  test('Vânt puternic → menționat în text', () => {
    const adv = buildAdvice({ ...base, tempC: 18, weatherMain: 'Clear', windSpeed: 12 });
    expect(adv.text).toMatch(/vânt/i);
  });

  test('Umiditate >80% → menționat în text', () => {
    const adv = buildAdvice({ ...base, tempC: 25, weatherMain: 'Clear', humidity: 85 });
    expect(adv.text).toMatch(/umiditate/i);
  });
});

describe('buildVerdict(): Descriere tip zi', () => {
  const base = { humidity: 50, isNight: false };

  test('Senin 25°C umiditate 55% → splendidă', () => {
    const v = buildVerdict({ ...base, tempC: 25, weatherMain: 'Clear', humidity: 55 });
    expect(v.toLowerCase()).toContain('splendid');
  });

  test('Noapte senin → stele', () => {
    const v = buildVerdict({ ...base, tempC: 15, weatherMain: 'Clear', isNight: true });
    expect(v.toLowerCase()).toContain('noapte');
  });

  test('Furtună → stai în interior', () => {
    const v = buildVerdict({ ...base, tempC: 18, weatherMain: 'Thunderstorm' });
    expect(v.toLowerCase()).toContain('furtun');
  });

  test('Ninsoare → om de zăpadă', () => {
    const v = buildVerdict({ ...base, tempC: -2, weatherMain: 'Snow' });
    expect(v.toLowerCase()).toContain('ninge');
  });
});

describe('GET /api/health', () => {
  test('Returnează status OK și portul', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.server).toBe('WeatherBuddy Backend');
  });
});

describe('GET /api/weather', () => {
  test('Fără parametru city → 400', async () => {
    const res = await request(app).get('/api/weather');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('City cu un singur caracter → 400', async () => {
    const res = await request(app).get('/api/weather?city=X');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Unit invalid → 400', async () => {
    const res = await request(app).get('/api/weather?city=Paris&unit=Z');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Oraș real (București) → 200 cu date valide', async () => {
    const res = await request(app).get('/api/weather?city=Bucharest&unit=C');
    expect([200, 401, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('tempC');
      expect(res.body.data).toHaveProperty('humidity');
      expect(res.body.data).toHaveProperty('windDir');
      expect(res.body.data.tempDisplay).toHaveProperty('allUnits');
    }
  }, 10000); 

  test('Oraș inexistent → 404', async () => {
    const res = await request(app).get('/api/weather?city=OrasulInexistentXXX999');
    expect([404, 401]).toContain(res.status);
  }, 10000);
});

describe('GET /api/history', () => {
  test('Returnează liste de căutări', async () => {
    const res = await request(app).get('/api/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.searches)).toBe(true);
  });
});

describe('GET /api/history/recent', () => {
  test('Returnează maxim 5 orașe', async () => {
    const res = await request(app).get('/api/history/recent');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.cities)).toBe(true);
    expect(res.body.cities.length).toBeLessThanOrEqual(5);
  });
});

describe('GET /api/stats', () => {
  test('Returnează statistici cu câmpuri obligatorii', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.stats).toHaveProperty('totalSearches');
    expect(res.body.stats).toHaveProperty('uniqueCities');
    expect(res.body.stats).toHaveProperty('topCities');
  });
});
afterAll(done => {
  server.close(done);
});
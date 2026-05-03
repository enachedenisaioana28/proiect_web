const AppState = {
  unit: 'C',
  lastWeather: null,
  recentCities: JSON.parse(localStorage.getItem('wb_recent') || '[]'),
};

const WeatherHelper = {
  unitSuffix: (u) => u === 'C' ? '°C' : (u === 'F' ? '°F' : ' K'),
  convertTemp: (c, u) => {
    if (u === 'F') return parseFloat((c * 9/5 + 32).toFixed(1));
    if (u === 'K') return parseFloat((c + 273.15).toFixed(2));
    return c;
  },
  calculateTime: (offset) => {
    const acum = new Date();
    const utcMs = acum.getTime() + (acum.getTimezoneOffset() * 60000);
    const oraOras = new Date(utcMs + (offset * 1000));
    return `${String(oraOras.getHours()).padStart(2, '0')}:${String(oraOras.getMinutes()).padStart(2, '0')}`;
  }
};

async function searchWeather() {
  const input = document.getElementById('cityInput');
  const city = input?.value?.trim();
  if (!city) return;

  showState('loading');
  try {
    const response = await fetch(`https://proiect-web-0tha.onrender.com/api/weather?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error('Orașul nu a fost găsit');
    const data = await response.json();
    
    AppState.lastWeather = data;

    // 1. Actualizăm Personajul
    if (typeof Character !== 'undefined') {
      Character.updateForWeather(data);
    }
    
    // 2. Actualizăm Fundalul (REPARAT: Fără spații în clase)
    if (typeof Background !== 'undefined') {
      const safeDesc = data.description.toLowerCase().replace(/\s+/g, '-');
      Background.update(safeDesc, data.isNight);
    }

    renderWeather(data);
    saveRecentCity(data.city);
    showState('weather');
  } catch (err) {
    showState('error');
    setText('errMsg', err.message);
  }
}

function renderWeather(data) {
  const u = AppState.unit;
  const suf = WeatherHelper.unitSuffix(u);
  const conv = (c) => WeatherHelper.convertTemp(c, u);
  const oraExacta = WeatherHelper.calculateTime(data.timezone);

  setText('cityName',   `${data.city}, ${data.country}`);
  setText('cityCountry', `UTC${data.timezone >= 0 ? '+' : ''}${data.timezone/3600}`);
  setText('localTime',  oraExacta);
  setText('tempBig', `${conv(data.tempC)}${suf}`);
  
  const alts = [];
  if (u !== 'C') alts.push(`${data.tempC}°C`);
  if (u !== 'F') alts.push(`${parseFloat((data.tempC * 9/5 + 32).toFixed(1))}°F`);
  if (u !== 'K') alts.push(`${parseFloat((data.tempC + 273.15).toFixed(2))} K`);
  setText('tempOthers', alts.join('  ·  '));

  setText('wIcon',  data.emoji || '🌤️');
  setText('wDesc',  data.description);
  setText('verdict', data.verdict);

  setText('dHumidity', `${data.humidity}%`);
  setText('dWind',     `${data.windSpeed} m/s · ${data.windDir}`);
  setText('dFeels',    `${conv(data.feelsC)}${suf}`);
  setText('dSunrise',  data.sunrise);
  setText('dSunset',   data.sunset);
  setText('dVis',      data.visibility !== null ? `${data.visibility} km` : 'N/D');

  if (data.advice) {
    setText('advIco',  data.advice.icon || '🧥');
    setText('advText', data.advice.text);
  }
}

function setUnit(unit) {
  AppState.unit = unit;
  ['C','F','K'].forEach(u => {
    const btn = document.getElementById(`unit${u}`);
    if (btn) btn.classList.toggle('active', u === unit);
  });
  if (AppState.lastWeather) renderWeather(AppState.lastWeather);
}

function saveRecentCity(city) {
  let cities = AppState.recentCities.filter(c => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);
  if (cities.length > 5) cities = cities.slice(0, 5);
  AppState.recentCities = cities;
  localStorage.setItem('wb_recent', JSON.stringify(cities));
  renderChips();
}

function renderChips() {
  const container = document.getElementById('chips');
  const row = document.getElementById('recentRow');
  if (!container) return;
  container.innerHTML = '';
  if (AppState.recentCities.length === 0) {
    if (row) row.style.display = 'none';
    return;
  }
  if (row) row.style.display = 'flex';
  AppState.recentCities.forEach(city => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = city;
    chip.onclick = () => {
      const input = document.getElementById('cityInput');
      if (input) input.value = city;
      searchWeather();
    };
    container.appendChild(chip);
  });
}

function showState(state) {
  const ids = { empty:'emptyCard', loading:'loadCard', error:'errCard', weather:'weatherCard' };
  Object.entries(ids).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = (key === state) ? '' : 'none';
  });
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

document.addEventListener('DOMContentLoaded', () => {
  renderChips();
  const input = document.getElementById('cityInput');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') searchWeather();
    });
  }
  setInterval(() => {
    if (!AppState.lastWeather) return;
    const currentOra = WeatherHelper.calculateTime(AppState.lastWeather.timezone);
    setText('localTime', currentOra);
  }, 30000);
  showState('empty');
});
'use strict';

const fetch = require('node-fetch');
const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE    = process.env.OWM_BASE_URL || 'https://api.openweathermap.org/data/2.5';

const COMPASS_RO = [
  'Nord','Nord-Nord-Est','Nord-Est','Est-Nord-Est',
  'Est','Est-Sud-Est','Sud-Est','Sud-Sud-Est',
  'Sud','Sud-Sud-Vest','Sud-Vest','Vest-Sud-Vest',
  'Vest','Vest-Nord-Vest','Nord-Vest','Nord-Nord-Vest',
];

async function fetchCurrentWeather(city) {
  if (!API_KEY) throw new Error('OPENWEATHER_API_KEY lipsește din .env');
  const url = `${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ro`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 404)
      throw Object.assign(new Error(`Orașul "${city}" nu a fost găsit.`), { status: 404 });
    if (res.status === 401)
      throw Object.assign(new Error('Cheie API OpenWeatherMap invalidă.'), { status: 401 });
    throw Object.assign(new Error(body.message || `Eroare API (${res.status})`), { status: res.status });
  }

  return res.json();
}

function processWeatherData(raw) {
  const { main, weather, wind, sys, timezone, name, visibility, clouds } = raw;
  const wInfo = weather[0];

  const tempC  = parseFloat(main.temp.toFixed(1));
  const feelsC = parseFloat(main.feels_like.toFixed(1))
  const nowUnix = Math.floor(Date.now() / 1000);
  const isNight = nowUnix < sys.sunrise || nowUnix > sys.sunset;

  return {
    city        : name,
    country     : sys.country,
    coords      : { lat: raw.coord.lat, lon: raw.coord.lon },

    tempC,
    tempF       : parseFloat((tempC * 9/5 + 32).toFixed(1)),
    tempK       : parseFloat((tempC + 273.15).toFixed(2)),
    feelsC,
    feelsF      : parseFloat((feelsC * 9/5 + 32).toFixed(1)),
    feelsK      : parseFloat((feelsC + 273.15).toFixed(2)),
    minC        : parseFloat(main.temp_min.toFixed(1)),
    maxC        : parseFloat(main.temp_max.toFixed(1)),

    humidity    : main.humidity,
    pressure    : main.pressure,
    description : wInfo.description,
    weatherMain : wInfo.main,
    weatherId   : wInfo.id,
    iconCode    : wInfo.icon,
    iconUrl     : `https://openweathermap.org/img/wn/${wInfo.icon}@2x.png`,
    cloudiness  : clouds?.all ?? null,
    visibility  : visibility ? parseFloat((visibility / 1000).toFixed(1)) : null,

  
    windSpeed   : wind.speed,
    windDeg     : wind.deg,
    windDir     : degToCompass(wind.deg),
    windGust    : wind.gust ?? null,

   
    sunrise     : unixToHHMM(sys.sunrise, timezone),
    sunset      : unixToHHMM(sys.sunset,  timezone),
    sunriseUnix : sys.sunrise,
    sunsetUnix  : sys.sunset,

   
    localTime   : getLocalTime(timezone),
    timezone,
    isNight,

    
    fetchedAt   : new Date().toISOString(),
  };
}

function buildAdvice(data) {
  const { tempC, weatherMain, humidity, isNight, windSpeed } = data;
  const isRain  = ['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherMain);
  const isSnow  = weatherMain === 'Snow';
  const isWindy = windSpeed > 8;

  const items = [];
  let outfit = 'normal', needUmbrella = false, needCoat = false;

  if (tempC >= 30) {
    items.push('Arșiță! Tricou lejer și pantaloni scurți sunt suficienți.');
    outfit = 'summer';
  } else if (tempC >= 22) {
    items.push('E cald afară! Un tricou și pantaloni subțiri sunt ideali.');
    outfit = 'light';
  } else if (tempC>=17) {
    items.push('Temperatură plăcută! Un tricou e perfect.');
    outfit = 'light';
  }
    else if (tempC >= 11) {
    items.push('Puțin răcoros! Ia o jachetă sau un hanorac.');
    outfit = 'jacket'; needCoat = true;
  } else if (tempC >= 4) {
    items.push('Frig afară. Îmbracă-te gros, cu siguranță vei avea nevoie de o haină călduroasă.');
    outfit = 'winter'; needCoat = true;
  } else {
    items.push('Ger serios! Haină groasă, căciulă, fular și mănuși obligatoriu!');
    outfit = 'heavy-winter'; needCoat = true;
  }

  if (isRain)  { items.push('Ia umbrela, plouă!'); needUmbrella = true; }
  if (isSnow)  { items.push('Ninge, ai grijă pe gheață!'); needCoat = true; }
  if (isWindy) { items.push('Vânt puternic, jachetă rezistentă la vânt.'); }
  if (humidity > 80 && !isRain) items.push('Umiditate ridicată, poate părea mai cald decât este.');
  if (isNight) items.push('E noapte acolo, temperaturile au scăzut!');

  return { text: items.join(' '), outfit, needCoat, needUmbrella };
}

function buildVerdict(data) {
  const { tempC, weatherMain, humidity, isNight } = data;
  if (isNight && weatherMain === 'Clear') 
    return 'Noapte senină, cer plin de stele!';
  if (isNight)                        
    return 'Noapte afară, lumea doarme deja!';
  if (weatherMain === 'Thunderstorm')     
    return 'Furtună puternică! Stai în interior!';
  if (weatherMain === 'Snow')             
    return 'Ninge frumos, zi de om de zăpadă!';
  if (weatherMain === 'Rain')             
    return 'Zi ploioasă, perfectă pentru o carte bună acasă!';
  if (weatherMain === 'Drizzle')          
    return 'Burniță ușoară, ia umbrela totuși!';
  if (weatherMain === 'Clouds' && tempC >= 18) 
    return 'Zi înnorată dar agreabilă!';
  if (weatherMain === 'Clouds')           
    return 'Cer acoperit și răcoare.';
  if (['Mist','Fog','Haze'].includes(weatherMain)) 
    return 'Ceață, condu cu grijă!';
  if (weatherMain === 'Clear' && tempC >= 25 && humidity < 65)
    return 'Zi splendidă! Soare, căldură, perfecțiune!';
  if (weatherMain === 'Clear' && tempC >= 18) 
    return 'Zi frumoasă și însorită!';
  if (weatherMain === 'Clear' && tempC < 10)  
    return 'Cer senin dar frig, îmbracă-te bine!';
  return 'O zi obișnuită, verifică detaliile!';
}

function degToCompass(deg) {
  if (deg === undefined || deg === null) return 'Necunoscut';
  return COMPASS_RO[Math.round(deg / 22.5) % 16];
}

function unixToHHMM(unix, tzOffset) {
  const d = new Date((unix + tzOffset) * 1000);
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
}

function getLocalTime(tzOffset) {
  const utcMs = Date.now() + new Date().getTimezoneOffset() * 60000;
  const d = new Date(utcMs + tzOffset * 1000);
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
}

const WeatherService = {
    getWeather: async function(city) {
        const raw  = await fetchCurrentWeather(city);
        const data = processWeatherData(raw);
        return {
            ...data,
            advice : buildAdvice(data),
            verdict: buildVerdict(data),
        };
    }
};

module.exports = WeatherService;
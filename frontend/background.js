const Background = (() => {
  let current = { main: '', isNight: false };
  let intervals = [];
  function setTheme(weatherMain, isNight) {
    const body = document.body;

    body.classList.remove(
      'weather-clear','weather-clouds','weather-rain','weather-drizzle',
      'weather-thunderstorm','weather-snow','weather-mist','weather-haze',
      'weather-fog','day','night'
    );

    const cls = weatherMain.toLowerCase();
    body.classList.add(`weather-${cls}`);
    body.classList.add(isNight ? 'night' : 'day');
    current = { main: weatherMain, isNight };
  }
  function buildSunRays() {
    const container = document.getElementById('rays');
    if (!container) return;
    container.innerHTML = '';
    const rayCount = 12;
    for (let i = 0; i < rayCount; i++) {
      const ray = document.createElement('div');
      ray.className = 'ray';
      const angle  = (i / rayCount) * 360;
      const length = 28 + Math.random() * 20;
      const dist   = 48;
      ray.style.cssText = `
        height:${length}px;
        transform: rotate(${angle}deg) translateY(-${dist}px);
        opacity: ${0.5 + Math.random() * 0.5};
      `;
      container.appendChild(ray);
    }
  }
  function buildStars() {
    const field = document.getElementById('starsField');
    if (!field) return;
    field.innerHTML = '';
    for (let i = 0; i < 80; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = 1 + Math.random() * 2.5;
      s.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random()*100}vw;
        top:${Math.random()*60}vh;
        --dur:${1.5 + Math.random()*2.5}s;
        --del:${Math.random()*3}s;
      `;
      field.appendChild(s);
    }
  }

  function buildClouds(count = 5) {
    const field = document.getElementById('cloudsField');
    if (!field) return;
    field.innerHTML = '';
    for (let i = 0; i < count; i++) {
      spawnCloud(field, i * (100 / count));
    }
  }

  function spawnCloud(field, startPercent) {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    const w = 80 + Math.random() * 120;
    const h = w * 0.45;
    const top = 5 + Math.random() * 35;
    const dur = 25 + Math.random() * 35;
    const opacity = 0.55 + Math.random() * 0.35;
    cloud.style.cssText = `
      width:${w}px; height:${h}px;
      top:${top}%; opacity:${opacity};
      left:${startPercent}vw;
      animation-duration:${dur}s;
    `;
    const bump1 = document.createElement('div');
    bump1.style.cssText = `width:${w*.55}px;height:${h*1.3}px;top:-${h*.3}px;left:${w*.15}px;`;
    const bump2 = document.createElement('div');
    bump2.style.cssText = `width:${w*.38}px;height:${h*1.1}px;top:-${h*.1}px;left:${w*.5}px;`;
    cloud.append(bump1, bump2);
    field.appendChild(cloud);

    cloud.addEventListener('animationiteration', () => {
      cloud.style.left = '-250px';
    });
  }

  function buildRain(heavy = false) {
    const field = document.getElementById('rainField');
    if (!field) return;
    field.innerHTML = '';
    const count = heavy ? 180 : 80;
    for (let i = 0; i < count; i++) {
      const drop = document.createElement('div');
      drop.className = 'drop';
      const h = heavy ? (12 + Math.random()*20) : (8+Math.random()*14);
      drop.style.cssText = `
        left:${Math.random()*105}%;
        top:${-10 - Math.random()*20}%;
        height:${h}px;
        opacity:${0.4 + Math.random()*.55};
        animation-duration:${heavy ? .4+Math.random()*.3 : .6+Math.random()*.5}s;
        animation-delay:${Math.random()*1.5}s;
      `;
      field.appendChild(drop);
    }
  }
  function buildSnow() {
    const field = document.getElementById('snowField');
    if (!field) return;
    field.innerHTML = '';
    const flakes = ['❄','❅','❆','*','·'];
    for (let i = 0; i < 60; i++) {
      const f = document.createElement('div');
      f.className = 'flake';
      const size = 10 + Math.random()*16;
      f.textContent = flakes[Math.floor(Math.random()*flakes.length)];
      f.style.cssText = `
        left:${Math.random()*100}%;
        top:${-10 - Math.random()*20}%;
        font-size:${size}px;
        animation-duration:${3+Math.random()*4}s;
        animation-delay:${Math.random()*4}s;
      `;
      field.appendChild(f);
    }
  }

  function clearEffects() {
    ['cloudsField','rainField','snowField'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });
    const rays = document.getElementById('rays');
    if (rays) rays.innerHTML = '';
    const stars = document.getElementById('starsField');
    if (stars) stars.innerHTML = '';
    intervals.forEach(clearInterval);
    intervals = [];
  }

  function update(weatherMain, isNight) {
    clearEffects();
    setTheme(weatherMain, isNight);

    if (isNight) buildStars();

    switch (weatherMain) {
      case 'Clear':
        if (!isNight) buildSunRays();
        if (isNight)  buildStars();
        buildClouds(1);
        break;

      case 'Clouds':
        buildClouds(6);
        break;

      case 'Drizzle':
        buildClouds(7);
        buildRain(false);
        break;

      case 'Rain':
        buildClouds(8);
        buildRain(false);
        break;

      case 'Thunderstorm':
        buildClouds(10);
        buildRain(true);
        break;

      case 'Snow':
        buildClouds(4);
        buildSnow();
        break;

      case 'Mist':
      case 'Fog':
      case 'Haze':
        buildClouds(12);
        break;

      default:
        buildClouds(3);
    }
  }

  return { update };

})();

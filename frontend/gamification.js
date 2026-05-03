const Gamification = (() => {
  const XP_PER_SEARCH   = 15;
  const XP_PER_LEVEL    = 100;
  const STORAGE_KEY_XP  = 'wb_xp';
  const STORAGE_KEY_ACH = 'wb_achievements';
  const STORAGE_KEY_CNT = 'wb_search_count';
  const ACHIEVEMENTS = {
    achv_first    : { label:'Prima căutare', xp:20,  check: (s,d) => s >= 1 },
    achv_five     : { label:'5 orașe diferite', xp:50, check:(s,d) => s >= 5 },
    achv_rain     : { label:'Prins ploaia!', xp:30, check:(s,d) => ['Rain','Drizzle','Thunderstorm'].includes(d?.weatherMain) },
    achv_sun      : { label:'Zi splendidă găsită!', xp:30, check:(s,d) => d?.weatherMain==='Clear' && d?.tempC>=20 },
    achv_night    : { label:'Bufniță de noapte', xp:25, check:(s,d) => d?.isNight },
    achv_snow     : { label:'Prima ninsoare!', xp:40, check:(s,d) => d?.weatherMain==='Snow' },
    achv_wind     : { label:'Vântul urlă!', xp:25,  check:(s,d) => d?.windSpeed > 10 },
    achv_explorer : { label:'Mare explorator', xp:80, check:(s,d) => s >= 10 },
  };

  
  let xp       = parseInt(localStorage.getItem(STORAGE_KEY_XP)  || '0', 10);
  let unlocked = JSON.parse(localStorage.getItem(STORAGE_KEY_ACH) || '[]');
  let searches = parseInt(localStorage.getItem(STORAGE_KEY_CNT) || '0', 10);
  function getLevel() { return Math.floor(xp / XP_PER_LEVEL) + 1; }
  function getXpInLevel() { return xp % XP_PER_LEVEL; }
  function getXpPercent() { return (getXpInLevel() / XP_PER_LEVEL) * 100; }


  function renderXP() {
    const valEl  = document.getElementById('xpVal');
    const barEl  = document.getElementById('xpBar');
    const lvEl   = document.getElementById('lvBadge');
    if (valEl)  valEl.textContent  = xp;
    if (barEl)  barEl.style.width  = getXpPercent() + '%';
    if (lvEl)   lvEl.textContent   = `Niv. ${getLevel()}`;
  }

  
  function renderAchievements() {
    Object.keys(ACHIEVEMENTS).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (unlocked.includes(id)) {
        el.classList.remove('locked');
        el.classList.add('unlocked');
      }
    });
  }

 
  function addXP(amount, label = '') {
    const prevLv = getLevel();
    xp += amount;
    localStorage.setItem(STORAGE_KEY_XP, xp);
    renderXP();

  
    showToast(`+${amount} XP ${label ? '– ' + label : ''}! ⭐`);


    if (getLevel() > prevLv) {
      setTimeout(() => showToast(`🎉 Nivel ${getLevel()} atins! Felicitări!`), 1200);
    }
  }

  function checkAchievements(weatherData) {
    let newUnlocks = [];
    Object.entries(ACHIEVEMENTS).forEach(([id, ach]) => {
      if (!unlocked.includes(id) && ach.check(searches, weatherData)) {
        unlocked.push(id);
        newUnlocks.push({ id, ach });
      }
    });
    if (newUnlocks.length) {
      localStorage.setItem(STORAGE_KEY_ACH, JSON.stringify(unlocked));
      renderAchievements();
      newUnlocks.forEach(({ id, ach }, i) => {
        setTimeout(() => {
          addXP(ach.xp, ach.label);
          const el = document.getElementById(id);
          if (el) {
            el.style.transform = 'scale(1.4)';
            setTimeout(() => el.style.transform = '', 500);
          }
        }, i * 1400);
      });
    }
  }


  function recordSearch(weatherData) {
    searches++;
    localStorage.setItem(STORAGE_KEY_CNT, searches);
    addXP(XP_PER_SEARCH);
    setTimeout(() => checkAchievements(weatherData), 600);
  }

  function showToast(msg, duration = 2800) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }
  renderXP();
  renderAchievements();
  return { recordSearch, showToast };

})();
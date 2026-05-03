const Character = (() => {

  let state = {
    gender  : 'm',
    skin    : 'light',
    hair    : 'brown',
    outfit  : 'normal',
    isNight : false,
  };

  const SKIN = {
    light  : { face:'#FFDBB4', shadow:'#E8B88A', neck:'#F1C27D' },
    medium : { face:'#cba378', shadow:'#A0672E', neck:'#B57531' },
    dark   : { face:'#5C3317', shadow:'#3D200D', neck:'#4B2912' },
  };
  
  const HAIR = {
    black  : '#1C1008',
    brown  : '#6B3A2A',
    blonde : '#E9C46A',
    red    : '#B22222',
    gray   : '#888888',
  };

  function buildSVG() {
    const sk  = SKIN[state.skin]  || SKIN.light;
    const hr  = HAIR[state.hair]  || HAIR.brown;
    const isF = state.gender === 'f';
    const out = state.outfit;

    const clothes = {
      body  : outfitBodyColor(out),
      pants : outfitPantsColor(out),
      acc   : outfitAccessory(out, isF),
    };

    // viewBox setat să ofere spațiu generos sus pentru umbrelă
    return `
<svg class="char-svg" width="130" height="200" viewBox="0 -55 140 255" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="70" cy="190" rx="32" ry="5" fill="rgba(0,0,0,0.1)"/>

  <rect x="50" y="145" width="14" height="40" rx="7" fill="${clothes.pants}" />
  <rect x="76" y="145" width="14" height="40" rx="7" fill="${clothes.pants}" />
  <path d="M50,180 h16 q2,0 2,4 t-2,4 h-14 q-4,0 -4,-4 t4,-4z" fill="#333"/>
  <path d="M76,180 h16 q2,0 2,4 t-2,4 h-18 q-4,0 -4,-4 t4,-4z" fill="#333"/>

  ${buildBody(sk, clothes, isF, out)}
  ${clothes.acc}
  ${buildHead(sk, hr, isF, out)}
</svg>`.trim();
  }

  function buildBody(sk, cl, isF, out) {
    let body;
    if (isF) {
      body = `<path d="M43,152 L97,152 L84,103 L56,103 Z" fill="${cl.body}"/>
              <path d="M56,103 L70,116 L84,103" fill="rgba(0,0,0,0.05)"/>`;
    } else {
      body = `<rect x="43" y="103" width="54" height="50" rx="9" fill="${cl.body}"/>`;
    }

    const armL = `<rect x="30" y="105" width="13" height="38" rx="6" fill="${cl.body}"/>
    <circle cx="36.5" cy="142" r="7" fill="${sk.face}"/>`;
    
    const armR = `<rect x="97" y="105" width="13" height="38" rx="6" fill="${cl.body}"/>
    <circle cx="103.5" cy="142" r="7" fill="${sk.face}"/>`;

    const scarf = (out === 'winter' || out === 'heavy-winter') 
    ? `<path d="M52,98 h36 q5,0 5,7 t-5,7 h-36 q-5,0 -5,-7 t5,-7" fill="#d63031"/>` : '';

    return `<rect x="64" y="93" width="12" height="13" fill="${sk.neck}"/>${armL}${armR}${body}${scarf}`;
  }

  function buildHead(sk, hr, isF, out) {
    const faceShape = isF 
      ? `<path d="M43,68 q0,-28 27,-28 t27,28 q0,22 -27,22 t-27,-22" fill="${sk.face}"/>`
      : `<rect x="43" y="42" width="54" height="52" rx="22" fill="${sk.face}"/>`;

    const eyes = `<circle cx="58" cy="66" r="3.2" fill="#333"/><circle cx="82" cy="66" r="3.2" fill="#333"/>`;

    const hair = isF 
      ? `<path d="M38,68 q0,-38 32,-38 t32,38 v28 q0,5 -5,5 t-5,-5 v-22 h-44 v22 q0,5 -5,5 t-5,-5 z" fill="${hr}"/>`
      : `<path d="M43,53 q0,-20 27,-20 t27,20 l5,5 h-64 z" fill="${hr}"/>`;

    const mouth = `<path d="M63,82 q7,4 14,0" fill="none" stroke="#e17055" stroke-width="1.8" stroke-linecap="round"/>`;

    return `${hair}${faceShape}${eyes}${mouth}`;
  }

  function outfitAccessory(out, isF) {
    // Verificăm dacă outfit-ul curent este setat pe ploaie
    if (out === 'rain') {
      return `
        <g transform="translate(103.5, 142)">
          <path d="M0,0 L0,-100 Q0,-105 5,-105" stroke="#2d3436" stroke-width="2.8" fill="none" stroke-linecap="round"/>
          <g transform="translate(-32, -108)">
             <path d="M0,22 Q0,-5 32,-5 Q64,-5 64,22 Q54,17 43,22 Q32,17 21,22 Q11,17 0,22 Z" fill="#0984e3" stroke="#2d3436" stroke-width="1.3" />
             <path d="M32,-5 L32,-14" stroke="#2d3436" stroke-width="2.2" fill="none" stroke-linecap="round"/>
          </g>
        </g>
      `;
    }
    
    if (out === 'summer') {
      return `<rect x="52" y="58" width="14" height="6" rx="2" fill="rgba(0,0,0,0.6)"/>
              <rect x="74" y="58" width="14" height="6" rx="2" fill="rgba(0,0,0,0.6)"/>`;
    }
    return '';
  }

  function outfitBodyColor(out) {
    const map = { summer:'#fab1a0', light:'#81ecec', normal:'#74b9ff', jacket:'#55efc4', winter:'#0984e3', 'heavy-winter':'#2d3436' };
    return map[out] || '#74b9ff';
  }

  function outfitPantsColor(out) { return '#2d3436'; }

  function render() {
    const el = document.getElementById('charSvg');
    if (el) el.innerHTML = buildSVG();
  }

  function setActiveButton(selector, activeId) {
    document.querySelectorAll(selector).forEach(button => {
      button.classList.toggle('active', button.id === activeId);
    });
  }

  return {
    render,
    setGender: (g) => {
      state.gender = g;
      render();
      setActiveButton('.pill', g === 'm' ? 'btnM' : 'btnF');
    },
    setSkin: (s) => {
      state.skin = s;
      render();
      setActiveButton('.swatch-row > .swatch', `skin${s.charAt(0).toUpperCase() + s.slice(1)}`);
    },
    setHair: (h) => {
      state.hair = h;
      render();
      setActiveButton('.swatch-row > .swatch', `hair${h.charAt(0).toUpperCase() + h.slice(1)}`);
    },
    updateForWeather: (data) => {
      // LOGICA DE DETECTARE:
      const desc = data.description ? data.description.toLowerCase() : "";
      const outText = (data.advice && data.advice.outfit) ? data.advice.outfit.toLowerCase() : "";

      // Dacă în descriere sau în sfatul de îmbrăcăminte apare "ploaie" sau "rain"
      if (desc.includes('ploaie') || desc.includes('rain') || desc.includes('drizzle') ||
          outText.includes('rain') || outText.includes('ploaie')) {
        state.outfit = 'rain';
      } else {
        state.outfit = data.advice ? data.advice.outfit : 'normal';
      }

      state.isNight = data.isNight || false;
      render();
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => { Character.render(); });

// Expose helper functions so inline onclick handlers work from HTML
window.setGender = (g) => Character.setGender(g);
window.setSkin = (s) => Character.setSkin(s);
window.setHair = (h) => Character.setHair(h);
window.Character = Character;

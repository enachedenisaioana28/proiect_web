# 🌤️ WeatherBuddy – Prietenul tău meteorologic
### Proiect 11 – Aplicație Web Meteo

---

## 📁 Structura proiectului

```
WeatherBuddy/
├── index.html              ← Pagina principală HTML5
├── css/
│   └── style.css           ← Stiluri CSS3 + teme dinamice
├── js/
│   ├── weather.js          ← Modul procesare date API (SEPARAT de UI!)
│   ├── character.js        ← Modul personaj SVG customizabil
│   ├── background.js       ← Modul animații fundal
│   ├── gamification.js     ← Modul XP, nivele, realizări
│   └── app.js              ← Controller principal UI
└── README.md
```

---

## 🚀 Cum rulezi aplicația

### Varianta simplă (fără server):
1. Deschide `index.html` direct în browser (dublu-click)
2. Aplicația funcționează imediat!

### Varianta cu server local (VS Code):
1. Instalează extensia **Live Server** în VS Code
2. Click dreapta pe `index.html` → `Open with Live Server`
3. Se deschide automat la `http://localhost:5500`

### Varianta Node.js (port 5000):
```bash
npm install -g serve
serve . -p 5000
# Deschide http://localhost:5000
```

---

## 🔑 Cheie API

Cheia API OpenWeatherMap este configurată în `js/weather.js`:
```javascript
const API_KEY = '8565b1a3ac0548dc03fc6ae7ca7f199d';
```

---

## Funcționalități implementate

### Cerințe de bază:
- [x] Caută orice oraș din lume
- [x] Afișează temperatura curentă
- [x] Temperatură în °C, °F și Kelvin (comutare liberă)
- [x] Procesare meteo **separată** de afișare (`weather.js` vs `app.js`)
- [x] Răsărit și apus de soare
- [x] Umiditate, vizibilitate, presiune
- [x] Descriere vreme în română
- [x] Direcție vânt în cuvinte (Nord, Sud-Vest, etc.)
- [x] Verdict zi ("Zi splendidă!", "Zi de pătură și ceai!")
- [x] Sfat haină / umbrelă

### Cerințe Node.js:
- [x] Selectare unitate temperatură (C/F/K)
- [x] Ora locală a orașului căutat
- [x] Ultimele 5 orașe (localStorage) cu selectare rapidă
- [x] Interfață dinamică după vreme:
  - ☀️ Senin → fundal albastru deschis + soare animat
  - ⛅ Nori → fundal gri + nori animați care driftează
  - 🌧️ Ploaie → fundal albastru închis + picuri animate
  - ❄️ Ninsoare → fundal alb-albastru + fulgi animați
  - ⚡ Furtună → fundal foarte închis + flash de fulger
  - 🌙 Noapte → fundal întunecat + stele animate

### Provocări:
- [x] Personaj SVG **customizabil**: sex, culoare piele, culoare păr
- [x] Personaj **se îmbracă** după vreme (vara lejer, iarna haină+fular)
- [x] Bulă de dialog cu sfaturi personalizate + numele utilizatorului
- [x] Gamification: XP, nivele, 8 realizări deblocabile
- [x] Animații fundal contextuale (soare cu raze, picuri de ploaie, fulgi de nea, stele)
- [x] Toast notifications pentru XP și realizări

---

## 🏗️ Arhitectură (Separare responsabilități)

```
┌─────────────────────────────────────────────────────┐
│                    index.html                       │
│              (structură HTML5 + layout)             │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────▼─────────┐
        │      app.js       │  ← Controller: leagă totul
        │  (UI Controller)  │
        └──┬──────┬────┬────┘
           │      │    │
    ┌──────▼──┐ ┌─▼──┐ ┌─▼──────────┐ ┌──────────────┐
    │weather.js│ │char│ │background.js│ │gamification.js│
    │API fetch │ │acter│ │Animații    │ │XP, Nivele    │
    │+procesare│ │.js  │ │fundal      │ │Realizări     │
    └──────────┘ └────┘ └────────────┘ └──────────────┘
         │
    ┌────▼─────────────────┐
    │ OpenWeatherMap API   │
    │ api.openweathermap   │
    └──────────────────────┘
```

---

## 🎮 Sistem Gamification

| Realizare | Condiție | XP |
|-----------|----------|----|
| 🔍 Prima căutare | 1 căutare | 20 XP |
| 🌍 5 orașe diferite | 5 căutări | 50 XP |
| ☂️ Prins ploaia | Vreme ploioasă | 30 XP |
| ☀️ Zi splendidă | Senin + >20°C | 30 XP |
| 🌙 Bufniță de noapte | Căutare noaptea | 25 XP |
| ❄️ Prima ninsoare | Snow | 40 XP |
| 🌬️ Vântul urlă | Vânt >10 m/s | 25 XP |
| 🗺️ Mare explorator | 10 căutări | 80 XP |

Fiecare căutare aduce **+15 XP**. La 100 XP → nivel nou!
## 👥 Contribuții echipă
- **Student 1** – `weather.js`, `app.js` (logică API + controller)
- **Student 2** – `character.js`, `background.js`, `css/style.css` (UI + animații)

## 🌐 Deployment

- **Vercel**: drag & drop folderul pe vercel.com
- **Render**: conectează repo GitHub → Static Site
- **GitHub Pages**: push pe branch `main` → Settings → Pages
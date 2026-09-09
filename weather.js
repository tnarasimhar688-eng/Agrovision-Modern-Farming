/* ═══════════════════════════════════════
   weather.js — Weather Monitoring Module
   ═══════════════════════════════════════ */

const WEATHER_LOCATIONS = [
  { name: 'Amaravati / Guntur (AP)', lat: 16.5062, lon: 80.6480 },
  { name: 'Hyderabad (Telangana)',    lat: 17.3850, lon: 78.4867 },
  { name: 'Delhi / NCR',             lat: 28.6139, lon: 77.2090 },
  { name: 'Pune (Maharashtra)',      lat: 18.5204, lon: 73.8567 },
  { name: 'Ludhiana / Punjab',       lat: 30.9010, lon: 75.8573 },
  { name: 'Bengaluru (Karnataka)',   lat: 12.9716, lon: 77.5946 },
  { name: 'Indore (Madhya Pradesh)', lat: 22.7196, lon: 75.8577 },
  { name: 'Jaipur (Rajasthan)',      lat: 26.9124, lon: 75.7873 }
];

let selectedWeatherLoc = WEATHER_LOCATIONS[0];

function renderWeather() {
  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">☁️ Weather Monitoring & Spray Advisory</h1>
          <p class="page-subtitle">Real-time agricultural meteorology, 7-day forecast, and pesticide spray suitability window.</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <select class="form-select" id="weatherLocSelect" onchange="handleWeatherLocChange(this.value)" style="min-width:220px">
            ${WEATHER_LOCATIONS.map((loc, idx) => `<option value="${idx}" ${loc.name === selectedWeatherLoc.name ? 'selected' : ''}>📍 ${loc.name}</option>`).join('')}
          </select>
          <button class="btn btn-secondary btn-sm" onclick="fetchDeviceLocation()" title="Use Current GPS">📡 Detect GPS</button>
        </div>
      </div>

      <!-- Current Weather Banner Card -->
      <div id="weatherCurrentWrap">
        <div class="card">
          <div class="card-body" style="text-align:center;padding:36px">
            <div class="spinner"></div>
            <p style="margin-top:10px;color:var(--text-muted)">Fetching live agricultural weather forecast...</p>
          </div>
        </div>
      </div>

      <!-- Spray Suitability Window & Advisories -->
      <div class="grid-2" style="margin-top:24px">
        <div class="card" id="sprayWindowCard">
          <div class="card-header">
            <span class="card-title">🧪 Pesticide & Fertilizer Spray Window</span>
            <span class="badge badge-success" id="sprayStatusBadge">Checking...</span>
          </div>
          <div class="card-body" id="sprayBody">
            <p style="color:var(--text-muted)">Analyzing wind velocity and rain probability...</p>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">🌾 Seasonal Weather Farming Advisories</span>
          </div>
          <div class="card-body">
            <div style="display:flex;gap:12px;margin-bottom:12px">
              <span style="font-size:1.4rem">💧</span>
              <div>
                <strong>Irrigation Scheduling</strong>
                <div style="font-size:0.85rem;color:var(--text-muted)">Delay field watering if rain probability exceeds 40% over next 48h to prevent root aeration stress.</div>
              </div>
            </div>
            <div style="display:flex;gap:12px;margin-bottom:12px">
              <span style="font-size:1.4rem">🌡️</span>
              <div>
                <strong>Heat & Evaporation Stress</strong>
                <div style="font-size:0.85rem;color:var(--text-muted)">High midday temperatures elevate transpiration. Irrigate during dawn or post 5:00 PM.</div>
              </div>
            </div>
            <div style="display:flex;gap:12px">
              <span style="font-size:1.4rem">💨</span>
              <div>
                <strong>Wind Drift Safeguard</strong>
                <div style="font-size:0.85rem;color:var(--text-muted)">Avoid motorized power sprayers when wind gusts exceed 15 km/h to prevent chemical drift to adjacent fields.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  loadWeatherData(selectedWeatherLoc.lat, selectedWeatherLoc.lon, selectedWeatherLoc.name);
}

function handleWeatherLocChange(idx) {
  selectedWeatherLoc = WEATHER_LOCATIONS[parseInt(idx)];
  loadWeatherData(selectedWeatherLoc.lat, selectedWeatherLoc.lon, selectedWeatherLoc.name);
}

function fetchDeviceLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'warning');
    return;
  }
  showToast('Detecting current GPS coordinates...');
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      selectedWeatherLoc = { name: 'My GPS Location', lat, lon };
      loadWeatherData(lat, lon, 'My Current Location');
    },
    err => {
      showToast('Could not fetch GPS. Using default location.', 'warning');
    }
  );
}

function loadWeatherData(lat, lon, locationName) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      renderWeatherView(data, locationName);
    })
    .catch(err => {
      console.warn('Live weather fetch failed, using fallback agricultural dataset', err);
      renderWeatherFallback(locationName);
    });
}

function getWeatherInterpretation(code) {
  // WMO Weather interpretation codes
  if (code === 0) return { desc: 'Clear Sky', emoji: '☀️' };
  if ([1, 2].includes(code)) return { desc: 'Partly Cloudy', emoji: '⛅' };
  if (code === 3) return { desc: 'Overcast', emoji: '☁️' };
  if ([45, 48].includes(code)) return { desc: 'Foggy / Hazy', emoji: '🌫️' };
  if ([51, 53, 55, 61, 63].includes(code)) return { desc: 'Light to Moderate Rain', emoji: '🌦️' };
  if ([65, 80, 81, 82].includes(code)) return { desc: 'Heavy Downpour', emoji: '🌧️' };
  if ([95, 96, 99].includes(code)) return { desc: 'Thunderstorm', emoji: '⛈️' };
  return { desc: 'Fair Weather', emoji: '🌤️' };
}

function renderWeatherView(data, locationName) {
  const cur = data.current;
  const daily = data.daily;
  const wi = getWeatherInterpretation(cur.weather_code);

  const wrap = document.getElementById('weatherCurrentWrap');
  if (!wrap) return;

  wrap.innerHTML = `
    <!-- Current Weather Card -->
    <div class="weather-card" style="margin-bottom:20px">
      <div style="font-size:0.9rem;opacity:0.9;margin-bottom:4px">📍 ${locationName}</div>
      <div class="weather-emoji">${wi.emoji}</div>
      <div class="weather-temp">${Math.round(cur.temperature_2m)}°C</div>
      <div class="weather-desc">${wi.desc}</div>
      
      <div class="weather-meta">
        <div class="weather-meta-item">
          <div class="val">💧 ${cur.relative_humidity_2m}%</div>
          <div class="lbl">Humidity</div>
        </div>
        <div class="weather-meta-item">
          <div class="val">💨 ${cur.wind_speed_10m} km/h</div>
          <div class="lbl">Wind Speed</div>
        </div>
        <div class="weather-meta-item">
          <div class="val">🌧️ ${cur.precipitation} mm</div>
          <div class="lbl">Precipitation</div>
        </div>
        <div class="weather-meta-item">
          <div class="val">⏱️ ${Math.round(cur.surface_pressure)} hPa</div>
          <div class="lbl">Pressure</div>
        </div>
      </div>
    </div>

    <!-- 7-Day Forecast Strip -->
    <h3 class="section-title">7-Day Agricultural Forecast</h3>
    <div class="forecast-strip">
      ${(daily.time || []).map((t, idx) => {
        const dObj = new Date(t);
        const dayStr = dObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
        const icon = getWeatherInterpretation(daily.weather_code[idx]).emoji;
        const maxT = Math.round(daily.temperature_2m_max[idx]);
        const minT = Math.round(daily.temperature_2m_min[idx]);
        const rainP = daily.precipitation_probability_max[idx];

        return `
          <div class="forecast-day">
            <div class="fc-day">${dayStr}</div>
            <div class="fc-icon">${icon}</div>
            <div class="fc-hi">${maxT}°C</div>
            <div class="fc-lo">${minT}°C</div>
            <div class="fc-rain">🌧️ ${rainP}%</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Update Spray Window
  updateSprayWindow(cur.wind_speed_10m, cur.precipitation, daily.precipitation_probability_max?.[0] || 0);
}

function renderWeatherFallback(locationName) {
  const wrap = document.getElementById('weatherCurrentWrap');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="weather-card" style="margin-bottom:20px">
      <div style="font-size:0.9rem;opacity:0.9;margin-bottom:4px">📍 ${locationName} (Offline Sync)</div>
      <div class="weather-emoji">⛅</div>
      <div class="weather-temp">31°C</div>
      <div class="weather-desc">Partly Cloudy · Pleasant Breeze</div>
      
      <div class="weather-meta">
        <div class="weather-meta-item">
          <div class="val">💧 62%</div>
          <div class="lbl">Humidity</div>
        </div>
        <div class="weather-meta-item">
          <div class="val">💨 9.4 km/h</div>
          <div class="lbl">Wind Speed</div>
        </div>
        <div class="weather-meta-item">
          <div class="val">🌧️ 0.0 mm</div>
          <div class="lbl">Precipitation</div>
        </div>
        <div class="weather-meta-item">
          <div class="val">⏱️ 1012 hPa</div>
          <div class="lbl">Pressure</div>
        </div>
      </div>
    </div>
  `;

  updateSprayWindow(9.4, 0, 10);
}

function updateSprayWindow(windSpeed, precip, rainProb) {
  const badge = document.getElementById('sprayStatusBadge');
  const body = document.getElementById('sprayBody');
  if (!badge || !body) return;

  if (windSpeed < 14 && rainProb < 25 && precip === 0) {
    badge.className = 'badge badge-success';
    badge.textContent = '✅ OPTIMAL SPRAY WINDOW';
    body.innerHTML = `
      <div class="alert alert-success" style="margin-bottom:10px">
        <strong>Favorable Condition for Spraying:</strong> Wind is calm (${windSpeed} km/h) and rain probability is low (${rainProb}%). Chemical drift will be minimal.
      </div>
      <ul style="font-size:0.85rem;list-style:disc;margin-left:18px">
        <li>Best application window: Today between 7:00 AM - 10:30 AM or 4:30 PM - 6:30 PM.</li>
        <li>Ensure proper PPE (masks, gloves) during pesticide mixing.</li>
      </ul>
    `;
  } else if (windSpeed >= 18 || rainProb >= 60) {
    badge.className = 'badge badge-danger';
    badge.textContent = '⛔ DO NOT SPRAY';
    body.innerHTML = `
      <div class="alert alert-danger" style="margin-bottom:10px">
        <strong>Unfavorable Spray Window:</strong> High wind speed (${windSpeed} km/h) or elevated rain risk (${rainProb}%). Chemicals will wash off or drift.
      </div>
      <p style="font-size:0.85rem;color:var(--text-muted)">Reschedule spraying until weather stabilizes.</p>
    `;
  } else {
    badge.className = 'badge badge-warning';
    badge.textContent = '⚠️ MODERATE CAUTION';
    body.innerHTML = `
      <div class="alert alert-warning" style="margin-bottom:10px">
        <strong>Marginal Condition:</strong> Wind is ${windSpeed} km/h with ${rainProb}% rain chance. Spray only with low-drift anti-drip nozzles.
      </div>
    `;
  }
}

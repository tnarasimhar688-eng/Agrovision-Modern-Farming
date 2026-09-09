/* ═══════════════════════════════════════
   irrigation.js — Smart Irrigation Module
   ═══════════════════════════════════════ */

let isPumpRunning = false;
let pumpTimer = null;
let pumpSeconds = 0;

function renderIrrigation() {
  const crops = JSON.parse(localStorage.getItem('smartfarm_crops') || '[]');
  const defaultCropId = crops.length > 0 ? crops[0].cropId : 'rice';

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">💧 Smart Irrigation & Water Management</h1>
          <p class="page-subtitle">Scientific water budgeting, micro-irrigation scheduling, and pump automation advisory.</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="badge ${isPumpRunning ? 'badge-success' : 'badge-gray'}" id="pumpStatusBadge">
            ${isPumpRunning ? '⚡ PUMP RUNNING' : '⚪ PUMP IDLE'}
          </span>
          <button class="btn ${isPumpRunning ? 'btn-danger' : 'btn-primary'} btn-sm" id="pumpToggleBtn" onclick="togglePumpSimulation()">
            ${isPumpRunning ? '⏹ Stop Pump' : '▶ Start Pump'}
          </button>
        </div>
      </div>

      <!-- Live Moisture & Pump Controller Card -->
      <div class="card" style="margin-bottom:24px;border-left:5px solid var(--primary)">
        <div class="card-body">
          <div class="grid-3" style="align-items:center">
            <div style="text-align:center">
              <div style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px">Simulated Root Zone Moisture</div>
              <div style="font-size:3rem;font-weight:800;color:var(--primary)" id="moistureDisplay">34%</div>
              <span class="badge badge-warning" id="moistureStatus">Moderate - Irrigation Due Soon</span>
            </div>

            <div style="padding:0 10px">
              <label class="form-label">Adjust Moisture Level Simulator</label>
              <input type="range" min="10" max="90" value="34" style="width:100%;cursor:pointer" id="moistureSlider" oninput="updateMoistureReading(this.value)"/>
              <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-top:4px">
                <span>10% (Critically Dry)</span>
                <span>50% (Ideal)</span>
                <span>90% (Saturated)</span>
              </div>
            </div>

            <div style="background:var(--bg);padding:14px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">Pump Runtime Today</div>
              <div style="font-size:1.8rem;font-weight:700" id="pumpDurationDisplay">${formatPumpTime(pumpSeconds)}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">Discharge: ~180 LPM (5 HP Submersible)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Water Requirement Calculator -->
      <div class="card" style="margin-bottom:24px">
        <div class="card-header">
          <span class="card-title">🧮 Precision Water Budget Calculator</span>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Select Crop</label>
              <select class="form-select" id="irr-crop" onchange="calculateIrrigationBudget()">
                ${CROPS_DATA.map(c => `<option value="${c.id}" ${c.id === defaultCropId ? 'selected' : ''}>${c.emoji} ${c.name} (${c.waterNeed} water need)</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Soil Texture</label>
              <select class="form-select" id="irr-soil" onchange="calculateIrrigationBudget()">
                <option value="clay">Clay / Heavy Clay (High Retention)</option>
                <option value="loam" selected>Loamy / Alluvial (Medium)</option>
                <option value="sandy">Sandy Loam / Light (Low Retention)</option>
                <option value="black">Black Cotton Soil (High Swell)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Field Area (Acres)</label>
              <input class="form-input" id="irr-acres" type="number" step="0.5" min="0.1" value="2" oninput="calculateIrrigationBudget()"/>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Irrigation System</label>
              <select class="form-select" id="irr-method" onchange="calculateIrrigationBudget()">
                <option value="drip" selected>Drip Irrigation (92% efficiency)</option>
                <option value="sprinkler">Sprinkler System (78% efficiency)</option>
                <option value="furrow">Furrow / Ridge Irrigation (60% efficiency)</option>
                <option value="flood">Traditional Flood Irrigation (45% efficiency)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Pump Rating</label>
              <select class="form-select" id="irr-pump" onchange="calculateIrrigationBudget()">
                <option value="3">3 HP Submersible (~120 LPM)</option>
                <option value="5" selected>5 HP Submersible (~200 LPM)</option>
                <option value="7.5">7.5 HP Submersible (~300 LPM)</option>
                <option value="10">10 HP Submersible (~450 LPM)</option>
              </select>
            </div>
          </div>

          <!-- Calculation Outputs -->
          <div class="grid-4" style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border)">
            <div style="background:var(--bg);padding:14px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Daily Water Need</div>
              <div style="font-size:1.4rem;font-weight:800;color:var(--primary);margin-top:4px" id="calcWaterLiters">-- Liters</div>
            </div>
            <div style="background:var(--bg);padding:14px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Recommended Pump Time</div>
              <div style="font-size:1.4rem;font-weight:800;color:var(--text);margin-top:4px" id="calcRuntime">-- Hours</div>
            </div>
            <div style="background:var(--bg);padding:14px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Water Savings vs Flood</div>
              <div style="font-size:1.4rem;font-weight:800;color:#2e7d32;margin-top:4px" id="calcSavings">-- %</div>
            </div>
            <div style="background:var(--bg);padding:14px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Est. Power Consumed</div>
              <div style="font-size:1.4rem;font-weight:800;color:#0288d1;margin-top:4px" id="calcPower">-- kWh</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Micro-Irrigation Comparative Guide -->
      <h2 class="section-title">Irrigation Systems Comparison</h2>
      <div class="grid-3">
        <div class="irr-method-card selected">
          <div class="irr-method-icon">💧</div>
          <div class="irr-method-title">Drip Irrigation</div>
          <div class="irr-method-eff">90 - 95% Efficiency · Saves 50-60% Water</div>
          <p style="font-size:0.82rem;color:var(--text-muted);margin-top:8px">
            Applies water directly to root zone drop by drop. Minimizes evaporation and prevents weed growth between rows.
          </p>
          <div style="font-size:0.75rem;color:var(--primary);font-weight:700;margin-top:8px">Up to 70% Govt Subsidy under PMKSY</div>
        </div>

        <div class="irr-method-card">
          <div class="irr-method-icon">🚿</div>
          <div class="irr-method-title">Micro-Sprinkler</div>
          <div class="irr-method-eff">75 - 82% Efficiency · Saves 30-40% Water</div>
          <p style="font-size:0.82rem;color:var(--text-muted);margin-top:8px">
            Ideal for closely spaced field crops like groundnut, pulses, wheat and leafy vegetables on undulating lands.
          </p>
          <div style="font-size:0.75rem;color:var(--primary);font-weight:700;margin-top:8px">Subsidy available under Per Drop More Crop</div>
        </div>

        <div class="irr-method-card">
          <div class="irr-method-icon">🌊</div>
          <div class="irr-method-title">Surface / Furrow</div>
          <div class="irr-method-eff">50 - 60% Efficiency · High Seepage Loss</div>
          <p style="font-size:0.82rem;color:var(--text-muted);margin-top:8px">
            Traditional channel based irrigation. High percolation and runoff losses. Better when coupled with trash mulching.
          </p>
          <div style="font-size:0.75rem;color:#c62828;font-weight:700;margin-top:8px">High water &amp; electricity consumption</div>
        </div>
      </div>
    </div>
  `;

  calculateIrrigationBudget();
}

function updateMoistureReading(val) {
  const num = parseInt(val);
  const display = document.getElementById('moistureDisplay');
  const status = document.getElementById('moistureStatus');
  if (!display || !status) return;

  display.textContent = num + '%';

  if (num < 25) {
    status.className = 'badge badge-danger';
    status.textContent = 'Critically Dry - Immediate Irrigation Needed!';
  } else if (num < 40) {
    status.className = 'badge badge-warning';
    status.textContent = 'Moderate - Irrigation Due Soon';
  } else if (num <= 70) {
    status.className = 'badge badge-success';
    status.textContent = 'Optimal Root Moisture - No Irrigation Needed';
  } else {
    status.className = 'badge badge-info';
    status.textContent = 'Saturated / Waterlogged - Pause Irrigation';
  }
}

function calculateIrrigationBudget() {
  const cropId = document.getElementById('irr-crop')?.value;
  const soil = document.getElementById('irr-soil')?.value;
  const acres = parseFloat(document.getElementById('irr-acres')?.value || '1');
  const method = document.getElementById('irr-method')?.value;
  const hp = parseFloat(document.getElementById('irr-pump')?.value || '5');

  const crop = CROPS_DATA.find(c => c.id === cropId);
  if (!crop) return;

  // Base mm per day water requirement by crop water need
  let baseMm = 4.5;
  if (crop.waterNeed === 'High' || crop.waterNeed === 'Very High') baseMm = 7.5;
  else if (crop.waterNeed === 'Low' || crop.waterNeed === 'Very Low') baseMm = 3.0;

  // Soil modifier
  let soilMult = 1.0;
  if (soil === 'sandy') soilMult = 1.25;
  else if (soil === 'clay') soilMult = 0.9;

  // Method efficiency
  let eff = 0.92;
  let savingsPct = 50;
  if (method === 'sprinkler') { eff = 0.78; savingsPct = 30; }
  else if (method === 'furrow') { eff = 0.60; savingsPct = 15; }
  else if (method === 'flood') { eff = 0.45; savingsPct = 0; }

  // 1 acre-mm = ~4046.86 Liters
  const netDailyLiters = (acres * baseMm * 4047 * soilMult) / eff;

  // LPM by pump HP
  const lpm = hp * 40; // Approx 200 LPM for 5 HP
  const runtimeHours = netDailyLiters / (lpm * 60);

  // Power consumed (1 HP = 0.746 kW)
  const powerKwh = hp * 0.746 * runtimeHours;

  const litersEl = document.getElementById('calcWaterLiters');
  const runtimeEl = document.getElementById('calcRuntime');
  const savingsEl = document.getElementById('calcSavings');
  const powerEl = document.getElementById('calcPower');

  if (litersEl) litersEl.textContent = Math.round(netDailyLiters).toLocaleString('en-IN') + ' L';
  if (runtimeEl) {
    const hrs = Math.floor(runtimeHours);
    const mins = Math.round((runtimeHours - hrs) * 60);
    runtimeEl.textContent = `${hrs}h ${mins}m / day`;
  }
  if (savingsEl) savingsEl.textContent = savingsPct > 0 ? `${savingsPct}% Saved` : 'Base Level';
  if (powerEl) powerEl.textContent = powerKwh.toFixed(1) + ' kWh';
}

function togglePumpSimulation() {
  isPumpRunning = !isPumpRunning;
  const badge = document.getElementById('pumpStatusBadge');
  const btn = document.getElementById('pumpToggleBtn');

  if (isPumpRunning) {
    badge.className = 'badge badge-success';
    badge.textContent = '⚡ PUMP RUNNING';
    btn.className = 'btn btn-danger btn-sm';
    btn.textContent = '⏹ Stop Pump';
    showToast('Irrigation pump started 💧');

    pumpTimer = setInterval(() => {
      pumpSeconds++;
      const dur = document.getElementById('pumpDurationDisplay');
      if (dur) dur.textContent = formatPumpTime(pumpSeconds);
    }, 1000);
  } else {
    badge.className = 'badge badge-gray';
    badge.textContent = '⚪ PUMP IDLE';
    btn.className = 'btn btn-primary btn-sm';
    btn.textContent = '▶ Start Pump';
    showToast('Pump switched off.');
    clearInterval(pumpTimer);
  }
}

function formatPumpTime(totalSecs) {
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

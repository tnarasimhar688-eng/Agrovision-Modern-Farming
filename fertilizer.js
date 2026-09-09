/* ═══════════════════════════════════════
   fertilizer.js — Fertilizer Recommendation
   ═══════════════════════════════════════ */

function renderFertilizer() {
  const crops = JSON.parse(localStorage.getItem('smartfarm_crops') || '[]');
  const defaultCropId = crops.length > 0 ? crops[0].cropId : 'rice';

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">🧪 Fertilizer Recommendation & Split Scheduling</h1>
          <p class="page-subtitle">Scientific N-P-K nutrient balancing, split dose timelines, and subsidized cost estimation.</p>
        </div>
      </div>

      <!-- Calculator Card -->
      <div class="card" style="margin-bottom:24px">
        <div class="card-header">
          <span class="card-title">🧮 Fertilizer Dosage & Schedule Calculator</span>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Target Crop *</label>
              <select class="form-select" id="fert-crop" onchange="calculateFertilizerDose()">
                ${CROPS_DATA.map(c => `<option value="${c.id}" ${c.id === defaultCropId ? 'selected' : ''}>${c.emoji} ${c.name} (${c.season})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Field Area (Acres) *</label>
              <input class="form-input" id="fert-acres" type="number" step="0.5" min="0.1" value="2" oninput="calculateFertilizerDose()"/>
            </div>
            <div class="form-group">
              <label class="form-label">Current Soil Fertility</label>
              <select class="form-select" id="fert-status" onchange="calculateFertilizerDose()">
                <option value="low">Low Nutrient Soil (+20% Dosage)</option>
                <option value="medium" selected>Medium / Normal Fertility (Standard)</option>
                <option value="high">High Organic Fertility (-15% Dosage)</option>
              </select>
            </div>
          </div>

          <!-- Total Bag Requirement Summary -->
          <div class="grid-4" style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border)">
            <div style="background:var(--bg);padding:14px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Urea (46% N)</div>
              <div style="font-size:1.5rem;font-weight:800;color:var(--primary);margin-top:4px" id="bagUrea">-- Bags</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">45 kg / bag</div>
            </div>
            <div style="background:var(--bg);padding:14px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">DAP (18-46-0)</div>
              <div style="font-size:1.5rem;font-weight:800;color:#e65100;margin-top:4px" id="bagDAP">-- Bags</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">50 kg / bag</div>
            </div>
            <div style="background:var(--bg);padding:14px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">MOP (Potash 60%)</div>
              <div style="font-size:1.5rem;font-weight:800;color:#0d47a1;margin-top:4px" id="bagMOP">-- Bags</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">50 kg / bag</div>
            </div>
            <div style="background:var(--bg);padding:14px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Est. Fertilizer Cost</div>
              <div style="font-size:1.5rem;font-weight:800;color:#2e7d32;margin-top:4px" id="fertCost">₹0</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">Subsidized MRP</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Split Application Schedule Table -->
      <div class="card" style="margin-bottom:24px">
        <div class="card-header">
          <span class="card-title">📅 Split Application Timeline & Dosages</span>
        </div>
        <div class="card-body">
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Timeline</th>
                  <th>Nutrient Objective</th>
                  <th>Recommended Commercial Fertilizer</th>
                  <th>Application Method</th>
                </tr>
              </thead>
              <tbody id="fertScheduleBody">
                <!-- Injected dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Biofertilizers & Organic Formulations Guide -->
      <h2 class="section-title">🌿 Biofertilizers & Organic Alternatives</h2>
      <div class="grid-3">
        <div class="card">
          <div class="card-body">
            <div style="font-size:2rem;margin-bottom:8px">🦠</div>
            <h4 style="margin-bottom:6px">Rhizobium & Azotobacter</h4>
            <p style="font-size:0.83rem;color:var(--text-muted);margin-bottom:10px">
              Free-living and symbiotic nitrogen fixers. Inoculate 200g per 10kg seeds with jaggery water slurry. Saves 25% chemical nitrogen.
            </p>
            <span class="badge badge-success">For Pulses & Cereals</span>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div style="font-size:2rem;margin-bottom:8px">🧪</div>
            <h4 style="margin-bottom:6px">PSB (Phosphorus Solubilizer)</h4>
            <p style="font-size:0.83rem;color:var(--text-muted);margin-bottom:10px">
              Converts insoluble soil phosphates into plant-available orthophosphate ions. Apply 2 kg/acre mixed with 200kg FYM at sowing.
            </p>
            <span class="badge badge-info">Root Growth Booster</span>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div style="font-size:2rem;margin-bottom:8px">🍶</div>
            <h4 style="margin-bottom:6px">Jeevamrut & Panchagavya</h4>
            <p style="font-size:0.83rem;color:var(--text-muted);margin-bottom:10px">
              Traditional microbial liquid formulations from cow dung, urine, jaggery, pulse flour and virgin soil. Apply 200 L/acre via irrigation water every 15 days.
            </p>
            <span class="badge badge-purple">Organic Bio-Stimulant</span>
          </div>
        </div>
      </div>
    </div>
  `;

  calculateFertilizerDose();
}

function calculateFertilizerDose() {
  const cropId = document.getElementById('fert-crop')?.value;
  const acres = parseFloat(document.getElementById('fert-acres')?.value || '1');
  const status = document.getElementById('fert-status')?.value;

  const crop = CROPS_DATA.find(c => c.id === cropId) || CROPS_DATA[0];
  const npk = crop.npk || { n: 100, p: 50, k: 50 };

  let mult = 1.0;
  if (status === 'low') mult = 1.20;
  else if (status === 'high') mult = 0.85;

  // N, P, K in kg per acre required
  const reqN = npk.n * mult * acres;
  const reqP = npk.p * mult * acres;
  const reqK = npk.k * mult * acres;

  // DAP has 18% N and 46% P2O5
  // 1 bag DAP (50kg) gives 23 kg P and 9 kg N
  const dapBags = Math.ceil(reqP / 23) || 1;
  const nFromDap = dapBags * 9;

  // Remaining N from Urea (46% N)
  // 1 bag Urea (45kg) gives 20.7 kg N
  const remainingN = Math.max(0, reqN - nFromDap);
  const ureaBags = Math.ceil(remainingN / 20.7) || 1;

  // MOP has 60% K2O
  // 1 bag MOP (50kg) gives 30 kg K
  const mopBags = Math.ceil(reqK / 30) || 1;

  // Pricing: Urea = ₹266.50, DAP = ₹1350, MOP = ₹1700
  const cost = (ureaBags * 266.50) + (dapBags * 1350) + (mopBags * 1700);

  const bagUreaEl = document.getElementById('bagUrea');
  const bagDAPEl = document.getElementById('bagDAP');
  const bagMOPEl = document.getElementById('bagMOP');
  const fertCostEl = document.getElementById('fertCost');

  if (bagUreaEl) bagUreaEl.textContent = `${ureaBags} Bags (${ureaBags * 45} kg)`;
  if (bagDAPEl) bagDAPEl.textContent = `${dapBags} Bags (${dapBags * 50} kg)`;
  if (bagMOPEl) bagMOPEl.textContent = `${mopBags} Bags (${mopBags * 50} kg)`;
  if (fertCostEl) fertCostEl.textContent = formatCurrency(cost);

  // Render Split Table
  const tbody = document.getElementById('fertScheduleBody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td><strong>🌱 Basal Dose</strong></td>
        <td>At Sowing / Land Preparation</td>
        <td>Root anchorage and early vegetative surge</td>
        <td>
          <strong>${dapBags} bags DAP</strong> + <strong>${mopBags} bags MOP</strong> + <strong>${Math.floor(ureaBags * 0.33) || 1} bags Urea</strong>
        </td>
        <td>Broadcast evenly and incorporate into top 8-10 cm soil before last ploughing</td>
      </tr>
      <tr>
        <td><strong>🌿 1st Top Dressing</strong></td>
        <td>20 - 30 Days After Sowing (Tillering/Branching)</td>
        <td>Promote rapid canopy growth and tillering</td>
        <td><strong>${Math.ceil(ureaBags * 0.33) || 1} bags Urea</strong></td>
        <td>Top-dress after hand weeding when field soil has moderate moisture</td>
      </tr>
      <tr>
        <td><strong>🌾 2nd Top Dressing</strong></td>
        <td>45 - 55 Days After Sowing (Panicle / Flowering)</td>
        <td>Boost grain filling, boll retention and panicle size</td>
        <td><strong>${Math.ceil(ureaBags * 0.34) || 1} bags Urea</strong></td>
        <td>Broadcast in evening, follow immediately with light irrigation if required</td>
      </tr>
    `;
  }
}

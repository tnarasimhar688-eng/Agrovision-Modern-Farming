/* ═══════════════════════════════════════
   profit.js — Profit Calculator Module
   ═══════════════════════════════════════ */

function renderProfit() {
  const crops = JSON.parse(localStorage.getItem('smartfarm_crops') || '[]');
  const defaultCropId = crops.length > 0 ? crops[0].cropId : 'rice';

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">📈 Crop Profit &amp; ROI Calculator</h1>
          <p class="page-subtitle">Evaluate crop economics, calculate break-even prices, and compare crop returns.</p>
        </div>
      </div>

      <!-- Main Calculator Card -->
      <div class="card" style="margin-bottom:24px">
        <div class="card-header">
          <span class="card-title">🧮 Cultivation Economics &amp; Net Return Estimator</span>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Select Crop</label>
              <select class="form-select" id="prof-crop" onchange="handleProfitCropChange()">
                ${CROPS_DATA.map(c => `<option value="${c.id}" ${c.id === defaultCropId ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Field Area (Acres)</label>
              <input class="form-input" id="prof-acres" type="number" step="0.5" min="0.1" value="2" oninput="calculateProfit()"/>
            </div>
            <div class="form-group">
              <label class="form-label">Yield per Acre (Quintals)</label>
              <input class="form-input" id="prof-yield" type="number" step="1" min="1" value="22" oninput="calculateProfit()"/>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Selling Market Price (₹ / Quintal)</label>
              <input class="form-input" id="prof-price" type="number" step="50" min="100" value="2200" oninput="calculateProfit()"/>
            </div>
            <div class="form-group">
              <label class="form-label">Cost of Cultivation (₹ Total for field)</label>
              <input class="form-input" id="prof-cost" type="number" step="500" min="0" value="32000" oninput="calculateProfit()"/>
            </div>
          </div>

          <!-- Economics Output Card -->
          <div class="grid-4" style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border)">
            <div style="background:var(--bg);padding:16px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Gross Revenue</div>
              <div style="font-size:1.5rem;font-weight:800;color:var(--primary);margin-top:4px" id="outGross">₹0</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px" id="outTotalYield">-- Total Quintals</div>
            </div>

            <div style="background:var(--bg);padding:16px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Cultivation Outflow</div>
              <div style="font-size:1.5rem;font-weight:800;color:#c62828;margin-top:4px" id="outCost">₹0</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px" id="outCostPerAcre">-- / acre</div>
            </div>

            <div style="background:var(--bg);padding:16px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Net Profit</div>
              <div style="font-size:1.6rem;font-weight:800;color:#2e7d32;margin-top:4px" id="outNetProfit">₹0</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px" id="outProfitPerAcre">-- / acre</div>
            </div>

            <div style="background:var(--bg);padding:16px;border-radius:var(--radius);text-align:center">
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Return on Investment (ROI)</div>
              <div style="font-size:1.6rem;font-weight:800;color:#0288d1;margin-top:4px" id="outRoi">0%</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px" id="outBreakEven">Break-even: --</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Crop Comparison Simulator -->
      <h2 class="section-title">⚖️ Side-by-Side Crop Comparison Simulator</h2>
      <div class="grid-2">
        <!-- Option A -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Option A: Cereal / Pulse</span>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Crop</label>
              <select class="form-select" id="cmpCropA" onchange="runCropComparison()">
                <option value="rice">🌾 Rice (Paddy)</option>
                <option value="wheat">🌻 Wheat</option>
                <option value="maize">🌽 Maize</option>
                <option value="soybean">🫘 Soybean</option>
              </select>
            </div>
            <div id="cmpResultA"></div>
          </div>
        </div>

        <!-- Option B -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Option B: Commercial / Cash Crop</span>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Crop</label>
              <select class="form-select" id="cmpCropB" onchange="runCropComparison()">
                <option value="cotton">🌿 Cotton</option>
                <option value="chilli">🌶️ Chilli</option>
                <option value="groundnut">🥜 Groundnut</option>
                <option value="tomato">🍅 Tomato</option>
              </select>
            </div>
            <div id="cmpResultB"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  handleProfitCropChange();
  runCropComparison();
}

function handleProfitCropChange() {
  const cropId = document.getElementById('prof-crop')?.value;
  const crop = CROPS_DATA.find(c => c.id === cropId);
  const mp = BASE_MARKET_PRICES.find(p => p.crop.toLowerCase() === crop?.name.toLowerCase());

  const yieldInput = document.getElementById('prof-yield');
  const priceInput = document.getElementById('prof-price');

  if (crop && yieldInput) {
    const yVal = parseInt(crop.yieldPerAcre) || 20;
    yieldInput.value = yVal;
  }
  if (mp && priceInput) {
    priceInput.value = mp.price;
  }

  // Check if there are recorded expenses for this crop in localStorage
  const expenses = JSON.parse(localStorage.getItem('smartfarm_expenses') || '[]');
  const cropExp = expenses.filter(e => e.cropName && crop && e.cropName.toLowerCase().includes(crop.name.toLowerCase()));
  if (cropExp.length > 0) {
    const totalLinkedExp = cropExp.reduce((s, e) => s + Number(e.amount || 0), 0);
    const costInput = document.getElementById('prof-cost');
    if (costInput) costInput.value = totalLinkedExp;
  }

  calculateProfit();
}

function calculateProfit() {
  const acres = parseFloat(document.getElementById('prof-acres')?.value || '1');
  const yieldPerAcre = parseFloat(document.getElementById('prof-yield')?.value || '15');
  const price = parseFloat(document.getElementById('prof-price')?.value || '2000');
  const cost = parseFloat(document.getElementById('prof-cost')?.value || '20000');

  const totalYield = yieldPerAcre * acres;
  const gross = totalYield * price;
  const net = gross - cost;
  const roi = cost > 0 ? ((net / cost) * 100).toFixed(1) : '0';
  const breakEven = totalYield > 0 ? (cost / totalYield).toFixed(0) : '0';

  const grossEl = document.getElementById('outGross');
  const costEl = document.getElementById('outCost');
  const netEl = document.getElementById('outNetProfit');
  const roiEl = document.getElementById('outRoi');
  const totalYieldEl = document.getElementById('outTotalYield');
  const costPerAcreEl = document.getElementById('outCostPerAcre');
  const profitPerAcreEl = document.getElementById('outProfitPerAcre');
  const breakEvenEl = document.getElementById('outBreakEven');

  if (grossEl) grossEl.textContent = formatCurrency(gross);
  if (costEl) costEl.textContent = formatCurrency(cost);
  if (netEl) {
    netEl.textContent = formatCurrency(net);
    netEl.style.color = net >= 0 ? '#2e7d32' : '#c62828';
  }
  if (roiEl) {
    roiEl.textContent = `${roi}%`;
    roiEl.style.color = net >= 0 ? '#0288d1' : '#c62828';
  }
  if (totalYieldEl) totalYieldEl.textContent = `${totalYield} Quintals total`;
  if (costPerAcreEl) costPerAcreEl.textContent = `${formatCurrency(acres > 0 ? cost / acres : 0)} / acre`;
  if (profitPerAcreEl) profitPerAcreEl.textContent = `${formatCurrency(acres > 0 ? net / acres : 0)} / acre`;
  if (breakEvenEl) breakEvenEl.textContent = `Break-even: ₹${breakEven}/qtl`;
}

function runCropComparison() {
  const cAId = document.getElementById('cmpCropA')?.value || 'rice';
  const cBId = document.getElementById('cmpCropB')?.value || 'cotton';

  const cA = CROPS_DATA.find(x => x.id === cAId);
  const cB = CROPS_DATA.find(x => x.id === cBId);

  const mpA = BASE_MARKET_PRICES.find(p => p.crop.toLowerCase() === cA?.name.toLowerCase()) || { price: 2180 };
  const mpB = BASE_MARKET_PRICES.find(p => p.crop.toLowerCase() === cB?.name.toLowerCase()) || { price: 6500 };

  const yA = parseInt(cA?.yieldPerAcre) || 22;
  const yB = parseInt(cB?.yieldPerAcre) || 10;

  const revA = yA * mpA.price;
  const revB = yB * mpB.price;

  const costA = 18000;
  const costB = 28000;

  const netA = revA - costA;
  const netB = revB - costB;

  const resA = document.getElementById('cmpResultA');
  const resB = document.getElementById('cmpResultB');

  if (resA) {
    resA.innerHTML = `
      <div style="background:var(--bg);padding:14px;border-radius:var(--radius-sm);line-height:1.8">
        <div style="display:flex;justify-content:space-between"><span>Avg Yield:</span><strong>${yA} Qtl/acre</strong></div>
        <div style="display:flex;justify-content:space-between"><span>Price (Mandi):</span><strong>₹${mpA.price}/Qtl</strong></div>
        <div style="display:flex;justify-content:space-between"><span>Est. Cost:</span><span style="color:#c62828">₹${costA.toLocaleString('en-IN')}/acre</span></div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:6px;font-size:1.05rem">
          <span>Est. Net Profit:</span><strong style="color:#2e7d32">${formatCurrency(netA)}/acre</strong>
        </div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px">Duration: ${cA?.duration} days · Water: ${cA?.waterNeed}</div>
      </div>
    `;
  }

  if (resB) {
    resB.innerHTML = `
      <div style="background:var(--bg);padding:14px;border-radius:var(--radius-sm);line-height:1.8">
        <div style="display:flex;justify-content:space-between"><span>Avg Yield:</span><strong>${yB} Qtl/acre</strong></div>
        <div style="display:flex;justify-content:space-between"><span>Price (Mandi):</span><strong>₹${mpB.price}/Qtl</strong></div>
        <div style="display:flex;justify-content:space-between"><span>Est. Cost:</span><span style="color:#c62828">₹${costB.toLocaleString('en-IN')}/acre</span></div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:6px;font-size:1.05rem">
          <span>Est. Net Profit:</span><strong style="color:#2e7d32">${formatCurrency(netB)}/acre</strong>
        </div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px">Duration: ${cB?.duration} days · Water: ${cB?.waterNeed}</div>
      </div>
    `;
  }
}

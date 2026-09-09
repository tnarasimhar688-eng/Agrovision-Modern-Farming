/* ═══════════════════════════════════════
   market.js — Market Mandi Prices & Trends
   ═══════════════════════════════════════ */

let marketSearchQuery = '';

const MSP_DATA = [
  { crop: 'Paddy (Common)', season: 'Kharif', msp: 2300, costOfProd: 1533, margin: '50%' },
  { crop: 'Wheat',          season: 'Rabi',   msp: 2425, costOfProd: 1192, margin: '103%' },
  { crop: 'Cotton (Medium)',season: 'Kharif', msp: 7121, costOfProd: 4747, margin: '50%' },
  { crop: 'Soybean (Yellow)',season: 'Kharif',msp: 4892, costOfProd: 3261, margin: '50%' },
  { crop: 'Groundnut',      season: 'Kharif', msp: 6783, costOfProd: 4522, margin: '50%' },
  { crop: 'Maize',          season: 'Kharif', msp: 2225, costOfProd: 1483, margin: '50%' },
  { crop: 'Mustard',        season: 'Rabi',   msp: 5950, costOfProd: 2987, margin: '99%' },
  { crop: 'Gram (Chana)',   season: 'Rabi',   msp: 5650, costOfProd: 3500, margin: '61%' },
  { crop: 'Moong',          season: 'Kharif', msp: 8682, costOfProd: 5788, margin: '50%' },
  { crop: 'Tur / Arhar',    season: 'Kharif', msp: 7550, costOfProd: 5033, margin: '50%' }
];

function renderMarket() {
  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">💰 Mandi Prices & Market Intelligence</h1>
          <p class="page-subtitle">Real-time modal mandi rates, 24h market fluctuations, and official MSP benchmark comparisons.</p>
        </div>
      </div>

      <!-- Quick Market Highlights -->
      <div class="grid-4" style="margin-bottom:24px">
        <div class="stat-card">
          <span class="stat-icon">🌾</span>
          <div>
            <div class="stat-value">₹2,183</div>
            <div class="stat-label">Paddy Modal (Delhi)</div>
          </div>
        </div>
        <div class="stat-card info">
          <span class="stat-icon">🌻</span>
          <div>
            <div class="stat-value">₹2,275</div>
            <div class="stat-label">Wheat Modal (Amritsar)</div>
          </div>
        </div>
        <div class="stat-card accent">
          <span class="stat-icon">🌿</span>
          <div>
            <div class="stat-value">₹6,500</div>
            <div class="stat-label">Cotton Modal (Rajkot)</div>
          </div>
        </div>
        <div class="stat-card danger">
          <span class="stat-icon">🌶️</span>
          <div>
            <div class="stat-value">₹12,000</div>
            <div class="stat-label">Chilli Modal (Guntur)</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="marketTabs">
        <button class="tab-btn active" data-tab="tab-mandi-rates">📊 Live Mandi Rates (${BASE_MARKET_PRICES.length})</button>
        <button class="tab-btn" data-tab="tab-msp-rates">🏛️ MSP Benchmark Guide (2025-26)</button>
        <button class="tab-btn" data-tab="tab-market-chart">📈 Price Comparison Chart</button>
        <button class="tab-btn" data-tab="tab-advisory">💡 Market Selling Advisory</button>
      </div>

      <!-- TAB 1: Mandi Rates Table -->
      <div class="tab-content active" id="tab-mandi-rates">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Daily Modal Rates across Major APMC Mandis</span>
            <div class="form-group" style="margin-bottom:0">
              <input class="form-input" id="marketSearch" type="text" placeholder="Search crop or mandi..." style="max-width:240px;padding:6px 12px;font-size:0.85rem" oninput="handleMarketSearch(this.value)"/>
            </div>
          </div>
          <div class="card-body">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Commodity</th>
                    <th>Major APMC Mandi</th>
                    <th>Modal Price</th>
                    <th>Unit</th>
                    <th>24h Change</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="mandiTableBody">
                  ${renderMandiTableRows(BASE_MARKET_PRICES)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: MSP Benchmark -->
      <div class="tab-content" id="tab-msp-rates">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Cabinet Committee on Economic Affairs (CCEA) - Minimum Support Prices</span>
          </div>
          <div class="card-body">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Season</th>
                    <th>MSP Rate (₹/Qtl)</th>
                    <th>Cost of Production (₹/Qtl)</th>
                    <th>Farmer Return Margin</th>
                  </tr>
                </thead>
                <tbody>
                  ${MSP_DATA.map(m => `
                    <tr>
                      <td><strong>${m.crop}</strong></td>
                      <td><span class="badge ${m.season === 'Kharif' ? 'badge-success' : 'badge-warning'}">${m.season}</span></td>
                      <td><strong style="color:var(--primary);font-size:1.05rem">₹${m.msp.toLocaleString('en-IN')}</strong></td>
                      <td style="color:var(--text-muted)">₹${m.costOfProd.toLocaleString('en-IN')}</td>
                      <td><span class="badge badge-success">+${m.margin} above cost</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: Comparison Chart -->
      <div class="tab-content" id="tab-market-chart">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Modal Price Comparison across Agricultural Commodities (₹ / Quintal)</span>
          </div>
          <div class="card-body" style="height:380px">
            <canvas id="marketChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- TAB 4: Selling Advisory -->
      <div class="tab-content" id="tab-advisory">
        <div class="grid-2">
          <div class="card">
            <div class="card-header">
              <span class="card-title">💡 Post-Harvest Marketing Strategy</span>
            </div>
            <div class="card-body">
              <div style="margin-bottom:16px">
                <h4 style="color:#2e7d32;margin-bottom:4px">🌾 Peak Arrival Price Drops</h4>
                <p style="font-size:0.85rem;color:var(--text-muted)">
                  Commodity prices typically dip 15-25% during the first 30 days of peak harvest season due to market glut. Avoid distress selling at the farm gate.
                </p>
              </div>
              <div style="margin-bottom:16px">
                <h4 style="color:#1565c0;margin-bottom:4px">🏛️ WDRA Warehouse Receipt Pledge</h4>
                <p style="font-size:0.85rem;color:var(--text-muted)">
                  Store your harvested grain in WDRA-accredited warehouses and avail electronic Negotiable Warehouse Receipt (eNWR) loans from banks up to 75% of produce value at 7% interest.
                </p>
              </div>
              <div>
                <h4 style="color:#e65100;margin-bottom:4px">💻 Direct e-NAM Online Auctions</h4>
                <p style="font-size:0.85rem;color:var(--text-muted)">
                  Grade and assay your produce at local eNAM mandis to attract inter-state and online bids, eliminating middleman commissions.
                </p>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-title">📈 Sell vs Store Decision Estimator</span>
            </div>
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Select Your Produce</label>
                <select class="form-select" id="advCrop">
                  ${BASE_MARKET_PRICES.map(p => `<option value="${p.price}">${p.emoji} ${p.crop} (Current: ₹${p.price})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Harvested Quantity (Quintals)</label>
                <input class="form-input" id="advQty" type="number" value="50"/>
              </div>
              <button class="btn btn-primary btn-full" onclick="calculateSellingDecision()">Evaluate Timing Strategy</button>
              <div id="advResult" style="margin-top:16px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  tabs('marketTabs', 'tab-mandi-rates');
  initMarketChart();
}

function renderMandiTableRows(list) {
  if (list.length === 0) {
    return '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted)">No commodities found.</td></tr>';
  }

  return list.map(p => {
    const isUp = p.change >= 0;
    return `
      <tr>
        <td><strong>${p.emoji || '🌾'} ${p.crop}</strong></td>
        <td>${p.market}</td>
        <td><strong style="font-size:1.05rem">₹${p.price.toLocaleString('en-IN')}</strong></td>
        <td style="color:var(--text-muted);font-size:0.82rem">${p.unit}</td>
        <td class="${isUp ? 'price-up' : 'price-down'}">
          ${isUp ? '▲ +' : '▼ '}${p.change}%
        </td>
        <td>
          <span class="badge ${isUp ? 'badge-success' : 'badge-danger'}">
            ${isUp ? 'Bullish' : 'Bearish'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function handleMarketSearch(query) {
  marketSearchQuery = (query || '').toLowerCase().trim();
  const filtered = BASE_MARKET_PRICES.filter(p => 
    p.crop.toLowerCase().includes(marketSearchQuery) ||
    p.market.toLowerCase().includes(marketSearchQuery)
  );
  const tbody = document.getElementById('mandiTableBody');
  if (tbody) tbody.innerHTML = renderMandiTableRows(filtered);
}

function initMarketChart() {
  const canvas = document.getElementById('marketChartCanvas');
  if (!canvas) return;

  destroyChart('marketChartCanvas');

  const topItems = BASE_MARKET_PRICES.slice(0, 10);
  const labels = topItems.map(p => p.crop);
  const data = topItems.map(p => p.price);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Modal Rate (₹/Quintal)',
        data,
        backgroundColor: '#2d7a2d',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: v => '₹' + v.toLocaleString('en-IN') }
        }
      }
    }
  });
}

function calculateSellingDecision() {
  const curPrice = parseFloat(document.getElementById('advCrop')?.value || '2000');
  const qty = parseFloat(document.getElementById('advQty')?.value || '50');
  const resultEl = document.getElementById('advResult');
  if (!resultEl) return;

  const currentWorth = curPrice * qty;
  const projectedWorth = currentWorth * 1.15; // 15% recovery expected in 90 days
  const storageCost = qty * 45 * 3; // ₹45/qtl/month storage fee for 3 months
  const netGain = projectedWorth - currentWorth - storageCost;

  resultEl.innerHTML = `
    <div style="background:var(--bg);padding:14px;border-radius:var(--radius-sm);border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span>Current Spot Sale:</span>
        <strong>${formatCurrency(currentWorth)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span>Est. Value after 3 Months:</span>
        <strong style="color:var(--primary)">${formatCurrency(projectedWorth)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span>3 Months Storage Fees:</span>
        <span style="color:#c62828">${formatCurrency(storageCost)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:8px;font-size:1rem">
        <strong>Net Benefit of Storing:</strong>
        <strong style="color:#2e7d32">${formatCurrency(netGain)}</strong>
      </div>
      <div class="alert alert-success" style="margin-top:12px;margin-bottom:0">
        ✅ Recommendation: Storing in a licensed warehouse can yield ~${formatCurrency(netGain)} in higher returns.
      </div>
    </div>
  `;
}

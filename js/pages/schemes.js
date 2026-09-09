/* ═══════════════════════════════════════
   schemes.js — Government Schemes & Subsidies
   ═══════════════════════════════════════ */

let currentSchemeCategory = 'All';
let currentSchemeSearch = '';

function renderSchemes() {
  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">🏛️ Government Schemes &amp; Subsidies</h1>
          <p class="page-subtitle">Central and state agricultural welfare schemes, direct income transfers, and credit facilities.</p>
        </div>
        <button class="btn btn-primary" onclick="openEligibilityCheckerModal()">🎯 Check My Eligibility</button>
      </div>

      <!-- Search & Filters -->
      <div class="card" style="margin-bottom:24px">
        <div class="card-body">
          <div class="form-row" style="align-items:flex-end">
            <div class="form-group" style="flex:2">
              <label class="form-label">Search Schemes</label>
              <input class="form-input" id="schemeSearchInput" type="text" placeholder="Search PM-KISAN, KCC, Solar Pump, Organic subsidy..." oninput="handleSchemeSearch(this.value)"/>
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-select" id="schemeCatSelect" onchange="handleSchemeCatFilter(this.value)">
                <option value="All">All Categories</option>
                <option value="Subsidy">Cash Subsidies &amp; Grants</option>
                <option value="Insurance">Crop Insurance (PMFBY)</option>
                <option value="Credit">Credit &amp; Loans (KCC)</option>
                <option value="Technology">Solar &amp; Technology (PM-KUSUM)</option>
                <option value="Infrastructure">Post-Harvest &amp; Storage</option>
                <option value="Input">Soil &amp; Fertilizer Inputs</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Schemes Grid -->
      <div class="grid-2" id="schemesGrid">
        ${renderSchemeCardList(SCHEMES_DATA)}
      </div>
    </div>
  `;
}

function renderSchemeCardList(list) {
  if (list.length === 0) {
    return `
      <div style="grid-column:1/-1" class="empty-state">
        <div class="empty-icon">🏛️</div>
        <p>No schemes matched your search.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetSchemeFilters()">Reset Filters</button>
      </div>
    `;
  }

  return list.map(s => `
    <div class="scheme-card" onclick="openSchemeDetailModal('${s.id}')">
      <div class="scheme-card-header">
        <div>
          <div class="scheme-name">${s.name} — ${s.fullName}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${s.ministry}</div>
        </div>
        <span class="badge ${s.category === 'Subsidy' ? 'badge-success' : s.category === 'Credit' ? 'badge-info' : 'badge-warning'}">
          ${s.category}
        </span>
      </div>

      <div class="scheme-benefit">${s.benefit}</div>
      <p class="scheme-desc">${s.description}</p>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:0.8rem">
        <span style="color:var(--text-muted)">Deadline: <strong>${s.deadline || 'Rolling'}</strong></span>
        <span style="color:var(--primary);font-weight:700">View Guidelines &rarr;</span>
      </div>
    </div>
  `).join('');
}

function handleSchemeSearch(val) {
  currentSchemeSearch = (val || '').toLowerCase().trim();
  applySchemeFilters();
}
function handleSchemeCatFilter(val) {
  currentSchemeCategory = val;
  applySchemeFilters();
}

function applySchemeFilters() {
  const filtered = SCHEMES_DATA.filter(s => {
    const matchSearch = !currentSchemeSearch ||
      s.name.toLowerCase().includes(currentSchemeSearch) ||
      s.fullName.toLowerCase().includes(currentSchemeSearch) ||
      s.description.toLowerCase().includes(currentSchemeSearch) ||
      (s.benefit && s.benefit.toLowerCase().includes(currentSchemeSearch));

    const matchCat = currentSchemeCategory === 'All' || s.category.toLowerCase() === currentSchemeCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  const grid = document.getElementById('schemesGrid');
  if (grid) grid.innerHTML = renderSchemeCardList(filtered);
}

function resetSchemeFilters() {
  currentSchemeSearch = '';
  currentSchemeCategory = 'All';
  document.getElementById('schemeSearchInput').value = '';
  document.getElementById('schemeCatSelect').value = 'All';
  applySchemeFilters();
}

function openSchemeDetailModal(schemeId) {
  const s = SCHEMES_DATA.find(x => x.id === schemeId);
  if (!s) return;

  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h3>${s.name}</h3>
            <div style="font-size:0.82rem;color:var(--text-muted)">${s.fullName} · ${s.ministry}</div>
          </div>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>

        <div class="modal-body">
          <div style="background:#e8f5e9;padding:14px;border-radius:var(--radius-sm);border:1px solid #c8e6c9;margin-bottom:18px">
            <div style="font-size:0.75rem;color:#2e7d32;font-weight:700;text-transform:uppercase">Financial Benefit &amp; Coverage</div>
            <div style="font-size:1.25rem;font-weight:800;color:#1b5e20;margin-top:2px">${s.benefit}</div>
          </div>

          <p style="font-size:0.92rem;margin-bottom:18px;line-height:1.5">${s.description}</p>

          <!-- Eligibility -->
          <div style="margin-bottom:18px">
            <h4 style="margin-bottom:8px;font-size:0.9rem">✅ Eligibility Requirements</h4>
            <ul style="list-style:disc;margin-left:20px;font-size:0.85rem">
              ${(s.eligibility || []).map(e => `<li style="margin-bottom:4px">${e}</li>`).join('')}
            </ul>
          </div>

          <!-- Application Process -->
          <div style="margin-bottom:18px">
            <h4 style="margin-bottom:8px;font-size:0.9rem">📝 How to Apply (Step-by-Step)</h4>
            <ol style="margin-left:20px;font-size:0.85rem;color:var(--text)">
              ${(s.applicationProcess || []).map(p => `<li style="margin-bottom:4px">${p}</li>`).join('')}
            </ol>
          </div>

          <!-- Required Docs -->
          <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);font-size:0.82rem;color:var(--text-muted)">
            <strong>Essential Documents:</strong> Aadhaar Card, Land Revenue Record (Pattadar Passbook / 7/12 Extract), Bank Passbook with IFSC, Sowing Certificate.
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
          <a href="${s.link}" target="_blank" rel="noopener" class="btn btn-primary">Visit Official Portal ↗</a>
        </div>
      </div>
    </div>
  `;

  openModal(modalHtml);
}

function openEligibilityCheckerModal() {
  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>🎯 Scheme Eligibility Wizard</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px">
            Enter your land and farm profile to discover all eligible central and state welfare initiatives.
          </p>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Total Landholding</label>
              <select class="form-select" id="wiz-land" onchange="runEligibilityCheck()">
                <option value="marginal">Marginal (< 2.5 Acres)</option>
                <option value="small" selected>Small (2.5 - 5 Acres)</option>
                <option value="medium">Medium (5 - 10 Acres)</option>
                <option value="large">Large (> 10 Acres)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Primary Farming Type</label>
              <select class="form-select" id="wiz-type" onchange="runEligibilityCheck()">
                <option value="crops">Field Crops (Cereals, Pulses, Cotton)</option>
                <option value="horticulture">Horticulture (Vegetables &amp; Fruits)</option>
                <option value="organic">Organic / Natural Farming</option>
                <option value="solar">Seeking Solar Irrigation</option>
              </select>
            </div>
          </div>

          <div id="wizResultsWrap" style="margin-top:20px">
            <!-- Results injected here -->
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `;

  openModal(modalHtml);
  runEligibilityCheck();
}

function runEligibilityCheck() {
  const land = document.getElementById('wiz-land')?.value || 'small';
  const type = document.getElementById('wiz-type')?.value || 'crops';
  const wrap = document.getElementById('wizResultsWrap');
  if (!wrap) return;

  const matched = [];

  // PM-KISAN for all small/marginal
  if (['marginal', 'small'].includes(land)) {
    matched.push(SCHEMES_DATA.find(s => s.id === 'pmkisan'));
  }
  // PMFBY & KCC for all
  matched.push(SCHEMES_DATA.find(s => s.id === 'pmfby'));
  matched.push(SCHEMES_DATA.find(s => s.id === 'kcc'));

  if (type === 'organic') matched.push(SCHEMES_DATA.find(s => s.id === 'pkvy'));
  if (type === 'solar') matched.push(SCHEMES_DATA.find(s => s.id === 'pmkusum'));
  if (type === 'horticulture') matched.push(SCHEMES_DATA.find(s => s.id === 'midh'));

  // Always add Soil Health Card
  matched.push(SCHEMES_DATA.find(s => s.id === 'shc'));

  const cleanMatches = matched.filter(Boolean);

  wrap.innerHTML = `
    <div style="font-size:0.85rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px">
      🌟 ${cleanMatches.length} Schemes You Are Pre-Qualified For:
    </div>
    ${cleanMatches.map(s => `
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${s.name}</strong>
          <div style="font-size:0.8rem;color:var(--primary);font-weight:700">${s.benefit}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="closeModal(); openSchemeDetailModal('${s.id}')">View Details</button>
      </div>
    `).join('')}
  `;
}

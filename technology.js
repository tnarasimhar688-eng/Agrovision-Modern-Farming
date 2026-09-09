/* ═══════════════════════════════════════
   technology.js — Modern Farming Technologies
   ═══════════════════════════════════════ */

let currentTechCat = 'All';

function renderTechnology() {
  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">🤖 Modern Farming Technologies &amp; AgriTech</h1>
          <p class="page-subtitle">Precision drones, IoT field sensors, solar micro-irrigation, and AI diagnostic ecosystems.</p>
        </div>
        <button class="btn btn-primary" onclick="openTechRoiModal()">🧮 Technology ROI Calculator</button>
      </div>

      <!-- Category Filter Pills -->
      <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap">
        <button class="btn btn-sm ${currentTechCat === 'All' ? 'btn-primary' : 'btn-ghost'}" onclick="filterTech('All')">All Technologies</button>
        <button class="btn btn-sm ${currentTechCat === 'AI' ? 'btn-primary' : 'btn-ghost'}" onclick="filterTech('AI')">🤖 AI &amp; Computer Vision</button>
        <button class="btn btn-sm ${currentTechCat === 'IoT' ? 'btn-primary' : 'btn-ghost'}" onclick="filterTech('IoT')">📡 IoT Sensors &amp; Automation</button>
        <button class="btn btn-sm ${currentTechCat === 'Digital' ? 'btn-primary' : 'btn-ghost'}" onclick="filterTech('Digital')">🛰️ GPS &amp; Digital Traceability</button>
        <button class="btn btn-sm ${currentTechCat === 'Mechanical' ? 'btn-primary' : 'btn-ghost'}" onclick="filterTech('Mechanical')">🏡 Solar &amp; Polyhouse</button>
        <button class="btn btn-sm ${currentTechCat === 'Biological' ? 'btn-primary' : 'btn-ghost'}" onclick="filterTech('Biological')">🌿 Hydroponics &amp; Soilless</button>
      </div>

      <!-- Tech Cards Grid -->
      <div class="grid-2" id="techGrid">
        ${renderTechCardList(TECH_DATA)}
      </div>
    </div>
  `;
}

function renderTechCardList(list) {
  const filtered = currentTechCat === 'All' ? list : list.filter(t => t.category === currentTechCat);

  if (filtered.length === 0) {
    return `<div style="grid-column:1/-1" class="empty-state"><p>No technologies in this category.</p></div>`;
  }

  return filtered.map(t => `
    <div class="tech-card" onclick="openTechDetailModal('${t.id}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="tech-emoji">${t.emoji || '🤖'}</div>
        <span class="badge badge-info">${t.category}</span>
      </div>

      <div class="tech-name">${t.name}</div>
      <p class="tech-desc">${t.description}</p>

      <!-- Key Metrics Strip -->
      <div class="grid-3" style="margin:16px 0;background:var(--bg);padding:10px;border-radius:var(--radius-sm);text-align:center">
        <div>
          <div style="font-size:0.68rem;color:var(--text-muted);text-transform:uppercase">Yield Boost</div>
          <strong style="color:var(--primary);font-size:0.95rem">+${t.yieldIncrease}%</strong>
        </div>
        <div>
          <div style="font-size:0.68rem;color:var(--text-muted);text-transform:uppercase">Water Saved</div>
          <strong style="color:#0288d1;font-size:0.95rem">${t.waterSaving}%</strong>
        </div>
        <div>
          <div style="font-size:0.68rem;color:var(--text-muted);text-transform:uppercase">Labor Saved</div>
          <strong style="color:#e65100;font-size:0.95rem">${t.labourSaving}%</strong>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem">
        <span style="color:var(--text-muted)">Cost: <strong>${t.cost}</strong></span>
        <span style="color:var(--primary);font-weight:700">Implementation Guide &rarr;</span>
      </div>
    </div>
  `).join('');
}

function filterTech(cat) {
  currentTechCat = cat;
  renderTechnology();
}

function openTechDetailModal(techId) {
  const t = TECH_DATA.find(x => x.id === techId);
  if (!t) return;

  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:2.4rem">${t.emoji || '🤖'}</span>
            <div>
              <h3>${t.name}</h3>
              <div style="font-size:0.8rem;color:var(--text-muted)">Category: ${t.category}</div>
            </div>
          </div>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>

        <div class="modal-body">
          <p style="font-size:0.92rem;margin-bottom:16px;line-height:1.5">${t.description}</p>

          <!-- Core Benefits -->
          <div style="background:#e8f5e9;padding:14px;border-radius:var(--radius-sm);margin-bottom:16px;border:1px solid #c8e6c9">
            <h4 style="color:#1b5e20;margin-bottom:8px;font-size:0.9rem">🌟 Primary Agronomic &amp; Economic Benefits</h4>
            <ul style="list-style:disc;margin-left:20px;font-size:0.85rem;color:#2e7d32">
              ${(t.benefits || []).map(b => `<li style="margin-bottom:4px">${b}</li>`).join('')}
            </ul>
          </div>

          <!-- Implementation Roadmap -->
          <div style="margin-bottom:16px">
            <h4 style="margin-bottom:6px;font-size:0.9rem">🚀 How to Adopt on Your Farm</h4>
            <p style="font-size:0.85rem;color:var(--text-muted);line-height:1.5">${t.implementation}</p>
          </div>

          <!-- Economics -->
          <div class="grid-2" style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);font-size:0.85rem">
            <div><strong>Investment:</strong> ${t.cost}</div>
            <div><strong>Est. ROI Period:</strong> ${t.roiYears > 0 ? t.roiYears + ' Years' : 'Immediate Rental Payback'}</div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
          <button class="btn btn-primary" onclick="closeModal(); openTechRoiModal('${t.name}')">Calculate My Farm ROI</button>
        </div>
      </div>
    </div>
  `;

  openModal(modalHtml);
}

function openTechRoiModal(preselectedTech) {
  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>🧮 Modern Technology ROI &amp; Payback Calculator</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Select Modern Technology</label>
            <select class="form-select" id="roi-tech" onchange="computeTechRoi()">
              ${TECH_DATA.map(t => `<option value="${t.id}" ${t.name === preselectedTech ? 'selected' : ''}>${t.emoji} ${t.name}</option>`).join('')}
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Farm Size (Acres)</label>
              <input class="form-input" id="roi-acres" type="number" min="0.5" step="0.5" value="3" oninput="computeTechRoi()"/>
            </div>
            <div class="form-group">
              <label class="form-label">Current Annual Farm Income (₹)</label>
              <input class="form-input" id="roi-income" type="number" step="10000" value="150000" oninput="computeTechRoi()"/>
            </div>
          </div>

          <div id="roiResultWrap" style="margin-top:20px">
            <!-- Dynamic ROI output injected here -->
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `;

  openModal(modalHtml);
  computeTechRoi();
}

function computeTechRoi() {
  const techId = document.getElementById('roi-tech')?.value;
  const acres = parseFloat(document.getElementById('roi-acres')?.value || '1');
  const income = parseFloat(document.getElementById('roi-income')?.value || '100000');
  const wrap = document.getElementById('roiResultWrap');
  if (!wrap) return;

  const t = TECH_DATA.find(x => x.id === techId) || TECH_DATA[0];

  const yieldGain = (income * (t.yieldIncrease / 100));
  const waterSavingsVal = acres * 3500 * (t.waterSaving / 100);
  const laborSavingsVal = acres * 6000 * (t.labourSaving / 100);
  const totalAnnualBenefit = yieldGain + waterSavingsVal + laborSavingsVal;

  wrap.innerHTML = `
    <div style="background:var(--bg);padding:16px;border-radius:var(--radius-sm);border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.88rem">
        <span>Extra Annual Yield Revenue (+${t.yieldIncrease}%):</span>
        <strong style="color:var(--primary)">+${formatCurrency(yieldGain)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.88rem">
        <span>Water &amp; Power Savings (${t.waterSaving}%):</span>
        <strong>+${formatCurrency(waterSavingsVal)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:0.88rem">
        <span>Labor Cost Reductions (${t.labourSaving}%):</span>
        <strong>+${formatCurrency(laborSavingsVal)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:8px;font-size:1.1rem">
        <strong>Total Annual Farm Value Added:</strong>
        <strong style="color:#2e7d32">${formatCurrency(totalAnnualBenefit)} / year</strong>
      </div>
      <div class="alert alert-success" style="margin-top:14px;margin-bottom:0">
        💡 <strong>Economic Verdict:</strong> Adopting ${t.name} delivers ~${formatCurrency(totalAnnualBenefit)} annual savings and pays for itself within ${t.roiYears > 0 ? t.roiYears + ' years' : 'immediate months'}.
      </div>
    </div>
  `;
}

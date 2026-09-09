/* ═══════════════════════════════════════
   pest.js — Pest & Disease Management
   ═══════════════════════════════════════ */

let currentPestSearch = '';
let currentPestType = 'All';
let currentPestSeverity = 'All';

function renderPest() {
  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">🐛 Pest & Disease Management</h1>
          <p class="page-subtitle">Symptom diagnostic assistant, biological IPM controls, and calibrated chemical dosages.</p>
        </div>
        <button class="btn btn-primary" onclick="openSymptomCheckerModal()">🩺 Instant Symptom Checker</button>
      </div>

      <!-- Search & Filters -->
      <div class="card" style="margin-bottom:24px">
        <div class="card-body">
          <div class="form-row" style="align-items:flex-end">
            <div class="form-group" style="flex:2">
              <label class="form-label">Search Pest / Disease</label>
              <input class="form-input" id="pestSearchInput" type="text" placeholder="Search by pest name, symptom, or crop..." oninput="handlePestSearch(this.value)"/>
            </div>
            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="form-select" id="pestTypeSelect" onchange="handlePestTypeFilter(this.value)">
                <option value="All">All Types</option>
                <option value="pest">Insect Pests (🦗)</option>
                <option value="disease">Diseases & Pathogens (🦠)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Severity</label>
              <select class="form-select" id="pestSeveritySelect" onchange="handlePestSeverityFilter(this.value)">
                <option value="All">All Severity Levels</option>
                <option value="Very High">Very High / Epidemic</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low / Minor</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Pest Cards Grid -->
      <div class="grid-auto" id="pestGridWrap">
        ${renderPestCardList(PESTS_DATA)}
      </div>
    </div>
  `;
}

function renderPestCardList(list) {
  if (list.length === 0) {
    return `
      <div style="grid-column:1/-1" class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>No pests or diseases matched your search.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetPestFilters()">Reset Filters</button>
      </div>
    `;
  }

  return list.map(p => `
    <div class="pest-card" onclick="openPestDetailModal('${p.id}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="pest-emoji">${p.emoji || '🐛'}</div>
        <span class="badge ${p.severity === 'Very High' ? 'badge-danger' : p.severity === 'High' ? 'badge-warning' : 'badge-info'}">
          ${p.severity} Severity
        </span>
      </div>
      <div class="pest-name">${p.name}</div>
      <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">
        ${p.type === 'pest' ? '🦗 Insect Pest' : '🦠 Plant Pathogen'}
      </div>
      <div style="font-size:0.82rem;color:var(--text);margin-bottom:12px;line-height:1.4">
        ${(p.symptoms && p.symptoms[0]) ? p.symptoms[0].slice(0, 75) + '...' : ''}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${(p.affectedCrops || []).map(c => `<span class="badge badge-gray" style="font-size:0.7rem">${c}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function handlePestSearch(val) {
  currentPestSearch = (val || '').toLowerCase().trim();
  applyPestFilters();
}
function handlePestTypeFilter(val) {
  currentPestType = val;
  applyPestFilters();
}
function handlePestSeverityFilter(val) {
  currentPestSeverity = val;
  applyPestFilters();
}

function applyPestFilters() {
  const filtered = PESTS_DATA.filter(p => {
    const matchSearch = !currentPestSearch ||
      p.name.toLowerCase().includes(currentPestSearch) ||
      (p.affectedCrops && p.affectedCrops.some(c => c.toLowerCase().includes(currentPestSearch))) ||
      (p.symptoms && p.symptoms.some(s => s.toLowerCase().includes(currentPestSearch)));

    const matchType = currentPestType === 'All' || p.type.toLowerCase() === currentPestType.toLowerCase();
    const matchSeverity = currentPestSeverity === 'All' || p.severity.toLowerCase() === currentPestSeverity.toLowerCase();

    return matchSearch && matchType && matchSeverity;
  });

  const wrap = document.getElementById('pestGridWrap');
  if (wrap) wrap.innerHTML = renderPestCardList(filtered);
}

function resetPestFilters() {
  currentPestSearch = '';
  currentPestType = 'All';
  currentPestSeverity = 'All';
  document.getElementById('pestSearchInput').value = '';
  document.getElementById('pestTypeSelect').value = 'All';
  document.getElementById('pestSeveritySelect').value = 'All';
  applyPestFilters();
}

function openPestDetailModal(pestId) {
  const p = PESTS_DATA.find(x => x.id === pestId);
  if (!p) return;

  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:2.2rem">${p.emoji || '🐛'}</span>
            <div>
              <h3>${p.name}</h3>
              <div style="font-size:0.8rem;color:var(--text-muted)">
                ${p.type === 'pest' ? 'Insect Pest' : 'Plant Disease'} · ${p.severity} Severity
              </div>
            </div>
          </div>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>

        <div class="modal-body">
          <!-- Affected Crops -->
          <div style="margin-bottom:16px">
            <span style="font-size:0.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">Major Host Crops:</span>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
              ${(p.affectedCrops || []).map(c => `<span class="badge badge-success">${c}</span>`).join('')}
            </div>
          </div>

          <!-- Symptoms -->
          <div style="margin-bottom:16px">
            <h4 style="margin-bottom:6px;font-size:0.92rem">🔍 Diagnostic Symptoms</h4>
            <ul style="list-style:disc;margin-left:20px;font-size:0.85rem;color:var(--text)">
              ${(p.symptoms || []).map(s => `<li style="margin-bottom:4px">${s}</li>`).join('')}
            </ul>
          </div>

          <!-- Organic Treatment -->
          <div style="background:#e8f5e9;border:1px solid #c8e6c9;padding:14px;border-radius:var(--radius-sm);margin-bottom:14px">
            <h4 style="color:#1b5e20;margin-bottom:6px;font-size:0.9rem">🌿 Organic &amp; Biological Management (IPM)</h4>
            <ul style="list-style:disc;margin-left:20px;font-size:0.84rem;color:#2e7d32">
              ${(p.organicTreatment || []).map(t => `<li style="margin-bottom:3px">${t}</li>`).join('')}
            </ul>
          </div>

          <!-- Chemical Treatment -->
          <div style="background:#ffebee;border:1px solid #ffcdd2;padding:14px;border-radius:var(--radius-sm);margin-bottom:14px">
            <h4 style="color:#b71c1c;margin-bottom:6px;font-size:0.9rem">🧪 Recommended Chemical Spray Dosage</h4>
            <ul style="list-style:disc;margin-left:20px;font-size:0.84rem;color:#c62828">
              ${(p.chemicalTreatment || []).map(t => `<li style="margin-bottom:3px"><strong>${t}</strong></li>`).join('')}
            </ul>
          </div>

          <!-- Prevention -->
          <div>
            <h4 style="margin-bottom:6px;font-size:0.9rem">🛡️ Preventive &amp; Cultural Practices</h4>
            <ul style="list-style:disc;margin-left:20px;font-size:0.85rem;color:var(--text-muted)">
              ${(p.prevention || []).map(pr => `<li style="margin-bottom:3px">${pr}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `;

  openModal(modalHtml);
}

function openSymptomCheckerModal() {
  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>🩺 Crop Disease &amp; Pest Symptom Diagnostic Tool</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px">
            Select your crop and the symptoms you observe on leaves, stems, or fruits to find the most probable match.
          </p>

          <div class="form-group">
            <label class="form-label">Step 1: Select Affected Crop</label>
            <select class="form-select" id="diagCrop" onchange="runSymptomDiagnosis()">
              <option value="">-- Choose Crop --</option>
              <option value="Rice">Rice (Paddy)</option>
              <option value="Wheat">Wheat</option>
              <option value="Cotton">Cotton</option>
              <option value="Tomato">Tomato</option>
              <option value="Potato">Potato</option>
              <option value="Maize">Maize</option>
              <option value="Okra">Okra (Bhindi)</option>
              <option value="Mango">Mango</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Step 2: Observed Visual Symptom</label>
            <select class="form-select" id="diagSymptom" onchange="runSymptomDiagnosis()">
              <option value="">-- Choose Primary Symptom --</option>
              <option value="yellow">Yellowing / Circular hopper burn / Mosaic yellow veins</option>
              <option value="holes">Pin-hole punctures or bored holes in fruits / bolls</option>
              <option value="powder">White powdery coating on leaves or shoots</option>
              <option value="lesion">Water-soaked lesions or dark brown sunken spots</option>
              <option value="wilt">Sudden wilting or plants drying up from root</option>
              <option value="curling">Leaf curling, silver streaks or sticky honeydew</option>
            </select>
          </div>

          <div id="diagResultWrap" style="margin-top:20px">
            <!-- Dynamic Diagnostic Match Injected Here -->
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `;

  openModal(modalHtml);
}

function runSymptomDiagnosis() {
  const crop = document.getElementById('diagCrop')?.value;
  const symptomKey = document.getElementById('diagSymptom')?.value;
  const wrap = document.getElementById('diagResultWrap');
  if (!wrap) return;

  if (!crop || !symptomKey) {
    wrap.innerHTML = '<div style="font-size:0.85rem;color:var(--text-muted);text-align:center">Select both crop and symptom above.</div>';
    return;
  }

  // Find matching pests
  const matches = PESTS_DATA.filter(p => {
    const hasCrop = (p.affectedCrops || []).some(c => c.toLowerCase().includes(crop.toLowerCase()));
    if (!hasCrop) return false;

    if (symptomKey === 'yellow') return p.symptoms.some(s => s.toLowerCase().includes('yellow') || s.toLowerCase().includes('mosaic'));
    if (symptomKey === 'holes') return p.symptoms.some(s => s.toLowerCase().includes('hole') || s.toLowerCase().includes('borer') || s.toLowerCase().includes('larva'));
    if (symptomKey === 'powder') return p.symptoms.some(s => s.toLowerCase().includes('powder') || s.toLowerCase().includes('white'));
    if (symptomKey === 'lesion') return p.symptoms.some(s => s.toLowerCase().includes('lesion') || s.toLowerCase().includes('spot') || s.toLowerCase().includes('blight'));
    if (symptomKey === 'wilt') return p.symptoms.some(s => s.toLowerCase().includes('wilt'));
    if (symptomKey === 'curling') return p.symptoms.some(s => s.toLowerCase().includes('curl') || s.toLowerCase().includes('honeydew') || s.toLowerCase().includes('streak'));
    return true;
  });

  if (matches.length === 0) {
    wrap.innerHTML = `
      <div class="alert alert-warning">
        No exact match in database for this specific combination. Check with your local Krishi Vigyan Kendra (KVK) or contact us via the toll-free helpline.
      </div>
    `;
    return;
  }

  wrap.innerHTML = `
    <div style="font-size:0.85rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px">
      🎯 Probable Diagnosis (${matches.length} Match${matches.length > 1 ? 'es' : ''})
    </div>
    ${matches.map(m => `
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <strong>${m.emoji} ${m.name}</strong>
          <span class="badge ${m.severity === 'Very High' ? 'badge-danger' : 'badge-warning'}">${m.severity}</span>
        </div>
        <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:8px">
          Immediate Spray: <strong>${m.chemicalTreatment ? m.chemicalTreatment[0] : 'Consult expert'}</strong>
        </div>
        <button class="btn btn-primary btn-sm" onclick="closeModal(); openPestDetailModal('${m.id}')">View Full Treatment Protocol</button>
      </div>
    `).join('')}
  `;
}

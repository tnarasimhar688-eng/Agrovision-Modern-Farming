/* ═══════════════════════════════════════
   crop-info.js — Crop Information Module
   ═══════════════════════════════════════ */

let currentCropFilterSeason = 'All';
let currentCropFilterWater = 'All';
let currentCropSearch = '';

function renderCropInfo() {
  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">🌾 Crop Information Directory</h1>
          <p class="page-subtitle">Comprehensive guide to Indian agricultural, horticultural, and cash crops.</p>
        </div>
        <div style="font-size:0.9rem;color:var(--text-muted)">
          Showing <strong id="cropCount">${CROPS_DATA.length}</strong> Crops
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="card" style="margin-bottom:24px">
        <div class="card-body">
          <div class="form-row" style="align-items:flex-end">
            <div class="form-group" style="flex:2">
              <label class="form-label">Search Crop</label>
              <input class="form-input" id="cropSearchInput" type="text" placeholder="Search by crop name, soil type..." oninput="handleCropSearch(this.value)"/>
            </div>
            <div class="form-group">
              <label class="form-label">Season</label>
              <select class="form-select" id="cropSeasonSelect" onchange="handleSeasonFilter(this.value)">
                <option value="All">All Seasons</option>
                <option value="Kharif">Kharif (Monsoon)</option>
                <option value="Rabi">Rabi (Winter)</option>
                <option value="Zaid">Zaid (Summer)</option>
                <option value="Annual">Annual / Perennial</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Water Need</label>
              <select class="form-select" id="cropWaterSelect" onchange="handleWaterFilter(this.value)">
                <option value="All">Any Water Level</option>
                <option value="Low">Low / Drought Tolerant</option>
                <option value="Medium">Medium</option>
                <option value="High">High / Flooded</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Crop Cards Grid -->
      <div class="grid-auto" id="cropCardsGrid">
        ${renderCropCardList(CROPS_DATA)}
      </div>
    </div>
  `;
}

function renderCropCardList(list) {
  if (list.length === 0) {
    return `
      <div style="grid-column:1/-1" class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>No crops match your search or filter criteria.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetCropFilters()">Reset Filters</button>
      </div>
    `;
  }

  return list.map(c => `
    <div class="crop-card" onclick="openCropDetailModal('${c.id}')">
      <div class="crop-card-emoji">${c.emoji || '🌱'}</div>
      <div class="crop-card-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="crop-card-name">${c.name}</div>
          <span class="badge ${c.season.includes('Kharif') ? 'badge-success' : c.season.includes('Rabi') ? 'badge-warning' : 'badge-info'}">${c.season}</span>
        </div>
        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px">
          ⏳ ${c.duration} Days · 💧 ${c.waterNeed} Water
        </div>
        <div style="font-size:0.82rem;color:var(--text);margin-bottom:10px;line-height:1.4">
          ${c.description ? c.description.slice(0, 75) + '...' : ''}
        </div>
        <div class="crop-card-meta">
          <span class="badge badge-gray">Yield: ${c.yieldPerAcre}</span>
          <span class="badge badge-gray">Soil: ${c.soilType}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function handleCropSearch(query) {
  currentCropSearch = (query || '').toLowerCase().trim();
  applyCropFilters();
}

function handleSeasonFilter(season) {
  currentCropFilterSeason = season;
  applyCropFilters();
}

function handleWaterFilter(water) {
  currentCropFilterWater = water;
  applyCropFilters();
}

function applyCropFilters() {
  const filtered = CROPS_DATA.filter(c => {
    const matchQuery = !currentCropSearch || 
      c.name.toLowerCase().includes(currentCropSearch) ||
      (c.soilType && c.soilType.toLowerCase().includes(currentCropSearch)) ||
      (c.description && c.description.toLowerCase().includes(currentCropSearch));

    const matchSeason = currentCropFilterSeason === 'All' || 
      c.season.toLowerCase().includes(currentCropFilterSeason.toLowerCase());

    const matchWater = currentCropFilterWater === 'All' || 
      (c.waterNeed && c.waterNeed.toLowerCase().includes(currentCropFilterWater.toLowerCase()));

    return matchQuery && matchSeason && matchWater;
  });

  const countEl = document.getElementById('cropCount');
  if (countEl) countEl.textContent = filtered.length;

  const gridEl = document.getElementById('cropCardsGrid');
  if (gridEl) gridEl.innerHTML = renderCropCardList(filtered);
}

function resetCropFilters() {
  currentCropFilterSeason = 'All';
  currentCropFilterWater = 'All';
  currentCropSearch = '';
  document.getElementById('cropSearchInput').value = '';
  document.getElementById('cropSeasonSelect').value = 'All';
  document.getElementById('cropWaterSelect').value = 'All';
  applyCropFilters();
}

function openCropDetailModal(cropId) {
  const c = CROPS_DATA.find(x => x.id === cropId);
  if (!c) return;

  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:2.2rem">${c.emoji || '🌱'}</span>
            <div>
              <h3>${c.name} Cultivation Guide</h3>
              <div style="font-size:0.8rem;color:var(--text-muted)">${c.season} Crop · ${c.duration} Days Cycle</div>
            </div>
          </div>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>

        <div class="modal-body">
          <p style="font-size:0.95rem;margin-bottom:16px;line-height:1.5">${c.description}</p>

          <!-- Specifications -->
          <div class="grid-3" style="background:var(--bg);padding:14px;border-radius:var(--radius);margin-bottom:18px;text-align:center">
            <div>
              <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Avg Yield</div>
              <strong style="color:var(--primary);font-size:0.95rem">${c.yieldPerAcre}</strong>
            </div>
            <div>
              <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Spacing</div>
              <strong style="font-size:0.95rem">${c.spacing}</strong>
            </div>
            <div>
              <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Water Need</div>
              <strong style="font-size:0.95rem">${c.waterNeed}</strong>
            </div>
          </div>

          <!-- NPK Requirements -->
          ${c.npk ? `
            <div style="margin-bottom:18px">
              <h4 style="margin-bottom:8px;font-size:0.9rem">Recommended NPK Nutrient Ratio (kg/acre)</h4>
              <div style="display:flex;gap:10px">
                <div style="flex:1;background:#e8f5e9;border:1px solid #c8e6c9;padding:10px;border-radius:var(--radius-sm);text-align:center">
                  <div style="font-size:0.75rem;color:#2e7d32;font-weight:700">Nitrogen (N)</div>
                  <div style="font-size:1.2rem;font-weight:800;color:#1b5e20">${c.npk.n} kg</div>
                </div>
                <div style="flex:1;background:#fff8e1;border:1px solid #ffe082;padding:10px;border-radius:var(--radius-sm);text-align:center">
                  <div style="font-size:0.75rem;color:#f57f17;font-weight:700">Phosphorus (P)</div>
                  <div style="font-size:1.2rem;font-weight:800;color:#e65100">${c.npk.p} kg</div>
                </div>
                <div style="flex:1;background:#e3f2fd;border:1px solid #bbdefb;padding:10px;border-radius:var(--radius-sm);text-align:center">
                  <div style="font-size:0.75rem;color:#1565c0;font-weight:700">Potassium (K)</div>
                  <div style="font-size:1.2rem;font-weight:800;color:#0d47a1">${c.npk.k} kg</div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Agronomic Tips -->
          ${c.tips && c.tips.length > 0 ? `
            <div style="margin-bottom:18px">
              <h4 style="margin-bottom:8px;font-size:0.9rem">💡 Agronomic Best Practices & Tips</h4>
              <ul style="list-style:disc;margin-left:20px;font-size:0.85rem;color:var(--text)">
                ${c.tips.map(t => `<li style="margin-bottom:4px">${t}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Major Pests & Diseases -->
          <div style="margin-bottom:18px">
            <h4 style="margin-bottom:8px;font-size:0.9rem">🐛 Common Pests & Diseases</h4>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${(c.pests || []).map(p => `<span class="badge badge-warning">🦗 ${p}</span>`).join('')}
              ${(c.diseases || []).map(d => `<span class="badge badge-danger">🦠 ${d}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
          <button class="btn btn-primary" onclick="planThisCrop('${c.id}')">+ Add to My Planner</button>
        </div>
      </div>
    </div>
  `;

  openModal(modalHtml);
}

function planThisCrop(cropId) {
  closeModal();
  navigateTo('crop-planner');
  setTimeout(() => {
    switchCropTab('tab-add-crop');
    const select = document.getElementById('plan-crop');
    if (select) {
      select.value = cropId;
      handleCropSelectChange(cropId);
    }
  }, 100);
}

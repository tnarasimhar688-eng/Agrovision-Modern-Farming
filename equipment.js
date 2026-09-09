/* ═══════════════════════════════════════
   equipment.js — Farming Machinery & Equipment
   ═══════════════════════════════════════ */

let currentEqCat = 'All';
let currentEqSearch = '';

function renderEquipment() {
  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">🚜 Farm Machinery &amp; Equipment Rental</h1>
          <p class="page-subtitle">Mechanization directory, operational specifications, and custom hiring rental estimator.</p>
        </div>
        <button class="btn btn-primary" onclick="openEquipmentRentalModal()">📅 Request Machinery Rental</button>
      </div>

      <!-- Search & Category Filters -->
      <div class="card" style="margin-bottom:24px">
        <div class="card-body">
          <div class="form-row" style="align-items:flex-end">
            <div class="form-group" style="flex:2">
              <label class="form-label">Search Machine or Implement</label>
              <input class="form-input" id="eqSearchInput" type="text" placeholder="Search tractor, harvester, drone, rotavator..." oninput="handleEqSearch(this.value)"/>
            </div>
            <div class="form-group">
              <label class="form-label">Operation Category</label>
              <select class="form-select" id="eqCatSelect" onchange="handleEqCatFilter(this.value)">
                <option value="All">All Operations</option>
                <option value="Tillage">Tillage &amp; Land Prep</option>
                <option value="Sowing">Sowing &amp; Planting</option>
                <option value="Protection">Plant Protection &amp; Spraying</option>
                <option value="Irrigation">Irrigation Pumps &amp; Drip</option>
                <option value="Harvesting">Harvesting &amp; Threshing</option>
                <option value="Post-harvest">Post-Harvest &amp; Storage</option>
                <option value="Technology">High-Tech &amp; Drones</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Equipment Grid -->
      <div class="grid-3" id="equipmentGrid">
        ${renderEquipmentCardList(EQUIPMENT_DATA)}
      </div>
    </div>
  `;
}

function renderEquipmentCardList(list) {
  if (list.length === 0) {
    return `
      <div style="grid-column:1/-1" class="empty-state">
        <div class="empty-icon">🚜</div>
        <p>No equipment matching your criteria.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetEqFilters()">Reset Filters</button>
      </div>
    `;
  }

  return list.map(e => `
    <div class="equipment-card" onclick="openEquipmentDetailModal('${e.id}')">
      <div class="equipment-emoji">${e.emoji || '🚜'}</div>
      <div class="equipment-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
          <div class="equipment-name">${e.name}</div>
          <span class="badge badge-info">${e.category}</span>
        </div>
        <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;line-height:1.4">
          ${e.description}
        </div>
        
        <div class="equipment-costs">
          <div class="equipment-cost">
            <div class="cost-val">${e.rentalCost}</div>
            <div class="cost-lbl">Custom Hiring</div>
          </div>
          <div class="equipment-cost">
            <div class="cost-val" style="color:var(--text)">${e.purchaseCost}</div>
            <div class="cost-lbl">Purchase Cost</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function handleEqSearch(val) {
  currentEqSearch = (val || '').toLowerCase().trim();
  applyEqFilters();
}
function handleEqCatFilter(val) {
  currentEqCat = val;
  applyEqFilters();
}

function applyEqFilters() {
  const filtered = EQUIPMENT_DATA.filter(e => {
    const matchSearch = !currentEqSearch ||
      e.name.toLowerCase().includes(currentEqSearch) ||
      e.description.toLowerCase().includes(currentEqSearch) ||
      (e.uses && e.uses.some(u => u.toLowerCase().includes(currentEqSearch)));

    const matchCat = currentEqCat === 'All' || e.category.toLowerCase() === currentEqCat.toLowerCase();
    return matchSearch && matchCat;
  });

  const grid = document.getElementById('equipmentGrid');
  if (grid) grid.innerHTML = renderEquipmentCardList(filtered);
}

function resetEqFilters() {
  currentEqSearch = '';
  currentEqCat = 'All';
  document.getElementById('eqSearchInput').value = '';
  document.getElementById('eqCatSelect').value = 'All';
  applyEqFilters();
}

function openEquipmentDetailModal(eqId) {
  const e = EQUIPMENT_DATA.find(x => x.id === eqId);
  if (!e) return;

  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:2.2rem">${e.emoji || '🚜'}</span>
            <div>
              <h3>${e.name}</h3>
              <div style="font-size:0.8rem;color:var(--text-muted)">Category: ${e.category}</div>
            </div>
          </div>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>

        <div class="modal-body">
          <p style="font-size:0.92rem;margin-bottom:16px;line-height:1.5">${e.description}</p>

          <!-- Uses -->
          <div style="margin-bottom:16px">
            <h4 style="margin-bottom:6px;font-size:0.9rem">⚙️ Primary Agricultural Uses</h4>
            <ul style="list-style:disc;margin-left:20px;font-size:0.85rem">
              ${(e.uses || []).map(u => `<li style="margin-bottom:3px">${u}</li>`).join('')}
            </ul>
          </div>

          <!-- Specifications -->
          ${e.specs ? `
            <div style="background:var(--bg);padding:14px;border-radius:var(--radius-sm);margin-bottom:16px">
              <h4 style="margin-bottom:8px;font-size:0.88rem">📋 Technical Specifications</h4>
              <div class="grid-2" style="gap:8px;font-size:0.82rem">
                ${Object.entries(e.specs).map(([k, v]) => `
                  <div><strong style="text-transform:capitalize">${k.replace(/([A-Z])/g, ' $1')}:</strong> ${v}</div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Maintenance Tips -->
          ${e.maintenanceTips ? `
            <div>
              <h4 style="margin-bottom:6px;font-size:0.9rem">🔧 Maintenance &amp; Care Protocol</h4>
              <ul style="list-style:disc;margin-left:20px;font-size:0.85rem;color:var(--text-muted)">
                ${(e.maintenanceTips || []).map(m => `<li style="margin-bottom:3px">${m}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
          <button class="btn btn-primary" onclick="closeModal(); openEquipmentRentalModal('${e.name}')">Book Rental</button>
        </div>
      </div>
    </div>
  `;

  openModal(modalHtml);
}

function openEquipmentRentalModal(preselectedMachine) {
  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>🚜 Custom Hiring Service (Rental Booking)</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="handleConfirmRental(event)">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Machinery Required *</label>
              <select class="form-select" id="rent-machine" required onchange="calculateRentalQuote()">
                ${EQUIPMENT_DATA.map(eq => `
                  <option value="${eq.name}" ${eq.name === preselectedMachine ? 'selected' : ''}>
                    ${eq.emoji} ${eq.name} (${eq.rentalCost})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Rental Date *</label>
                <input class="form-input" id="rent-date" type="date" required value="${new Date().toISOString().split('T')[0]}"/>
              </div>
              <div class="form-group">
                <label class="form-label">Duration (Hours / Acres) *</label>
                <input class="form-input" id="rent-dur" type="number" min="1" max="50" value="4" required oninput="calculateRentalQuote()"/>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Field Delivery Location</label>
              <input class="form-input" id="rent-loc" type="text" placeholder="Village name or plot number" required value="Plot 1"/>
            </div>

            <div style="background:var(--bg);padding:14px;border-radius:var(--radius-sm);margin-top:16px;text-align:center">
              <div style="font-size:0.8rem;color:var(--text-muted);text-transform:uppercase">Estimated Hire Cost</div>
              <div style="font-size:1.6rem;font-weight:800;color:var(--primary);margin-top:4px" id="rentEstimate">₹3,200</div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">Includes operator &amp; standard fuel</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Confirm Booking Request</button>
          </div>
        </form>
      </div>
    </div>
  `;

  openModal(modalHtml);
  calculateRentalQuote();
}

function calculateRentalQuote() {
  const machine = document.getElementById('rent-machine')?.value;
  const dur = parseFloat(document.getElementById('rent-dur')?.value || '4');
  const estEl = document.getElementById('rentEstimate');
  if (!estEl) return;

  const eq = EQUIPMENT_DATA.find(x => x.name === machine) || EQUIPMENT_DATA[0];
  let rate = 800;
  if (eq.rentalCost.includes('1,500')) rate = 1800;
  else if (eq.rentalCost.includes('500')) rate = 600;
  else if (eq.rentalCost.includes('200')) rate = 300;
  else if (eq.rentalCost.includes('400')) rate = 450;

  const total = rate * dur;
  estEl.textContent = formatCurrency(total);
}

function handleConfirmRental(e) {
  e.preventDefault();
  const machine = document.getElementById('rent-machine').value;
  const date = document.getElementById('rent-date').value;
  const dur = document.getElementById('rent-dur').value;
  const est = document.getElementById('rentEstimate').textContent;

  closeModal();
  showToast(`Booking confirmed for ${machine} on ${formatDate(date)}! (${est}) 🚜`);

  // Add notification
  const alerts = JSON.parse(localStorage.getItem('smartfarm_alerts') || '[]');
  alerts.unshift({
    id: Date.now(),
    title: `Equipment Rental: ${machine}`,
    message: `Reserved for ${dur} units on ${formatDate(date)}. Estimated cost: ${est}. Operator assigned.`,
    icon: '🚜',
    category: 'tasks',
    ts: Date.now(),
    read: false
  });
  localStorage.setItem('smartfarm_alerts', JSON.stringify(alerts));
  updateNotifBadge();
}

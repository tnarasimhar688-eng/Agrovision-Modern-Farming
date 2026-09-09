/* ═══════════════════════════════════════
   crop-planner.js — Crop Planner Module
   ═══════════════════════════════════════ */

function renderCropPlanner() {
  const crops = JSON.parse(localStorage.getItem('smartfarm_crops') || '[]');

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">🌱 Crop Planner & Management</h1>
          <p class="page-subtitle">Plan sowing cycles, monitor growth stages, and track harvest timelines.</p>
        </div>
        <button class="btn btn-primary" onclick="switchCropTab('tab-add-crop')">+ Plan New Crop</button>
      </div>

      <div class="tabs" id="cropPlannerTabs">
        <button class="tab-btn active" data-tab="tab-my-crops">🌾 My Active Crops (${crops.length})</button>
        <button class="tab-btn" data-tab="tab-add-crop">➕ Plan New Crop</button>
        <button class="tab-btn" data-tab="tab-calendar">📅 Seasonal Crop Calendar</button>
      </div>

      <!-- TAB 1: My Crops -->
      <div class="tab-content active" id="tab-my-crops">
        ${crops.length === 0 
          ? `
            <div class="card">
              <div class="card-body" style="text-align:center;padding:48px 20px">
                <div style="font-size:3.5rem;margin-bottom:12px">🌱</div>
                <h3 style="margin-bottom:8px">No Crops in Cultivation Yet</h3>
                <p style="color:var(--text-muted);margin-bottom:20px;max-width:460px;margin-inline:auto">
                  Start your season right! Add your planted crops to track lifecycle stages, moisture needs, and receive automated harvest reminders.
                </p>
                <button class="btn btn-primary" onclick="switchCropTab('tab-add-crop')">Plan Your First Crop</button>
              </div>
            </div>
          `
          : `
            <div class="grid-2">
              ${crops.map(c => {
                const cd = CROPS_DATA.find(x => x.id === c.cropId) || { name: c.cropId, duration: 120, emoji: '🌱', season: 'Kharif', yieldPerAcre: '15-20 qtl' };
                const gs = getGrowthStage(c.plantingDate, cd.duration);
                const daysLeft = daysDiff(new Date().toISOString().split('T')[0], c.harvestDate);

                return `
                  <div class="card">
                    <div class="card-header">
                      <div style="display:flex;align-items:center;gap:10px">
                        <span style="font-size:1.8rem">${cd.emoji || '🌱'}</span>
                        <div>
                          <div class="card-title">${cd.name}</div>
                          <div style="font-size:0.75rem;color:var(--text-muted)">${escapeHtml(c.fieldName || 'Plot 1')} · ${Number(c.acres) || 1} acres</div>
                        </div>
                      </div>
                      <span class="badge ${gs.pct >= 90 ? 'badge-warning' : 'badge-success'}">${gs.stage}</span>
                    </div>

                    <div class="card-body">
                      <!-- Progress Meter -->
                      <div style="margin-bottom:14px">
                        <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:6px">
                          <span style="font-weight:600">Crop Progress</span>
                          <span style="font-weight:700;color:var(--primary)">${gs.pct}%</span>
                        </div>
                        <div class="progress" style="height:12px">
                          <div class="progress-bar ${gs.pct >= 90 ? 'warning' : ''}" style="width:${gs.pct}%"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-top:5px">
                          <span>Sown: ${formatDate(c.plantingDate)}</span>
                          <span>Harvest: ${formatDate(c.harvestDate)} (${daysLeft > 0 ? daysLeft + ' days left' : 'Due for harvest!'})</span>
                        </div>
                      </div>

                      <!-- Key Specs -->
                      <div class="grid-3" style="margin-bottom:16px;background:var(--bg);padding:10px;border-radius:var(--radius-sm);text-align:center">
                        <div>
                          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase">Season</div>
                          <div style="font-weight:700;font-size:0.85rem">${cd.season}</div>
                        </div>
                        <div>
                          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase">Exp. Yield</div>
                          <div style="font-weight:700;font-size:0.85rem">${escapeHtml(c.targetYield || cd.yieldPerAcre)}</div>
                        </div>
                        <div>
                          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase">Duration</div>
                          <div style="font-weight:700;font-size:0.85rem">${cd.duration} Days</div>
                        </div>
                      </div>

                      ${c.notes ? `<div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;font-style:italic">"${escapeHtml(c.notes)}"</div>` : ''}

                      <div style="display:flex;gap:8px;justify-content:flex-end">
                        <button class="btn btn-secondary btn-sm" onclick="quickViewCropInfo('${c.cropId}')">View Guide</button>
                        <button class="btn btn-ghost btn-sm" onclick="deleteCropPlan(${c.id})" style="color:var(--accent-dark)">Delete</button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `
        }
      </div>

      <!-- TAB 2: Add Crop Plan -->
      <div class="tab-content" id="tab-add-crop">
        <div class="card" style="max-width:760px;margin:0 auto">
          <div class="card-header">
            <span class="card-title">🌱 Plan a Crop Cultivation Cycle</span>
          </div>
          <div class="card-body">
            <form onsubmit="handleSaveCrop(event)">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Select Crop *</label>
                  <select class="form-select" id="plan-crop" required onchange="handleCropSelectChange(this.value)">
                    <option value="">-- Choose Crop --</option>
                    ${CROPS_DATA.map(c => `<option value="${c.id}">${c.emoji} ${c.name} (${c.season} · ${c.duration} days)</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Field / Plot Name</label>
                  <input class="form-input" id="plan-field" type="text" placeholder="e.g. North Plot or Field A" required value="Plot 1"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Land Area (Acres) *</label>
                  <input class="form-input" id="plan-acres" type="number" step="0.25" min="0.1" required placeholder="e.g. 2.5" value="2"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Target Yield (Optional)</label>
                  <input class="form-input" id="plan-yield" type="text" placeholder="e.g. 25 quintals/acre"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Sowing / Planting Date *</label>
                  <input class="form-input" id="plan-sow-date" type="date" required onchange="recalculateHarvestDate()"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Estimated Harvest Date</label>
                  <input class="form-input" id="plan-harvest-date" type="date" required/>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Notes / Variety Used</label>
                <textarea class="form-textarea" id="plan-notes" placeholder="e.g. Certified BPT-5204 seeds, treated with Trichoderma, 10 tonnes FYM applied."></textarea>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:20px">
                <button type="button" class="btn btn-secondary" onclick="switchCropTab('tab-my-crops')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Crop Plan</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- TAB 3: Seasonal Calendar -->
      <div class="tab-content" id="tab-calendar">
        <div class="card">
          <div class="card-header">
            <span class="card-title">📅 Indian Crop Seasons Matrix</span>
          </div>
          <div class="card-body">
            <div class="grid-3" style="margin-bottom:24px">
              <div style="background:var(--bg);border-radius:var(--radius);padding:18px;border-top:4px solid #2e7d32">
                <h3 style="color:#2e7d32;margin-bottom:6px">🌧️ Kharif (Monsoon)</h3>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px">Sowing: June - July · Harvesting: Sept - Oct</div>
                <p style="font-size:0.85rem">Rely heavily on monsoon rains. Major crops include:</p>
                <ul style="list-style:disc;margin-left:20px;font-size:0.85rem;margin-top:8px">
                  <li>Rice (Paddy)</li>
                  <li>Maize &amp; Cotton</li>
                  <li>Soybean &amp; Groundnut</li>
                  <li>Jowar, Bajra &amp; Turmeric</li>
                </ul>
              </div>

              <div style="background:var(--bg);border-radius:var(--radius);padding:18px;border-top:4px solid #f57f17">
                <h3 style="color:#f57f17;margin-bottom:6px">❄️ Rabi (Winter)</h3>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px">Sowing: Oct - Dec · Harvesting: Feb - April</div>
                <p style="font-size:0.85rem">Grown in winter season; require cooler temperature and timely irrigation.</p>
                <ul style="list-style:disc;margin-left:20px;font-size:0.85rem;margin-top:8px">
                  <li>Wheat &amp; Mustard</li>
                  <li>Potato &amp; Onion</li>
                  <li>Gram / Chickpea</li>
                  <li>Barley &amp; Peas</li>
                </ul>
              </div>

              <div style="background:var(--bg);border-radius:var(--radius);padding:18px;border-top:4px solid #0288d1">
                <h3 style="color:#0288d1;margin-bottom:6px">☀️ Zaid (Summer)</h3>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px">Sowing: March - April · Harvesting: May - June</div>
                <p style="font-size:0.85rem">Short duration crops grown between Rabi and Kharif in irrigated fields.</p>
                <ul style="list-style:disc;margin-left:20px;font-size:0.85rem;margin-top:8px">
                  <li>Watermelon &amp; Muskmelon</li>
                  <li>Cucumber &amp; Gourds</li>
                  <li>Moong (Summer Green Gram)</li>
                  <li>Fodder crops</li>
                </ul>
              </div>
            </div>

            <h3 class="section-title">Recommended Crop Rotations for Soil Health</h3>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Rotation Type</th>
                    <th>Kharif (Monsoon)</th>
                    <th>Rabi (Winter)</th>
                    <th>Zaid (Summer)</th>
                    <th>Soil Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Cereal - Pulse</strong></td>
                    <td>Rice (🌾)</td>
                    <td>Chickpea / Gram (🫘)</td>
                    <td>Green Gram / Fallow</td>
                    <td>Fixes atmospheric nitrogen, restores soil structure</td>
                  </tr>
                  <tr>
                    <td><strong>High Input - Oilseed</strong></td>
                    <td>Cotton (🌿)</td>
                    <td>Mustard (🌼)</td>
                    <td>Fallow / Dhaincha</td>
                    <td>Breaks pest life cycles, minimizes fertilizer depletion</td>
                  </tr>
                  <tr>
                    <td><strong>Cereal - Vegetable</strong></td>
                    <td>Maize (🌽)</td>
                    <td>Potato (🥔)</td>
                    <td>Moong (🫛)</td>
                    <td>High annual cash return per acre</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Init tabs
  tabs('cropPlannerTabs', 'tab-my-crops');

  // Set default sow date to today
  const sowInput = document.getElementById('plan-sow-date');
  if (sowInput) {
    const today = new Date().toISOString().split('T')[0];
    sowInput.value = today;
  }
}

function switchCropTab(tabId) {
  const btn = document.querySelector(`#cropPlannerTabs [data-tab="${tabId}"]`);
  if (btn) btn.click();
}

function handleCropSelectChange(cropId) {
  const crop = CROPS_DATA.find(c => c.id === cropId);
  const yieldInput = document.getElementById('plan-yield');
  if (crop && yieldInput && !yieldInput.value) {
    yieldInput.value = crop.yieldPerAcre;
  }
  recalculateHarvestDate();
}

function recalculateHarvestDate() {
  const cropId = document.getElementById('plan-crop')?.value;
  const sowDateStr = document.getElementById('plan-sow-date')?.value;
  const crop = CROPS_DATA.find(c => c.id === cropId);

  if (crop && sowDateStr) {
    const d = new Date(sowDateStr);
    d.setDate(d.getDate() + Number(crop.duration || 120));
    const harvestInput = document.getElementById('plan-harvest-date');
    if (harvestInput) {
      harvestInput.value = d.toISOString().split('T')[0];
    }
  }
}

function handleSaveCrop(e) {
  e.preventDefault();
  const cropId = document.getElementById('plan-crop').value;
  const fieldName = document.getElementById('plan-field').value.trim();
  const acres = document.getElementById('plan-acres').value;
  const targetYield = document.getElementById('plan-yield').value.trim();
  const plantingDate = document.getElementById('plan-sow-date').value;
  const harvestDate = document.getElementById('plan-harvest-date').value;
  const notes = document.getElementById('plan-notes').value.trim();

  if (!cropId || !plantingDate || !harvestDate) {
    showToast('Please fill all required fields.', 'warning');
    return;
  }

  const crops = JSON.parse(localStorage.getItem('smartfarm_crops') || '[]');
  const newCrop = {
    id: Date.now(),
    cropId,
    fieldName,
    acres: Number(acres || 1),
    targetYield,
    plantingDate,
    harvestDate,
    notes,
    createdAt: new Date().toISOString()
  };

  crops.push(newCrop);
  localStorage.setItem('smartfarm_crops', JSON.stringify(crops));
  showToast('Crop cycle planned successfully! 🌱');
  generateSmartAlerts();
  renderCropPlanner();
}

function deleteCropPlan(id) {
  if (!confirm('Are you sure you want to remove this crop plan?')) return;
  let crops = JSON.parse(localStorage.getItem('smartfarm_crops') || '[]');
  crops = crops.filter(c => c.id !== id);
  localStorage.setItem('smartfarm_crops', JSON.stringify(crops));
  showToast('Crop plan removed.');
  renderCropPlanner();
}

function quickViewCropInfo(cropId) {
  navigateTo('crop-info');
  setTimeout(() => {
    if (typeof openCropDetailModal === 'function') {
      openCropDetailModal(cropId);
    }
  }, 100);
}

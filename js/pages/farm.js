/* ═══════════════════════════════════════
   farm.js — Farm & Plot Management Module
   ═══════════════════════════════════════ */

function renderFarm() {
  const plots = JSON.parse(localStorage.getItem('smartfarm_plots') || '[]');
  const tasks = JSON.parse(localStorage.getItem('smartfarm_tasks') || '[]');
  const inv = JSON.parse(localStorage.getItem('smartfarm_inventory') || '[]');
  const farmer = getCurrentFarmer();

  const pendingTasks = tasks.filter(t => !t.completed);
  const totalPlotAcres = plots.reduce((s, p) => s + Number(p.acres || 0), 0) || Number(farmer?.farmSize || 0);

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">🚜 Farm Operations &amp; Plot Management</h1>
          <p class="page-subtitle">Subdivide field parcels, organize seasonal labor activities, and track farm supplies.</p>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-primary btn-sm" onclick="openAddPlotModal()">+ Add Plot</button>
          <button class="btn btn-secondary btn-sm" onclick="openAddTaskModal()">+ Add Task</button>
        </div>
      </div>

      <!-- KPI Banner -->
      <div class="grid-3" style="margin-bottom:24px">
        <div class="stat-card">
          <span class="stat-icon">🗺️</span>
          <div>
            <div class="stat-value">${plots.length}</div>
            <div class="stat-label">Mapped Parcels (${totalPlotAcres} Acres)</div>
          </div>
        </div>
        <div class="stat-card accent">
          <span class="stat-icon">📋</span>
          <div>
            <div class="stat-value">${pendingTasks.length}</div>
            <div class="stat-label">Active To-Do Tasks</div>
          </div>
        </div>
        <div class="stat-card info">
          <span class="stat-icon">📦</span>
          <div>
            <div class="stat-value">${inv.length}</div>
            <div class="stat-label">Tracked Inventory Items</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="farmTabs">
        <button class="tab-btn active" data-tab="tab-farm-plots">🗺️ Field Parcels (${plots.length})</button>
        <button class="tab-btn" data-tab="tab-farm-tasks">📋 Activity Tasks (${tasks.length})</button>
        <button class="tab-btn" data-tab="tab-farm-inv">📦 Supplies Inventory (${inv.length})</button>
      </div>

      <!-- TAB 1: Plots -->
      <div class="tab-content active" id="tab-farm-plots">
        ${plots.length === 0 
          ? `
            <div class="card">
              <div class="card-body" style="text-align:center;padding:48px 20px">
                <div style="font-size:3.5rem;margin-bottom:12px">🗺️</div>
                <h3>No Field Parcels Mapped Yet</h3>
                <p style="color:var(--text-muted);margin-bottom:20px;max-width:440px;margin-inline:auto">
                  Subdivide your farm land into distinct plots (e.g. North Acre, River Plot, Well Field) to monitor soil and crops individually.
                </p>
                <button class="btn btn-primary" onclick="openAddPlotModal()">+ Map Your First Plot</button>
              </div>
            </div>
          `
          : `
            <div class="grid-3">
              ${plots.map(p => `
                <div class="card">
                  <div class="card-header">
                    <span class="card-title">📍 ${escapeHtml(p.name)}</span>
                    <span class="badge badge-success">${p.acres} Acres</span>
                  </div>
                  <div class="card-body">
                    <div style="font-size:0.85rem;margin-bottom:8px">
                      <strong>Soil:</strong> ${escapeHtml(p.soilType || 'Loamy')}
                    </div>
                    <div style="font-size:0.85rem;margin-bottom:8px">
                      <strong>Irrigation Source:</strong> ${escapeHtml(p.waterSource || 'Borewell')}
                    </div>
                    <div style="font-size:0.85rem;margin-bottom:12px">
                      <strong>Current Crop:</strong> ${escapeHtml(p.currentCrop || 'None / Fallow')}
                    </div>
                    <div style="display:flex;justify-content:flex-end;gap:8px">
                      <button class="btn btn-ghost btn-sm" style="color:#c62828" onclick="deletePlotEntry(${p.id})">Delete</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `
        }
      </div>

      <!-- TAB 2: Tasks -->
      <div class="tab-content" id="tab-farm-tasks">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Scheduled Farm Activities</span>
            <button class="btn btn-primary btn-sm" onclick="openAddTaskModal()">+ Add Task</button>
          </div>
          <div class="card-body">
            ${tasks.length === 0 
              ? '<div class="empty-state"><div class="empty-icon">📋</div><p>No tasks scheduled.</p><button class="btn btn-primary btn-sm" onclick="openAddTaskModal()">Create Task</button></div>'
              : `
                <div class="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th style="width:40px">Status</th>
                        <th>Task Description</th>
                        <th>Category</th>
                        <th>Due Date</th>
                        <th>Priority</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${tasks.map(t => `
                        <tr>
                          <td>
                            <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleFarmTask(${t.id})" style="transform:scale(1.2);cursor:pointer"/>
                          </td>
                          <td style="text-decoration:${t.completed ? 'line-through' : 'none'};opacity:${t.completed ? '0.6' : '1'}">
                            <strong>${escapeHtml(t.name)}</strong>
                            ${t.notes ? `<div style="font-size:0.78rem;color:var(--text-muted)">${escapeHtml(t.notes)}</div>` : ''}
                          </td>
                          <td><span class="badge badge-gray">${escapeHtml(t.category || 'General')}</span></td>
                          <td style="color:var(--text-muted);font-size:0.85rem">${formatDate(t.dueDate)}</td>
                          <td>
                            <span class="badge ${t.priority === 'High' ? 'badge-danger' : t.priority === 'Medium' ? 'badge-warning' : 'badge-success'}">
                              ${t.priority || 'Normal'}
                            </span>
                          </td>
                          <td>
                            <button class="btn btn-ghost btn-sm" style="color:#c62828;padding:4px 8px" onclick="deleteFarmTask(${t.id})">🗑️</button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `
            }
          </div>
        </div>
      </div>

      <!-- TAB 3: Inventory -->
      <div class="tab-content" id="tab-farm-inv">
        <div class="card">
          <div class="card-header">
            <span class="card-title">On-Farm Supplies &amp; Inputs Stock</span>
            <button class="btn btn-primary btn-sm" onclick="openAddInvModal()">+ Add Stock Item</button>
          </div>
          <div class="card-body">
            ${inv.length === 0 
              ? '<div class="empty-state"><div class="empty-icon">📦</div><p>No inventory items registered.</p><button class="btn btn-primary btn-sm" onclick="openAddInvModal()">Add First Item</button></div>'
              : `
                <div class="grid-3">
                  ${inv.map(i => `
                    <div style="background:var(--bg);padding:14px;border-radius:var(--radius-sm);border:1px solid var(--border)">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start">
                        <strong>${escapeHtml(i.name)}</strong>
                        <span class="badge badge-info">${escapeHtml(i.category)}</span>
                      </div>
                      <div style="font-size:1.6rem;font-weight:800;color:var(--primary);margin:8px 0">
                        ${Number(i.qty) || 0} <span style="font-size:0.85rem;color:var(--text-muted)">${escapeHtml(i.unit)}</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;color:var(--text-muted)">
                        <span>Stored at: ${escapeHtml(i.location || 'Barn')}</span>
                        <button class="btn btn-ghost btn-sm" style="color:#c62828;padding:2px 6px" onclick="deleteInvItem(${i.id})">Delete</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `
            }
          </div>
        </div>
      </div>
    </div>
  `;

  tabs('farmTabs', 'tab-farm-plots');
}

/* Modal Helpers for Plots */
function openAddPlotModal() {
  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>📍 Add Field Parcel / Plot</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="handleSavePlot(event)">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Plot Name / Identifier *</label>
              <input class="form-input" id="plot-name" type="text" placeholder="e.g. North Plot, Canal Field" required/>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Acreage (Acres) *</label>
                <input class="form-input" id="plot-acres" type="number" step="0.25" min="0.1" value="2" required/>
              </div>
              <div class="form-group">
                <label class="form-label">Soil Type</label>
                <select class="form-select" id="plot-soil">
                  <option value="Loamy / Alluvial">Loamy / Alluvial</option>
                  <option value="Black Cotton">Black Cotton Soil</option>
                  <option value="Red Sandy Loam">Red Sandy Loam</option>
                  <option value="Clayey">Clayey</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Irrigation Source</label>
                <select class="form-select" id="plot-water">
                  <option value="Borewell + Drip">Borewell + Drip</option>
                  <option value="Canal / Lift">Canal / Lift</option>
                  <option value="Farm Pond / Sprinkler">Farm Pond / Sprinkler</option>
                  <option value="Rainfed">Rainfed (Dryland)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Current Crop</label>
                <input class="form-input" id="plot-crop" type="text" placeholder="e.g. Rice BPT-5204"/>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Plot</button>
          </div>
        </form>
      </div>
    </div>
  `;
  openModal(modalHtml);
}

function handleSavePlot(e) {
  e.preventDefault();
  const name = document.getElementById('plot-name').value.trim();
  const acres = parseFloat(document.getElementById('plot-acres').value);
  const soilType = document.getElementById('plot-soil').value;
  const waterSource = document.getElementById('plot-water').value;
  const currentCrop = document.getElementById('plot-crop').value.trim();

  const plots = JSON.parse(localStorage.getItem('smartfarm_plots') || '[]');
  plots.push({ id: Date.now(), name, acres, soilType, waterSource, currentCrop });
  localStorage.setItem('smartfarm_plots', JSON.stringify(plots));
  closeModal();
  showToast('Plot added successfully! 📍');
  renderFarm();
}

function deletePlotEntry(id) {
  if (!confirm('Delete this plot record?')) return;
  let plots = JSON.parse(localStorage.getItem('smartfarm_plots') || '[]');
  plots = plots.filter(p => p.id !== id);
  localStorage.setItem('smartfarm_plots', JSON.stringify(plots));
  showToast('Plot deleted.');
  renderFarm();
}

/* Modal Helpers for Tasks */
function openAddTaskModal() {
  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>📋 Add Scheduled Farm Task</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="handleSaveTask(event)">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Task Name *</label>
              <input class="form-input" id="task-name" type="text" placeholder="e.g. Apply 1st top dressing Urea, Weed field B" required/>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Due Date *</label>
                <input class="form-input" id="task-date" type="date" required value="${new Date().toISOString().split('T')[0]}"/>
              </div>
              <div class="form-group">
                <label class="form-label">Priority</label>
                <select class="form-select" id="task-priority">
                  <option value="Low">Low Priority</option>
                  <option value="Medium" selected>Medium Priority</option>
                  <option value="High">High Priority 🔴</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Activity Category</label>
              <select class="form-select" id="task-cat">
                <option value="Fertilizer">Fertilizer Application</option>
                <option value="Spraying">Pesticide / Foliar Spray</option>
                <option value="Irrigation">Irrigation / Channel Clearing</option>
                <option value="Weeding">Weeding &amp; Interculture</option>
                <option value="Harvesting">Harvesting &amp; Threshing</option>
                <option value="Equipment">Equipment Maintenance</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Schedule Task</button>
          </div>
        </form>
      </div>
    </div>
  `;
  openModal(modalHtml);
}

function handleSaveTask(e) {
  e.preventDefault();
  const name = document.getElementById('task-name').value.trim();
  const dueDate = document.getElementById('task-date').value;
  const priority = document.getElementById('task-priority').value;
  const category = document.getElementById('task-cat').value;

  const tasks = JSON.parse(localStorage.getItem('smartfarm_tasks') || '[]');
  tasks.push({ id: Date.now(), name, dueDate, priority, category, completed: false });
  localStorage.setItem('smartfarm_tasks', JSON.stringify(tasks));
  closeModal();
  showToast('Task added to schedule! 📋');
  generateSmartAlerts();
  renderFarm();
}

function toggleFarmTask(id) {
  const tasks = JSON.parse(localStorage.getItem('smartfarm_tasks') || '[]');
  const t = tasks.find(x => x.id === id);
  if (t) {
    t.completed = !t.completed;
    localStorage.setItem('smartfarm_tasks', JSON.stringify(tasks));
    renderFarm();
  }
}

function deleteFarmTask(id) {
  let tasks = JSON.parse(localStorage.getItem('smartfarm_tasks') || '[]');
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem('smartfarm_tasks', JSON.stringify(tasks));
  renderFarm();
}

/* Modal Helpers for Inventory */
function openAddInvModal() {
  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>📦 Register Inventory Stock Item</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="handleSaveInv(event)">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Item Name *</label>
              <input class="form-input" id="inv-name" type="text" placeholder="e.g. Urea 45kg Bags, Chlorpyrifos, Diesel" required/>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Quantity *</label>
                <input class="form-input" id="inv-qty" type="number" step="0.5" required value="10"/>
              </div>
              <div class="form-group">
                <label class="form-label">Unit</label>
                <input class="form-input" id="inv-unit" type="text" placeholder="Bags, Liters, kg" required value="Bags"/>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" id="inv-cat">
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Chemicals">Chemicals / Sprays</option>
                  <option value="Fuel">Fuel &amp; Oil</option>
                  <option value="Tools">Tools &amp; Hardware</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Storage Location</label>
                <input class="form-input" id="inv-loc" type="text" placeholder="e.g. Pump Shed, Storage Barn"/>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Stock</button>
          </div>
        </form>
      </div>
    </div>
  `;
  openModal(modalHtml);
}

function handleSaveInv(e) {
  e.preventDefault();
  const name = document.getElementById('inv-name').value.trim();
  const qty = parseFloat(document.getElementById('inv-qty').value);
  const unit = document.getElementById('inv-unit').value.trim();
  const category = document.getElementById('inv-cat').value;
  const location = document.getElementById('inv-loc').value.trim();

  const inv = JSON.parse(localStorage.getItem('smartfarm_inventory') || '[]');
  inv.push({ id: Date.now(), name, qty, unit, category, location });
  localStorage.setItem('smartfarm_inventory', JSON.stringify(inv));
  closeModal();
  showToast('Inventory stock registered! 📦');
  renderFarm();
}

function deleteInvItem(id) {
  let inv = JSON.parse(localStorage.getItem('smartfarm_inventory') || '[]');
  inv = inv.filter(i => i.id !== id);
  localStorage.setItem('smartfarm_inventory', JSON.stringify(inv));
  renderFarm();
}

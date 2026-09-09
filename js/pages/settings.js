/* ═══════════════════════════════════════
   settings.js — Application Settings & Profile
   ═══════════════════════════════════════ */

function renderSettings() {
  const farmer = getCurrentFarmer() || {};
  const isDark = document.body.classList.contains('dark-mode');

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">⚙️ Settings &amp; Farmer Profile</h1>
          <p class="page-subtitle">Manage farmer profile credentials, theme preferences, and data backups.</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="settingsTabs">
        <button class="tab-btn active" data-tab="tab-set-profile">👨‍🌾 Farmer Profile</button>
        <button class="tab-btn" data-tab="tab-set-pref">🎨 Theme &amp; Display</button>
        <button class="tab-btn" data-tab="tab-set-data">💾 Data Management &amp; Demo</button>
      </div>

      <!-- TAB 1: Profile -->
      <div class="tab-content active" id="tab-set-profile">
        <div class="card" style="max-width:720px">
          <div class="card-header">
            <span class="card-title">Edit Farmer Profile Details</span>
          </div>
          <div class="card-body">
            <form onsubmit="handleSaveProfile(event)">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input class="form-input" id="set-name" type="text" required value="${farmer.name || ''}"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <input class="form-input" id="set-phone" type="tel" required value="${farmer.phone || ''}"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Village / Town</label>
                  <input class="form-input" id="set-village" type="text" value="${farmer.village || ''}"/>
                </div>
                <div class="form-group">
                  <label class="form-label">District</label>
                  <input class="form-input" id="set-district" type="text" value="${farmer.district || ''}"/>
                </div>
                <div class="form-group">
                  <label class="form-label">State</label>
                  <select class="form-select" id="set-state">
                    <option ${farmer.state === 'Andhra Pradesh' ? 'selected' : ''}>Andhra Pradesh</option>
                    <option ${farmer.state === 'Telangana' ? 'selected' : ''}>Telangana</option>
                    <option ${farmer.state === 'Karnataka' ? 'selected' : ''}>Karnataka</option>
                    <option ${farmer.state === 'Maharashtra' ? 'selected' : ''}>Maharashtra</option>
                    <option ${farmer.state === 'Punjab' ? 'selected' : ''}>Punjab</option>
                    <option ${farmer.state === 'Uttar Pradesh' ? 'selected' : ''}>Uttar Pradesh</option>
                    <option ${farmer.state === 'Madhya Pradesh' ? 'selected' : ''}>Madhya Pradesh</option>
                    <option ${farmer.state === 'Gujarat' ? 'selected' : ''}>Gujarat</option>
                    <option ${farmer.state === 'Rajasthan' ? 'selected' : ''}>Rajasthan</option>
                    <option ${farmer.state === 'Tamil Nadu' ? 'selected' : ''}>Tamil Nadu</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Total Landholding (Acres)</label>
                  <input class="form-input" id="set-size" type="number" step="0.5" value="${farmer.farmSize || 2}"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Primary Crop</label>
                  <select class="form-select" id="set-crop">
                    <option ${farmer.primaryCrop === 'Rice' ? 'selected' : ''}>Rice</option>
                    <option ${farmer.primaryCrop === 'Wheat' ? 'selected' : ''}>Wheat</option>
                    <option ${farmer.primaryCrop === 'Cotton' ? 'selected' : ''}>Cotton</option>
                    <option ${farmer.primaryCrop === 'Maize' ? 'selected' : ''}>Maize</option>
                    <option ${farmer.primaryCrop === 'Tomato' ? 'selected' : ''}>Tomato</option>
                    <option ${farmer.primaryCrop === 'Chilli' ? 'selected' : ''}>Chilli</option>
                    <option ${farmer.primaryCrop === 'Soybean' ? 'selected' : ''}>Soybean</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Farming Experience (Years)</label>
                  <input class="form-input" id="set-exp" type="number" value="${farmer.experience || 5}"/>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="margin-top:10px">Save Profile Changes</button>
            </form>
          </div>
        </div>
      </div>

      <!-- TAB 2: Preferences -->
      <div class="tab-content" id="tab-set-pref">
        <div class="card" style="max-width:640px">
          <div class="card-header">
            <span class="card-title">Theme &amp; Display Preferences</span>
          </div>
          <div class="card-body">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid var(--border)">
              <div>
                <strong>🌙 Dark Mode Theme</strong>
                <div style="font-size:0.82rem;color:var(--text-muted)">Reduces glare and preserves screen battery during night field monitoring.</div>
              </div>
              <button class="btn ${isDark ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="toggleDarkMode()">
                ${isDark ? '🌙 Dark Active' : '☀️ Light Active'}
              </button>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid var(--border)">
              <div>
                <strong>🌐 Interface Language</strong>
                <div style="font-size:0.82rem;color:var(--text-muted)">Choose your preferred display language.</div>
              </div>
              <select class="form-select" style="max-width:180px" onchange="showToast('Language preference updated!')">
                <option selected>English (EN)</option>
                <option>తెలుగు (Telugu)</option>
                <option>हिंदी (Hindi)</option>
              </select>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0">
              <div>
                <strong>📐 Preferred Land Unit</strong>
                <div style="font-size:0.82rem;color:var(--text-muted)">Standard land measurement unit for reports and calculations.</div>
              </div>
              <select class="form-select" style="max-width:180px">
                <option selected>Acres (ac)</option>
                <option>Hectares (ha)</option>
                <option>Bigha</option>
                <option>Guntha</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: Data Management -->
      <div class="tab-content" id="tab-set-data">
        <div class="grid-2">
          <!-- Seed Demo Data -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">🌱 Instant Demo Data</span>
            </div>
            <div class="card-body">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px">
                Instantly populate your SmartFarm app with pre-configured active crops (Rice &amp; Cotton), seasonal expenses, farm plots, and field activity tasks to test all features.
              </p>
              <button class="btn btn-primary btn-full" onclick="loadSampleDemoData()">🚀 Load Sample Farm Data</button>
            </div>
          </div>

          <!-- Backup & Restore -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">📦 Backup &amp; Restore</span>
            </div>
            <div class="card-body">
              <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:14px">
                Export all your crops, expenses, tasks, and settings as an offline JSON backup file.
              </p>
              <div style="display:flex;gap:10px;margin-bottom:16px">
                <button class="btn btn-secondary btn-full btn-sm" onclick="exportFullDataBackup()">💾 Export Backup (JSON)</button>
              </div>

              <div style="border-top:1px solid var(--border);padding-top:14px">
                <label class="form-label" style="font-size:0.78rem">Restore from Backup File</label>
                <input type="file" id="importJsonInput" accept=".json" onchange="importDataBackup(event)" style="font-size:0.85rem"/>
              </div>
            </div>
          </div>

          <!-- Reset Data -->
          <div class="card" style="grid-column:1/-1;border-color:#ffcdd2">
            <div class="card-header" style="background:#ffebee">
              <span class="card-title" style="color:#b71c1c">⚠️ Danger Zone: Reset Application Data</span>
            </div>
            <div class="card-body" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
              <div>
                <strong style="color:#b71c1c">Clear all local storage data</strong>
                <p style="font-size:0.82rem;color:var(--text-muted)">This will permanently erase all your saved crops, expenses, plots, and tasks from this device.</p>
              </div>
              <button class="btn btn-danger btn-sm" onclick="clearAllData()">Wipe All Farm Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  tabs('settingsTabs', 'tab-set-profile');
}

function handleSaveProfile(e) {
  e.preventDefault();
  const farmer = getCurrentFarmer() || {};
  farmer.name = document.getElementById('set-name').value.trim();
  farmer.phone = document.getElementById('set-phone').value.trim();
  farmer.village = document.getElementById('set-village').value.trim();
  farmer.district = document.getElementById('set-district').value.trim();
  farmer.state = document.getElementById('set-state').value;
  farmer.farmSize = parseFloat(document.getElementById('set-size').value || '2');
  farmer.primaryCrop = document.getElementById('set-crop').value;
  farmer.experience = parseFloat(document.getElementById('set-exp').value || '5');

  localStorage.setItem('smartfarm_session', JSON.stringify(farmer));

  // Update in farmers array
  const farmers = JSON.parse(localStorage.getItem('smartfarm_farmers') || '[]');
  const idx = farmers.findIndex(f => f.phone === farmer.phone);
  if (idx !== -1) farmers[idx] = farmer;
  else farmers.push(farmer);
  localStorage.setItem('smartfarm_farmers', JSON.stringify(farmers));

  updateSidebarFarmer(farmer);
  showToast('Farmer Profile updated successfully! ✅');
  renderSettings();
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('smartfarm_theme', isDark ? 'dark' : 'light');
  renderSettings();
}

function loadSampleDemoData() {
  const today = new Date();
  const harvestRice = new Date(); harvestRice.setDate(today.getDate() + 45);
  const harvestCotton = new Date(); harvestCotton.setDate(today.getDate() + 90);

  const sampleCrops = [
    {
      id: 101,
      cropId: 'rice',
      fieldName: 'North Canal Plot',
      acres: 3.0,
      targetYield: '24 qtl/acre',
      plantingDate: new Date(today.getTime() - (75 * 86400000)).toISOString().split('T')[0],
      harvestDate: harvestRice.toISOString().split('T')[0],
      notes: 'BPT-5204 (Samba Mahsuri) paddy. Transplanted 21-day nursery.'
    },
    {
      id: 102,
      cropId: 'cotton',
      fieldName: 'East Red Soil Plot',
      acres: 2.0,
      targetYield: '10 qtl/acre',
      plantingDate: new Date(today.getTime() - (35 * 86400000)).toISOString().split('T')[0],
      harvestDate: harvestCotton.toISOString().split('T')[0],
      notes: 'Bt Cotton Hybrid. Drip irrigated.'
    }
  ];

  const sampleExpenses = [
    { id: 201, date: new Date(today.getTime() - (70 * 86400000)).toISOString().split('T')[0], category: 'Seeds', cropName: 'Rice', amount: 3500, notes: 'Certified BPT-5204 foundation seed' },
    { id: 202, date: new Date(today.getTime() - (65 * 86400000)).toISOString().split('T')[0], category: 'Machinery & Fuel', cropName: 'Rice', amount: 6200, notes: 'Rotavator & puddling tillage service' },
    { id: 203, date: new Date(today.getTime() - (60 * 86400000)).toISOString().split('T')[0], category: 'Fertilizers', cropName: 'Rice', amount: 4800, notes: 'Basal DAP & MOP bags' },
    { id: 204, date: new Date(today.getTime() - (40 * 86400000)).toISOString().split('T')[0], category: 'Labour', cropName: 'Rice', amount: 5500, notes: 'Paddy nursery transplanting labour' },
    { id: 205, date: new Date(today.getTime() - (30 * 86400000)).toISOString().split('T')[0], category: 'Seeds', cropName: 'Cotton', amount: 4200, notes: 'Bt Cotton seed packets' },
    { id: 206, date: new Date(today.getTime() - (15 * 86400000)).toISOString().split('T')[0], category: 'Pesticides', cropName: 'Cotton', amount: 2400, notes: 'Neem oil and Flonicamid for sucking pests' }
  ];

  const sampleTasks = [
    { id: 301, name: 'Apply 2nd Top Dressing Urea on Rice', category: 'Fertilizer', dueDate: new Date(today.getTime() + (3 * 86400000)).toISOString().split('T')[0], priority: 'High', completed: false, cropName: 'Rice' },
    { id: 302, name: 'Flush Drip Laterals & Clean Sand Filter', category: 'Irrigation', dueDate: new Date(today.getTime() + (5 * 86400000)).toISOString().split('T')[0], priority: 'Medium', completed: false, cropName: 'Cotton' },
    { id: 303, name: 'Scout Cotton plot for Pink Bollworm rosette flowers', category: 'Spraying', dueDate: new Date(today.getTime() + (7 * 86400000)).toISOString().split('T')[0], priority: 'High', completed: false, cropName: 'Cotton' },
    { id: 304, name: 'Nursery bed weeding', category: 'Weeding', dueDate: new Date(today.getTime() - (20 * 86400000)).toISOString().split('T')[0], priority: 'Low', completed: true, cropName: 'Rice' }
  ];

  const samplePlots = [
    { id: 401, name: 'North Canal Plot', acres: 3.0, soilType: 'Loamy / Alluvial', waterSource: 'Canal / Lift', currentCrop: 'Rice (BPT-5204)' },
    { id: 402, name: 'East Red Soil Plot', acres: 2.0, soilType: 'Red Sandy Loam', waterSource: 'Borewell + Drip', currentCrop: 'Bt Cotton' }
  ];

  const sampleInv = [
    { id: 501, name: 'Urea 45kg Bags', qty: 6, unit: 'Bags', category: 'Fertilizer', location: 'Fertilizer Shed' },
    { id: 502, name: 'Neem Seed Kernel Extract', qty: 10, unit: 'Liters', category: 'Chemicals', location: 'Storage Barn' },
    { id: 503, name: 'Submersible Pump Grease', qty: 2, unit: 'Cans', category: 'Tools', location: 'Pump Shed' }
  ];

  localStorage.setItem('smartfarm_crops', JSON.stringify(sampleCrops));
  localStorage.setItem('smartfarm_expenses', JSON.stringify(sampleExpenses));
  localStorage.setItem('smartfarm_tasks', JSON.stringify(sampleTasks));
  localStorage.setItem('smartfarm_plots', JSON.stringify(samplePlots));
  localStorage.setItem('smartfarm_inventory', JSON.stringify(sampleInv));

  generateSmartAlerts();
  showToast('Sample farm demo data loaded successfully! 🌱');
  navigateTo('dashboard');
}

function exportFullDataBackup() {
  const data = {
    session: JSON.parse(localStorage.getItem('smartfarm_session') || '{}'),
    crops: JSON.parse(localStorage.getItem('smartfarm_crops') || '[]'),
    expenses: JSON.parse(localStorage.getItem('smartfarm_expenses') || '[]'),
    tasks: JSON.parse(localStorage.getItem('smartfarm_tasks') || '[]'),
    plots: JSON.parse(localStorage.getItem('smartfarm_plots') || '[]'),
    inventory: JSON.parse(localStorage.getItem('smartfarm_inventory') || '[]'),
    soil: JSON.parse(localStorage.getItem('smartfarm_soil') || 'null'),
    alerts: JSON.parse(localStorage.getItem('smartfarm_alerts') || '[]'),
    exportedAt: new Date().toISOString()
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `SmartFarm_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Backup JSON exported! 💾');
}

function importDataBackup(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Max 5MB file limit for safety
  if (file.size > 5 * 1024 * 1024) {
    showToast('File size exceeds 5MB security limit.', 'danger');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new Error('Invalid JSON format');
      }

      // Safe import with array validation
      if (Array.isArray(data.crops)) {
        localStorage.setItem('smartfarm_crops', JSON.stringify(data.crops.slice(0, 100)));
      }
      if (Array.isArray(data.expenses)) {
        localStorage.setItem('smartfarm_expenses', JSON.stringify(data.expenses.slice(0, 500)));
      }
      if (Array.isArray(data.tasks)) {
        localStorage.setItem('smartfarm_tasks', JSON.stringify(data.tasks.slice(0, 200)));
      }
      if (Array.isArray(data.plots)) {
        localStorage.setItem('smartfarm_plots', JSON.stringify(data.plots.slice(0, 50)));
      }
      if (Array.isArray(data.inventory)) {
        localStorage.setItem('smartfarm_inventory', JSON.stringify(data.inventory.slice(0, 100)));
      }
      if (Array.isArray(data.alerts)) {
        localStorage.setItem('smartfarm_alerts', JSON.stringify(data.alerts.slice(0, 100)));
      }
      if (data.soil && typeof data.soil === 'object' && !Array.isArray(data.soil)) {
        localStorage.setItem('smartfarm_soil', JSON.stringify(data.soil));
      }

      showToast('Farm backup validated & restored safely! 📦');
      renderSettings();
    } catch(err) {
      showToast('Invalid or corrupted JSON backup file.', 'danger');
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (!confirm('Are you absolutely sure? All crops, expenses, tasks and plots will be deleted!')) return;
  const keys = ['smartfarm_crops', 'smartfarm_expenses', 'smartfarm_tasks', 'smartfarm_plots', 'smartfarm_inventory', 'smartfarm_soil', 'smartfarm_alerts'];
  keys.forEach(k => localStorage.removeItem(k));
  showToast('All farm data has been wiped.');
  navigateTo('dashboard');
}

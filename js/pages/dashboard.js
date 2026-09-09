/* ═══════════════════════════════════════
   dashboard.js — Farmer Dashboard Module
   ═══════════════════════════════════════ */

function renderDashboard() {
  const farmer   = getCurrentFarmer();
  const crops    = JSON.parse(localStorage.getItem('smartfarm_crops')    || '[]');
  const tasks    = JSON.parse(localStorage.getItem('smartfarm_tasks')    || '[]');
  const expenses = JSON.parse(localStorage.getItem('smartfarm_expenses') || '[]');
  const plots    = JSON.parse(localStorage.getItem('smartfarm_plots')    || '[]');

  const pendingTasks = tasks.filter(t => !t.completed);
  const totalExp = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalAcreage = crops.reduce((s, c) => s + Number(c.acres || 0), 0) || Number(farmer?.farmSize || 0);

  // Calculate estimated revenue & profit if any crops exist
  let estRevenue = 0;
  crops.forEach(c => {
    const cd = CROPS_DATA.find(x => x.id === c.cropId);
    if (cd) {
      const yieldMin = parseInt(cd.yieldPerAcre) || 15;
      const mp = BASE_MARKET_PRICES.find(p => p.crop.toLowerCase() === cd.name.toLowerCase()) || { price: 2000 };
      estRevenue += yieldMin * mp.price * Number(c.acres || 1);
    }
  });
  const estProfit = Math.max(0, estRevenue - totalExp);

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">📊 Farmer Dashboard</h1>
          <p class="page-subtitle">Welcome back, <strong>${escapeHtml(farmer?.name || 'Farmer')}</strong>! Real-time overview of your farm operations.</p>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-primary btn-sm" onclick="navigateTo('crop-planner')">+ Plan Crop</button>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('expense')">+ Log Expense</button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="grid-4" style="margin-bottom:24px">
        <div class="stat-card">
          <span class="stat-icon">🌱</span>
          <div>
            <div class="stat-value">${crops.length}</div>
            <div class="stat-label">Active Crops (${totalAcreage} ac)</div>
          </div>
        </div>
        <div class="stat-card accent">
          <span class="stat-icon">📋</span>
          <div>
            <div class="stat-value">${pendingTasks.length}</div>
            <div class="stat-label">Pending Tasks</div>
          </div>
        </div>
        <div class="stat-card danger">
          <span class="stat-icon">💵</span>
          <div>
            <div class="stat-value">${formatCurrency(totalExp)}</div>
            <div class="stat-label">Total Expenses</div>
          </div>
        </div>
        <div class="stat-card info">
          <span class="stat-icon">📈</span>
          <div>
            <div class="stat-value">${formatCurrency(estProfit)}</div>
            <div class="stat-label">Est. Net Profit</div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid-2" style="margin-bottom:24px">
        <div class="card">
          <div class="card-header">
            <span class="card-title">🌾 Crop Acreage Distribution</span>
            <span class="badge badge-success">${crops.length} Planted</span>
          </div>
          <div class="card-body" style="height:280px;display:flex;align-items:center;justify-content:center">
            ${crops.length === 0 
              ? '<div class="empty-state"><p class="text-muted">No crops added yet. <a href="javascript:void(0)" onclick="navigateTo(\'crop-planner\')">Add a crop</a> to see acreage distribution.</p></div>' 
              : '<canvas id="dashCropChart"></canvas>'
            }
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">💰 Expense by Category</span>
            <span class="badge badge-info">${formatCurrency(totalExp)} Total</span>
          </div>
          <div class="card-body" style="height:280px;display:flex;align-items:center;justify-content:center">
            ${expenses.length === 0 
              ? '<div class="empty-state"><p class="text-muted">No expenses recorded. <a href="javascript:void(0)" onclick="navigateTo(\'expense\')">Log an expense</a> to view distribution.</p></div>' 
              : '<canvas id="dashExpChart"></canvas>'
            }
          </div>
        </div>
      </div>

      <!-- Crop Progress & Task Tracker -->
      <div class="grid-2" style="margin-bottom:24px">
        <!-- Crops Lifecycle -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">🌱 Active Crop Progress</span>
            <button class="btn btn-ghost btn-sm" onclick="navigateTo('crop-planner')">View All</button>
          </div>
          <div class="card-body">
            ${crops.length === 0 
              ? '<div class="empty-state"><p>No crops currently in cultivation.</p><button class="btn btn-primary btn-sm" onclick="navigateTo(\'crop-planner\')">Add Crop</button></div>'
              : crops.slice(0, 5).map(c => {
                  const cd = CROPS_DATA.find(x => x.id === c.cropId) || { name: c.cropId, duration: 120, emoji: '🌱' };
                  const gs = getGrowthStage(c.plantingDate, cd.duration);
                  return `
                    <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                        <div>
                          <strong style="font-size:0.95rem">${cd.emoji || '🌱'} ${cd.name}</strong>
                          <span style="font-size:0.8rem;color:var(--text-muted);margin-left:6px">(${c.acres || 1} acres · ${escapeHtml(c.fieldName || 'Field 1')})</span>
                        </div>
                        <span class="badge ${gs.pct >= 80 ? 'badge-warning' : 'badge-success'}">${gs.stage} (${gs.pct}%)</span>
                      </div>
                      <div class="progress" style="height:10px">
                        <div class="progress-bar ${gs.pct >= 80 ? 'warning' : ''}" style="width:${gs.pct}%"></div>
                      </div>
                      <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-top:4px">
                        <span>Planted: ${formatDate(c.plantingDate)}</span>
                        <span>Est. Harvest: ${formatDate(c.harvestDate)}</span>
                      </div>
                    </div>
                  `;
                }).join('')
            }
          </div>
        </div>

        <!-- Task Checklist -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">📋 Scheduled Farm Activities</span>
            <button class="btn btn-ghost btn-sm" onclick="navigateTo('farm')">Manage Tasks</button>
          </div>
          <div class="card-body">
            ${tasks.length === 0 
              ? '<div class="empty-state"><p>No upcoming tasks.</p><button class="btn btn-primary btn-sm" onclick="navigateTo(\'farm\')">+ Add Task</button></div>'
              : tasks.slice(0, 6).map(t => `
                  <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
                    <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleDashTask(${t.id})" style="transform:scale(1.2);cursor:pointer"/>
                    <div style="flex:1;text-decoration:${t.completed ? 'line-through' : 'none'};opacity:${t.completed ? '0.6' : '1'}">
                      <div style="font-weight:600;font-size:0.9rem">${escapeHtml(t.name)}</div>
                      <div style="font-size:0.75rem;color:var(--text-muted)">Due: ${formatDate(t.dueDate)} ${t.cropName ? '· ' + escapeHtml(t.cropName) : ''}</div>
                    </div>
                    <span class="badge ${t.priority === 'High' ? 'badge-danger' : t.priority === 'Medium' ? 'badge-warning' : 'badge-success'}">${t.priority || 'Normal'}</span>
                  </div>
                `).join('')
            }
          </div>
        </div>
      </div>

      <!-- Quick Advisories & Alerts Banner -->
      <div class="card" style="background:linear-gradient(135deg, rgba(45,122,45,0.06), rgba(2,136,209,0.06))">
        <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
          <div style="display:flex;align-items:center;gap:16px">
            <span style="font-size:2.5rem">🌦️</span>
            <div>
              <div style="font-weight:700;font-size:1.05rem">Smart Advisory: Optimal Spraying & Irrigation Window</div>
              <div style="font-size:0.85rem;color:var(--text-muted)">Moderate winds and zero rainfall expected over the next 48 hours. Ideal condition for foliar nutrient sprays.</div>
            </div>
          </div>
          <div style="display:flex;gap:10px">
            <button class="btn btn-secondary btn-sm" onclick="navigateTo('weather')">Live Weather</button>
            <button class="btn btn-primary btn-sm" onclick="navigateTo('irrigation')">Check Irrigation</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render Charts
  initDashboardCharts(crops, expenses);
}

function initDashboardCharts(crops, expenses) {
  // Crop Chart
  if (crops.length > 0 && document.getElementById('dashCropChart')) {
    destroyChart('dashCropChart');
    const cropLabels = crops.map(c => {
      const cd = CROPS_DATA.find(x => x.id === c.cropId);
      return (cd ? cd.name : c.cropId) + ` (${c.acres || 1} ac)`;
    });
    const cropData = crops.map(c => Number(c.acres || 1));
    const bgColors = ['#2d7a2d', '#4caf50', '#8bc34a', '#cddc39', '#ff9800', '#03a9f4', '#9c27b0'];

    new Chart(document.getElementById('dashCropChart'), {
      type: 'doughnut',
      data: {
        labels: cropLabels,
        datasets: [{
          data: cropData,
          backgroundColor: bgColors.slice(0, crops.length),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  // Expense Chart
  if (expenses.length > 0 && document.getElementById('dashExpChart')) {
    destroyChart('dashExpChart');
    const catMap = {};
    expenses.forEach(e => {
      const c = e.category || 'Other';
      catMap[c] = (catMap[c] || 0) + Number(e.amount || 0);
    });
    const expLabels = Object.keys(catMap);
    const expData = Object.values(catMap);

    new Chart(document.getElementById('dashExpChart'), {
      type: 'bar',
      data: {
        labels: expLabels,
        datasets: [{
          label: 'Spent (₹)',
          data: expData,
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
}

function toggleDashTask(taskId) {
  const tasks = JSON.parse(localStorage.getItem('smartfarm_tasks') || '[]');
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    localStorage.setItem('smartfarm_tasks', JSON.stringify(tasks));
    renderDashboard();
    showToast(task.completed ? 'Task marked complete! ✅' : 'Task reopened 🔄');
  }
}

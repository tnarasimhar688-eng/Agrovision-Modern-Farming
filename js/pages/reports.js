/* ═══════════════════════════════════════
   reports.js — Reports & Analytics Module
   ═══════════════════════════════════════ */

function renderReports() {
  const farmer = getCurrentFarmer();
  const crops = JSON.parse(localStorage.getItem('smartfarm_crops') || '[]');
  const expenses = JSON.parse(localStorage.getItem('smartfarm_expenses') || '[]');
  const tasks = JSON.parse(localStorage.getItem('smartfarm_tasks') || '[]');

  const totalExp = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalAcres = crops.reduce((s, c) => s + Number(c.acres || 0), 0) || Number(farmer?.farmSize || 0);

  let estGross = 0;
  crops.forEach(c => {
    const cd = CROPS_DATA.find(x => x.id === c.cropId);
    if (cd) {
      const yieldMin = parseInt(cd.yieldPerAcre) || 18;
      const mp = BASE_MARKET_PRICES.find(p => p.crop.toLowerCase() === cd.name.toLowerCase()) || { price: 2100 };
      estGross += yieldMin * mp.price * Number(c.acres || 1);
    }
  });
  const estNet = Math.max(0, estGross - totalExp);

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">📊 Reports &amp; Farm Analytics</h1>
          <p class="page-subtitle">Detailed seasonal profit &amp; loss statements, cost auditing, and CSV exports.</p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ Print Farm Report</button>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid-4" style="margin-bottom:24px">
        <div class="stat-card">
          <span class="stat-icon">🌾</span>
          <div>
            <div class="stat-value">${crops.length}</div>
            <div class="stat-label">Total Crops (${totalAcres} Acres)</div>
          </div>
        </div>
        <div class="stat-card danger">
          <span class="stat-icon">💸</span>
          <div>
            <div class="stat-value">${formatCurrency(totalExp)}</div>
            <div class="stat-label">Total Season Outflow</div>
          </div>
        </div>
        <div class="stat-card info">
          <span class="stat-icon">💰</span>
          <div>
            <div class="stat-value">${formatCurrency(estGross)}</div>
            <div class="stat-label">Projected Revenue</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📈</span>
          <div>
            <div class="stat-value" style="color:#2e7d32">${formatCurrency(estNet)}</div>
            <div class="stat-label">Estimated Net Return</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="reportTabs">
        <button class="tab-btn active" data-tab="tab-rep-summary">📑 Season Performance Statement</button>
        <button class="tab-btn" data-tab="tab-rep-charts">📈 Analytics Visualizations</button>
        <button class="tab-btn" data-tab="tab-rep-export">💾 Export Spreadsheets (CSV)</button>
      </div>

      <!-- TAB 1: Statement -->
      <div class="tab-content active" id="tab-rep-summary">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Seasonal Cultivation Audit Statement</span>
            <span style="font-size:0.8rem;color:var(--text-muted)">Generated: ${formatDate(new Date().toISOString())}</span>
          </div>
          <div class="card-body">
            <div style="margin-bottom:20px;background:var(--bg);padding:16px;border-radius:var(--radius-sm)">
              <div class="grid-3">
                <div><strong>Farmer Name:</strong> ${farmer?.name || 'Farmer'}</div>
                <div><strong>Village / State:</strong> ${farmer?.village || '--'}, ${farmer?.state || '--'}</div>
                <div><strong>Total Landholding:</strong> ${farmer?.farmSize || totalAcres} Acres</div>
              </div>
            </div>

            <h3 class="section-title">Planted Crop Performance</h3>
            <div class="table-container" style="margin-bottom:24px">
              <table>
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Plot / Field</th>
                    <th>Acreage</th>
                    <th>Planting Date</th>
                    <th>Harvest Date</th>
                    <th>Exp. Yield</th>
                    <th>Linked Cost</th>
                  </tr>
                </thead>
                <tbody>
                  ${crops.length === 0 
                    ? '<tr><td colspan="7" style="text-align:center;padding:16px;color:var(--text-muted)">No active crops recorded.</td></tr>'
                    : crops.map(c => {
                        const cd = CROPS_DATA.find(x => x.id === c.cropId) || { name: c.cropId, yieldPerAcre: '20 qtl', emoji: '🌱' };
                        const cropExp = expenses.filter(e => e.cropName && e.cropName.toLowerCase().includes(cd.name.toLowerCase()))
                          .reduce((s, e) => s + Number(e.amount || 0), 0);
                        return `
                          <tr>
                            <td><strong>${cd.emoji || '🌱'} ${cd.name}</strong></td>
                            <td>${c.fieldName || 'Plot 1'}</td>
                            <td>${c.acres || 1} Acres</td>
                            <td>${formatDate(c.plantingDate)}</td>
                            <td>${formatDate(c.harvestDate)}</td>
                            <td>${c.targetYield || cd.yieldPerAcre}</td>
                            <td><strong>${formatCurrency(cropExp)}</strong></td>
                          </tr>
                        `;
                      }).join('')
                  }
                </tbody>
              </table>
            </div>

            <h3 class="section-title">Expense Summary by Input Type</h3>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Input Category</th>
                    <th>Total Spent</th>
                    <th>% of Total Outflow</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderExpenseSummaryRows(expenses, totalExp)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: Charts -->
      <div class="tab-content" id="tab-rep-charts">
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><span class="card-title">Monthly Farm Spending Outflow</span></div>
            <div class="card-body" style="height:320px">
              <canvas id="monthlyExpChart"></canvas>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">Input Cost Allocation</span></div>
            <div class="card-body" style="height:320px">
              <canvas id="repCatChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: CSV Export -->
      <div class="tab-content" id="tab-rep-export">
        <div class="grid-3">
          <div class="card" style="text-align:center">
            <div class="card-body">
              <div style="font-size:3rem;margin-bottom:10px">💵</div>
              <h4>Export Expenses</h4>
              <p style="font-size:0.83rem;color:var(--text-muted);margin-bottom:16px">Download all logged transaction lines in CSV format for Excel/accounting.</p>
              <button class="btn btn-primary btn-full btn-sm" onclick="exportExpensesCSV()">Download Expenses CSV</button>
            </div>
          </div>

          <div class="card" style="text-align:center">
            <div class="card-body">
              <div style="font-size:3rem;margin-bottom:10px">🌱</div>
              <h4>Export Crops Log</h4>
              <p style="font-size:0.83rem;color:var(--text-muted);margin-bottom:16px">Download seasonal crop cycles, acreage, sowing dates and harvest records.</p>
              <button class="btn btn-primary btn-full btn-sm" onclick="exportCropsCSV()">Download Crops CSV</button>
            </div>
          </div>

          <div class="card" style="text-align:center">
            <div class="card-body">
              <div style="font-size:3rem;margin-bottom:10px">📋</div>
              <h4>Export Farm Tasks</h4>
              <p style="font-size:0.83rem;color:var(--text-muted);margin-bottom:16px">Download completed and scheduled farm operational tasks checklist.</p>
              <button class="btn btn-primary btn-full btn-sm" onclick="exportTasksCSV()">Download Tasks CSV</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  tabs('reportTabs', 'tab-rep-summary');
  initReportCharts(expenses);
}

function renderExpenseSummaryRows(expenses, total) {
  if (expenses.length === 0) {
    return '<tr><td colspan="3" style="text-align:center;padding:16px;color:var(--text-muted)">No expenses recorded yet.</td></tr>';
  }
  const map = {};
  expenses.forEach(e => {
    const c = e.category || 'Other';
    map[c] = (map[c] || 0) + Number(e.amount || 0);
  });

  return Object.entries(map).map(([cat, amt]) => {
    const pct = total > 0 ? ((amt / total) * 100).toFixed(1) : 0;
    return `
      <tr>
        <td><strong>${cat}</strong></td>
        <td><strong style="color:#c62828">${formatCurrency(amt)}</strong></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="progress" style="flex:1;height:8px"><div class="progress-bar" style="width:${pct}%"></div></div>
            <span style="font-size:0.82rem;font-weight:700">${pct}%</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function initReportCharts(expenses) {
  // Monthly Chart
  const mCanvas = document.getElementById('monthlyExpChart');
  if (mCanvas) {
    destroyChart('monthlyExpChart');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals = new Array(12).fill(0);

    expenses.forEach(e => {
      if (e.date) {
        const m = new Date(e.date).getMonth();
        if (!isNaN(m) && m >= 0 && m < 12) {
          monthlyTotals[m] += Number(e.amount || 0);
        }
      }
    });

    new Chart(mCanvas, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Expenditure (₹)',
          data: monthlyTotals,
          backgroundColor: '#2d7a2d',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => '₹' + v.toLocaleString('en-IN') } }
        }
      }
    });
  }

  // Category Chart
  const cCanvas = document.getElementById('repCatChart');
  if (cCanvas) {
    destroyChart('repCatChart');
    const map = {};
    expenses.forEach(e => {
      const c = e.category || 'Other';
      map[c] = (map[c] || 0) + Number(e.amount || 0);
    });

    new Chart(cCanvas, {
      type: 'pie',
      data: {
        labels: Object.keys(map),
        datasets: [{
          data: Object.values(map),
          backgroundColor: ['#2d7a2d', '#0288d1', '#e65100', '#7b1fa2', '#c2185b', '#fbc02d', '#00796b']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } }
      }
    });
  }
}

function downloadCSVFile(csvContent, fileName) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Downloaded ${fileName} 💾`);
}

function exportExpensesCSV() {
  const expenses = JSON.parse(localStorage.getItem('smartfarm_expenses') || '[]');
  if (expenses.length === 0) { showToast('No expenses to export.', 'warning'); return; }

  let csv = 'ID,Date,Category,Crop,Amount,Notes\n';
  expenses.forEach(e => {
    csv += `"${e.id}","${e.date}","${e.category || ''}","${e.cropName || ''}","${e.amount}","${(e.notes || '').replace(/"/g, '""')}"\n`;
  });
  downloadCSVFile(csv, 'SmartFarm_Expenses.csv');
}

function exportCropsCSV() {
  const crops = JSON.parse(localStorage.getItem('smartfarm_crops') || '[]');
  if (crops.length === 0) { showToast('No crops to export.', 'warning'); return; }

  let csv = 'ID,Crop,Field,Acres,PlantingDate,HarvestDate,Yield\n';
  crops.forEach(c => {
    csv += `"${c.id}","${c.cropId}","${c.fieldName || ''}","${c.acres}","${c.plantingDate}","${c.harvestDate}","${c.targetYield || ''}"\n`;
  });
  downloadCSVFile(csv, 'SmartFarm_Crops.csv');
}

function exportTasksCSV() {
  const tasks = JSON.parse(localStorage.getItem('smartfarm_tasks') || '[]');
  if (tasks.length === 0) { showToast('No tasks to export.', 'warning'); return; }

  let csv = 'ID,Task,Category,DueDate,Priority,Completed\n';
  tasks.forEach(t => {
    csv += `"${t.id}","${(t.name || '').replace(/"/g, '""')}","${t.category || ''}","${t.dueDate}","${t.priority}","${t.completed ? 'YES' : 'NO'}"\n`;
  });
  downloadCSVFile(csv, 'SmartFarm_Tasks.csv');
}

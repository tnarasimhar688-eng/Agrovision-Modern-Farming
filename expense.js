/* ═══════════════════════════════════════
   expense.js — Expense Management Module
   ═══════════════════════════════════════ */

function renderExpense() {
  const expenses = JSON.parse(localStorage.getItem('smartfarm_expenses') || '[]');
  const crops = JSON.parse(localStorage.getItem('smartfarm_crops') || '[]');
  const budget = Number(localStorage.getItem('smartfarm_budget') || '75000');

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const remainingBudget = budget - totalSpent;
  const budgetPct = Math.min(100, Math.round((totalSpent / (budget || 1)) * 100));

  // Find highest expense category
  const catTotals = {};
  expenses.forEach(e => {
    const c = e.category || 'Other';
    catTotals[c] = (catTotals[c] || 0) + Number(e.amount || 0);
  });
  let topCat = 'None', topCatVal = 0;
  for (const [k, v] of Object.entries(catTotals)) {
    if (v > topCatVal) { topCat = k; topCatVal = v; }
  }

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">💵 Farm Expense Management</h1>
          <p class="page-subtitle">Track cultivation costs, manage seasonal budgets, and categorize farm inputs.</p>
        </div>
        <button class="btn btn-primary" onclick="switchExpenseTab('tab-add-exp')">+ Add New Expense</button>
      </div>

      <!-- KPI Summary -->
      <div class="grid-4" style="margin-bottom:24px">
        <div class="stat-card danger">
          <span class="stat-icon">💸</span>
          <div>
            <div class="stat-value">${formatCurrency(totalSpent)}</div>
            <div class="stat-label">Total Outflow</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🎯</span>
          <div>
            <div class="stat-value">${formatCurrency(budget)}</div>
            <div class="stat-label">Season Target Budget</div>
          </div>
        </div>
        <div class="stat-card ${remainingBudget >= 0 ? 'info' : 'accent'}">
          <span class="stat-icon">${remainingBudget >= 0 ? '🛡️' : '⚠️'}</span>
          <div>
            <div class="stat-value">${formatCurrency(remainingBudget)}</div>
            <div class="stat-label">${remainingBudget >= 0 ? 'Budget Remaining' : 'Over Budget!'}</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📊</span>
          <div>
            <div class="stat-value" style="font-size:1.15rem">${topCat}</div>
            <div class="stat-label">Top Cost Driver (${formatCurrency(topCatVal)})</div>
          </div>
        </div>
      </div>

      <!-- Budget Progress Bar -->
      <div class="card" style="margin-bottom:24px">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-weight:700">Seasonal Budget Utilization</span>
            <span style="font-weight:700;color:${budgetPct > 90 ? '#c62828' : 'var(--primary)'}">${budgetPct}% (${formatCurrency(totalSpent)} / ${formatCurrency(budget)})</span>
          </div>
          <div class="progress" style="height:12px">
            <div class="progress-bar ${budgetPct > 90 ? 'danger' : budgetPct > 75 ? 'warning' : ''}" style="width:${budgetPct}%"></div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="expenseTabs">
        <button class="tab-btn active" data-tab="tab-exp-list">📋 Expense Records (${expenses.length})</button>
        <button class="tab-btn" data-tab="tab-add-exp">➕ Log New Expense</button>
        <button class="tab-btn" data-tab="tab-exp-charts">📊 Category Analytics</button>
        <button class="tab-btn" data-tab="tab-exp-budget">⚙️ Budget Preferences</button>
      </div>

      <!-- TAB 1: Expense List -->
      <div class="tab-content active" id="tab-exp-list">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Detailed Cost Log</span>
            <span class="badge badge-info">${expenses.length} Entries</span>
          </div>
          <div class="card-body">
            ${expenses.length === 0 
              ? '<div class="empty-state"><div class="empty-icon">💵</div><p>No expenses recorded yet.</p><button class="btn btn-primary btn-sm" onclick="switchExpenseTab(\'tab-add-exp\')">Log First Expense</button></div>'
              : `
                <div class="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Crop / Purpose</th>
                        <th>Description / Notes</th>
                        <th>Amount (₹)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${expenses.slice().reverse().map(e => `
                        <tr>
                          <td>${formatDate(e.date)}</td>
                          <td><span class="badge badge-gray">${getCategoryIcon(e.category)} ${escapeHtml(e.category)}</span></td>
                          <td><strong>${escapeHtml(e.cropName || 'General Farm')}</strong></td>
                          <td style="color:var(--text-muted)">${escapeHtml(e.notes || '—')}</td>
                          <td><strong style="color:#c62828;font-size:1rem">${formatCurrency(e.amount)}</strong></td>
                          <td>
                            <button class="btn btn-ghost btn-sm" style="color:#c62828;padding:4px 8px" onclick="deleteExpenseEntry(${e.id})">🗑️ Delete</button>
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

      <!-- TAB 2: Add Expense -->
      <div class="tab-content" id="tab-add-exp">
        <div class="card" style="max-width:680px;margin:0 auto">
          <div class="card-header">
            <span class="card-title">➕ Record Farm Expenditure</span>
          </div>
          <div class="card-body">
            <form onsubmit="handleSaveExpense(event)">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Expense Date *</label>
                  <input class="form-input" id="exp-date" type="date" required/>
                </div>
                <div class="form-group">
                  <label class="form-label">Category *</label>
                  <select class="form-select" id="exp-cat" required>
                    <option value="Fertilizers">🧪 Fertilizers & Nutrients</option>
                    <option value="Seeds">🌱 Seeds & Seedlings</option>
                    <option value="Pesticides">🐛 Pesticides & Fungicides</option>
                    <option value="Labour">👨‍🌾 Field Labour & Weeding</option>
                    <option value="Machinery & Fuel">🚜 Tractor, Fuel & Machinery</option>
                    <option value="Irrigation">💧 Irrigation & Electricity</option>
                    <option value="Harvesting">🌾 Harvesting & Threshing</option>
                    <option value="Transport">🚚 Transport & Mandi Fees</option>
                    <option value="Other">📦 Other Supplies</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Link to Crop</label>
                  <select class="form-select" id="exp-crop">
                    <option value="">-- General Farm --</option>
                    ${crops.map(c => {
                      const cd = CROPS_DATA.find(x => x.id === c.cropId);
                      return `<option value="${cd ? cd.name : c.cropId}">${cd ? cd.name : c.cropId} (${c.fieldName || 'Field'})</option>`;
                    }).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Amount (₹) *</label>
                  <input class="form-input" id="exp-amount" type="number" min="1" step="10" required placeholder="e.g. 2400"/>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description / Receipt Notes</label>
                <input class="form-input" id="exp-notes" type="text" placeholder="e.g. Purchased 2 bags DAP and 1 bag MOP from IFFCO dealer"/>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
                <button type="button" class="btn btn-secondary" onclick="switchExpenseTab('tab-exp-list')">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- TAB 3: Category Charts -->
      <div class="tab-content" id="tab-exp-charts">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Category-wise Cost Breakdown</span>
          </div>
          <div class="card-body" style="height:350px;display:flex;align-items:center;justify-content:center">
            ${expenses.length === 0 
              ? '<p class="text-muted">No expenses recorded yet.</p>'
              : '<canvas id="expChartCanvas"></canvas>'
            }
          </div>
        </div>
      </div>

      <!-- TAB 4: Budget Settings -->
      <div class="tab-content" id="tab-exp-budget">
        <div class="card" style="max-width:540px;margin:0 auto">
          <div class="card-header">
            <span class="card-title">⚙️ Set Season Target Budget</span>
          </div>
          <div class="card-body">
            <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px">
              Setting an overall budget caps your input expenses and provides alerts when spending exceeds thresholds.
            </p>
            <div class="form-group">
              <label class="form-label">Total Season Budget (₹)</label>
              <input class="form-input" id="budgetInput" type="number" value="${budget}" step="5000"/>
            </div>
            <button class="btn btn-primary" onclick="saveTargetBudget()">Update Target Budget</button>
          </div>
        </div>
      </div>
    </div>
  `;

  tabs('expenseTabs', 'tab-exp-list');

  // Set default date to today
  const dtEl = document.getElementById('exp-date');
  if (dtEl) dtEl.value = new Date().toISOString().split('T')[0];

  initExpenseChart(catTotals);
}

function switchExpenseTab(tabId) {
  const btn = document.querySelector(`#expenseTabs [data-tab="${tabId}"]`);
  if (btn) btn.click();
}

function getCategoryIcon(cat) {
  if (cat === 'Fertilizers') return '🧪';
  if (cat === 'Seeds') return '🌱';
  if (cat === 'Pesticides') return '🐛';
  if (cat === 'Labour') return '👨‍🌾';
  if (cat === 'Machinery & Fuel') return '🚜';
  if (cat === 'Irrigation') return '💧';
  if (cat === 'Harvesting') return '🌾';
  if (cat === 'Transport') return '🚚';
  return '📦';
}

function handleSaveExpense(e) {
  e.preventDefault();
  const date = document.getElementById('exp-date').value;
  const category = document.getElementById('exp-cat').value;
  const cropName = document.getElementById('exp-crop').value;
  const amount = parseFloat(document.getElementById('exp-amount').value);
  const notes = document.getElementById('exp-notes').value.trim();

  if (!date || isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid positive amount and date.', 'warning');
    return;
  }

  const expenses = JSON.parse(localStorage.getItem('smartfarm_expenses') || '[]');
  const newExp = {
    id: Date.now(),
    date,
    category,
    cropName,
    amount,
    notes
  };

  expenses.push(newExp);
  localStorage.setItem('smartfarm_expenses', JSON.stringify(expenses));
  showToast('Expense recorded successfully! 💵');
  renderExpense();
}

function deleteExpenseEntry(id) {
  if (!confirm('Are you sure you want to delete this expense record?')) return;
  let expenses = JSON.parse(localStorage.getItem('smartfarm_expenses') || '[]');
  expenses = expenses.filter(e => e.id !== id);
  localStorage.setItem('smartfarm_expenses', JSON.stringify(expenses));
  showToast('Expense record deleted.');
  renderExpense();
}

function saveTargetBudget() {
  const b = parseFloat(document.getElementById('budgetInput')?.value || '75000');
  localStorage.setItem('smartfarm_budget', b.toString());
  showToast('Target budget updated! 🎯');
  renderExpense();
}

function initExpenseChart(catTotals) {
  const canvas = document.getElementById('expChartCanvas');
  if (!canvas || Object.keys(catTotals).length === 0) return;

  destroyChart('expChartCanvas');

  const labels = Object.keys(catTotals);
  const data = Object.values(catTotals);
  const bg = ['#2d7a2d', '#0288d1', '#e65100', '#7b1fa2', '#c2185b', '#fbc02d', '#00796b', '#5d4037'];

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: bg.slice(0, labels.length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}`
          }
        }
      }
    }
  });
}

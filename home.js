/* ── Home Page ── */
function renderHome() {
  const farmer  = getCurrentFarmer();
  const crops   = JSON.parse(localStorage.getItem('smartfarm_crops')   || '[]');
  const tasks   = JSON.parse(localStorage.getItem('smartfarm_tasks')   || '[]');
  const expenses= JSON.parse(localStorage.getItem('smartfarm_expenses')|| '[]');
  const pending = tasks.filter(t => !t.completed).length;
  const totalExp= expenses.reduce((s,e)=>s+Number(e.amount||0),0);

  const tips = [
    '🌱 Apply neem-based pesticides in the early morning or evening to avoid sunlight degradation.',
    '💧 Drip irrigation saves up to 60% water compared to flood irrigation.',
    '🧪 Conduct soil testing every 2 years for optimum fertilizer recommendations.',
    '🌾 Crop rotation improves soil health and reduces pest pressure naturally.',
    '📱 Record all farm expenses promptly for accurate profit analysis at season end.',
    '🌦️ Always keep an eye on 7-day weather forecasts before spraying pesticides.',
    '🐛 Install pheromone traps early in the season to monitor pest populations.',
    '🌿 Intercropping legumes with cereals fixes nitrogen and reduces fertilizer cost.',
  ];
  const tip = tips[Math.floor(Date.now()/60000) % tips.length];

  const features = [
    {id:'crop-planner', icon:'🌱', title:'Crop Planner',      desc:'Plan, track and manage all your crops with growth stage monitoring.'},
    {id:'weather',      icon:'☁️', title:'Weather Monitor',   desc:'Real-time weather and 7-day forecast with farming advisories.'},
    {id:'expense',      icon:'💵', title:'Expense Manager',   desc:'Track all farm expenses and generate financial reports.'},
    {id:'schemes',      icon:'🏛️', title:'Govt Schemes',     desc:'Browse 15+ government schemes and check your eligibility.'},
    {id:'pest',         icon:'🐛', title:'Pest & Disease',    desc:'Identify pests and get organic & chemical treatment guides.'},
    {id:'market',       icon:'💰', title:'Market Prices',     desc:'Check today\'s mandi prices and price trends for your crops.'},
  ];

  const month = new Date().toLocaleString('en-IN',{month:'long', year:'numeric'});

  document.getElementById('page-content').innerHTML = `<div class="page">
    <div class="hero-banner">
      <h1>Welcome to SmartFarm 🌾</h1>
      <p>Hello, <strong>${farmer?.name || 'Farmer'}</strong>! Here's your farm overview for today.</p>
    </div>

    <div class="tip-banner">
      <span class="tip-banner-icon">💡</span>
      <span class="tip-banner-text"><strong>Today's Tip:</strong> ${tip}</span>
    </div>

    <div class="grid-4" style="margin-bottom:24px">
      <div class="stat-card">
        <span class="stat-icon">🌱</span>
        <div><div class="stat-value">${crops.length}</div><div class="stat-label">Active Crops</div></div>
      </div>
      <div class="stat-card accent">
        <span class="stat-icon">📋</span>
        <div><div class="stat-value">${pending}</div><div class="stat-label">Pending Tasks</div></div>
      </div>
      <div class="stat-card info">
        <span class="stat-icon">💵</span>
        <div><div class="stat-value">${formatCurrency(totalExp)}</div><div class="stat-label">Total Expenses</div></div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🏡</span>
        <div><div class="stat-value">${farmer?.farmSize || '--'}</div><div class="stat-label">Farm Acres</div></div>
      </div>
    </div>

    <h2 class="section-title">Quick Actions</h2>
    <div class="grid-4" style="margin-bottom:28px">
      <a class="quick-action" onclick="navigateTo('crop-planner')"><span class="qa-icon">🌱</span><span class="qa-label">Add Crop</span></a>
      <a class="quick-action" onclick="navigateTo('expense')"><span class="qa-icon">💵</span><span class="qa-label">Add Expense</span></a>
      <a class="quick-action" onclick="navigateTo('weather')"><span class="qa-icon">☁️</span><span class="qa-label">Check Weather</span></a>
      <a class="quick-action" onclick="navigateTo('market')"><span class="qa-icon">💰</span><span class="qa-label">Market Prices</span></a>
      <a class="quick-action" onclick="navigateTo('fertilizer')"><span class="qa-icon">🧪</span><span class="qa-label">Fertilizer Reco.</span></a>
      <a class="quick-action" onclick="navigateTo('pest')"><span class="qa-icon">🐛</span><span class="qa-label">Pest Guide</span></a>
      <a class="quick-action" onclick="navigateTo('schemes')"><span class="qa-icon">🏛️</span><span class="qa-label">Govt Schemes</span></a>
      <a class="quick-action" onclick="navigateTo('reports')"><span class="qa-icon">📊</span><span class="qa-label">View Reports</span></a>
    </div>

    <h2 class="section-title">Key Features</h2>
    <div class="grid-3" style="margin-bottom:28px">
      ${features.map(f=>`
        <div class="card" style="cursor:pointer" onclick="navigateTo('${f.id}')">
          <div class="card-body" style="text-align:center;padding:24px">
            <div style="font-size:2.5rem;margin-bottom:10px">${f.icon}</div>
            <div style="font-weight:700;margin-bottom:6px">${f.title}</div>
            <div style="font-size:0.85rem;color:var(--text-muted)">${f.desc}</div>
          </div>
        </div>`).join('')}
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">🌱 My Crops</span><button class="btn btn-primary btn-sm" onclick="navigateTo('crop-planner')">+ Add</button></div>
        <div class="card-body">
          ${crops.length === 0
            ? '<div class="empty-state"><div class="empty-icon">🌱</div><p>No crops added yet.</p><button class="btn btn-primary btn-sm" onclick="navigateTo(\'crop-planner\')">Add Your First Crop</button></div>'
            : crops.slice(0,4).map(c => {
                const cd = CROPS_DATA.find(x=>x.id===c.cropId)||{name:c.cropId,duration:120};
                const gs = getGrowthStage(c.plantingDate, cd.duration);
                return `<div style="margin-bottom:12px">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <span style="font-weight:600">${cd.name}</span>
                    <span class="badge badge-success">${gs.stage}</span>
                  </div>
                  <div class="progress"><div class="progress-bar" style="width:${gs.pct}%"></div></div>
                  <div style="font-size:0.75rem;color:var(--text-muted);margin-top:3px">${gs.pct}% · Harvest: ${formatDate(c.harvestDate)}</div>
                </div>`;
              }).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">📋 Pending Tasks</span></div>
        <div class="card-body">
          ${pending === 0
            ? '<div class="empty-state"><div class="empty-icon">✅</div><p>All tasks completed!</p></div>'
            : tasks.filter(t=>!t.completed).slice(0,5).map(t=>`
                <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
                  <span style="font-size:1rem">${t.priority==='High'?'🔴':t.priority==='Medium'?'🟡':'🟢'}</span>
                  <span style="flex:1;font-size:0.9rem">${t.name}</span>
                  <span style="font-size:0.78rem;color:var(--text-muted)">${formatDate(t.dueDate)}</span>
                </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

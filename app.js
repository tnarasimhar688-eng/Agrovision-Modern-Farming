/* ═══════════════════════════════════════
   app.js — SPA Router & Core
   ═══════════════════════════════════════ */

const PAGES = {
  'home':         renderHome,
  'dashboard':    renderDashboard,
  'crop-planner': renderCropPlanner,
  'crop-info':    renderCropInfo,
  'irrigation':   renderIrrigation,
  'weather':      renderWeather,
  'soil':         renderSoil,
  'fertilizer':   renderFertilizer,
  'pest':         renderPest,
  'market':       renderMarket,
  'expense':      renderExpense,
  'profit':       renderProfit,
  'farm':         renderFarm,
  'reports':      renderReports,
  'alerts':       renderAlerts,
  'equipment':    renderEquipment,
  'schemes':      renderSchemes,
  'technology':   renderTechnology,
  'contact':      renderContact,
  'settings':     renderSettings,
};

let currentPage = 'home';

function navigateTo(pageId) {
  if (!PAGES[pageId]) return;
  currentPage = pageId;

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (navEl) navEl.classList.add('active');

  // Render page
  const container = document.getElementById('page-content');
  container.innerHTML = '<div class="loading-center"><div class="spinner"></div><p>Loading...</p></div>';
  setTimeout(() => {
    try { PAGES[pageId](); }
    catch(e) {
      container.innerHTML = `<div class="page"><div class="alert alert-danger">⚠️ Error loading page: ${e.message}</div></div>`;
      console.error(e);
    }
    window.scrollTo(0, 0);
    // Close mobile sidebar
    closeSidebar();
  }, 80);
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  sb.classList.toggle('open');
  ov.classList.toggle('visible');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('visible');
}

function updateNotifBadge() {
  const alerts = JSON.parse(localStorage.getItem('smartfarm_alerts') || '[]');
  const unread = alerts.filter(a => !a.read).length;
  const badge  = document.getElementById('notif-badge');
  if (!badge) return;
  if (unread > 0) { badge.style.display = 'inline'; badge.textContent = unread; }
  else              badge.style.display = 'none';
}

// Auto-generate smart alerts based on crops and tasks
function generateSmartAlerts() {
  const existing = JSON.parse(localStorage.getItem('smartfarm_alerts') || '[]');
  const crops    = JSON.parse(localStorage.getItem('smartfarm_crops')  || '[]');
  const tasks    = JSON.parse(localStorage.getItem('smartfarm_tasks')  || '[]');
  const today    = new Date().toISOString().split('T')[0];
  const newAlerts = [];

  crops.forEach(c => {
    const crop = CROPS_DATA.find(x => x.id === c.cropId) || {name: c.cropId, duration:120};
    const daysLeft = daysDiff(today, c.harvestDate);
    if (daysLeft >= 0 && daysLeft <= 7) {
      const key = 'harvest_' + c.id;
      if (!existing.find(a => a.key === key)) {
        newAlerts.push({id: Date.now()+Math.random(), key, category:'crops', icon:'🌾', title:`Harvest Alert: ${crop.name}`, message:`${crop.name} on ${c.fieldName || 'your field'} is due for harvest in ${daysLeft} days!`, ts: Date.now(), read:false});
      }
    }
  });

  tasks.forEach(t => {
    if (!t.completed && t.dueDate && t.dueDate < today) {
      const key = 'overdue_' + t.id;
      if (!existing.find(a => a.key === key)) {
        newAlerts.push({id: Date.now()+Math.random(), key, category:'tasks', icon:'⚠️', title:'Overdue Task', message:`"${t.name}" was due on ${formatDate(t.dueDate)} and is still pending!`, ts: Date.now(), read:false});
      }
    }
  });

  // Seasonal pest warning
  const month = new Date().getMonth();
  if ([5,6,7].includes(month)) { // Kharif pest season
    const key = 'kharif_pest_2026';
    if (!existing.find(a => a.key === key)) {
      newAlerts.push({id: Date.now()+Math.random(), key, category:'pest', icon:'🐛', title:'Kharif Pest Season Alert', message:'June-August is peak season for Fall Army Worm, Brown Planthopper and Whitefly. Start monitoring your crops!', ts: Date.now(), read:false});
    }
  }

  if (newAlerts.length > 0) {
    const all = [...newAlerts, ...existing].slice(0, 50);
    localStorage.setItem('smartfarm_alerts', JSON.stringify(all));
    updateNotifBadge();
  }
}

// Toast style injection
const toastStyle = document.createElement('style');
toastStyle.textContent = `.toast{position:fixed;bottom:24px;right:24px;background:#1b5e20;color:white;padding:12px 20px;border-radius:8px;font-size:0.9rem;font-weight:600;z-index:99999;opacity:0;transform:translateY(10px);transition:all 0.3s;box-shadow:0 4px 16px rgba(0,0,0,0.2);max-width:320px}.toast.show{opacity:1;transform:translateY(0)}.toast.toast-danger{background:#c62828}.toast.toast-warning{background:#f57f17}`;
document.head.appendChild(toastStyle);

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  const s = getCurrentFarmer();
  if (s) {
    navigateTo('home');
    generateSmartAlerts();
  }
});

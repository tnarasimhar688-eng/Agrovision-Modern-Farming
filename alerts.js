/* ═══════════════════════════════════════
   alerts.js — Alerts & Notifications Module
   ═══════════════════════════════════════ */

let currentAlertFilter = 'all';

function renderAlerts() {
  const alerts = JSON.parse(localStorage.getItem('smartfarm_alerts') || '[]');
  const unreadCount = alerts.filter(a => !a.read).length;

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">🔔 Alerts &amp; Farming Notifications</h1>
          <p class="page-subtitle">Harvest timers, overdue field tasks, pest season warnings, and custom reminders.</p>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-secondary btn-sm" onclick="markAllAlertsRead()">Mark All Read</button>
          <button class="btn btn-primary btn-sm" onclick="openCreateAlertModal()">+ Create Reminder</button>
        </div>
      </div>

      <!-- Filter Pills -->
      <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
        <button class="btn btn-sm ${currentAlertFilter === 'all' ? 'btn-primary' : 'btn-ghost'}" onclick="filterAlerts('all')">
          All Notifications (${alerts.length})
        </button>
        <button class="btn btn-sm ${currentAlertFilter === 'unread' ? 'btn-primary' : 'btn-ghost'}" onclick="filterAlerts('unread')">
          Unread (${unreadCount})
        </button>
        <button class="btn btn-sm ${currentAlertFilter === 'crops' ? 'btn-primary' : 'btn-ghost'}" onclick="filterAlerts('crops')">
          🌾 Crop Harvests
        </button>
        <button class="btn btn-sm ${currentAlertFilter === 'pest' ? 'btn-primary' : 'btn-ghost'}" onclick="filterAlerts('pest')">
          🐛 Pest Advisories
        </button>
      </div>

      <!-- Alerts List Card -->
      <div class="card">
        <div class="card-body" style="padding:0" id="alertsListWrap">
          ${renderAlertItems(alerts)}
        </div>
      </div>
    </div>
  `;
}

function renderAlertItems(alerts) {
  let filtered = alerts;
  if (currentAlertFilter === 'unread') {
    filtered = alerts.filter(a => !a.read);
  } else if (currentAlertFilter !== 'all') {
    filtered = alerts.filter(a => a.category === currentAlertFilter);
  }

  if (filtered.length === 0) {
    return `
      <div class="empty-state" style="padding:48px 20px">
        <div class="empty-icon">🔔</div>
        <p>No notifications in this category.</p>
      </div>
    `;
  }

  return filtered.map(a => `
    <div class="notif-item ${!a.read ? 'unread' : ''}" onclick="toggleAlertRead(${a.id})">
      <span class="notif-icon">${a.icon || '🔔'}</span>
      <div class="notif-body">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="notif-title">${escapeHtml(a.title)}</div>
          <span style="font-size:0.75rem;color:var(--text-muted)">${timeAgo(a.ts || Date.now())}</span>
        </div>
        <div class="notif-msg">${escapeHtml(a.message)}</div>
      </div>
      <button class="btn btn-ghost btn-sm" style="color:#c62828;padding:2px 8px" onclick="event.stopPropagation(); deleteAlert(${a.id})" title="Dismiss">✕</button>
    </div>
  `).join('');
}

function filterAlerts(category) {
  currentAlertFilter = category;
  renderAlerts();
}

function toggleAlertRead(id) {
  const alerts = JSON.parse(localStorage.getItem('smartfarm_alerts') || '[]');
  const a = alerts.find(x => x.id === id);
  if (a) {
    a.read = !a.read;
    localStorage.setItem('smartfarm_alerts', JSON.stringify(alerts));
    updateNotifBadge();
    renderAlerts();
  }
}

function markAllAlertsRead() {
  const alerts = JSON.parse(localStorage.getItem('smartfarm_alerts') || '[]');
  alerts.forEach(a => a.read = true);
  localStorage.setItem('smartfarm_alerts', JSON.stringify(alerts));
  updateNotifBadge();
  showToast('All notifications marked as read.');
  renderAlerts();
}

function deleteAlert(id) {
  let alerts = JSON.parse(localStorage.getItem('smartfarm_alerts') || '[]');
  alerts = alerts.filter(a => a.id !== id);
  localStorage.setItem('smartfarm_alerts', JSON.stringify(alerts));
  updateNotifBadge();
  renderAlerts();
}

function openCreateAlertModal() {
  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>🔔 Create Custom Farm Alert / Reminder</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="handleSaveCustomAlert(event)">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Alert Title *</label>
              <input class="form-input" id="alert-title" type="text" placeholder="e.g. Schedule Foliar Zinc Spray, Service Drip Filter" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-select" id="alert-cat">
                <option value="crops">🌾 Crop Management</option>
                <option value="pest">🐛 Pest &amp; Disease</option>
                <option value="irrigation">💧 Irrigation</option>
                <option value="tasks">📋 General Task</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Details / Notes *</label>
              <textarea class="form-textarea" id="alert-msg" placeholder="Write description or dosage notes..." required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Alert</button>
          </div>
        </form>
      </div>
    </div>
  `;
  openModal(modalHtml);
}

function handleSaveCustomAlert(e) {
  e.preventDefault();
  const title = document.getElementById('alert-title').value.trim();
  const category = document.getElementById('alert-cat').value;
  const message = document.getElementById('alert-msg').value.trim();

  const iconMap = { crops: '🌾', pest: '🐛', irrigation: '💧', tasks: '📋' };
  const alerts = JSON.parse(localStorage.getItem('smartfarm_alerts') || '[]');

  alerts.unshift({
    id: Date.now(),
    title,
    category,
    message,
    icon: iconMap[category] || '🔔',
    ts: Date.now(),
    read: false
  });

  localStorage.setItem('smartfarm_alerts', JSON.stringify(alerts));
  updateNotifBadge();
  closeModal();
  showToast('Custom reminder created! 🔔');
  renderAlerts();
}

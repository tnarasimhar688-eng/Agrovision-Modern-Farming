/* ═══════════════════════════════════════
   soil.js — Soil Monitoring & Health Card
   ═══════════════════════════════════════ */

function renderSoil() {
  const savedSoil = JSON.parse(localStorage.getItem('smartfarm_soil') || 'null') || {
    ph: 6.8,
    nitrogen: 240,
    phosphorus: 18,
    potassium: 190,
    oc: 0.52,
    ec: 0.35,
    testedOn: new Date().toISOString().split('T')[0]
  };

  const evalResult = evaluateSoilHealth(savedSoil);

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">🌍 Soil Monitoring & Health Card</h1>
          <p class="page-subtitle">Track chemical soil parameters, compute soil fertility index, and get scientific amendment advisories.</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openSoilTestModal()">+ Log New Soil Test</button>
      </div>

      <!-- Health Score Banner & Breakdown -->
      <div class="card" style="margin-bottom:24px">
        <div class="card-body">
          <div class="grid-3" style="align-items:center">
            <!-- Soil Gauge -->
            <div style="display:flex;flex-direction:column;align-items:center;text-align:center">
              <div class="soil-score-circle" style="background:conic-gradient(var(--primary) ${evalResult.score}%, var(--border) 0%)">
                <div style="background:var(--bg-card);border-radius:50%;width:96px;height:96px;display:flex;flex-direction:column;align-items:center;justify-content:center">
                  <div class="score-val">${evalResult.score}</div>
                  <div class="score-lbl">Score / 100</div>
                </div>
              </div>
              <div style="font-weight:700;margin-top:12px;font-size:1.05rem">${evalResult.statusTitle}</div>
              <span class="badge ${evalResult.score >= 70 ? 'badge-success' : evalResult.score >= 45 ? 'badge-warning' : 'badge-danger'}">
                ${evalResult.rating}
              </span>
            </div>

            <!-- Parameters Grid -->
            <div style="grid-column:span 2">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <span style="font-size:0.85rem;color:var(--text-muted)">Last Tested: <strong>${formatDate(savedSoil.testedOn)}</strong></span>
                <button class="btn btn-secondary btn-sm" onclick="openSoilTestModal()">Edit Values</button>
              </div>

              <div class="grid-3">
                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm)">
                  <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Soil pH</div>
                  <div style="font-size:1.3rem;font-weight:800;color:var(--text)">${savedSoil.ph}</div>
                  <span class="badge ${evalResult.phBadge}">${evalResult.phStatus}</span>
                </div>

                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm)">
                  <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Available Nitrogen (N)</div>
                  <div style="font-size:1.3rem;font-weight:800;color:var(--text)">${savedSoil.nitrogen} <span style="font-size:0.7rem">kg/ha</span></div>
                  <span class="badge ${evalResult.nBadge}">${evalResult.nStatus}</span>
                </div>

                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm)">
                  <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Available Phosphorus (P)</div>
                  <div style="font-size:1.3rem;font-weight:800;color:var(--text)">${savedSoil.phosphorus} <span style="font-size:0.7rem">kg/ha</span></div>
                  <span class="badge ${evalResult.pBadge}">${evalResult.pStatus}</span>
                </div>

                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm)">
                  <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Available Potassium (K)</div>
                  <div style="font-size:1.3rem;font-weight:800;color:var(--text)">${savedSoil.potassium} <span style="font-size:0.7rem">kg/ha</span></div>
                  <span class="badge ${evalResult.kBadge}">${evalResult.kStatus}</span>
                </div>

                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm)">
                  <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Organic Carbon (OC)</div>
                  <div style="font-size:1.3rem;font-weight:800;color:var(--text)">${savedSoil.oc}%</div>
                  <span class="badge ${evalResult.ocBadge}">${evalResult.ocStatus}</span>
                </div>

                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm)">
                  <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase">Electrical Cond. (EC)</div>
                  <div style="font-size:1.3rem;font-weight:800;color:var(--text)">${savedSoil.ec} <span style="font-size:0.7rem">dS/m</span></div>
                  <span class="badge ${evalResult.ecBadge}">${evalResult.ecStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Soil Correction & Scientific Advisories -->
      <h2 class="section-title">🧪 Recommended Soil Amendments & Corrections</h2>
      <div class="grid-2" style="margin-bottom:24px">
        <div class="card">
          <div class="card-header">
            <span class="card-title">💡 Chemical & Physical Corrections</span>
          </div>
          <div class="card-body">
            <ul style="list-style:none;padding:0">
              ${evalResult.recommendations.map(r => `
                <li style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border)">
                  <span style="font-size:1.3rem">${r.icon}</span>
                  <div>
                    <strong style="font-size:0.9rem">${r.title}</strong>
                    <div style="font-size:0.83rem;color:var(--text-muted);margin-top:2px">${r.desc}</div>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">🌿 Biological Soil Rejuvenation</span>
          </div>
          <div class="card-body">
            <div style="margin-bottom:14px">
              <strong style="font-size:0.9rem">🌱 Green Manuring (Dhaincha / Sunn Hemp)</strong>
              <p style="font-size:0.83rem;color:var(--text-muted);margin-top:2px">
                Sow Sesbania (Dhaincha) in pre-monsoon (May-June) and incorporate into soil at 45 days. Adds 15-20 tonnes of green biomass and 60-80 kg N/ha naturally.
              </p>
            </div>
            <div style="margin-bottom:14px">
              <strong style="font-size:0.9rem">🪱 Vermicomposting & Biofertilizers</strong>
              <p style="font-size:0.83rem;color:var(--text-muted);margin-top:2px">
                Apply 2 tonnes vermicompost along with <em>Azotobacter</em> (for cereals) and <em>PSB</em> (Phosphate Solubilizing Bacteria) @ 2 kg/acre mixed with compost.
              </p>
            </div>
            <div>
              <strong style="font-size:0.9rem">🪵 Crop Residue Mulching</strong>
              <p style="font-size:0.83rem;color:var(--text-muted);margin-top:2px">
                Never burn stubble. Retain crop residues on surface to prevent topsoil erosion, enhance microbial activity and increase water infiltration.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Soil Health Card Scheme Promo -->
      <div class="card" style="background:linear-gradient(135deg,#e8f5e9,#f1f8e9);border-color:#a5d6a7">
        <div class="card-body" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
          <div>
            <h3 style="color:#1b5e20;margin-bottom:4px">🏛️ Free Soil Testing under Soil Health Card Scheme</h3>
            <p style="font-size:0.88rem;color:#2e7d32;max-width:600px">
              Government provides comprehensive soil testing every 2 years through local Krishi Vigyan Kendras (KVK) and Soil Testing Labs at zero cost.
            </p>
          </div>
          <button class="btn btn-primary" onclick="navigateTo('schemes')">View Scheme Details</button>
        </div>
      </div>
    </div>
  `;
}

function evaluateSoilHealth(s) {
  let score = 50;
  const recs = [];

  // pH Evaluation
  let phStatus = 'Normal', phBadge = 'badge-success';
  if (s.ph < 6.0) {
    phStatus = 'Acidic'; phBadge = 'badge-danger'; score -= 15;
    recs.push({ icon: '🧱', title: 'Apply Agricultural Lime', desc: `Soil pH (${s.ph}) is acidic. Apply agricultural lime (CaCO₃) @ 1.5 tonnes/ha during land preparation to neutralize acidity.` });
  } else if (s.ph > 8.0) {
    phStatus = 'Alkaline'; phBadge = 'badge-warning'; score -= 15;
    recs.push({ icon: '⚪', title: 'Apply Agricultural Gypsum', desc: `Soil pH (${s.ph}) is alkaline/saline. Apply gypsum (CaSO₄·2H₂O) @ 2 tonnes/ha to leach excess sodium.` });
  } else {
    phStatus = 'Optimal (6.5 - 7.5)'; score += 10;
  }

  // Nitrogen
  let nStatus = 'Medium', nBadge = 'badge-success';
  if (s.nitrogen < 200) {
    nStatus = 'Low (<280)'; nBadge = 'badge-danger'; score -= 10;
    recs.push({ icon: '🌿', title: 'Incorporate Legumes & Urea Split', desc: `Available Nitrogen is low (${s.nitrogen} kg/ha). Apply 25% extra basal nitrogen or practice green manuring with cowpea/dhaincha.` });
  } else if (s.nitrogen > 400) {
    nStatus = 'High'; nBadge = 'badge-info'; score += 5;
  } else {
    nStatus = 'Moderate'; score += 10;
  }

  // Phosphorus
  let pStatus = 'Medium', pBadge = 'badge-success';
  if (s.phosphorus < 12) {
    pStatus = 'Low (<15)'; pBadge = 'badge-danger'; score -= 10;
    recs.push({ icon: '🧪', title: 'Apply Single Super Phosphate (SSP) / DAP', desc: `Phosphorus is deficient (${s.phosphorus} kg/ha). Apply SSP or DAP along with PSB biofertilizers for root anchorage.` });
  } else {
    pStatus = 'Adequate'; score += 10;
  }

  // Potassium
  let kStatus = 'Medium', kBadge = 'badge-success';
  if (s.potassium < 120) {
    kStatus = 'Low'; kBadge = 'badge-warning'; score -= 5;
    recs.push({ icon: '🍂', title: 'Apply Muriate of Potash (MOP)', desc: `Available Potassium is low (${s.potassium} kg/ha). Apply MOP @ 30-40 kg/acre to boost pest and drought resistance.` });
  } else {
    kStatus = 'Adequate'; score += 10;
  }

  // Organic Carbon
  let ocStatus = 'Moderate', ocBadge = 'badge-success';
  if (s.oc < 0.50) {
    ocStatus = 'Low (<0.5%)'; ocBadge = 'badge-danger'; score -= 15;
    recs.push({ icon: '🐂', title: 'Heavy FYM / Compost Application', desc: `Organic Carbon is critically low (${s.oc}%). Apply 8-10 tonnes/acre of well-rotted FYM, vermicompost, or pressmud.` });
  } else {
    ocStatus = 'Good (>0.5%)'; score += 10;
  }

  // EC
  let ecStatus = 'Normal', ecBadge = 'badge-success';
  if (s.ec > 1.0) {
    ecStatus = 'Saline (>1.0)'; ecBadge = 'badge-danger'; score -= 10;
    recs.push({ icon: '💧', title: 'Flush Field & Improve Drainage', desc: `High Electrical Conductivity (${s.ec} dS/m) indicates salinity. Ensure proper drainage channels and avoid saline borewell water.` });
  } else {
    ecStatus = 'Non-Saline'; score += 5;
  }

  score = Math.min(100, Math.max(20, score));

  let statusTitle = 'Optimal Soil Health';
  let rating = 'Class A Soil';
  if (score < 50) {
    statusTitle = 'Nutrient Deficient / Needs Correction';
    rating = 'Requires Immediate Amendment';
  } else if (score < 75) {
    statusTitle = 'Moderate Soil Fertility';
    rating = 'Good with Minor Amendments';
  }

  if (recs.length === 0) {
    recs.push({ icon: '🌟', title: 'Maintain Current Soil Care', desc: 'Your soil parameters are balanced! Continue regular crop rotation, balanced NPK fertilizing, and organic mulching.' });
  }

  return { score, statusTitle, rating, phStatus, phBadge, nStatus, nBadge, pStatus, pBadge, kStatus, kBadge, ocStatus, ocBadge, ecStatus, ecBadge, recommendations: recs };
}

function openSoilTestModal() {
  const cur = JSON.parse(localStorage.getItem('smartfarm_soil') || 'null') || {
    ph: 6.8, nitrogen: 240, phosphorus: 18, potassium: 190, oc: 0.52, ec: 0.35, testedOn: new Date().toISOString().split('T')[0]
  };

  const modalHtml = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-box" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>📝 Log Soil Health Test Values</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <form onsubmit="handleSaveSoil(event)">
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Soil pH (0 - 14) *</label>
                <input class="form-input" id="soil-ph" type="number" step="0.1" min="3" max="11" required value="${cur.ph}"/>
              </div>
              <div class="form-group">
                <label class="form-label">Test Date *</label>
                <input class="form-input" id="soil-date" type="date" required value="${cur.testedOn || new Date().toISOString().split('T')[0]}"/>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Available Nitrogen (kg/ha)</label>
                <input class="form-input" id="soil-n" type="number" min="0" max="1000" value="${cur.nitrogen}"/>
              </div>
              <div class="form-group">
                <label class="form-label">Available Phosphorus (kg/ha)</label>
                <input class="form-input" id="soil-p" type="number" min="0" max="200" value="${cur.phosphorus}"/>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Available Potassium (kg/ha)</label>
                <input class="form-input" id="soil-k" type="number" min="0" max="800" value="${cur.potassium}"/>
              </div>
              <div class="form-group">
                <label class="form-label">Organic Carbon (OC %)</label>
                <input class="form-input" id="soil-oc" type="number" step="0.01" min="0.05" max="5.0" value="${cur.oc}"/>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Electrical Conductivity EC (dS/m)</label>
              <input class="form-input" id="soil-ec" type="number" step="0.01" min="0.01" max="10.0" value="${cur.ec}"/>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Health Card</button>
          </div>
        </form>
      </div>
    </div>
  `;

  openModal(modalHtml);
}

function handleSaveSoil(e) {
  e.preventDefault();
  const ph = parseFloat(document.getElementById('soil-ph').value);
  const testedOn = document.getElementById('soil-date').value;
  const nitrogen = parseFloat(document.getElementById('soil-n').value || '240');
  const phosphorus = parseFloat(document.getElementById('soil-p').value || '18');
  const potassium = parseFloat(document.getElementById('soil-k').value || '190');
  const oc = parseFloat(document.getElementById('soil-oc').value || '0.5');
  const ec = parseFloat(document.getElementById('soil-ec').value || '0.35');

  const soilData = { ph, testedOn, nitrogen, phosphorus, potassium, oc, ec };
  localStorage.setItem('smartfarm_soil', JSON.stringify(soilData));
  closeModal();
  showToast('Soil Health Card updated! 🌍');
  renderSoil();
}

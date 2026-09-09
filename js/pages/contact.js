/* ═══════════════════════════════════════
   contact.js — Contact Us & Helplines Module
   ═══════════════════════════════════════ */

function renderContact() {
  const farmer = getCurrentFarmer();

  document.getElementById('page-content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">📞 Agricultural Helplines &amp; Expert Support</h1>
          <p class="page-subtitle">National Kisan Call Centers, state agricultural officers, and direct advisory queries.</p>
        </div>
      </div>

      <!-- Emergency Helplines Grid -->
      <div class="grid-4" style="margin-bottom:24px">
        <div class="contact-card">
          <div class="contact-icon">👨‍🌾</div>
          <div class="contact-num">1800-180-1551</div>
          <div style="font-weight:700;margin-top:4px">Kisan Call Centre (KCC)</div>
          <div class="contact-desc">Toll-Free · 6:00 AM - 10:00 PM · 22 Regional Languages</div>
        </div>

        <div class="contact-card">
          <div class="contact-icon">🏛️</div>
          <div class="contact-num">155261</div>
          <div style="font-weight:700;margin-top:4px">PM-KISAN Helpline</div>
          <div class="contact-desc">Direct DBT Installments &amp; Aadhaar Seeding Support</div>
        </div>

        <div class="contact-card">
          <div class="contact-icon">🛡️</div>
          <div class="contact-num">1800-200-5142</div>
          <div style="font-weight:700;margin-top:4px">PMFBY Crop Insurance</div>
          <div class="contact-desc">Crop Loss Intimation within 72h of Calamity</div>
        </div>

        <div class="contact-card">
          <div class="contact-icon">🌱</div>
          <div class="contact-num">1800-180-1551</div>
          <div style="font-weight:700;margin-top:4px">Krishi Vigyan Kendra</div>
          <div class="contact-desc">District Level Agronomist Technical Guidance</div>
        </div>
      </div>

      <!-- Contact Form & State Directory -->
      <div class="grid-2" style="margin-bottom:28px">
        <!-- Direct Query Form -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">💬 Ask an Agricultural Agronomist</span>
          </div>
          <div class="card-body">
            <form onsubmit="handleSubmitQuery(event)">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Farmer Name *</label>
                  <input class="form-input" id="q-name" type="text" required value="${farmer?.name || ''}"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <input class="form-input" id="q-phone" type="tel" required value="${farmer?.phone || ''}"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Topic / Issue Area</label>
                  <select class="form-select" id="q-topic">
                    <option value="Pest & Disease">🐛 Pest or Disease Infestation</option>
                    <option value="Fertilizer">🧪 Fertilizer / Soil Nutrition</option>
                    <option value="Irrigation">💧 Irrigation Water Stress</option>
                    <option value="Schemes">🏛️ Government Scheme Application</option>
                    <option value="Market">💰 Mandi Selling Guidance</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Crop Name</label>
                  <input class="form-input" id="q-crop" type="text" placeholder="e.g. Cotton, Rice, Tomato" value="${farmer?.primaryCrop || 'Rice'}"/>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Detailed Question / Field Problem *</label>
                <textarea class="form-textarea" id="q-message" placeholder="Describe the symptom or question in detail..." required></textarea>
              </div>

              <button type="submit" class="btn btn-primary btn-full">Submit Question to Agronomist</button>
            </form>

            <div id="queryResponseWrap" style="margin-top:16px"></div>
          </div>
        </div>

        <!-- State Agriculture Helplines -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">📍 State Agricultural Helplines</span>
          </div>
          <div class="card-body" style="padding:0">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Nodal Department</th>
                    <th>Direct Contact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Andhra Pradesh</strong></td>
                    <td>Rythu Bharosa Kendras (RBK)</td>
                    <td><strong style="color:var(--primary)">1907</strong> (Toll Free)</td>
                  </tr>
                  <tr>
                    <td><strong>Telangana</strong></td>
                    <td>Rythu Vedika / Agril Dept</td>
                    <td><strong style="color:var(--primary)">040-23383520</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Karnataka</strong></td>
                    <td>Raitha Samparka Kendra (RSK)</td>
                    <td><strong style="color:var(--primary)">1800-425-3553</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Maharashtra</strong></td>
                    <td>Kisan Suvidha / Krishi Vibhag</td>
                    <td><strong style="color:var(--primary)">1800-233-4000</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Punjab</strong></td>
                    <td>Punjab Agriculture University</td>
                    <td><strong style="color:var(--primary)">0161-2401960</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Uttar Pradesh</strong></td>
                    <td>Kisan Seva Kendra</td>
                    <td><strong style="color:var(--primary)">1800-180-1551</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Accordion -->
      <h2 class="section-title">❓ Frequently Asked Questions (FAQ)</h2>
      <div class="card">
        <div class="card-body" style="padding:0">
          ${FAQ_DATA.map((faq, idx) => `
            <div class="faq-item">
              <div class="faq-question" onclick="toggleFaq(${idx})">
                <span>${faq.q}</span>
                <span id="faq-icon-${idx}">➕</span>
              </div>
              <div class="faq-answer" id="faq-ans-${idx}">
                ${faq.a}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function toggleFaq(idx) {
  const ans = document.getElementById(`faq-ans-${idx}`);
  const icon = document.getElementById(`faq-icon-${idx}`);
  if (!ans) return;

  const isOpen = ans.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-answer').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.faq-question span:last-child').forEach(el => el.textContent = '➕');

  if (!isOpen) {
    ans.classList.add('open');
    if (icon) icon.textContent = '➖';
  }
}

function handleSubmitQuery(e) {
  e.preventDefault();
  const name = document.getElementById('q-name').value.trim();
  const phone = document.getElementById('q-phone').value.trim();
  const topic = document.getElementById('q-topic').value;
  const crop = document.getElementById('q-crop').value.trim();
  const message = document.getElementById('q-message').value.trim();

  const wrap = document.getElementById('queryResponseWrap');
  if (!wrap) return;

  // Save query locally
  const queries = JSON.parse(localStorage.getItem('smartfarm_queries') || '[]');
  queries.push({ id: Date.now(), name, phone, topic, crop, message, date: new Date().toISOString() });
  localStorage.setItem('smartfarm_queries', JSON.stringify(queries));

  showToast('Question submitted successfully! 💬');

  wrap.innerHTML = `
    <div class="alert alert-success">
      <div>
        <strong>✅ Query Registered (#SF-${Date.now().toString().slice(-4)})</strong>
        <p style="font-size:0.83rem;margin-top:4px;margin-bottom:8px">
          Thank you, <strong>${escapeHtml(name)}</strong>! Your inquiry regarding <strong>${escapeHtml(crop)} (${escapeHtml(topic)})</strong> has been dispatched to our expert agronomy panel.
        </p>
        <div style="background:white;padding:10px;border-radius:var(--radius-sm);font-size:0.83rem;color:var(--text)">
          💡 <strong>Instant Advisory Note:</strong> For acute pest outbreaks or fungal blights, please visit the <a href="javascript:void(0)" onclick="navigateTo('pest')">Pest &amp; Disease Guide</a> to identify instant organic and chemical dosage remedies while waiting for phone call assistance.
        </div>
      </div>
    </div>
  `;

  document.getElementById('q-message').value = '';
}

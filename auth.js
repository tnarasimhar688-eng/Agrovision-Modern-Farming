/* ═══════════════════════════════════════
   auth.js — Secure Authentication & Session Management
   ═══════════════════════════════════════ */

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds
const SESSION_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 hours

// Cryptographic SHA-256 Hashing with Salt
async function hashPassword(password, salt) {
  if (!salt) {
    const randomBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randomBytes);
    salt = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const enc = new TextEncoder();
  const data = enc.encode(salt + ':' + password);
  const hashBuf = await window.crypto.subtle.digest('SHA-256', data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  const hashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
  return { hash: hashHex, salt };
}

function showLogin() {
  document.getElementById('login-form-wrap').style.display = 'block';
  document.getElementById('register-form-wrap').style.display = 'none';
  clearErrors();
}
function showRegister() {
  document.getElementById('login-form-wrap').style.display = 'none';
  document.getElementById('register-form-wrap').style.display = 'block';
  clearErrors();
}
function clearErrors() {
  const errL = document.getElementById('login-error');
  const errR = document.getElementById('reg-error');
  if (errL) errL.textContent = '';
  if (errR) errR.textContent = '';
}

// Rate Limiting & Brute Force Prevention
function checkLoginRateLimit(phone) {
  const attemptsData = JSON.parse(localStorage.getItem('smartfarm_login_attempts') || '{}');
  const record = attemptsData[phone];
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockoutUntil && now < record.lockoutUntil) {
    const remainingSecs = Math.ceil((record.lockoutUntil - now) / 1000);
    return { allowed: false, message: `Too many failed attempts. Please wait ${remainingSecs} seconds.` };
  }

  // Reset if window has elapsed
  if (now - record.firstAttempt > LOCKOUT_DURATION_MS) {
    delete attemptsData[phone];
    localStorage.setItem('smartfarm_login_attempts', JSON.stringify(attemptsData));
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedLogin(phone) {
  const attemptsData = JSON.parse(localStorage.getItem('smartfarm_login_attempts') || '{}');
  const now = Date.now();
  if (!attemptsData[phone]) {
    attemptsData[phone] = { count: 1, firstAttempt: now, lockoutUntil: null };
  } else {
    attemptsData[phone].count += 1;
    if (attemptsData[phone].count >= MAX_LOGIN_ATTEMPTS) {
      attemptsData[phone].lockoutUntil = now + LOCKOUT_DURATION_MS;
    }
  }
  localStorage.setItem('smartfarm_login_attempts', JSON.stringify(attemptsData));
}

function clearFailedLogins(phone) {
  const attemptsData = JSON.parse(localStorage.getItem('smartfarm_login_attempts') || '{}');
  if (attemptsData[phone]) {
    delete attemptsData[phone];
    localStorage.setItem('smartfarm_login_attempts', JSON.stringify(attemptsData));
  }
}

async function handleRegister() {
  const name    = document.getElementById('reg-name').value.trim();
  const phone   = document.getElementById('reg-phone').value.trim();
  const pass    = document.getElementById('reg-pass').value;
  const village = document.getElementById('reg-village').value.trim();
  const district= document.getElementById('reg-district').value.trim();
  const state   = document.getElementById('reg-state').value;
  const size    = parseFloat(document.getElementById('reg-farmsize').value || '0');
  const crop    = document.getElementById('reg-crop').value;
  const exp     = parseFloat(document.getElementById('reg-exp').value || '0');
  const err     = document.getElementById('reg-error');

  // Strict Validation
  if (!name || name.length < 2) {
    err.textContent = 'Full name must be at least 2 characters.';
    return;
  }
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    err.textContent = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    return;
  }
  if (!pass || pass.length < 6) {
    err.textContent = 'Password must be at least 6 characters for security.';
    return;
  }
  err.textContent = '';

  const farmers = JSON.parse(localStorage.getItem('smartfarm_farmers') || '[]');
  if (farmers.find(f => f.phone === phone)) {
    err.textContent = 'Mobile number already registered. Please login.';
    return;
  }

  // Hash password securely with per-user salt
  const { hash, salt } = await hashPassword(pass);

  const farmer = {
    id: Date.now(),
    name,
    phone,
    passwordHash: hash,
    salt,
    village,
    district,
    state,
    farmSize: Math.max(0, size),
    primaryCrop: crop,
    experience: Math.max(0, exp),
    joinedOn: new Date().toISOString()
  };

  farmers.push(farmer);
  localStorage.setItem('smartfarm_farmers', JSON.stringify(farmers));

  loginFarmer(farmer);
  showToast('Welcome to SmartFarm! Account created securely. 🌱');
}

async function handleLogin() {
  const phone = document.getElementById('login-phone').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const err   = document.getElementById('login-error');

  if (!phone || !pass) {
    err.textContent = 'Please enter both mobile number and password.';
    return;
  }

  // Check rate limiting
  const rateCheck = checkLoginRateLimit(phone);
  if (!rateCheck.allowed) {
    err.textContent = rateCheck.message;
    return;
  }

  err.textContent = '';

  const farmers = JSON.parse(localStorage.getItem('smartfarm_farmers') || '[]');
  const farmer = farmers.find(f => f.phone === phone);

  if (!farmer) {
    recordFailedLogin(phone);
    err.textContent = 'Invalid credentials. Please verify phone and password.';
    return;
  }

  let isValidPassword = false;

  // Check hash or legacy plaintext
  if (farmer.passwordHash && farmer.salt) {
    const { hash } = await hashPassword(pass, farmer.salt);
    isValidPassword = (hash === farmer.passwordHash);
  } else if (farmer.pass) {
    // Backward compatibility: legacy plaintext password check
    if (farmer.pass === pass) {
      isValidPassword = true;
      // Automatically migrate to secure hash
      const { hash, salt } = await hashPassword(pass);
      farmer.passwordHash = hash;
      farmer.salt = salt;
      delete farmer.pass;
      localStorage.setItem('smartfarm_farmers', JSON.stringify(farmers));
    }
  }

  if (!isValidPassword) {
    recordFailedLogin(phone);
    err.textContent = 'Invalid credentials. Please verify phone and password.';
    return;
  }

  clearFailedLogins(phone);
  loginFarmer(farmer);
}

function loginFarmer(farmer) {
  // Generate random session token
  const tokenBytes = new Uint8Array(16);
  window.crypto.getRandomValues(tokenBytes);
  const sessionToken = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  // Sanitize session object - NEVER store password or hash in active session
  const safeSession = {
    id: farmer.id,
    name: farmer.name,
    phone: farmer.phone,
    village: farmer.village,
    district: farmer.district,
    state: farmer.state,
    farmSize: farmer.farmSize,
    primaryCrop: farmer.primaryCrop,
    experience: farmer.experience,
    sessionToken,
    loginTime: Date.now(),
    lastActive: Date.now()
  };

  localStorage.setItem('smartfarm_session', JSON.stringify(safeSession));
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-wrapper').style.display  = 'flex';
  updateSidebarFarmer(safeSession);
  navigateTo('home');
  updateNotifBadge();
}

function handleLogout() {
  if (!confirm('Are you sure you want to log out of SmartFarm?')) return;
  localStorage.removeItem('smartfarm_session');
  document.getElementById('app-wrapper').style.display  = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  showLogin();
  showToast('Logged out securely.');
}

function updateSidebarFarmer(farmer) {
  if (!farmer) return;
  const nameEl = document.getElementById('farmer-name-display');
  const metaEl = document.getElementById('farmer-meta-display');
  if (nameEl) nameEl.textContent = farmer.name || 'Farmer';
  if (metaEl) metaEl.textContent = (farmer.farmSize || '--') + ' acres · ' + (farmer.state || '');
}

function initAuth() {
  const session = getCurrentFarmer();
  if (session) {
    // Check session timeout
    const now = Date.now();
    if (session.lastActive && (now - session.lastActive > SESSION_EXPIRY_MS)) {
      localStorage.removeItem('smartfarm_session');
      document.getElementById('login-screen').style.display = 'flex';
      document.getElementById('app-wrapper').style.display  = 'none';
      showToast('Session expired due to inactivity. Please log in again.', 'warning');
      return;
    }

    // Refresh last active timestamp
    session.lastActive = now;
    localStorage.setItem('smartfarm_session', JSON.stringify(session));

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-wrapper').style.display  = 'flex';
    updateSidebarFarmer(session);
  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-wrapper').style.display  = 'none';
  }
}

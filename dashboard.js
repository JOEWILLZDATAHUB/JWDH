// =====================================================================
// CONSTANTS & DEFAULT DATA
// =====================================================================
const CHANNEL_NAME   = 'joewillz-channel';
const STORAGE_KEY    = 'jwSiteData';
const ORDERS_KEY     = 'jwOrders';
const AUTH_KEY       = 'jwAdminAuth';
const PW_KEY         = 'jwAdminPw';
const DEFAULT_PW     = 'JoeWillz@2026';

const DEFAULT_DATA = {
  version: 2,
  packages: {
    MTN: [
      {id:'mtn-1gb', size:'1GB',  price:5.50,   active:true},
      {id:'mtn-2gb', size:'2GB',  price:11.00,  active:true},
      {id:'mtn-3gb', size:'3GB',  price:17.00,  active:true},
      {id:'mtn-4gb', size:'4GB',  price:23.00,  active:true},
      {id:'mtn-5gb', size:'5GB',  price:29.00,  active:true},
      {id:'mtn-6gb', size:'6GB',  price:33.00,  active:true},
      {id:'mtn-7gb', size:'7GB',  price:36.00,  active:true},
      {id:'mtn-8gb', size:'8GB',  price:40.00,  active:true},
      {id:'mtn-9gb', size:'9GB',  price:43.00,  active:true},
      {id:'mtn-10gb',size:'10GB', price:48.00,  active:true},
      {id:'mtn-12gb',size:'12GB', price:58.00,  active:true},
      {id:'mtn-15gb',size:'15GB', price:72.00,  active:true},
      {id:'mtn-20gb',size:'20GB', price:87.00,  active:true},
    ],
    AT: [
      {id:'at-1gb', size:'1GB',  price:5.00,  active:true},
      {id:'at-2gb', size:'2GB',  price:10.00, active:true},
      {id:'at-3gb', size:'3GB',  price:15.00, active:true},
      {id:'at-4gb', size:'4GB',  price:17.50, active:true},
      {id:'at-5gb', size:'5GB',  price:22.00, active:true},
      {id:'at-6gb', size:'6GB',  price:27.00, active:true},
      {id:'at-7gb', size:'7GB',  price:30.00, active:true},
      {id:'at-8gb', size:'8GB',  price:34.00, active:true},
      {id:'at-9gb', size:'9GB',  price:39.00, active:true},
      {id:'at-10gb',size:'10GB', price:42.00, active:true},
      {id:'at-12gb',size:'12GB', price:48.00, active:true},
      {id:'at-15gb',size:'15GB', price:60.00, active:true},
    ],
    Telecel: [
      {id:'tc-5gb', size:'5GB',  price:23.00,  active:true},
      {id:'tc-10gb',size:'10GB', price:43.00,  active:true},
      {id:'tc-15gb',size:'15GB', price:57.00,  active:true},
      {id:'tc-20gb',size:'20GB', price:79.00,  active:true},
      {id:'tc-25gb',size:'25GB', price:95.00,  active:true},
      {id:'tc-30gb',size:'30GB', price:120.00, active:true},
    ]
  },
  promotions: [],
  settings: {
    businessName:     'JoeWillz Data Bundle Hub',
    tagline:          'Affordable and reliable data bundle services across Ghana.',
    heroHeadline:     'Affordable Data Bundles Delivered Instantly Across Ghana',
    heroSubheadline:  'Purchase MTN, AT, and Telecel data bundles at competitive rates and receive delivery within minutes directly to your phone.',
    heroCta1:         'Buy Data Now',
    heroCta2:         'Contact Support',
    deliveryTime:     '1–5 minutes',
    whatsapp:         '233507593896',
    supportPhone:     '+233 50 759 3896',
    paymentNetwork:   'Telecel Cash',
    paymentName:      'Jonathan Zidan Nunoo',
    paymentNumber:    '+233 50 759 3896',
    paymentNumberClean: '+233507593896',
    announcement: {active:false, text:'', bgColor:'#0A4D9C', textColor:'#ffffff'}
  },
  lastUpdated: null
};

// =====================================================================
// STATE
// =====================================================================
let currentPkgNetwork = 'MTN';
let editingPkgId      = null;  // pkg id being edited, null = new
let editingPromoId    = null;
let confirmCallback   = null;
let revenueChart      = null;
let networkChart      = null;
let syncChannel       = null;

// =====================================================================
// DATA LAYER
// =====================================================================
function getSiteData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function setSiteData(data) {
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  } catch(e) { return []; }
}

function setOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function initData() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    setSiteData(JSON.parse(JSON.stringify(DEFAULT_DATA)));
  }
}

function broadcastUpdate(type, payload) {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, payload, ts: Date.now() });
    } catch(e) {}
  }
  flashSaved();
}

function flashSaved() {
  const el = document.getElementById('save-indicator');
  const ls = document.getElementById('last-saved');
  el.classList.remove('hidden');
  el.classList.add('flex');
  const now = new Date();
  if (ls) ls.textContent = now.toLocaleTimeString('en-GH', {hour:'2-digit', minute:'2-digit'});
  setTimeout(() => { el.classList.add('hidden'); el.classList.remove('flex'); }, 2500);
}

// =====================================================================
// BROADCAST CHANNEL
// =====================================================================
function initChannel() {
  try {
    syncChannel = new BroadcastChannel(CHANNEL_NAME);
    // Listen for pings from main site
    syncChannel.onmessage = (e) => {
      if (e.data.type === 'PING') {
        syncChannel.postMessage({ type: 'PONG', ts: Date.now() });
      }
    };
    // Update sync dot to live
    const dot = document.getElementById('sync-dot');
    const lbl = document.getElementById('sync-label');
    if (dot) { dot.classList.add('sync-live'); dot.classList.remove('sync-idle'); }
    if (lbl) lbl.textContent = 'Syncing live';
  } catch(e) {
    const lbl = document.getElementById('sync-label');
    if (lbl) lbl.textContent = 'Single tab mode';
  }
}

// =====================================================================
// AUTH
// =====================================================================
function getStoredPw() {
  return localStorage.getItem(PW_KEY) || DEFAULT_PW;
}

function doLogin() {
  const pw = document.getElementById('login-pw').value;
  const err = document.getElementById('login-err');
  if (pw === getStoredPw()) {
    sessionStorage.setItem(AUTH_KEY, '1');
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-app').style.display = 'flex';
    err.classList.add('hidden');
    onAppReady();
  } else {
    err.classList.remove('hidden');
    document.getElementById('login-pw').value = '';
    document.getElementById('login-pw').focus();
  }
}

function doLogout() {
  sessionStorage.removeItem(AUTH_KEY);
  location.reload();
}

function checkAuth() {
  if (sessionStorage.getItem(AUTH_KEY)) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-app').style.display = 'flex';
    onAppReady();
  }
}

// =====================================================================
// APP INIT (called after auth)
// =====================================================================
function onAppReady() {
  initData();
  initChannel();
  switchSection('overview');
  updatePendingBadge();
  updatePkgCount();
  updatePromoCount();
}

// =====================================================================
// NAVIGATION
// =====================================================================
const SECTIONS = {
  overview:   { title:'Overview',   sub:'Dashboard summary and quick stats' },
  packages:   { title:'Packages',   sub:'Manage pricing across all networks' },
  promotions: { title:'Promotions', sub:'Active banners and announcements' },
  content:    { title:'Content',    sub:'Edit website copy and banners' },
  orders:     { title:'Orders',     sub:'View and manage customer orders' },
  settings:   { title:'Settings',   sub:'Payment, contact, and security settings' },
};

function switchSection(name) {
  // Update panels
  document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('sec-' + name);
  if (el) el.classList.add('active');

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const navEl = document.getElementById('nav-' + name);
  if (navEl) navEl.classList.add('active');

  // Update page title
  const info = SECTIONS[name] || {};
  document.getElementById('page-title').textContent = info.title || name;
  document.getElementById('page-sub').textContent = info.sub || '';

  closeSidebar();

  // Section-specific init
  if (name === 'overview')    renderOverview();
  if (name === 'packages')    renderPkgTable();
  if (name === 'promotions')  renderPromos();
  if (name === 'content')     loadContentForm();
  if (name === 'orders')      renderOrders();
  if (name === 'settings')    loadSettingsForm();
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// =====================================================================
// OVERVIEW SECTION
// =====================================================================
function renderOverview() {
  const orders = getOrders();
  const data   = getSiteData();

  const completed  = orders.filter(o => o.status === 'Completed');
  const pending    = orders.filter(o => o.status === 'Pending');
  const totalRev   = completed.reduce((s, o) => s + (o.price || 0), 0);
  const allActive  = Object.values(data.packages).flat().filter(p => p.active !== false).length;

  document.getElementById('stat-revenue').textContent  = 'GHS ' + totalRev.toFixed(2);
  document.getElementById('stat-orders').textContent   = orders.length;
  document.getElementById('stat-pkgs').textContent     = allActive;
  document.getElementById('stat-pending').textContent  = pending.length;

  renderRecentOrders(orders);
  createRevenueChart();
  createNetworkChart(orders);
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById('recent-orders-tbody');
  const recent = orders.slice(-5).reverse();
  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-gray-400 text-sm">No orders yet.</td></tr>';
    return;
  }
  tbody.innerHTML = recent.map(o => `
    <tr>
      <td class="font-mono text-xs font-semibold text-blue-600">${o.id}</td>
      <td class="font-medium">${o.customerName}</td>
      <td><span class="ndot ndot-${o.network.toLowerCase()}"></span>${o.network}</td>
      <td class="font-semibold">${o.package}</td>
      <td class="font-bold text-blue-700">GHS ${(o.price||0).toFixed(2)}</td>
      <td><span class="badge badge-${(o.status||'pending').toLowerCase()}">${o.status}</span></td>
      <td class="text-gray-400 text-xs">${o.date}</td>
    </tr>
  `).join('');
}

function getRevenueByDay(days) {
  const orders = getOrders().filter(o => o.status === 'Completed');
  const result = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    result[d.toISOString().split('T')[0]] = 0;
  }
  orders.forEach(o => {
    if (o.iso) { const k = o.iso.split('T')[0]; if (k in result) result[k] += o.price || 0; }
  });
  return result;
}

function createRevenueChart() {
  const ctx = document.getElementById('revenue-chart');
  if (!ctx) return;
  const days = parseInt(document.getElementById('rev-period')?.value || '7');
  const raw  = getRevenueByDay(days);
  const labels = Object.keys(raw).map(d => {
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('en-GH', { month:'short', day:'numeric' });
  });
  const values = Object.values(raw);

  if (revenueChart) { revenueChart.destroy(); revenueChart = null; }
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values, label: 'Revenue (GHS)',
        borderColor: '#0A4D9C', backgroundColor: 'rgba(10,77,156,0.07)',
        borderWidth: 2, fill: true, tension: 0.4,
        pointRadius: 4, pointBackgroundColor: '#0A4D9C', pointBorderColor: '#fff', pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => 'GHS ' + c.raw.toFixed(2) } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11 }, color: '#94a3b8', callback: v => 'GHS ' + v }
        }
      }
    }
  });
}

function updateRevenueChart() { createRevenueChart(); }

function createNetworkChart(orders) {
  const ctx = document.getElementById('network-chart');
  if (!ctx) return;

  const counts = { MTN: 0, AT: 0, Telecel: 0 };
  orders.forEach(o => { if (o.network in counts) counts[o.network]++; });
  const labels = Object.keys(counts);
  const values = Object.values(counts);
  const colors = ['#FFCC00', '#E4002B', '#0099CC'];

  if (networkChart) { networkChart.destroy(); networkChart = null; }

  if (values.every(v => v === 0)) {
    document.getElementById('net-legend').innerHTML = '<p class="text-xs text-gray-400 text-center">No orders yet.</p>';
    networkChart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: ['No data'], datasets: [{ data: [1], backgroundColor: ['#f1f5f9'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '65%' }
    });
    return;
  }

  networkChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { display: false } }
    }
  });

  const total = values.reduce((a, b) => a + b, 0);
  document.getElementById('net-legend').innerHTML = labels.map((l, i) => `
    <div class="flex items-center justify-between text-xs">
      <div class="flex items-center gap-1.5">
        <span style="background:${colors[i]}" class="w-2.5 h-2.5 rounded-full inline-block"></span>
        <span class="text-gray-700 font-medium">${l}</span>
      </div>
      <span class="text-gray-500">${values[i]} (${total ? Math.round(values[i]/total*100) : 0}%)</span>
    </div>
  `).join('');
}

// =====================================================================
// PACKAGES SECTION
// =====================================================================
function switchPkgTab(net) {
  currentPkgNetwork = net;
  ['MTN','AT','Telecel'].forEach(n => {
    const btn = document.getElementById('ptab-' + n);
    btn.className = 'pkg-tab';
    if (n === net) btn.classList.add('active-' + n.toLowerCase());
  });
  renderPkgTable();
}

function renderPkgTable() {
  const data = getSiteData();
  const pkgs = data.packages[currentPkgNetwork] || [];
  const tbody = document.getElementById('pkg-tbody');
  const title = document.getElementById('pkg-table-title');
  const count = document.getElementById('pkg-table-count');
  const active = pkgs.filter(p => p.active !== false).length;

  title.textContent = currentPkgNetwork + ' Packages';
  count.textContent = `${active} active, ${pkgs.length - active} hidden`;

  if (pkgs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400 text-sm">No packages. Click "Add Package" to get started.</td></tr>`;
    return;
  }

  tbody.innerHTML = pkgs.map((p, i) => {
    const perGb = p.price / (parseFloat(p.size) || 1);
    return `
      <tr>
        <td class="text-gray-400 text-xs">${i + 1}</td>
        <td class="font-bold text-gray-900">${p.size}</td>
        <td>
          <span class="font-bold text-blue-700">GHS ${p.price.toFixed(2)}</span>
        </td>
        <td class="text-gray-400 text-xs">GHS ${perGb.toFixed(2)}/GB</td>
        <td>
          <label class="toggle-wrap">
            <input type="checkbox" class="toggle-input" ${p.active !== false ? 'checked' : ''}
                   onchange="togglePkg('${p.id}', this.checked)">
            <span class="toggle-track"></span>
          </label>
        </td>
        <td>
          <div class="flex items-center gap-1.5">
            <button onclick="openPkgModal('${p.id}')" class="btn-icon btn-sm" title="Edit">
              <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
            </button>
            <button onclick="confirmDeletePkg('${p.id}')" class="btn-icon btn-sm danger" title="Delete">
              <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  updatePkgCount();
}

function openPkgModal(id) {
  editingPkgId = id || null;
  const data = getSiteData();
  const title = document.getElementById('pkg-modal-title');

  if (id) {
    // Find the package
    let pkg = null;
    Object.keys(data.packages).forEach(net => {
      const found = data.packages[net].find(p => p.id === id);
      if (found) { pkg = found; }
    });
    if (!pkg) return;

    title.textContent = 'Edit Package';
    document.getElementById('pkg-net').value    = getNetworkForPkg(id, data);
    document.getElementById('pkg-net').disabled = true;
    document.getElementById('pkg-size').value   = pkg.size;
    document.getElementById('pkg-price').value  = pkg.price;
    document.getElementById('pkg-active').checked = pkg.active !== false;
  } else {
    title.textContent = 'Add Package';
    document.getElementById('pkg-net').value    = currentPkgNetwork;
    document.getElementById('pkg-net').disabled = false;
    document.getElementById('pkg-size').value   = '';
    document.getElementById('pkg-price').value  = '';
    document.getElementById('pkg-active').checked = true;
  }

  ['pkg-size-err','pkg-price-err'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById('modal-package').classList.add('open');
}

function getNetworkForPkg(id, data) {
  for (const [net, pkgs] of Object.entries(data.packages)) {
    if (pkgs.find(p => p.id === id)) return net;
  }
  return 'MTN';
}

function closePkgModal() {
  document.getElementById('modal-package').classList.remove('open');
  document.getElementById('pkg-net').disabled = false;
  editingPkgId = null;
}

function savePkg() {
  const size    = document.getElementById('pkg-size').value.trim();
  const priceRaw = document.getElementById('pkg-price').value.trim();
  const active  = document.getElementById('pkg-active').checked;
  const net     = document.getElementById('pkg-net').value;
  let valid     = true;

  document.getElementById('pkg-size-err').classList.add('hidden');
  document.getElementById('pkg-price-err').classList.add('hidden');

  if (!size) { document.getElementById('pkg-size-err').classList.remove('hidden'); valid = false; }
  const price = parseFloat(priceRaw);
  if (isNaN(price) || price < 0) { document.getElementById('pkg-price-err').classList.remove('hidden'); valid = false; }
  if (!valid) return;

  const data = getSiteData();
  if (editingPkgId) {
    const pkgNet = getNetworkForPkg(editingPkgId, data);
    const idx = data.packages[pkgNet].findIndex(p => p.id === editingPkgId);
    if (idx >= 0) {
      data.packages[pkgNet][idx] = { ...data.packages[pkgNet][idx], size, price, active };
    }
    showToast('Package updated and published.', 'success');
  } else {
    const id = net.toLowerCase() + '-' + size.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now();
    if (!data.packages[net]) data.packages[net] = [];
    data.packages[net].push({ id, size, price, active });
    showToast('Package added and published.', 'success');
  }

  setSiteData(data);
  broadcastUpdate('PACKAGES_UPDATED', data.packages);
  closePkgModal();
  renderPkgTable();
  updatePkgCount();
}

function togglePkg(id, active) {
  const data = getSiteData();
  Object.keys(data.packages).forEach(net => {
    const pkg = data.packages[net].find(p => p.id === id);
    if (pkg) pkg.active = active;
  });
  setSiteData(data);
  broadcastUpdate('PACKAGES_UPDATED', data.packages);
  renderPkgTable();
  showToast(`Package ${active ? 'activated' : 'hidden'}.`, active ? 'success' : 'info');
}

function confirmDeletePkg(id) {
  confirmCallback = () => {
    const data = getSiteData();
    Object.keys(data.packages).forEach(net => {
      data.packages[net] = data.packages[net].filter(p => p.id !== id);
    });
    setSiteData(data);
    broadcastUpdate('PACKAGES_UPDATED', data.packages);
    renderPkgTable();
    updatePkgCount();
    showToast('Package deleted.', 'warning');
    closeConfirm();
  };
  showConfirm('Delete Package', 'This package will be removed from the main site immediately. This cannot be undone.');
}

function updatePkgCount() {
  const data = getSiteData();
  const total = Object.values(data.packages).flat().length;
  const badge = document.getElementById('pkg-count');
  if (badge) badge.textContent = total;
}

// =====================================================================
// PROMOTIONS SECTION
// =====================================================================
function renderPromos() {
  const data  = getSiteData();
  const promos = data.promotions || [];
  const list  = document.getElementById('promos-list');
  const countEl = document.getElementById('promo-active-count');
  const activeCount = promos.filter(p => p.active).length;

  if (activeCount > 0) {
    countEl.textContent = activeCount;
    countEl.classList.remove('hidden');
  } else {
    countEl.classList.add('hidden');
  }

  if (promos.length === 0) {
    list.innerHTML = `
      <div class="card p-8 text-center text-gray-400">
        <svg class="w-10 h-10 mx-auto mb-3 opacity-40" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/></svg>
        <p class="text-sm font-medium">No promotions yet.</p>
        <p class="text-xs mt-1">Create your first promotion to display on the main site.</p>
      </div>`;
    return;
  }

  list.innerHTML = promos.map(p => `
    <div class="card p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h4 class="font-bold text-gray-900 text-sm">${p.title}</h4>
            <span class="badge ${p.active ? 'badge-active' : 'badge-inactive'}">${p.active ? 'Active' : 'Inactive'}</span>
            <span class="badge" style="background:#e0f2fe;color:#0369a1">${p.type === 'announcement' ? 'Announcement Bar' : 'Promo Banner'}</span>
          </div>
          <div class="rounded-lg px-3 py-2 text-sm font-medium mt-2 inline-block max-w-full truncate"
               style="background:${p.bgColor||'#0A4D9C'};color:${p.textColor||'#fff'}">
            ${p.text || 'No message set'}
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <label class="toggle-wrap" title="${p.active ? 'Deactivate' : 'Activate'}">
            <input type="checkbox" class="toggle-input" ${p.active ? 'checked' : ''} onchange="togglePromo('${p.id}', this.checked)">
            <span class="toggle-track"></span>
          </label>
          <button onclick="openPromoModal('${p.id}')" class="btn-icon" title="Edit">
            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
          </button>
          <button onclick="confirmDeletePromo('${p.id}')" class="btn-icon danger" title="Delete">
            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function openPromoModal(id) {
  editingPromoId = id || null;
  const data = getSiteData();

  if (id) {
    const p = (data.promotions || []).find(p => p.id === id);
    if (!p) return;
    document.getElementById('promo-modal-title').textContent = 'Edit Promotion';
    document.getElementById('promo-edit-id').value = id;
    document.getElementById('promo-title').value   = p.title;
    document.getElementById('promo-type').value    = p.type || 'announcement';
    document.getElementById('promo-text').value    = p.text || '';
    document.getElementById('promo-bg').value      = p.bgColor || '#0A4D9C';
    document.getElementById('promo-bg-txt').value  = p.bgColor || '#0A4D9C';
    document.getElementById('promo-color').value   = p.textColor || '#ffffff';
    document.getElementById('promo-color-txt').value = p.textColor || '#ffffff';
    document.getElementById('promo-active').checked = p.active || false;
  } else {
    document.getElementById('promo-modal-title').textContent = 'New Promotion';
    document.getElementById('promo-edit-id').value = '';
    document.getElementById('promo-title').value   = '';
    document.getElementById('promo-type').value    = 'announcement';
    document.getElementById('promo-text').value    = '';
    document.getElementById('promo-bg').value      = '#0A4D9C';
    document.getElementById('promo-bg-txt').value  = '#0A4D9C';
    document.getElementById('promo-color').value   = '#ffffff';
    document.getElementById('promo-color-txt').value = '#ffffff';
    document.getElementById('promo-active').checked = false;
  }

  document.getElementById('promo-title-err').classList.add('hidden');
  document.getElementById('modal-promo').classList.add('open');
}

function closePromoModal() {
  document.getElementById('modal-promo').classList.remove('open');
  editingPromoId = null;
}

function savePromo() {
  const title  = document.getElementById('promo-title').value.trim();
  const type   = document.getElementById('promo-type').value;
  const text   = document.getElementById('promo-text').value.trim();
  const bg     = document.getElementById('promo-bg').value;
  const color  = document.getElementById('promo-color').value;
  const active = document.getElementById('promo-active').checked;

  if (!title) { document.getElementById('promo-title-err').classList.remove('hidden'); return; }

  const data = getSiteData();
  if (!data.promotions) data.promotions = [];

  if (editingPromoId) {
    const idx = data.promotions.findIndex(p => p.id === editingPromoId);
    if (idx >= 0) data.promotions[idx] = { ...data.promotions[idx], title, type, text, bgColor:bg, textColor:color, active };
    showToast('Promotion updated.', 'success');
  } else {
    data.promotions.push({ id:'promo-' + Date.now(), title, type, text, bgColor:bg, textColor:color, active });
    showToast('Promotion created.', 'success');
  }

  setSiteData(data);
  broadcastUpdate('PROMOTIONS_UPDATED', data.promotions);
  closePromoModal();
  renderPromos();
  updatePromoCount();
}

function togglePromo(id, active) {
  const data = getSiteData();
  const p = (data.promotions || []).find(p => p.id === id);
  if (p) p.active = active;
  setSiteData(data);
  broadcastUpdate('PROMOTIONS_UPDATED', data.promotions);
  renderPromos();
  updatePromoCount();
  showToast(`Promotion ${active ? 'activated' : 'deactivated'}.`, active ? 'success' : 'info');
}

function confirmDeletePromo(id) {
  confirmCallback = () => {
    const data = getSiteData();
    data.promotions = (data.promotions || []).filter(p => p.id !== id);
    setSiteData(data);
    broadcastUpdate('PROMOTIONS_UPDATED', data.promotions);
    renderPromos();
    updatePromoCount();
    showToast('Promotion deleted.', 'warning');
    closeConfirm();
  };
  showConfirm('Delete Promotion', 'This promotion will be removed from the main site immediately.');
}

function updatePromoCount() {
  const data = getSiteData();
  const count = (data.promotions || []).filter(p => p.active).length;
  const badge = document.getElementById('promo-active-count');
  if (!badge) return;
  badge.textContent = count;
  count > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');
}

function togglePromoFields() {} // reserved for future use

// =====================================================================
// CONTENT SECTION
// =====================================================================
function loadContentForm() {
  const data = getSiteData();
  const s = data.settings;
  setVal('c-headline',    s.heroHeadline);
  setVal('c-subheadline', s.heroSubheadline);
  setVal('c-cta1',        s.heroCta1 || 'Buy Data Now');
  setVal('c-cta2',        s.heroCta2 || 'Contact Support');
  setVal('c-bizname',     s.businessName);
  setVal('c-tagline',     s.tagline);
  setVal('c-delivery',    s.deliveryTime);

  const ann = s.announcement || {};
  document.getElementById('c-ann-active').checked = ann.active || false;
  setVal('c-ann-text',       ann.text || '');
  setVal('c-ann-bg',         ann.bgColor || '#0A4D9C');
  setVal('c-ann-bg-text',    ann.bgColor || '#0A4D9C');
  setVal('c-ann-color',      ann.textColor || '#ffffff');
  setVal('c-ann-color-text', ann.textColor || '#ffffff');
  previewBanner();
}

function saveContent() {
  const data = getSiteData();
  data.settings.heroHeadline    = getVal('c-headline');
  data.settings.heroSubheadline = getVal('c-subheadline');
  data.settings.heroCta1        = getVal('c-cta1');
  data.settings.heroCta2        = getVal('c-cta2');
  setSiteData(data);
  broadcastUpdate('SETTINGS_UPDATED', data.settings);
  showToast('Hero content published to main site.', 'success');
}

function saveBanner() {
  const data = getSiteData();
  data.settings.announcement = {
    active:    document.getElementById('c-ann-active').checked,
    text:      getVal('c-ann-text'),
    bgColor:   getVal('c-ann-bg'),
    textColor: getVal('c-ann-color'),
  };
  setSiteData(data);
  broadcastUpdate('SETTINGS_UPDATED', data.settings);
  showToast(`Announcement banner ${data.settings.announcement.active ? 'activated' : 'deactivated'} on main site.`, 'success');
}

function saveBizInfo() {
  const data = getSiteData();
  data.settings.businessName = getVal('c-bizname');
  data.settings.tagline      = getVal('c-tagline');
  data.settings.deliveryTime = getVal('c-delivery');
  setSiteData(data);
  broadcastUpdate('SETTINGS_UPDATED', data.settings);
  showToast('Business info saved.', 'success');
}

function previewBanner() {
  const text   = getVal('c-ann-text') || 'Banner text will appear here';
  const bg     = getVal('c-ann-bg')   || '#0A4D9C';
  const color  = getVal('c-ann-color') || '#ffffff';
  const prev   = document.getElementById('banner-preview');
  if (prev) { prev.textContent = text; prev.style.background = bg; prev.style.color = color; }
}

function syncColorInput(colorId, textId) {
  const colorEl = document.getElementById(colorId);
  const textEl  = document.getElementById(textId);
  if (!colorEl || !textEl) return;
  const val = textEl.value;
  if (/^#[0-9a-fA-F]{6}$/.test(val)) colorEl.value = val;
  if (colorId.includes('ann')) previewBanner();
}

// =====================================================================
// ORDERS SECTION
// =====================================================================
function renderOrders() {
  const search  = (document.getElementById('ord-search')?.value  || '').toLowerCase();
  const netF    = document.getElementById('ord-net')?.value    || '';
  const statusF = document.getElementById('ord-status')?.value || '';
  const dateF   = document.getElementById('ord-date')?.value   || '';

  let orders = getOrders();

  orders = orders.filter(o => {
    const ms = !search || [o.id, o.customerName, o.recipientPhone, o.transactionId]
      .some(v => v && v.toLowerCase().includes(search));
    const mn = !netF    || o.network === netF;
    const ms2= !statusF || o.status  === statusF;
    const md = !dateF   || (o.iso && o.iso.startsWith(dateF));
    return ms && mn && ms2 && md;
  });

  const tbody  = document.getElementById('orders-tbody');
  const label  = document.getElementById('ord-count-label');
  const revEl  = document.getElementById('ord-revenue-filter');
  const revenue = orders.filter(o => o.status === 'Completed').reduce((s, o) => s + (o.price || 0), 0);

  label.textContent = `${orders.length} order${orders.length !== 1 ? 's' : ''}`;
  revEl.textContent = 'GHS ' + revenue.toFixed(2);
  updatePendingBadge();

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center py-10 text-gray-400 text-sm">No orders found.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.slice().reverse().map(o => `
    <tr>
      <td class="font-mono text-xs font-bold text-blue-600">${o.id}</td>
      <td class="text-xs text-gray-500 whitespace-nowrap">${o.date}<br><span class="text-gray-400">${o.time}</span></td>
      <td class="font-medium text-sm">${o.customerName}</td>
      <td><span class="flex items-center gap-1 text-sm"><span class="ndot ndot-${o.network.toLowerCase()}"></span>${o.network}</span></td>
      <td class="font-semibold">${o.package}</td>
      <td class="font-bold text-blue-700">GHS ${(o.price||0).toFixed(2)}</td>
      <td class="font-mono text-xs">${o.recipientPhone}</td>
      <td class="font-mono text-xs text-gray-500">${o.transactionId}</td>
      <td>
        <select class="text-xs rounded-lg px-2 py-1 border border-gray-200 font-semibold badge badge-${(o.status||'pending').toLowerCase()} cursor-pointer"
                style="background:transparent"
                onchange="updateOrderStatus('${o.id}', this.value)">
          <option value="Pending"    ${o.status==='Pending'    ?'selected':''}>Pending</option>
          <option value="Processing" ${o.status==='Processing' ?'selected':''}>Processing</option>
          <option value="Completed"  ${o.status==='Completed'  ?'selected':''}>Completed</option>
        </select>
      </td>
      <td>
        <button onclick="confirmDeleteOrder('${o.id}')" class="btn-icon danger" title="Delete">
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

function updateOrderStatus(id, status) {
  const orders = getOrders();
  const o = orders.find(x => x.id === id);
  if (o) o.status = status;
  setOrders(orders);
  broadcastUpdate('ORDERS_UPDATED', null);
  updatePendingBadge();
  showToast(`Order ${id} → ${status}`, 'info');
}

function confirmDeleteOrder(id) {
  confirmCallback = () => {
    const orders = getOrders().filter(o => o.id !== id);
    setOrders(orders);
    broadcastUpdate('ORDERS_UPDATED', null);
    renderOrders();
    showToast('Order deleted.', 'warning');
    closeConfirm();
  };
  showConfirm('Delete Order', `Remove order ${id}? This cannot be undone.`);
}

function clearOrdFilters() {
  ['ord-search','ord-net','ord-status','ord-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderOrders();
}

function updatePendingBadge() {
  const count  = getOrders().filter(o => o.status === 'Pending').length;
  const badge  = document.getElementById('pending-badge');
  if (!badge) return;
  badge.textContent = count;
  count > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');
}

function exportOrders() {
  const orders = getOrders();
  if (orders.length === 0) { showToast('No orders to export.', 'warning'); return; }
  const h = ['Order ID','Date','Time','Customer','Network','Package','Price (GHS)','Recipient','Sender','Txn ID','Status','Payment Method','Payment Receiver'];
  const rows = orders.map(o => [o.id,o.date,o.time,`"${o.customerName}"`,o.network,o.package,o.price,o.recipientPhone,o.senderPhone,o.transactionId,o.status,o.paymentMethod,`"${o.paymentReceiver||''}"`]);
  const csv  = [h.join(','), ...rows.map(r => r.join(','))].join('\n');
  const link = document.createElement('a');
  link.href  = URL.createObjectURL(new Blob([csv], { type:'text/csv' }));
  link.download = `joewillz-orders-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  showToast(`Exported ${orders.length} orders.`, 'success');
}

// =====================================================================
// SETTINGS SECTION
// =====================================================================
function loadSettingsForm() {
  const data = getSiteData();
  const s = data.settings;
  setVal('s-pay-network', s.paymentNetwork || 'Telecel Cash');
  setVal('s-pay-name',    s.paymentName);
  setVal('s-pay-number',  s.paymentNumber);
  setVal('s-pay-wa',      s.paymentNumberClean);
  setVal('s-phone',       s.supportPhone);
  setVal('s-whatsapp',    s.whatsapp);
}

function savePaymentSettings() {
  const data = getSiteData();
  data.settings.paymentNetwork     = getVal('s-pay-network');
  data.settings.paymentName        = getVal('s-pay-name');
  data.settings.paymentNumber      = getVal('s-pay-number');
  data.settings.paymentNumberClean = getVal('s-pay-wa').replace(/\+|\s/g,'');
  setSiteData(data);
  broadcastUpdate('SETTINGS_UPDATED', data.settings);
  showToast('Payment settings saved and published.', 'success');
}

function saveContactSettings() {
  const data = getSiteData();
  data.settings.supportPhone = getVal('s-phone');
  data.settings.whatsapp     = getVal('s-whatsapp').replace(/\+|\s/g,'');
  setSiteData(data);
  broadcastUpdate('SETTINGS_UPDATED', data.settings);
  showToast('Contact settings saved.', 'success');
}

function changePassword() {
  const current  = document.getElementById('s-pw-current').value;
  const newPw    = document.getElementById('s-pw-new').value;
  const confirm  = document.getElementById('s-pw-confirm').value;
  const err      = document.getElementById('s-pw-err');

  err.classList.add('hidden');
  if (current !== getStoredPw()) { err.textContent = 'Current password is incorrect.'; err.classList.remove('hidden'); return; }
  if (newPw.length < 6)          { err.textContent = 'New password must be at least 6 characters.'; err.classList.remove('hidden'); return; }
  if (newPw !== confirm)         { err.textContent = 'Passwords do not match.'; err.classList.remove('hidden'); return; }

  localStorage.setItem(PW_KEY, newPw);
  ['s-pw-current','s-pw-new','s-pw-confirm'].forEach(id => document.getElementById(id).value = '');
  showToast('Password changed successfully.', 'success');
}

function resetPackages() {
  confirmCallback = () => {
    const data = getSiteData();
    data.packages = JSON.parse(JSON.stringify(DEFAULT_DATA.packages));
    setSiteData(data);
    broadcastUpdate('PACKAGES_UPDATED', data.packages);
    renderPkgTable();
    updatePkgCount();
    showToast('Packages reset to defaults.', 'success');
    closeConfirm();
  };
  showConfirm('Reset All Packages', 'All packages will be reset to their original default values. This cannot be undone.');
}

function clearAllOrders() {
  confirmCallback = () => {
    setOrders([]);
    broadcastUpdate('ORDERS_UPDATED', null);
    renderOrders();
    updatePendingBadge();
    showToast('All orders cleared.', 'warning');
    closeConfirm();
  };
  showConfirm('Clear All Orders', 'All order history will be permanently deleted. This cannot be undone.');
}

// =====================================================================
// CONFIRM MODAL
// =====================================================================
function showConfirm(title, msg) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent   = msg;
  document.getElementById('confirm-ok-btn').onclick    = confirmCallback;
  document.getElementById('modal-confirm').classList.add('open');
}

function closeConfirm() {
  document.getElementById('modal-confirm').classList.remove('open');
  confirmCallback = null;
}

// =====================================================================
// UTILITIES
// =====================================================================
function showToast(msg, type = 'success') {
  const colors = { success:'#16a34a', error:'#dc2626', info:'#0A4D9C', warning:'#d97706' };
  const t = document.createElement('div');
  t.className = 'toast';
  t.style.background = colors[type] || colors.success;
  t.textContent = msg;
  document.getElementById('toast-wrap').appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateX(30px)'; t.style.transition = 'all 0.25s ease';
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.type === 'checkbox') el.checked = !!val;
  else el.value = val !== undefined && val !== null ? val : '';
}

function getVal(id) {
  const el = document.getElementById(id);
  if (!el) return '';
  if (el.type === 'checkbox') return el.checked;
  return el.value;
}

// Close modals on overlay click
['modal-package','modal-promo','modal-confirm'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', e => { if (e.target === el) { if (id === 'modal-confirm') closeConfirm(); else if (id === 'modal-package') closePkgModal(); else if (id === 'modal-promo') closePromoModal(); } });
});

// =====================================================================
// INIT
// =====================================================================
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  document.getElementById('login-pw')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});
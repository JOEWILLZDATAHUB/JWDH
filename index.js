// =====================================================
// DATA LAYER — synced with dashboard via jwSiteData
// =====================================================
const SITE_KEY     = 'jwSiteData';
const CHANNEL_NAME = 'joewillz-channel';
const CHECKER_PRICE = 20.00; // flat rate (GHS) for both BECE and WASSCE checkers

const DEFAULT_PACKAGES = {
  MTN: [
    { size: '1GB',  price: 5.50  }, { size: '2GB',  price: 11.00 },
    { size: '3GB',  price: 17.00 }, { size: '4GB',  price: 23.00 },
    { size: '5GB',  price: 29.00 }, { size: '6GB',  price: 33.00 },
    { size: '7GB',  price: 36.00 }, { size: '8GB',  price: 40.00 },
    { size: '9GB',  price: 43.00 }, { size: '10GB', price: 48.00 },
    { size: '12GB', price: 58.00 }, { size: '15GB', price: 72.00 },
    { size: '20GB', price: 87.00 },
  ],
  AT: [
    { size: '1GB',  price: 5.00  }, { size: '2GB',  price: 10.00 },
    { size: '3GB',  price: 15.00 }, { size: '4GB',  price: 17.50 },
    { size: '5GB',  price: 22.00 }, { size: '6GB',  price: 27.00 },
    { size: '7GB',  price: 30.00 }, { size: '8GB',  price: 34.00 },
    { size: '9GB',  price: 39.00 }, { size: '10GB', price: 42.00 },
    { size: '12GB', price: 48.00 }, { size: '15GB', price: 60.00 },
  ],
  Telecel: [
    { size: '5GB',  price: 23.00  }, { size: '10GB', price: 43.00  },
    { size: '15GB', price: 57.00  }, { size: '20GB', price: 79.00  },
    { size: '25GB', price: 95.00  }, { size: '30GB', price: 120.00 },
  ]
};

const DEFAULT_SETTINGS = {
  businessName:       'JoeWillz Data Bundle Hub',
  tagline:            'Affordable and reliable data bundle services across Ghana.',
  heroHeadline:       'Affordable Data Bundles Delivered Instantly Across Ghana',
  heroSubheadline:    'Purchase MTN, AT, and Telecel data bundles at competitive rates and receive delivery within minutes directly to your phone.',
  heroCta1:           'Buy Data Now',
  heroCta2:           'Contact Support',
  deliveryTime:       '1–5 minutes',
  whatsapp:           '233507593896',
  supportPhone:       '+233 50 759 3896',
  paymentNetwork:     'Telecel Cash',
  paymentName:        'Jonathan Zidan Nunoo',
  paymentNumber:      '+233 50 759 3896',
  paymentNumberClean: '+233507593896',
  announcement:       { active: false, text: '', bgColor: '#0A4D9C', textColor: '#ffffff' }
};

function getRawSiteData() {
  try { return JSON.parse(localStorage.getItem(SITE_KEY) || 'null'); } catch(e) { return null; }
}

function loadPackages() {
  const data = getRawSiteData();
  if (!data || !data.packages) return JSON.parse(JSON.stringify(DEFAULT_PACKAGES));
  const result = {};
  for (const [net, pkgs] of Object.entries(data.packages)) {
    result[net] = pkgs.filter(p => p.active !== false).map(p => ({ size: p.size, price: Number(p.price) }));
  }
  return result;
}

function loadSettings() {
  const data = getRawSiteData();
  return Object.assign({}, DEFAULT_SETTINGS, data && data.settings ? data.settings : {});
}

function loadPaymentInfo() {
  const s = loadSettings();
  return {
    network:     s.paymentNetwork,
    name:        s.paymentName,
    number:      s.paymentNumber,
    numberClean: s.paymentNumberClean,
    whatsapp:    s.whatsapp
  };
}

// Live copies — refreshed by applySiteSettings()
let PACKAGES     = loadPackages();
let PAYMENT_INFO = loadPaymentInfo();

// ── Push all dashboard settings into every DOM element ──────────────────────
function applySiteSettings() {
  PACKAGES     = loadPackages();
  PAYMENT_INFO = loadPaymentInfo();
  const s      = loadSettings();

  const setText = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.textContent = val; };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.href = val; };

  // Hero
  setText('hero-headline',    s.heroHeadline);
  setText('hero-subheadline', s.heroSubheadline);
  const cta1 = document.getElementById('hero-cta1');
  const cta2 = document.getElementById('hero-cta2');
  if (cta1) cta1.innerHTML = `<svg class="w-4 h-4"><use href="#icon-bolt"/></svg> ${s.heroCta1}`;
  if (cta2) cta2.innerHTML = `<svg class="w-4 h-4"><use href="#icon-headphones"/></svg> ${s.heroCta2}`;

  // Delivery time
  setText('sum-delivery', s.deliveryTime);
  setText('checker-sum-delivery', s.deliveryTime);
  setText('feature-delivery-text',
    `Data bundles are delivered within ${s.deliveryTime} of payment verification. Available around the clock.`);

  // Contact section
  const phoneLink = document.getElementById('contact-phone-link');
  if (phoneLink) { phoneLink.href = 'tel:' + s.supportPhone.replace(/\s+/g, ''); phoneLink.textContent = s.supportPhone; }
  setHref('contact-wa-link', 'https://wa.me/' + s.whatsapp);
  setText('contact-pay-network', s.paymentNetwork);
  setText('contact-pay-number',  s.paymentNumber);
  setText('contact-pay-name',    s.paymentName);
  setText('contact-pay-badge',   s.paymentNetwork);
  setText('contact-biz-name',    s.businessName);
  setText('contact-tagline',     s.tagline);

  // Footer
  setText('footer-tagline', s.tagline + ' Fast delivery, secure payments, and 24/7 support.');
  setHref('footer-wa-link',  'https://wa.me/' + s.whatsapp);
  setHref('footer-wa-link2', 'https://wa.me/' + s.whatsapp);
  const ftPhone = document.getElementById('footer-phone-link');
  if (ftPhone) { ftPhone.href = 'tel:' + s.supportPhone.replace(/\s+/g, ''); ftPhone.textContent = s.supportPhone; }
  const ftWa2 = document.getElementById('footer-wa-link2');
  if (ftWa2) ftWa2.textContent = s.supportPhone;
  setText('footer-pay-line', `${s.paymentNetwork}: ${s.paymentNumber}`);

  // Payment modal
  setText('modal-header-network',    s.paymentNetwork);
  setText('modal-pay-network',       s.paymentNetwork);
  setText('modal-pay-name',          s.paymentName);
  setText('modal-pay-number',        s.paymentNumber);
  setText('modal-pay-network-label', s.paymentNetwork + ' Number');

  // Announcement banner
  applyAnnouncementBanner(s.announcement || {});

  // Re-render pricing cards with latest packages
  if (typeof renderPricingCards === 'function') renderPricingCards();
}

function applyAnnouncementBanner(ann) {
  let bar = document.getElementById('announcement-bar');
  if (!ann || !ann.active || !ann.text) {
    if (bar) bar.style.display = 'none';
    return;
  }
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'announcement-bar';
    bar.style.cssText = 'width:100%;text-align:center;padding:8px 16px;font-size:13px;font-weight:600;position:relative;z-index:60;';
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.parentNode.insertBefore(bar, navbar);
    else document.body.prepend(bar);
  }
  bar.style.display    = 'block';
  bar.style.background = ann.bgColor   || '#0A4D9C';
  bar.style.color      = ann.textColor || '#ffffff';
  bar.textContent      = ann.text;
}

// ── BroadcastChannel: receive live updates from dashboard ──────────────────
(function initSiteChannel() {
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.onmessage = function(e) {
      const type = e.data && e.data.type;
      if (type === 'PACKAGES_UPDATED' || type === 'SETTINGS_UPDATED' || type === 'PROMOTIONS_UPDATED') {
        applySiteSettings();
      }
      if (type === 'ORDERS_UPDATED') {
        orders = JSON.parse(localStorage.getItem('jwOrders') || '[]');
      }
    };
  } catch(e) {}
})();

// Popular/best value markers per network
const POPULAR = { MTN: '5GB', AT: '5GB', Telecel: '10GB' };
const BEST_VALUE = { MTN: '20GB', AT: '15GB', Telecel: '30GB' };


// =====================================================
// STATE
// =====================================================
let currentNetwork = 'MTN';
let currentOrder = {};
let orders = JSON.parse(localStorage.getItem('jwOrders') || '[]');
let screenshotData = null;
let screenshotName = '';

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function formatPrice(n) {
  return 'GHS ' + n.toFixed(2);
}

function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'JW-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function getNow() {
  const d = new Date();
  return {
    date: d.toLocaleDateString('en-GH', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' }),
    iso: d.toISOString()
  };
}

function showToast(message, type = 'success') {
  const colors = { success: '#16a34a', error: '#dc2626', info: '#0A4D9C', warning: '#d97706' };
  const t = document.createElement('div');
  t.className = 'toast';
  t.style.background = colors[type] || colors.success;
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(40px)';
    t.style.transition = 'all 0.3s ease';
    setTimeout(() => t.remove(), 350);
  }, 3000);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

function validateGhanaPhone(num) {
  const cleaned = num.replace(/\s+/g, '').replace(/^(\+?233|0)/, '0');
  return /^0[25]\d{8}$/.test(cleaned);
}

// =====================================================
// NAVIGATION
// =====================================================
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.classList.toggle('scrolled', window.scrollY > 10);
});

function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}

function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
}

// =====================================================
// HERO NETWORK BUTTONS
// =====================================================
function goToNetwork(net) {
  switchNetworkTab(net);
  // Pre-select network in form
  const sel = document.getElementById('network-select');
  sel.value = net;
  onNetworkChange();
  document.getElementById('packages').scrollIntoView({ behavior: 'smooth' });
}

// =====================================================
// PRICING TABS
// =====================================================
function switchNetworkTab(net) {
  currentNetwork = net;

  // Update tab active states
  ['MTN', 'AT', 'Telecel'].forEach(n => {
    const btn = document.getElementById('tab-' + n.toLowerCase());
    btn.classList.remove('active');
  });
  document.getElementById('tab-' + net.toLowerCase()).classList.add('active');

  renderPricingCards();
}

function renderPricingCards() {
  const pkgs = PACKAGES[currentNetwork];
  const grid = document.getElementById('packages-grid');
  const netClass = 'network-' + currentNetwork.toLowerCase();
  const popular = POPULAR[currentNetwork];
  const bestVal = BEST_VALUE[currentNetwork];

  grid.innerHTML = pkgs.map(p => {
    const isPopular = p.size === popular;
    const isBest    = p.size === bestVal;
    const badge = isBest
      ? '<span class="value-badge">Best Value</span>'
      : isPopular
      ? '<span class="popular-badge">Popular</span>'
      : '';

    return `
      <div class="pkg-card ${netClass} bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative cursor-pointer text-center"
           onclick="selectPackage('${currentNetwork}','${p.size}',${p.price})"
           data-network="${currentNetwork}" data-size="${p.size}" data-price="${p.price}">
        ${badge}
        <p class="text-2xl font-extrabold text-text-main mb-1">${p.size}</p>
        <p class="text-primary font-bold text-lg">${formatPrice(p.price)}</p>
        <p class="text-gray-400 text-xs mt-1">GHS ${(p.price / parseInt(p.size)).toFixed(2)}/GB</p>
        <button class="mt-3 w-full text-xs font-semibold py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">Order Now</button>
      </div>
    `;
  }).join('');
}

function selectPackage(net, size, price) {
  // Pre-fill form
  const netSel = document.getElementById('network-select');
  netSel.value = net;
  onNetworkChange();

  setTimeout(() => {
    const pkgSel = document.getElementById('package-select');
    pkgSel.value = size;
    updateOrderSummary();
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
  }, 50);
}

// =====================================================
// ORDER FORM
// =====================================================
function onNetworkChange() {
  const net = document.getElementById('network-select').value;
  const pkgSel = document.getElementById('package-select');

  if (!net) {
    pkgSel.innerHTML = '<option value="">Select a network first</option>';
    pkgSel.disabled = true;
  } else {
    const pkgs = PACKAGES[net] || [];
    pkgSel.innerHTML = '<option value="">Select a data package</option>' +
      pkgs.map(p => `<option value="${p.size}" data-price="${p.price}">${p.size} — ${formatPrice(p.price)}</option>`).join('');
    pkgSel.disabled = false;
  }

  updateOrderSummary();
}

function updateOrderSummary() {
  const name   = document.getElementById('customer-name').value.trim();
  const net    = document.getElementById('network-select').value;
  const pkgSel = document.getElementById('package-select');
  const pkgVal = pkgSel.value;
  const phone  = document.getElementById('recipient-phone').value.trim();

  const hasData = name || net || pkgVal || phone;

  document.getElementById('summary-content').classList.toggle('hidden', hasData);
  document.getElementById('summary-filled').classList.toggle('hidden', !hasData);

  if (!hasData) return;

  let price = 0;
  const opt = pkgSel.options[pkgSel.selectedIndex];
  if (opt && opt.dataset.price) price = parseFloat(opt.dataset.price);

  document.getElementById('sum-name').textContent    = name || '—';
  document.getElementById('sum-network').textContent = net  || '—';
  document.getElementById('sum-package').textContent = pkgVal || '—';
  document.getElementById('sum-phone').textContent   = phone || '—';
  document.getElementById('sum-price').textContent   = price > 0 ? formatPrice(price) : '—';

  // Store current order
  currentOrder = { orderType: 'bundle', name, net, pkg: pkgVal, price, phone };
}

// =====================================================
// CHECKER ORDER FORM (BECE / WASSCE)
// =====================================================
function selectChecker(type) {
  const sel = document.getElementById('checker-type');
  sel.value = type;
  updateCheckerSummary();
  document.getElementById('checkers-form').scrollIntoView({ behavior: 'smooth' });
}

function updateCheckerSummary() {
  const name  = document.getElementById('checker-name').value.trim();
  const type  = document.getElementById('checker-type').value;
  const phone = document.getElementById('checker-phone').value.trim();

  const hasData = name || type || phone;

  document.getElementById('checker-summary-content').classList.toggle('hidden', hasData);
  document.getElementById('checker-summary-filled').classList.toggle('hidden', !hasData);

  if (!hasData) return;

  const price     = type ? CHECKER_PRICE : 0;
  const typeLabel = type ? `${type} Result Checker` : '—';

  document.getElementById('checker-sum-name').textContent  = name || '—';
  document.getElementById('checker-sum-type').textContent  = typeLabel;
  document.getElementById('checker-sum-phone').textContent = phone || '—';
  document.getElementById('checker-sum-price').textContent = price > 0 ? formatPrice(price) : '—';

  // Store current order
  currentOrder = { orderType: 'checker', name, checkerType: type, price, phone };
}

function validateCheckerForm() {
  let valid = true;
  const name  = document.getElementById('checker-name').value.trim();
  const type  = document.getElementById('checker-type').value;
  const phone = document.getElementById('checker-phone').value.trim();

  clearError('checker-name-error'); clearError('checker-type-error'); clearError('checker-phone-error');

  if (!name)  { showError('checker-name-error'); valid = false; }
  if (!type)  { showError('checker-type-error'); valid = false; }
  if (!phone || !validateGhanaPhone(phone)) { showError('checker-phone-error'); valid = false; }

  return valid;
}

function proceedToCheckerPayment() {
  if (!validateCheckerForm()) {
    showToast('Please complete all required fields correctly.', 'error');
    return;
  }
  updateCheckerSummary();
  openPaymentModal();
}

function resetCheckerForm() {
  document.getElementById('checker-name').value = '';
  document.getElementById('checker-type').value = '';
  document.getElementById('checker-phone').value = '';
  document.getElementById('sender-name').value = '';
  document.getElementById('sender-phone').value = '';
  document.getElementById('transaction-id').value = '';
  document.getElementById('payment-screenshot').value = '';
  document.getElementById('file-label').classList.remove('has-file');
  document.getElementById('file-label-text').textContent = 'Tap to upload screenshot (JPG, PNG, PDF)';
  screenshotData = null;
  screenshotName = '';
  currentOrder = {};
  updateCheckerSummary();
}

// Returns the { network, package } fields to store on the order record,
// derived from whichever flow (bundle or checker) is currently active.
function getProductFields() {
  if (currentOrder.orderType === 'checker') {
    return { network: 'Checker', package: `${currentOrder.checkerType} Result Checker` };
  }
  return { network: currentOrder.net, package: currentOrder.pkg };
}

function clearError(id) {
  document.getElementById(id).classList.add('hidden');
}

function showError(id) {
  document.getElementById(id).classList.remove('hidden');
}

function validateOrderForm() {
  let valid = true;
  const name  = document.getElementById('customer-name').value.trim();
  const net   = document.getElementById('network-select').value;
  const pkg   = document.getElementById('package-select').value;
  const phone = document.getElementById('recipient-phone').value.trim();

  clearError('name-error'); clearError('network-error');
  clearError('package-error'); clearError('phone-error');

  if (!name) { showError('name-error'); valid = false; }
  if (!net)  { showError('network-error'); valid = false; }
  if (!pkg)  { showError('package-error'); valid = false; }
  if (!phone || !validateGhanaPhone(phone)) { showError('phone-error'); valid = false; }

  return valid;
}

function proceedToPayment() {
  if (!validateOrderForm()) {
    showToast('Please complete all required fields correctly.', 'error');
    return;
  }
  updateOrderSummary();
  openPaymentModal();
}

// =====================================================
// PAYMENT MODAL
// =====================================================
function openPaymentModal() {
  const modal = document.getElementById('payment-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Set amount
  const price = currentOrder.price || 0;
  document.getElementById('modal-amount').textContent = formatPrice(price);

  // Reset to step 1
  showModalStep(1);
  document.getElementById('sender-name').value = currentOrder.name || '';
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function showModalStep(step) {
  document.getElementById('modal-step1').classList.toggle('hidden', step !== 1);
  document.getElementById('modal-step2').classList.toggle('hidden', step !== 2);

  const step2num   = document.getElementById('step2-num');
  const step2label = document.getElementById('step2-label');

  if (step === 2) {
    step2num.classList.replace('bg-gray-200', 'bg-primary');
    step2num.classList.replace('text-gray-500', 'text-white');
    step2label.classList.replace('text-gray-400', 'text-primary');
  } else {
    step2num.classList.replace('bg-primary', 'bg-gray-200');
    step2num.classList.replace('text-white', 'text-gray-500');
    step2label.classList.replace('text-primary', 'text-gray-400');
  }
}

function goToConfirmation() {
  showModalStep(2);
}

function backToPayment() {
  showModalStep(1);
}

async function copyPhoneNumber() {
  const ok = await copyToClipboard(PAYMENT_INFO.numberClean);
  showToast(ok ? 'Phone number copied!' : 'Copy failed — please copy manually.', ok ? 'success' : 'error');
}

async function copyPaymentDetails() {
  const details = `${PAYMENT_INFO.network}\nAccount Name: ${PAYMENT_INFO.name}\nNumber: ${PAYMENT_INFO.number}\nAmount: ${formatPrice(currentOrder.price || 0)}`;
  const ok = await copyToClipboard(details);
  showToast(ok ? 'Payment details copied!' : 'Copy failed — please copy manually.', ok ? 'success' : 'error');
}

function onFileSelected(input) {
  const file = input.files[0];
  if (!file) return;
  screenshotName = file.name;
  document.getElementById('file-label').classList.add('has-file');
  document.getElementById('file-label-text').textContent = file.name;

  // Read as base64 for storage
  const reader = new FileReader();
  reader.onload = (e) => {
    screenshotData = e.target.result;
  };
  reader.readAsDataURL(file);
}

// =====================================================
// ORDER SUBMISSION
// =====================================================
function validateConfirmForm() {
  let valid = true;
  const sn = document.getElementById('sender-name').value.trim();
  const sp = document.getElementById('sender-phone').value.trim();
  const tx = document.getElementById('transaction-id').value.trim();

  clearError('sender-name-error'); clearError('sender-phone-error'); clearError('txn-error');

  if (!sn) { showError('sender-name-error'); valid = false; }
  if (!sp) { showError('sender-phone-error'); valid = false; }
  if (!tx) { showError('txn-error'); valid = false; }

  return valid;
}

function submitOrder() {
  if (!validateConfirmForm()) {
    showToast('Please fill in all confirmation fields.', 'error');
    return;
  }

  const senderName  = document.getElementById('sender-name').value.trim();
  const senderPhone = document.getElementById('sender-phone').value.trim();
  const txnId       = document.getElementById('transaction-id').value.trim();
  const now         = getNow();
  const orderId     = generateOrderId();
  const orderType   = currentOrder.orderType || 'bundle';
  const prod        = getProductFields();

  // Build order record
  const order = {
    id: orderId,
    date: now.date,
    time: now.time,
    iso: now.iso,
    orderType: orderType,
    customerName: currentOrder.name,
    network: prod.network,
    package: prod.package,
    price: currentOrder.price,
    recipientPhone: currentOrder.phone,
    senderName,
    senderPhone,
    transactionId: txnId,
    paymentMethod: PAYMENT_INFO.network,
    paymentReceiver: PAYMENT_INFO.name,
    paymentNumber: PAYMENT_INFO.number,
    screenshotName: screenshotName || null,
    status: 'Pending'
  };

  // Always read fresh before push (prevents deleted orders reappearing)
  orders = JSON.parse(localStorage.getItem('jwOrders') || '[]');
  orders.push(order);
  localStorage.setItem('jwOrders', JSON.stringify(orders));

  // Disable button to prevent double submission
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Processing...';

  // Build WhatsApp message
  const msg = buildWhatsAppMessage(order);
  const waURL = `https://wa.me/${PAYMENT_INFO.whatsapp}?text=${encodeURIComponent(msg)}`;

  // Open WhatsApp immediately — must stay in the user-gesture (click) context
  // so browsers don't block it as a popup. Calling window.open inside setTimeout
  // breaks this context and causes the redirect to be silently blocked.
  window.open(waURL, '_blank');

  setTimeout(() => {
    closePaymentModal();
    if (orderType === 'checker') resetCheckerForm(); else resetOrderForm();
    showToast('Order submitted! WhatsApp opened.', 'success');

    btn.disabled = false;
    btn.innerHTML = '<svg class="w-4 h-4"><use href="#icon-whatsapp"/></svg> Submit Order via WhatsApp';
  }, 1000);
}

function buildWhatsAppMessage(o) {
  if (o.orderType === 'checker') {
    return `Hello JoeWillz Data Bundle Hub,

I have completed payment for a result checker order.

*Order ID:* ${o.id}
*Customer Name:* ${o.customerName}
*Checker Type:* ${o.package}
*Amount Paid:* ${formatPrice(o.price)}
*Phone Number for PIN Delivery:* ${o.recipientPhone}

*Payment Sender Name:* ${o.senderName}
*Payment Sender Number:* ${o.senderPhone}
*Transaction ID:* ${o.transactionId}

*Payment Sent To:*
${o.paymentReceiver}
${o.paymentMethod}: ${o.paymentNumber}

*Date:* ${o.date} at ${o.time}

Please verify payment and send my checker PIN.

Thank you.`;
  }

  return `Hello JoeWillz Data Bundle Hub,

I have completed payment for a data bundle order.

*Order ID:* ${o.id}
*Customer Name:* ${o.customerName}
*Network:* ${o.network}
*Package:* ${o.package}
*Amount Paid:* ${formatPrice(o.price)}
*Data Recipient Number:* ${o.recipientPhone}
*Payment Sender Name:* ${o.senderName}
*Payment Sender Number:* ${o.senderPhone}
*Transaction ID:* ${o.transactionId}

*Payment Sent To:*
${o.paymentReceiver}
${o.paymentMethod}: ${o.paymentNumber}

*Date:* ${o.date} at ${o.time}

Please verify payment and process my order.

Thank you.`;
}

async function copySMSText() {
  if (!validateConfirmForm()) {
    showToast('Please fill in all confirmation fields first.', 'error');
    return;
  }
  const prod = getProductFields();
  const order = {
    id: 'PENDING',
    orderType: currentOrder.orderType || 'bundle',
    customerName: currentOrder.name,
    network: prod.network,
    package: prod.package,
    price: currentOrder.price,
    recipientPhone: currentOrder.phone,
    senderName: document.getElementById('sender-name').value.trim(),
    senderPhone: document.getElementById('sender-phone').value.trim(),
    transactionId: document.getElementById('transaction-id').value.trim(),
    paymentMethod: PAYMENT_INFO.network,
    paymentReceiver: PAYMENT_INFO.name,
    paymentNumber: PAYMENT_INFO.number,
    date: getNow().date,
    time: getNow().time
  };
  const msg = buildWhatsAppMessage(order);
  const ok = await copyToClipboard(msg);
  showToast(ok ? 'Order message copied! Paste it into SMS.' : 'Copy failed.', ok ? 'success' : 'error');
}

function resetOrderForm() {
  document.getElementById('customer-name').value = '';
  document.getElementById('network-select').value = '';
  document.getElementById('package-select').innerHTML = '<option value="">Select a network first</option>';
  document.getElementById('package-select').disabled = true;
  document.getElementById('recipient-phone').value = '';
  document.getElementById('sender-name').value = '';
  document.getElementById('sender-phone').value = '';
  document.getElementById('transaction-id').value = '';
  document.getElementById('payment-screenshot').value = '';
  document.getElementById('file-label').classList.remove('has-file');
  document.getElementById('file-label-text').textContent = 'Tap to upload screenshot (JPG, PNG, PDF)';
  screenshotData = null;
  screenshotName = '';
  currentOrder = {};
  updateOrderSummary();
}

// =====================================================
// FAQ ACCORDION
// =====================================================
const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'Data bundles are typically delivered within 1 to 5 minutes after payment verification. During peak hours, delivery may take up to 10 minutes. We operate 24 hours a day, 7 days a week.'
  },
  {
    q: 'Which networks are supported?',
    a: 'We currently support MTN, AT (AirtelTigo), and Telecel networks. We offer a wide range of packages across all three major networks in Ghana.'
  },
  {
    q: 'Can I buy data for another person?',
    a: 'Yes, absolutely. Simply enter the recipient\'s phone number in the "Phone Number Receiving Data" field when placing your order. The data will be delivered directly to that number.'
  },
  {
    q: 'How do I verify payment?',
    a: 'After making your Telecel Cash payment, save your transaction ID. Complete the payment confirmation form by entering your sender name, mobile money number, and transaction ID. You may also upload a payment screenshot as additional proof.'
  },
  {
    q: 'What if my order is delayed?',
    a: 'If your order is not processed within 15 minutes of submission, please contact our support team via WhatsApp at +233 50 759 3896 with your Order ID and transaction ID. We will resolve the issue immediately.'
  },
  {
    q: 'How do I contact support?',
    a: 'You can reach us via WhatsApp at +233 50 759 3896 or call us directly on the same number. Our support team is available 24 hours a day, 7 days a week to assist with any order or payment queries.'
  }
];

function renderFAQs() {
  const container = document.getElementById('faq-container');
  container.innerHTML = FAQS.map((faq, i) => `
    <div class="faq-item bg-white rounded-xl border border-gray-100 overflow-hidden" id="faq-${i}">
      <button class="w-full text-left flex items-center justify-between gap-4 p-5 font-semibold text-text-main text-sm sm:text-base hover:bg-gray-50 transition-colors" onclick="toggleFAQ(${i})">
        <span>${faq.q}</span>
        <svg class="w-5 h-5 text-primary flex-shrink-0 faq-chevron"><use href="#icon-chevron-down"/></svg>
      </button>
      <div class="faq-content" id="faq-content-${i}">
        <div class="px-5 pb-5 text-gray-600 text-sm leading-relaxed">${faq.a}</div>
      </div>
    </div>
  `).join('');
}

function toggleFAQ(i) {
  const item    = document.getElementById(`faq-${i}`);
  const content = document.getElementById(`faq-content-${i}`);
  const isOpen  = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.faq-content').forEach(el => el.classList.remove('open'));

  if (!isOpen) {
    item.classList.add('open');
    content.classList.add('open');
  }
}

// =====================================================
// THEME SWITCHER
// =====================================================
const THEME_META = {
  light: { icon: '☀️', label: 'Light' },
  dark:  { icon: '🌙', label: 'Dark'  },
  warm:  { icon: '🌅', label: 'Warm'  },
  ocean: { icon: '🌊', label: 'Ocean' },
};

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('jwTheme', theme);

  // Update button icon/label
  const meta = THEME_META[theme] || THEME_META.light;
  const iconEl = document.getElementById('theme-icon');
  const labelEl = document.getElementById('theme-label');
  if (iconEl) iconEl.textContent = meta.icon;
  if (labelEl) labelEl.textContent = meta.label;

  // Update active state on all option buttons
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });

  // Close dropdown
  const dd = document.getElementById('theme-dropdown');
  if (dd) dd.classList.remove('open');
}

function toggleThemeDropdown(e) {
  e.stopPropagation();
  const dd = document.getElementById('theme-dropdown');
  if (dd) dd.classList.toggle('open');
}

// Close theme dropdown on outside click
document.addEventListener('click', function(e) {
  const dd = document.getElementById('theme-dropdown');
  const btn = document.getElementById('theme-toggle-btn');
  if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
    dd.classList.remove('open');
  }
});

// Apply saved theme on load
(function() {
  const saved = localStorage.getItem('jwTheme') || 'light';
  setTheme(saved);
})();


function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// Close modals on overlay click
document.getElementById('payment-modal').addEventListener('click', function(e) {
  if (e.target === this) closePaymentModal();
});

// Close mobile menu on outside click
document.addEventListener('click', function(e) {
  const menu = document.getElementById('mobile-menu');
  const toggle = document.getElementById('nav-toggle');
  if (!menu.contains(e.target) && !toggle.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// =====================================================
// INIT
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
  applySiteSettings();   // load all dashboard settings on first paint
  renderFAQs();
  initScrollAnimations();

  // Pre-select MTN tab
  switchNetworkTab('MTN');
});
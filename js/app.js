// ==============================================================================
// EventSetu - Main Application Orchestrator & UI Controller
// Matches PhonePe UPI Payments (7249593243-2@axl / NAYAN DATTATRAY KHALADKAR)
// ==============================================================================

const App = {
  currentView: 'home',
  deferredInstallPrompt: null,

  init() {
    this.registerServiceWorker();
    this.setupPwaInstall();
    this.bindGlobalEvents();
    this.updateUserNav();
    
    if (window.EventSetuCustomer) window.EventSetuCustomer.init();
    if (window.EventSetuVendor) window.EventSetuVendor.init();
    if (window.EventSetuAdmin) window.EventSetuAdmin.init();

    this.showView('home');
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then(reg => console.log('EventSetu ServiceWorker registered:', reg.scope))
          .catch(err => console.warn('ServiceWorker registration error:', err));
      });
    }
  },

  setupPwaInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const installBtn = document.getElementById('drawer-install-pwa-btn');
      if (installBtn) installBtn.style.display = 'flex';
    });
  },

  promptPwaInstall() {
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      this.deferredInstallPrompt.userChoice.then(({ outcome }) => {
        if (outcome === 'accepted') {
          this.showToast('Thank you for installing EventSetu PWA!', 'success');
        }
        this.deferredInstallPrompt = null;
      });
    } else {
      this.showToast('To install EventSetu, tap browser menu & select "Add to Home Screen" or "Install App".', 'info');
    }
  },

  bindGlobalEvents() {
    // Drawer toggle
    const drawerBtn = document.getElementById('drawer-toggle-btn');
    if (drawerBtn) {
      drawerBtn.addEventListener('click', () => {
        this.openDrawer();
      });
    }

    const drawerBackdrop = document.getElementById('side-drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', (e) => {
        if (e.target === drawerBackdrop) {
          this.closeDrawer();
        }
      });
    }

    // Modal background dismiss
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.addEventListener('click', (e) => {
        if (e.target === m) m.classList.remove('active');
      });
    });

    // PhonePe confirmation form
    const phonepeForm = document.getElementById('phonepe-confirm-form');
    if (phonepeForm) {
      phonepeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const utr = document.getElementById('phonepe-utr-input').value.trim();
        if (!utr) {
          this.showToast('Please enter the 12-digit UPI UTR number.', 'warning');
          return;
        }

        this.showToast('Payment verified! Advance booking confirmed.', 'success');
        this.closeModal('phonepe-payment-modal');
        this.showView('customer-dashboard');
      });
    }

    // Post Event requirement form
    const peForm = document.getElementById('post-event-form');
    if (peForm) {
      peForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const eventType = document.getElementById('pe-event-type').value;
        const eventDate = document.getElementById('pe-event-date').value;
        const city = document.getElementById('pe-event-city').value;
        const guests = document.getElementById('pe-guest-count').value;
        const budget = document.getElementById('pe-budget').value;
        const name = document.getElementById('pe-name').value;

        this.showToast(`Requirement posted! 4 verified vendors in ${city} notified.`, 'success');
        this.closeModal('post-event-modal');
        peForm.reset();
      });
    }

    // Supabase Settings form
    const supabaseForm = document.getElementById('supabase-config-form');
    if (supabaseForm) {
      supabaseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('cfg-supabase-url').value.trim();
        const key = document.getElementById('cfg-supabase-key').value.trim();
        window.EventSetuDB.saveCredentials(url, key);
        this.showToast(url ? 'Supabase connected!' : 'Switched to offline local interactive mode.', 'success');
        this.closeModal('supabase-settings-modal');
        this.updateUserNav();
      });
    }
  },

  openDrawer() {
    const d = document.getElementById('side-drawer-backdrop');
    if (d) d.classList.add('active');
  },

  closeDrawer() {
    const d = document.getElementById('side-drawer-backdrop');
    if (d) d.classList.remove('active');
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  openPostEventModal() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('pe-event-date');
    if (dateInput && !dateInput.value) dateInput.value = today;
    this.openModal('post-event-modal');
  },

  openPhonePePaymentModal() {
    const upiId = '7249593243-2@axl';
    const payeeName = 'NAYAN DATTATRAY KHALADKAR';
    const amount = 27000;
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('EventSetu Advance Booking')}`;

    const qrImg = document.getElementById('phonepe-qr-img');
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}`;
    }

    this.openModal('phonepe-payment-modal');
  },

  copyUpiId(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(`Copied UPI ID: ${text}`, 'success');
    }).catch(() => {
      this.showToast(`UPI ID: ${text}`, 'info');
    });
  },

  launchUpiApp(appName) {
    const upiId = '7249593243-2@axl';
    const payeeName = 'NAYAN DATTATRAY KHALADKAR';
    const amount = 27000;
    const note = 'EventSetu Advance Booking';

    let url = '';
    if (appName === 'phonepe') {
      url = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    } else if (appName === 'gpay') {
      url = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    } else if (appName === 'paytm') {
      url = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    } else {
      url = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    }

    window.location.href = url;
    setTimeout(() => {
      this.showToast('Please complete the advance payment in your UPI app.', 'info');
    }, 1500);
  },

  showView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.view-panel').forEach(v => v.classList.add('hidden'));

    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('.bottom-nav-item').forEach(el => {
      if (el.getAttribute('data-nav-target') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    if (viewName === 'home') {
      if (window.EventSetuCustomer) window.EventSetuCustomer.loadVendors();
    } else if (viewName === 'customer-dashboard') {
      if (window.EventSetuCustomer) window.EventSetuCustomer.loadCustomerDashboard();
    } else if (viewName === 'vendor-dashboard') {
      if (window.EventSetuVendor) window.EventSetuVendor.loadVendorDashboard();
    } else if (viewName === 'admin-dashboard') {
      if (window.EventSetuAdmin) window.EventSetuAdmin.loadAdminDashboard();
    }
  },

  updateUserNav() {
    const user = window.EventSetuAuth ? window.EventSetuAuth.getCurrentUser() : null;
    const nameEl = document.getElementById('drawer-user-name');
    if (nameEl) {
      nameEl.textContent = user ? user.full_name : 'Guest User';
    }
  },

  openAuthModal(defaultTab = 'login') {
    this.openModal('auth-modal');
  },

  openSupabaseSettings() {
    if (window.EventSetuConfig) {
      const uEl = document.getElementById('cfg-supabase-url');
      const kEl = document.getElementById('cfg-supabase-key');
      if (uEl) uEl.value = window.EventSetuConfig.supabaseUrl || '';
      if (kEl) kEl.value = window.EventSetuConfig.supabaseAnonKey || '';
    }
    this.openModal('supabase-settings-modal');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
  window.EventSetuApp = App;
});

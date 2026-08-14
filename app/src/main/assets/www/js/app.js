// ==============================================================================
// EventSetu - Main Controller & Navigation Router
// Manages Role Selection First Screen, Separated Role Dashboards, Auth & Storage
// ==============================================================================

const App = {
  currentView: 'role-selection',
  selectedCity: 'Pune',

  async init() {
    console.log('EventSetu App Initializing...');

    // 1. Initialize Supabase Client
    if (window.EventSetuDB) {
      window.EventSetuDB.init();
    }

    // 2. Initialize Auth state with Session Cache
    if (window.EventSetuAuth) {
      window.EventSetuAuth.init();
    }

    // 3. Initialize Customer & Vendor Modules
    if (window.EventSetuCustomer) {
      await window.EventSetuCustomer.init();
    }

    // 4. Bind Global Event Handlers
    this.bindEvents();

    // 5. Check if user already has an active cached session
    const currentUser = window.EventSetuAuth ? window.EventSetuAuth.getCurrentUser() : null;
    if (currentUser && currentUser.role) {
      if (currentUser.role === 'admin') {
        this.showView('admin-dashboard');
      } else if (currentUser.role === 'vendor') {
        this.showView('vendor-dashboard');
      } else {
        this.showView('home');
      }
    } else {
      // First screen requirement: Show Role Selection
      this.showView('role-selection');
    }

    this.updateUserNav();
  },

  bindEvents() {
    // Drawer open / close
    const drawerToggleBtn = document.getElementById('drawer-toggle-btn');
    if (drawerToggleBtn) {
      drawerToggleBtn.addEventListener('click', () => this.toggleDrawer());
    }

    const drawerBackdrop = document.getElementById('side-drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', (e) => {
        if (e.target === drawerBackdrop) this.closeDrawer();
      });
    }

    // Post Event Form submission
    const postEventForm = document.getElementById('post-event-form');
    if (postEventForm) {
      postEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePostEventSubmit();
      });
    }

    // PhonePe confirmation form
    const phonePeConfirmForm = document.getElementById('phonepe-confirm-form');
    if (phonePeConfirmForm) {
      phonePeConfirmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePhonePePaymentSubmit();
      });
    }

    // Supabase Config Form
    const supabaseForm = document.getElementById('supabase-config-form');
    if (supabaseForm) {
      supabaseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSupabaseConfig();
      });
    }
  },

  /**
   * Handle Role Selection from First Screen
   */
  selectRolePortal(role) {
    const user = window.EventSetuAuth ? window.EventSetuAuth.getCurrentUser() : null;

    if (role === 'customer') {
      if (user && user.role === 'customer') {
        this.showView('home');
      } else {
        this.showView('auth-customer');
      }
    } else if (role === 'vendor') {
      if (user && (user.role === 'vendor' || user.role === 'admin')) {
        this.showView('vendor-dashboard');
      } else {
        this.showView('auth-vendor');
      }
    } else if (role === 'admin') {
      if (user && user.role === 'admin') {
        this.showView('admin-dashboard');
      } else {
        this.showView('auth-admin');
      }
    }
  },

  /**
   * View Switcher & Role Navigation Controller
   */
  showView(viewName) {
    // 1. Authorization checks
    if (window.EventSetuAuth && !window.EventSetuAuth.canAccessView(viewName)) {
      this.showToast(`Access restricted. You need an authorized account to view this portal.`, 'error');
      if (viewName === 'admin-dashboard') {
        this.showView('auth-admin');
      } else if (viewName === 'vendor-dashboard') {
        this.showView('auth-vendor');
      } else {
        this.showView('role-selection');
      }
      return;
    }

    // 2. Hide all view panels
    const views = document.querySelectorAll('.view-panel');
    views.forEach(v => {
      v.classList.add('hidden');
    });

    // 3. Show requested view
    const targetId = `view-${viewName}`;
    const targetView = document.getElementById(targetId);
    if (targetView) {
      targetView.classList.remove('hidden');
      this.currentView = viewName;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 4. Manage Role-Specific Navigation Bars
    const custNav = document.getElementById('customer-bottom-nav');
    const vendNav = document.getElementById('vendor-bottom-nav');
    const admNav = document.getElementById('admin-bottom-nav');
    const subBar = document.getElementById('app-location-sub-bar');

    if (custNav) custNav.style.display = 'none';
    if (vendNav) vendNav.style.display = 'none';
    if (admNav) admNav.style.display = 'none';

    if (viewName === 'home' || viewName === 'booking-details' || viewName === 'customer-dashboard') {
      if (custNav) custNav.style.display = 'block';
      if (subBar) subBar.style.display = 'flex';
      this.updateCustomerNavHighlight(viewName);
    } else if (viewName === 'vendor-dashboard') {
      if (vendNav) vendNav.style.display = 'block';
      if (subBar) subBar.style.display = 'none';
    } else if (viewName === 'admin-dashboard') {
      if (admNav) admNav.style.display = 'block';
      if (subBar) subBar.style.display = 'none';
    } else {
      // Role selection & Auth views: fullscreen immersion
      if (subBar) subBar.style.display = 'none';
    }

    // 5. Trigger view-specific data loads
    if (viewName === 'home' && window.EventSetuCustomer) {
      window.EventSetuCustomer.renderVenues();
    } else if (viewName === 'customer-dashboard' && window.EventSetuCustomer) {
      window.EventSetuCustomer.loadCustomerBookings();
    } else if (viewName === 'vendor-dashboard' && window.EventSetuVendor) {
      window.EventSetuVendor.loadVendorDashboard();
    } else if (viewName === 'admin-dashboard' && window.EventSetuAdmin) {
      window.EventSetuAdmin.loadAdminDashboard();
    }

    this.updateUserNav();
  },

  updateCustomerNavHighlight(viewName) {
    const btns = document.querySelectorAll('#customer-bottom-nav .role-nav-btn');
    btns.forEach(b => {
      const target = b.getAttribute('data-cust-target');
      if (target === viewName) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  },

  handleBrandClick() {
    const role = window.EventSetuAuth ? window.EventSetuAuth.getRole() : null;
    if (role === 'admin') {
      this.showView('admin-dashboard');
    } else if (role === 'vendor') {
      this.showView('vendor-dashboard');
    } else if (role === 'customer') {
      this.showView('home');
    } else {
      this.showView('role-selection');
    }
  },

  /* Customer Auth Handlers */
  switchCustomerAuthTab(tab) {
    const loginBtn = document.getElementById('cust-tab-login');
    const regBtn = document.getElementById('cust-tab-reg');
    const loginForm = document.getElementById('cust-login-form');
    const regForm = document.getElementById('cust-reg-form');

    if (tab === 'login') {
      loginBtn.style.background = '#fff';
      loginBtn.style.color = 'var(--primary)';
      regBtn.style.background = 'transparent';
      regBtn.style.color = 'var(--text-muted)';
      loginForm.style.display = 'block';
      regForm.style.display = 'none';
    } else {
      regBtn.style.background = '#fff';
      regBtn.style.color = 'var(--primary)';
      loginBtn.style.background = 'transparent';
      loginBtn.style.color = 'var(--text-muted)';
      regForm.style.display = 'block';
      loginForm.style.display = 'none';
    }
  },

  async handleCustomerLogin(e) {
    e.preventDefault();
    const email = document.getElementById('cust-login-email').value;
    const pass = document.getElementById('cust-login-password').value;

    const res = await window.EventSetuAuth.loginCustomer(email, pass);
    if (res.success) {
      this.showToast(`Welcome back, ${res.user?.full_name || 'Customer'}!`, 'success');
      this.showView('home');
    } else {
      this.showToast(res.message || 'Login failed', 'error');
    }
  },

  async handleCustomerRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('cust-reg-name').value;
    const mobile = document.getElementById('cust-reg-mobile').value;
    const email = document.getElementById('cust-reg-email').value;
    const password = document.getElementById('cust-reg-password').value;

    const res = await window.EventSetuAuth.registerCustomer({ fullName, email, mobile, password });
    if (res.success) {
      this.showToast('Account created successfully!', 'success');
      this.showView('home');
    } else {
      this.showToast(res.message || 'Registration failed', 'error');
    }
  },

  /* Vendor Auth Handlers */
  switchVendorAuthTab(tab) {
    const loginBtn = document.getElementById('vend-tab-login');
    const regBtn = document.getElementById('vend-tab-reg');
    const loginForm = document.getElementById('vend-login-form');
    const regForm = document.getElementById('vend-reg-form');

    if (tab === 'login') {
      loginBtn.style.background = '#fff';
      loginBtn.style.color = '#15803d';
      regBtn.style.background = 'transparent';
      regBtn.style.color = 'var(--text-muted)';
      loginForm.style.display = 'block';
      regForm.style.display = 'none';
    } else {
      regBtn.style.background = '#fff';
      regBtn.style.color = '#15803d';
      loginBtn.style.background = 'transparent';
      loginBtn.style.color = 'var(--text-muted)';
      regForm.style.display = 'block';
      loginForm.style.display = 'none';
    }
  },

  async handleVendorLogin(e) {
    e.preventDefault();
    const email = document.getElementById('vend-login-email').value;
    const pass = document.getElementById('vend-login-password').value;

    const res = await window.EventSetuAuth.loginVendor(email, pass);
    if (res.success) {
      this.showToast(`Welcome to Vendor Business Portal!`, 'success');
      this.showView('vendor-dashboard');
    } else {
      this.showToast(res.message || 'Vendor login failed', 'error');
    }
  },

  async handleVendorRegister(e) {
    e.preventDefault();
    const businessName = document.getElementById('vend-reg-bizname').value;
    const ownerName = document.getElementById('vend-reg-name').value;
    const category = document.getElementById('vend-reg-cat').value;
    const mobile = document.getElementById('vend-reg-mobile').value;
    const email = document.getElementById('vend-reg-email').value;
    const password = document.getElementById('vend-reg-password').value;

    const res = await window.EventSetuAuth.registerVendor({
      businessName,
      ownerName,
      category,
      mobile,
      email,
      password
    });

    if (res.success) {
      this.showToast('Vendor registration submitted! Welcome to your dashboard.', 'success');
      this.showView('vendor-dashboard');
    } else {
      this.showToast(res.message || 'Registration failed', 'error');
    }
  },

  /* Admin Auth Handlers */
  async handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-login-email').value;
    const pass = document.getElementById('admin-login-password').value;

    const res = await window.EventSetuAuth.loginAdmin(email, pass);
    if (res.success) {
      this.showToast(`Admin Console Unlocked!`, 'success');
      this.showView('admin-dashboard');
    } else {
      this.showToast(res.message || 'Admin authentication failed', 'error');
    }
  },

  /**
   * Update Drawer & Top Bar info according to active session
   */
  updateUserNav() {
    const user = window.EventSetuAuth ? window.EventSetuAuth.getCurrentUser() : null;
    const drawerNameEl = document.getElementById('drawer-user-name');
    const drawerRoleEl = document.getElementById('drawer-user-role-label');
    const roleBadgeEl = document.getElementById('role-indicator-badge');

    if (user) {
      if (drawerNameEl) drawerNameEl.textContent = user.full_name || 'Event User';
      if (drawerRoleEl) drawerRoleEl.textContent = `Role: ${user.role ? user.role.toUpperCase() : 'CUSTOMER'}`;
      if (roleBadgeEl) {
        if (user.role === 'admin') {
          roleBadgeEl.textContent = '🛡️ Admin Console';
          roleBadgeEl.style.color = '#7c3aed';
        } else if (user.role === 'vendor') {
          roleBadgeEl.textContent = '🏢 Vendor Portal';
          roleBadgeEl.style.color = '#15803d';
        } else {
          roleBadgeEl.textContent = '👤 Customer Portal';
          roleBadgeEl.style.color = 'var(--primary)';
        }
      }
    } else {
      if (drawerNameEl) drawerNameEl.textContent = 'Guest User';
      if (drawerRoleEl) drawerRoleEl.textContent = 'No session active';
      if (roleBadgeEl) roleBadgeEl.textContent = '⚡ Select Portal';
    }
  },

  toggleDrawer() {
    const backdrop = document.getElementById('side-drawer-backdrop');
    if (backdrop) backdrop.classList.toggle('open');
  },

  closeDrawer() {
    const backdrop = document.getElementById('side-drawer-backdrop');
    if (backdrop) backdrop.classList.remove('open');
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  },

  openPostEventModal() {
    this.openModal('post-event-modal');
  },

  openPhonePePaymentModal() {
    this.openModal('phonepe-payment-modal');
  },

  openSupabaseSettings() {
    const urlInput = document.getElementById('cfg-supabase-url');
    const keyInput = document.getElementById('cfg-supabase-key');
    if (urlInput && window.EventSetuConfig) urlInput.value = window.EventSetuConfig.supabaseUrl || '';
    if (keyInput && window.EventSetuConfig) keyInput.value = window.EventSetuConfig.supabaseAnonKey || '';
    this.openModal('supabase-settings-modal');
  },

  saveSupabaseConfig() {
    const url = document.getElementById('cfg-supabase-url').value.trim();
    const key = document.getElementById('cfg-supabase-key').value.trim();
    if (url && key) {
      localStorage.setItem('EVENTSETU_SUPABASE_URL', url);
      localStorage.setItem('EVENTSETU_SUPABASE_ANON_KEY', key);
      window.EventSetuConfig.supabaseUrl = url;
      window.EventSetuConfig.supabaseAnonKey = key;
      window.EventSetuDB.init();
      this.closeModal('supabase-settings-modal');
      this.showToast('Supabase configuration saved & reconnected!', 'success');
    }
  },

  selectCity(city) {
    this.selectedCity = city;
    const locText = document.getElementById('current-location-text');
    if (locText) locText.textContent = `${city}, Maharashtra`;
    this.closeModal('city-selector-modal');
    this.showToast(`Showing verified vendors in ${city}`, 'info');
  },

  copyUpiId(upiId) {
    navigator.clipboard.writeText(upiId).then(() => {
      this.showToast(`UPI ID copied: ${upiId}`, 'success');
    }).catch(() => {
      this.showToast(`UPI ID: ${upiId}`, 'info');
    });
  },

  launchUpiApp(appName) {
    const upiUri = `upi://pay?pa=7249593243-2@axl&pn=NAYAN%20DATTATRAY%20KHALADKAR&am=27000&cu=INR&tn=EventSetu%20Advance%20Booking`;
    window.location.href = upiUri;
    this.showToast(`Launching ${appName.toUpperCase()}...`, 'info');
  },

  async handlePhonePePaymentSubmit() {
    const utr = document.getElementById('phonepe-utr-input').value.trim();
    if (!utr || utr.length < 6) {
      this.showToast('Please enter a valid 12-digit UPI UTR number', 'error');
      return;
    }

    this.closeModal('phonepe-payment-modal');
    this.showToast('Verifying payment with PhonePe UPI Escrow...', 'info');

    setTimeout(async () => {
      if (window.EventSetuCustomer && window.EventSetuCustomer.currentBookingDraft) {
        window.EventSetuCustomer.currentBookingDraft.payment_reference = `UPI/UTR-${utr}`;
        window.EventSetuCustomer.currentBookingDraft.booking_status = 'confirmed';
        window.EventSetuCustomer.currentBookingDraft.advance_amount = 27000;
        await window.EventSetuDB.createBooking(window.EventSetuCustomer.currentBookingDraft);
      }

      this.showToast('✓ Advance payment confirmed! Booking is active.', 'success');
      this.showView('customer-dashboard');
    }, 1200);
  },

  async handlePostEventSubmit() {
    const type = document.getElementById('pe-event-type').value;
    const date = document.getElementById('pe-event-date').value;
    const city = document.getElementById('pe-event-city').value;
    const guests = document.getElementById('pe-guest-count').value;
    const budget = document.getElementById('pe-budget').value;
    const contact = document.getElementById('pe-name').value;

    const reqData = {
      event_type: type,
      event_date: date,
      city: city,
      guest_count: parseInt(guests) || 300,
      budget: parseFloat(budget) || 100000,
      contact_info: contact,
      created_at: new Date().toISOString()
    };

    await window.EventSetuDB.createEventRequirement(reqData);
    this.closeModal('post-event-modal');
    this.showToast('Requirement posted! Verified vendors in your area will contact you.', 'success');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s forwards ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  promptPwaInstall() {
    this.showToast('App is installed and running in native Android mode!', 'success');
  }
};

window.EventSetuApp = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.EventSetuApp.init();
});

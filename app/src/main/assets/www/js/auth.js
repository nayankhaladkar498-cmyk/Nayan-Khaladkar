// ==============================================================================
// EventSetu - Authentication, Session Cache & Role Manager
// High-reliability Supabase local storage session caching for PWA & page refreshes
// ==============================================================================

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'eventsetu_current_user',
  SUPABASE_SESSION: 'eventsetu_supabase_session',
  AUTH_TOKEN: 'eventsetu_auth_token',
  CACHED_AT: 'eventsetu_session_cached_at',
  USERS_DB: 'eventsetu_users'
};

const DEMO_USERS = [
  {
    id: 'u_cust_1',
    email: 'rohit@example.com',
    full_name: 'Rohit Sharma',
    mobile: '9876543210',
    role: 'customer'
  },
  {
    id: 'u_vend_1',
    email: 'anand@royalphoto.com',
    full_name: 'Anand Patil',
    mobile: '9822019988',
    role: 'vendor'
  },
  {
    id: 'u_admin_1',
    email: 'admin@eventsetu.in',
    full_name: 'EventSetu Admin',
    mobile: '9000000000',
    role: 'admin'
  }
];

class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentSession = null;
    this.authListenerAttached = false;
    this.isInitializing = false;

    // 1. Instant Synchronous Hydration from Local Storage (0ms delay on refresh / PWA launch)
    this.hydrateFromStorage();

    // 2. Ensure initial fallback users exist in localStorage
    if (!localStorage.getItem(AUTH_STORAGE_KEYS.USERS_DB)) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEYS.USERS_DB, JSON.stringify(DEMO_USERS));
      } catch (e) {
        console.warn('Could not seed local users in localStorage:', e);
      }
    }

    // 3. Initiate asynchronous Supabase session restoration and event listeners
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        setTimeout(() => this.init(), 0);
      }
    }
  }

  /**
   * Synchronously loads cached session & user profile from LocalStorage
   */
  hydrateFromStorage() {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (err) {
      console.warn('Error reading cached user from localStorage:', err);
      this.currentUser = null;
    }

    try {
      const storedSession = localStorage.getItem(AUTH_STORAGE_KEYS.SUPABASE_SESSION);
      if (storedSession) {
        this.currentSession = JSON.parse(storedSession);
      }
    } catch (err) {
      console.warn('Error reading cached session from localStorage:', err);
      this.currentSession = null;
    }
  }

  /**
   * Resolves active Supabase client instance
   */
  getSupabaseClient() {
    if (window.EventSetuDB && window.EventSetuDB.client) {
      return window.EventSetuDB.client;
    }
    if (window.EventSetuConfig && window.EventSetuConfig.client) {
      return window.EventSetuConfig.client;
    }
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      const url = localStorage.getItem('eventsetu_supabase_url');
      const key = localStorage.getItem('eventsetu_supabase_key');
      if (url && key) {
        try {
          return window.supabase.createClient(url, key);
        } catch (e) {
          // ignore
        }
      }
    }
    return null;
  }

  /**
   * Initializes Supabase Auth listener & restores/validates persistent session
   */
  async init() {
    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      const client = this.getSupabaseClient();
      if (!client || !client.auth) {
        console.log('EventSetu Auth: Running in local interactive cached mode.');
        this.isInitializing = false;
        return;
      }

      // Attach Supabase Auth state listener if not already attached
      this.setupSupabaseAuthListener(client);

      // Verify active session with Supabase
      await this.restoreSupabaseSession(client);
    } catch (error) {
      console.warn('EventSetu Auth initialization error:', error);
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Sets up onAuthStateChange listener to continuously persist refreshed tokens
   */
  setupSupabaseAuthListener(client) {
    if (this.authListenerAttached || !client || !client.auth) return;

    try {
      client.auth.onAuthStateChange(async (event, session) => {
        console.log('Supabase Auth State Change Event:', event);

        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED')) {
          this.currentSession = session;
          
          let profile = this.currentUser;
          // Attempt to load full profile if we only have minimal session user
          if (session.user) {
            try {
              const { data: dbProfile } = await client
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              profile = dbProfile || {
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Event User',
                mobile: session.user.user_metadata?.mobile || '',
                role: session.user.user_metadata?.role || (this.currentUser?.role || 'customer')
              };
            } catch (fetchErr) {
              profile = {
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || 'Event User',
                mobile: session.user.user_metadata?.mobile || '',
                role: session.user.user_metadata?.role || 'customer'
              };
            }
          }

          this.saveSessionToCache(session, profile);
          if (window.EventSetuApp && typeof window.EventSetuApp.updateUserNav === 'function') {
            window.EventSetuApp.updateUserNav();
          }
        } else if (event === 'SIGNED_OUT') {
          // If explicit signed out event from Supabase, clear cached live session
          if (this.currentSession) {
            this.clearSessionCache();
            if (window.EventSetuApp && typeof window.EventSetuApp.updateUserNav === 'function') {
              window.EventSetuApp.updateUserNav();
            }
          }
        }
      });

      this.authListenerAttached = true;
    } catch (err) {
      console.warn('Error setting up Supabase auth listener:', err);
    }
  }

  /**
   * Validates Supabase session or restores it from cached refresh token
   */
  async restoreSupabaseSession(client) {
    try {
      const { data, error } = await client.auth.getSession();
      
      if (!error && data && data.session) {
        this.currentSession = data.session;
        let profile = this.currentUser;

        if (data.session.user) {
          try {
            const { data: dbProfile } = await client
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .maybeSingle();

            if (dbProfile) profile = dbProfile;
          } catch (e) {
            // fallback
          }
        }

        this.saveSessionToCache(data.session, profile);
        console.log('Supabase session restored & validated from local storage cache.');
        return;
      }

      // If Supabase returned no session, check if we have a valid cached session with refresh token
      if (this.currentSession && this.currentSession.refresh_token) {
        console.log('Attempting to recover Supabase session from cached refresh token...');
        const { data: refreshData, error: refreshError } = await client.auth.refreshSession({
          refresh_token: this.currentSession.refresh_token
        });

        if (!refreshError && refreshData && refreshData.session) {
          this.saveSessionToCache(refreshData.session, this.currentUser);
          console.log('Supabase session successfully refreshed and cached.');
        }
      }
    } catch (e) {
      console.warn('Offline or network warning during Supabase session restoration; maintaining local cached session:', e);
      // Retain this.currentUser and this.currentSession so user stays logged in offline / PWA relaunch
    }
  }

  /**
   * Persists session and profile into localStorage with safe JSON encoding
   */
  saveSessionToCache(session, userProfile) {
    try {
      if (session) {
        this.currentSession = session;
        localStorage.setItem(AUTH_STORAGE_KEYS.SUPABASE_SESSION, JSON.stringify(session));
        if (session.access_token) {
          localStorage.setItem(AUTH_STORAGE_KEYS.AUTH_TOKEN, session.access_token);
        }
        localStorage.setItem(AUTH_STORAGE_KEYS.CACHED_AT, Date.now().toString());
      }

      if (userProfile) {
        this.currentUser = userProfile;
        localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(userProfile));
      }
    } catch (err) {
      console.error('Failed to write auth session to localStorage:', err);
    }
  }

  /**
   * Removes cached session and credentials from localStorage
   */
  clearSessionCache() {
    this.currentUser = null;
    this.currentSession = null;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(AUTH_STORAGE_KEYS.SUPABASE_SESSION);
      localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.CACHED_AT);
    } catch (e) {
      console.warn('Error clearing auth cache:', e);
    }
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getSession() {
    if (!this.currentSession) {
      this.hydrateFromStorage();
    }
    return this.currentSession;
  }

  getAccessToken() {
    if (this.currentSession && this.currentSession.access_token) {
      return this.currentSession.access_token;
    }
    return localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN) || null;
  }

  getRole() {
    return this.currentUser ? this.currentUser.role : 'guest';
  }

  isTokenExpired() {
    if (!this.currentSession || !this.currentSession.expires_at) return false;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    // Return true if expired or within 60 seconds of expiration
    return this.currentSession.expires_at <= (nowInSeconds + 60);
  }

  /**
   * Explicitly refreshes the Supabase token if needed
   */
  async refreshSession() {
    const client = this.getSupabaseClient();
    if (!client || !client.auth) return null;

    try {
      const session = this.getSession();
      if (!session || !session.refresh_token) return null;

      const { data, error } = await client.auth.refreshSession({
        refresh_token: session.refresh_token
      });

      if (!error && data && data.session) {
        this.saveSessionToCache(data.session, this.currentUser);
        return data.session;
      }
    } catch (e) {
      console.warn('Error during manual session refresh:', e);
    }
    return null;
  }

  /**
   * Login with email and password
   */
  async login(email, password, requiredRole = null) {
    const cleanEmail = (email || '').trim();
    const client = this.getSupabaseClient();

    // 1. Live Supabase Auth
    if (client && client.auth) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (error) throw error;

        if (data && data.user) {
          let profile = null;
          try {
            const { data: dbProfile } = await client
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            profile = dbProfile;
          } catch (e) {
            console.warn('Could not load user row from DB:', e);
          }

          if (!profile) {
            profile = {
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0] || 'Event User',
              mobile: data.user.user_metadata?.mobile || '',
              role: data.user.user_metadata?.role || (requiredRole || 'customer')
            };
          }

          if (requiredRole && profile.role !== requiredRole && profile.role !== 'admin') {
            return {
              success: false,
              message: `Access denied. This account has the role "${profile.role}", but "${requiredRole}" is required.`
            };
          }

          // Persist both session and user profile to LocalStorage
          this.saveSessionToCache(data.session, profile);

          return { success: true, user: this.currentUser, session: this.currentSession };
        }
      } catch (err) {
        console.warn('Supabase Auth failed, checking local demo database:', err);
      }
    }

    // 2. Local Demo Mock Auth Fallback
    try {
      const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.USERS_DB) || '[]');
      let user = users.find(u => (u.email || '').toLowerCase() === cleanEmail.toLowerCase());

      if (user) {
        if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
          return {
            success: false,
            message: `Access denied. This account has role "${user.role}", not "${requiredRole}".`
          };
        }
        this.saveSessionToCache(null, user);
        return { success: true, user: this.currentUser };
      }
    } catch (e) {
      console.warn('Error reading local users database:', e);
    }

    return {
      success: false,
      message: 'Account not found. Please register or select Fast Demo below.'
    };
  }

  async loginCustomer(email, password) {
    return this.login(email, password, 'customer');
  }

  async loginVendor(email, password) {
    return this.login(email, password, 'vendor');
  }

  async loginAdmin(email, password) {
    return this.login(email, password, 'admin');
  }

  /**
   * Role-based authorization checker
   */
  canAccessView(viewName) {
    const role = this.getRole();
    if (viewName === 'admin-dashboard') {
      return role === 'admin';
    }
    if (viewName === 'vendor-dashboard') {
      return role === 'vendor' || role === 'admin';
    }
    return true; // customer and public views are open
  }

  /**
   * Register a new customer
   */
  async registerCustomer({ fullName, email, mobile, password }) {
    const cleanEmail = (email || '').trim();
    const cleanName = (fullName || '').trim();
    const cleanMobile = (mobile || '').trim();
    const client = this.getSupabaseClient();

    // 1. Live Supabase signup
    if (client && client.auth) {
      try {
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: cleanName,
              mobile: cleanMobile,
              role: 'customer'
            }
          }
        });

        if (error) throw error;
        if (data && data.user) {
          const userProfile = {
            id: data.user.id,
            email: cleanEmail,
            full_name: cleanName,
            mobile: cleanMobile,
            role: 'customer'
          };

          // Save user record in public users table if possible
          try {
            await client.from('users').upsert(userProfile);
          } catch (e) {
            // ignore
          }

          this.saveSessionToCache(data.session, userProfile);
          return { success: true, user: userProfile, session: data.session };
        }
      } catch (err) {
        console.warn('Supabase customer signup error, registering locally:', err);
      }
    }

    // 2. Local Storage Mock Registration
    const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.USERS_DB) || '[]');
    const newUser = {
      id: 'u_cust_' + Date.now(),
      email: cleanEmail,
      full_name: cleanName,
      mobile: cleanMobile,
      role: 'customer'
    };
    users.push(newUser);
    localStorage.setItem(AUTH_STORAGE_KEYS.USERS_DB, JSON.stringify(users));

    this.saveSessionToCache(null, newUser);
    return { success: true, user: newUser };
  }

  /**
   * Register a new vendor
   */
  async registerVendor({ ownerName, businessName, email, mobile, category, password }) {
    const cleanEmail = (email || '').trim();
    const cleanOwner = (ownerName || '').trim();
    const cleanBiz = (businessName || '').trim();
    const cleanMobile = (mobile || '').trim();
    const client = this.getSupabaseClient();

    let userId = 'u_vend_' + Date.now();
    let session = null;

    // 1. Live Supabase Signup
    if (client && client.auth) {
      try {
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: cleanOwner,
              business_name: cleanBiz,
              mobile: cleanMobile,
              role: 'vendor'
            }
          }
        });

        if (error) throw error;
        if (data && data.user) {
          userId = data.user.id;
          session = data.session;
        }
      } catch (err) {
        console.warn('Supabase vendor registration error, registering locally:', err);
      }
    }

    const newUser = {
      id: userId,
      email: cleanEmail,
      full_name: cleanOwner,
      business_name: cleanBiz,
      mobile: cleanMobile,
      role: 'vendor'
    };

    // Save in local users db
    const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.USERS_DB) || '[]');
    users.push(newUser);
    localStorage.setItem(AUTH_STORAGE_KEYS.USERS_DB, JSON.stringify(users));

    // Create draft vendor profile in database engine
    if (window.EventSetuDB && typeof window.EventSetuDB.saveVendorProfile === 'function') {
      await window.EventSetuDB.saveVendorProfile({
        user_id: userId,
        business_name: cleanBiz,
        owner_name: cleanOwner,
        category: category,
        mobile: cleanMobile,
        city: 'Pune',
        description: 'Newly registered vendor on EventSetu.',
        upi_id: '7249593243-2@axl',
        payee_name: 'NAYAN DATTATRAY KHALADKAR',
        is_approved: false, // Requires admin verification
        is_active: true
      });
    }

    this.saveSessionToCache(session, newUser);
    return { success: true, user: newUser, session: session };
  }

  /**
   * Fast Demo Switcher for seamless testing
   */
  switchDemoRole(role) {
    const user = DEMO_USERS.find(u => u.role === role);
    if (user) {
      this.saveSessionToCache(null, user);
      if (window.EventSetuApp && typeof window.EventSetuApp.updateUserNav === 'function') {
        window.EventSetuApp.updateUserNav();
      }
    }
  }

  /**
   * Log out and purge cached session & credentials
   */
  async logout() {
    const client = this.getSupabaseClient();
    if (client && client.auth) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Error during Supabase sign out:', e);
      }
    }

    this.clearSessionCache();
    window.location.reload();
  }
}

// Global Singleton Initialization
window.EventSetuAuth = new AuthService();

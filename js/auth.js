// ==============================================================================
// EventSetu - Authentication & Session Management
// ==============================================================================

const Auth = {
  currentUser: null,

  init() {
    // Restore session
    const saved = localStorage.getItem('eventsetu_auth_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }
  },

  getCurrentUser() {
    return this.currentUser;
  },

  isLoggedIn() {
    return !!this.currentUser;
  },

  getRole() {
    return this.currentUser ? this.currentUser.role : 'guest';
  },

  async login(email, password) {
    email = email.trim().toLowerCase();
    
    // Live Supabase Auth
    if (window.EventSetuConfig.isLiveSupabase) {
      try {
        const { data, error } = await window.EventSetuConfig.client.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        // Fetch profile
        const { data: profileData, error: profileErr } = await window.EventSetuConfig.client
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profileData) throw new Error('Profile record not found.');
        
        this.currentUser = {
          id: data.user.id,
          email: data.user.email,
          full_name: profileData.full_name,
          role: profileData.role,
          mobile: profileData.mobile || ''
        };

        // If vendor, attach vendor_profile id
        if (profileData.role === 'vendor') {
          const vp = await window.EventSetuDB.getVendorByUserId(data.user.id);
          this.currentUser.vendorProfile = vp;
        }

        localStorage.setItem('eventsetu_auth_user', JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser };
      } catch (err) {
        console.error('Supabase login error:', err);
        return { success: false, message: err.message || 'Login failed' };
      }
    }

    // Local Interactive Auth Check
    const localStore = JSON.parse(localStorage.getItem('eventsetu_local_db_v1') || '{}');
    const profiles = localStore.profiles || [];
    
    // Check known test credentials or registered profiles
    const user = profiles.find(p => p.email.toLowerCase() === email);
    if (!user) {
      return { success: false, message: 'Invalid email or user not found. Please register first or use demo accounts.' };
    }

    this.currentUser = { ...user };
    if (user.role === 'vendor') {
      const vp = (localStore.vendor_profiles || []).find(v => v.user_id === user.id);
      this.currentUser.vendorProfile = vp || null;
    }

    localStorage.setItem('eventsetu_auth_user', JSON.stringify(this.currentUser));
    return { success: true, user: this.currentUser };
  },

  async registerCustomer({ fullName, email, mobile, password }) {
    email = email.trim().toLowerCase();

    if (window.EventSetuConfig.isLiveSupabase) {
      try {
        const { data, error } = await window.EventSetuConfig.client.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              mobile: mobile,
              role: 'customer'
            }
          }
        });
        if (error) throw error;

        // Upsert profile
        const newProfile = {
          id: data.user.id,
          full_name: fullName,
          email: email,
          mobile: mobile,
          role: 'customer'
        };

        await window.EventSetuConfig.client.from('profiles').upsert([newProfile]);

        this.currentUser = newProfile;
        localStorage.setItem('eventsetu_auth_user', JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser };
      } catch (err) {
        console.error('Supabase customer registration error:', err);
        return { success: false, message: err.message || 'Registration failed' };
      }
    }

    // Local Registration
    const localStore = JSON.parse(localStorage.getItem('eventsetu_local_db_v1') || '{}');
    if (!localStore.profiles) localStore.profiles = [];

    if (localStore.profiles.some(p => p.email.toLowerCase() === email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUserId = 'usr-cust-' + Date.now();
    const newUser = {
      id: newUserId,
      full_name: fullName,
      email: email,
      mobile: mobile,
      role: 'customer',
      avatar_url: ''
    };

    localStore.profiles.push(newUser);
    localStorage.setItem('eventsetu_local_db_v1', JSON.stringify(localStore));

    this.currentUser = newUser;
    localStorage.setItem('eventsetu_auth_user', JSON.stringify(this.currentUser));
    return { success: true, user: this.currentUser };
  },

  async registerVendor({ ownerName, businessName, email, mobile, category, password }) {
    email = email.trim().toLowerCase();

    if (window.EventSetuConfig.isLiveSupabase) {
      try {
        const { data, error } = await window.EventSetuConfig.client.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: ownerName,
              mobile: mobile,
              role: 'vendor'
            }
          }
        });
        if (error) throw error;

        const userId = data.user.id;
        const profileRecord = {
          id: userId,
          full_name: ownerName,
          email: email,
          mobile: mobile,
          role: 'vendor'
        };

        await window.EventSetuConfig.client.from('profiles').upsert([profileRecord]);

        // Create initial pending vendor profile
        const vendorRecord = {
          user_id: userId,
          owner_name: ownerName,
          business_name: businessName,
          email: email,
          mobile: mobile,
          category: category,
          city: 'Pune',
          is_approved: false,
          is_active: true
        };

        const { data: vpData } = await window.EventSetuConfig.client
          .from('vendor_profiles')
          .insert([vendorRecord])
          .select();

        this.currentUser = {
          ...profileRecord,
          vendorProfile: vpData ? vpData[0] : null
        };

        localStorage.setItem('eventsetu_auth_user', JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser };
      } catch (err) {
        console.error('Supabase vendor registration error:', err);
        return { success: false, message: err.message || 'Vendor registration failed' };
      }
    }

    // Local Registration
    const localStore = JSON.parse(localStorage.getItem('eventsetu_local_db_v1') || '{}');
    if (!localStore.profiles) localStore.profiles = [];
    if (!localStore.vendor_profiles) localStore.vendor_profiles = [];

    if (localStore.profiles.some(p => p.email.toLowerCase() === email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUserId = 'usr-vend-' + Date.now();
    const newUser = {
      id: newUserId,
      full_name: ownerName,
      email: email,
      mobile: mobile,
      role: 'vendor',
      avatar_url: ''
    };

    const newVendorProfile = {
      id: 'vp-' + Date.now(),
      user_id: newUserId,
      business_name: businessName,
      owner_name: ownerName,
      description: 'Newly registered event service provider. Profile details pending verification.',
      category: category,
      mobile: mobile,
      location: 'Pune',
      city: 'Pune',
      address: '',
      upi_id: '',
      profile_photo: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80',
      is_approved: false,
      is_active: true,
      created_at: new Date().toISOString()
    };

    localStore.profiles.push(newUser);
    localStore.vendor_profiles.push(newVendorProfile);
    localStorage.setItem('eventsetu_local_db_v1', JSON.stringify(localStore));

    this.currentUser = {
      ...newUser,
      vendorProfile: newVendorProfile
    };

    localStorage.setItem('eventsetu_auth_user', JSON.stringify(this.currentUser));
    return { success: true, user: this.currentUser };
  },

  async logout() {
    if (window.EventSetuConfig.isLiveSupabase && window.EventSetuConfig.client) {
      try {
        await window.EventSetuConfig.client.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    this.currentUser = null;
    localStorage.removeItem('eventsetu_auth_user');
    window.location.reload();
  },

  // Quick switch for demo testing
  switchDemoRole(role) {
    const localStore = JSON.parse(localStorage.getItem('eventsetu_local_db_v1') || '{}');
    const target = (localStore.profiles || []).find(p => p.role === role);
    if (target) {
      this.currentUser = { ...target };
      if (role === 'vendor') {
        this.currentUser.vendorProfile = (localStore.vendor_profiles || []).find(v => v.user_id === target.id);
      }
      localStorage.setItem('eventsetu_auth_user', JSON.stringify(this.currentUser));
      return true;
    }
    return false;
  }
};

Auth.init();
window.EventSetuAuth = Auth;

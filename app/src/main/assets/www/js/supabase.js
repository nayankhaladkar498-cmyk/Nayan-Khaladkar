// ==============================================================================
// EventSetu - Supabase Client & Enhanced Mock Storage Layer
// Pre-configured for Maharashtra Venues & Event Marketplace
// ==============================================================================

const SUPABASE_DEFAULT_CONFIG = {
  url: '',
  anonKey: '',
  commissionPercentage: 10,
  defaultUpiId: '7249593243-2@axl',
  defaultPayeeName: 'NAYAN DATTATRAY KHALADKAR'
};

// Initial Seed Data mirroring Maharashtra's premier event services
const INITIAL_SEED_DATA = {
  categories: [
    { id: 'cat_venue', name: 'Venues', icon: '🏢', bg: '#fee2e2', color: '#ef4444', description: 'Banquet halls, Lawns, Resorts & Conventions' },
    { id: 'cat_wedding', name: 'Wedding', icon: '💍', bg: '#fee2e2', color: '#ef4444', description: 'Complete Wedding Planning & Mandap Setups' },
    { id: 'cat_birthday', name: 'Birthday', icon: '🎂', bg: '#fef3c7', color: '#f59e0b', description: 'Theme setups, Balloon arches & Kids entertainment' },
    { id: 'cat_corporate', name: 'Corporate', icon: '💼', bg: '#e0f2fe', color: '#0284c7', description: 'Conferences, Annual meets & Product launches' },
    { id: 'cat_engagement', name: 'Engagement', icon: '💜', bg: '#f3e8ff', color: '#9333ea', description: 'Roka, Ring ceremony & Cocktail parties' },
    { id: 'cat_exhibitions', name: 'Exhibitions', icon: '🏪', bg: '#dcfce7', color: '#10b981', description: 'Expo stalls, Truss setups & Trade shows' },
    { id: 'cat_photo', name: 'Photographer', icon: '📸', bg: '#e0e7ff', color: '#4f46e5', description: 'Wedding, Pre-wedding, Candid photography' },
    { id: 'cat_decor', name: 'Decoration', icon: '🌸', bg: '#fce7f3', color: '#ec4899', description: 'Stage decor, Mandap, Floral, Balloon' },
    { id: 'cat_caterer', name: 'Caterer', icon: '🍽️', bg: '#ffedd5', color: '#ea580c', description: 'Maharashtrian, North Indian, Live buffet' },
    { id: 'cat_dj', name: 'DJ & Music', icon: '🎧', bg: '#ede9fe', color: '#7c3aed', description: 'Sound system, High-bass DJ, Dhol-Tasha' }
  ],
  vendors: [
    {
      id: 'v_green_valley',
      user_id: 'u_vend_gv',
      business_name: 'Green Valley Lawn',
      owner_name: 'Nayan Khaladkar',
      mobile: '7249593243',
      category: 'Venues',
      sub_category: 'Lawn & Banquet',
      city: 'Pune',
      location: 'Hinjewadi, Pune',
      address: 'Near Phase 1 IT Park, Hinjewadi, Pune, Maharashtra 411057',
      description: 'Lush green open lawn spanning 35,000 sq.ft with luxury AC banquet hall, bride & groom suites, ample valet parking, and royal stage setup for 1200+ guests.',
      profile_photo: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80',
      upi_id: '7249593243-2@axl',
      payee_name: 'NAYAN DATTATRAY KHALADKAR',
      is_approved: true,
      is_active: true,
      is_featured: true,
      created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
      vendor_services: [
        { id: 'vs_gv_pkg', service_name: 'Premium Venue Package', price: 75000, price_type: 'per_day', description: 'Main Lawn + AC Banquet Hall + 2 Luxury Green Rooms + Generator Backup' },
        { id: 'vs_gv_cat', service_name: 'Catering: Premium Veg Menu', price: 25000, price_type: 'starting_from', description: 'Authentic Maharashtrian & North Indian Buffet with Live Chaat & Sweets' },
        { id: 'vs_gv_dec', service_name: 'Decoration: Royal Flower Decoration', price: 15000, price_type: 'starting_from', description: 'Grand Entrance Arch, 40ft Royal Stage Decor, LED Mood Lighting' },
        { id: 'vs_gv_pho', service_name: 'Photography: Full Day Photography', price: 20000, price_type: 'fixed', description: '2 Candid Photographers, 1 Traditional, Softcopies + Edited Album' }
      ],
      vendor_gallery: [
        { id: 'vg_gv_1', image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80' },
        { id: 'vg_gv_2', image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80' },
        { id: 'vg_gv_3', image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80' }
      ],
      reviews: [
        { id: 'r_gv_1', customer_name: 'Rahul Deshmukh', rating: 5, review: 'We had our sister wedding here. The lawn management, lighting, and spacious parking made the event seamless!', created_at: '2026-03-01' },
        { id: 'r_gv_2', customer_name: 'Snehal Kulkarni', rating: 4, review: 'Very clean lawns and helpful staff. Highly recommended in Hinjewadi.', created_at: '2026-02-14' }
      ]
    },
    {
      id: 'v_royal_palace',
      user_id: 'u_vend_rp',
      business_name: 'Royal Palace Banquet',
      owner_name: 'Vikram Shinde',
      mobile: '9822011223',
      category: 'Venues',
      sub_category: 'AC Banquet Hall',
      city: 'Pune',
      location: 'Baner, Pune',
      address: 'Main Baner Road, Near High Street, Baner, Pune 411045',
      description: 'Opulent crystal chandelier banquet hall with central AC, modern acoustic sound, Italian marble flooring, and seating capacity of 800 guests.',
      profile_photo: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop&q=80',
      upi_id: '7249593243-2@axl',
      payee_name: 'NAYAN DATTATRAY KHALADKAR',
      is_approved: true,
      is_active: true,
      is_featured: true,
      created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
      vendor_services: [
        { id: 'vs_rp_1', service_name: 'Full Day Grand Banquet Booking', price: 75000, price_type: 'per_day', description: 'Central AC, Stage Lighting, Dining Hall, 4 Changing Rooms' }
      ],
      vendor_gallery: [
        { id: 'vg_rp_1', image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop&q=80' }
      ],
      reviews: [
        { id: 'r_rp_1', customer_name: 'Amit Joshi', rating: 5, review: 'Breathtaking interior and lavish ambience in Baner!', created_at: '2026-01-20' }
      ]
    },
    {
      id: 'v_skyline_conv',
      user_id: 'u_vend_sc',
      business_name: 'Skyline Convention',
      owner_name: 'Pradeep Mehta',
      mobile: '9890123344',
      category: 'Venues',
      sub_category: 'Convention & Expo Center',
      city: 'Pune',
      location: 'Kharadi, Pune',
      address: 'World Trade Center Road, Kharadi, Pune 411014',
      description: 'Mega convention center for grand weddings, exhibitions, corporate galas, and product launches with 2000+ guest capacity.',
      profile_photo: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
      upi_id: '7249593243-2@axl',
      payee_name: 'NAYAN DATTATRAY KHALADKAR',
      is_approved: true,
      is_active: true,
      is_featured: true,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      vendor_services: [
        { id: 'vs_sc_1', service_name: 'Convention Main Hall Rental', price: 60000, price_type: 'per_day', description: 'Spacious hall with LED Video Wall & sound system' }
      ],
      vendor_gallery: [
        { id: 'vg_sc_1', image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80' }
      ],
      reviews: [
        { id: 'r_sc_1', customer_name: 'Priyanka Patil', rating: 5, review: 'Superb architecture and grand feeling for big family events.', created_at: '2026-02-28' }
      ]
    },
    {
      id: 'v_101',
      user_id: 'u_vend_1',
      business_name: 'Royal Heritage Photography & Films',
      owner_name: 'Anand Patil',
      mobile: '9822019988',
      category: 'Photographer',
      sub_category: 'Wedding Photography',
      city: 'Pune',
      location: 'Kothrud & Baner, Pune',
      address: 'Shop 14, Heritage Plaza, FC Road, Pune',
      description: 'Specializing in cinematic Maharashtrian weddings, candid photography, drone captures, and luxury albums with 10+ years experience.',
      profile_photo: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&auto=format&fit=crop&q=80',
      upi_id: '7249593243-2@axl',
      payee_name: 'NAYAN DATTATRAY KHALADKAR',
      is_approved: true,
      is_active: true,
      is_featured: false,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      vendor_services: [
        { id: 'vs_1', service_name: 'Full Wedding Candid Photography', price: 35000, price_type: 'per_event', description: '2 Candid Photographers, 1 Traditional, Raw & Edited Softcopies' },
        { id: 'vs_2', service_name: 'Pre-Wedding Cinematic Shoot', price: 18000, price_type: 'fixed', description: '1 Day Outdoor shoot with Drone & 3 min teaser film' },
        { id: 'vs_3', service_name: 'Premium Leather Album (40 Pages)', price: 8000, price_type: 'fixed', description: 'High-gloss velvet touch pages with presentation box' }
      ],
      vendor_gallery: [
        { id: 'vg_1', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80' },
        { id: 'vg_2', image_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80' }
      ],
      reviews: [
        { id: 'r_1', customer_name: 'Siddharth Deshmukh', rating: 5, review: 'Fantastic photos and candid captures! Very punctual and cooperative team.', created_at: '2026-02-10' }
      ]
    },
    {
      id: 'v_102',
      user_id: 'u_vend_2',
      business_name: 'Siddhi Mandap & Royal Decorators',
      owner_name: 'Ganesh Shinde',
      mobile: '9890123456',
      category: 'Decoration',
      sub_category: 'Mandap & Stage Decor',
      city: 'Pune',
      location: 'Wakad & PCMC, Pune',
      address: 'Plot 42, Sector 24, Pradhikaran, Nigdi, Pune',
      description: 'Luxury flower stage decoration, authentic temple mandaps, theme reception entries, and designer lights.',
      profile_photo: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80',
      upi_id: '7249593243-2@axl',
      payee_name: 'NAYAN DATTATRAY KHALADKAR',
      is_approved: true,
      is_active: true,
      is_featured: false,
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      vendor_services: [
        { id: 'vs_4', service_name: 'Traditional Royal Mandap & Stage Decor', price: 45000, price_type: 'starting_from', description: 'Fresh Marigold/Rose setup, Velvet backdrop, Entrance arch & walkway' },
        { id: 'vs_5', service_name: 'Haldi & Mehendi Floral Backdrop', price: 15000, price_type: 'fixed', description: 'Marigold cascades, Jhula setup, Photo-booth with props' }
      ],
      vendor_gallery: [
        { id: 'vg_4', image_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80' }
      ],
      reviews: [
        { id: 'r_3', customer_name: 'Abhijit Gaikwad', rating: 5, review: 'The mandap decor was breathtaking. All our guests complimented the flowers.', created_at: '2026-03-01' }
      ]
    },
    {
      id: 'v_103',
      user_id: 'u_vend_3',
      business_name: 'Annapurna Maharashtrian & Multi-Catering',
      owner_name: 'Mrs. Sunita Jadhav',
      mobile: '9422034567',
      category: 'Caterer',
      sub_category: 'Wedding Catering',
      city: 'Pune',
      location: 'Shivajinagar & Hadapsar, Pune',
      address: 'Annapurna Bhavan, Pune-Solapur Road, Pune',
      description: 'Authentic Maharashtrian Pangat (Puran Poli, Ukadiche Modak, Basundi) and Live Buffet catering with hygiene certification.',
      profile_photo: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
      upi_id: '7249593243-2@axl',
      payee_name: 'NAYAN DATTATRAY KHALADKAR',
      is_approved: true,
      is_active: true,
      is_featured: false,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      vendor_services: [
        { id: 'vs_6', service_name: 'Deluxe Maharashtrian Pangat (Per Plate)', price: 450, price_type: 'per_day', description: 'Welcome drink, 2 Sweets (Puran Poli / Basundi), 3 Sabjis, Masale Bhaat' },
        { id: 'vs_7', service_name: 'Royal Wedding Buffet (Per Plate)', price: 750, price_type: 'per_day', description: 'Live Chaat counters, Continental + Traditional, 4 Desserts' }
      ],
      vendor_gallery: [
        { id: 'vg_6', image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80' }
      ],
      reviews: [
        { id: 'r_4', customer_name: 'Dr. Mahesh Joshi', rating: 5, review: 'Mouth watering food! Puran poli was pure ghee authentic taste.', created_at: '2026-02-18' }
      ]
    },
    {
      id: 'v_104',
      user_id: 'u_vend_4',
      business_name: 'DJ Beats & High-Bass Sound Setup',
      owner_name: 'Sameer More',
      mobile: '9823123456',
      category: 'DJ & Music',
      sub_category: 'DJ & Sound System',
      city: 'Pune',
      location: 'Kalyani Nagar & Viman Nagar, Pune',
      address: 'Unit 9, Sound Waves Studio, Koregaon Park Road, Pune',
      description: 'JBL VRX Line Array sound system, Sharpy stage lighting, Smoke lasers, and Bollywood/Marathi/EDM DJ tracks.',
      profile_photo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
      upi_id: '7249593243-2@axl',
      payee_name: 'NAYAN DATTATRAY KHALADKAR',
      is_approved: true,
      is_active: true,
      is_featured: false,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      vendor_services: [
        { id: 'vs_8', service_name: 'Complete Sangeet & Reception DJ Package', price: 22000, price_type: 'per_event', description: '4 JBL Tops, 2 Bass, 6 Sharpy lights, Truss, Fog machine & Pro DJ' }
      ],
      vendor_gallery: [
        { id: 'vg_8', image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80' }
      ],
      reviews: [
        { id: 'r_5', customer_name: 'Nitin Salunkhe', rating: 5, review: 'Danced until midnight! Great track selection and heavy bass.', created_at: '2026-03-05' }
      ]
    }
  ],
  bookings: [
    {
      id: 'bk_sample_101',
      customer_id: 'u_cust_1',
      vendor_id: 'v_green_valley',
      service_id: 'vs_gv_pkg',
      service_name: 'Premium Package + Catering + Decor + Photography',
      event_name: 'Wedding Ceremony & Grand Reception',
      event_type: 'Wedding',
      event_date: '2026-05-25',
      event_time: '06:00 PM',
      guest_count: 300,
      event_location: 'Green Valley Lawn, Hinjewadi, Pune',
      notes: 'Royal floral theme with authentic Maharashtrian catering and candid drone coverage.',
      total_amount: 135000,
      advance_amount: 27000,
      commission_amount: 13500,
      vendor_amount: 121500,
      payment_status: 'paid',
      booking_status: 'accepted',
      payment_reference: 'UPI/2026/89472918',
      selected_services_breakdown: [
        { name: 'Catering', desc: 'Premium Veg Menu', price: 25000, icon: '🍽️' },
        { name: 'Decoration', desc: 'Royal Flower Decoration', price: 15000, icon: '🏛️' },
        { name: 'Photography', desc: 'Full Day Photography', price: 20000, icon: '📷' },
        { name: 'Venue Base', desc: 'Premium Lawn & Banquet Package', price: 75000, icon: '🏢' }
      ],
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ],
  users: [
    {
      id: 'u_cust_1',
      email: 'rohit@eventsetu.in',
      full_name: 'Rohit Sharma',
      mobile: '9822012345',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 'u_vend_gv',
      email: 'nayan@greenvalley.com',
      full_name: 'Nayan Khaladkar',
      mobile: '7249593243',
      role: 'vendor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    {
      id: 'u_admin_1',
      email: 'admin@eventsetu.in',
      full_name: 'EventSetu Admin',
      mobile: '9999988888',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'
    }
  ]
};

// Database Access & Persistence Engine
const DatabaseEngine = {
  config: { ...SUPABASE_DEFAULT_CONFIG },
  client: null,
  isLiveSupabase: false,

  init() {
    const savedUrl = localStorage.getItem('eventsetu_supabase_url');
    const savedKey = localStorage.getItem('eventsetu_supabase_key');
    const savedCommission = localStorage.getItem('eventsetu_commission');

    if (savedUrl && savedKey) {
      this.config.url = savedUrl;
      this.config.anonKey = savedKey;
      this.setupSupabaseClient();
    } else {
      this.initLocalStorageSeed();
    }

    if (savedCommission) {
      this.config.commissionPercentage = parseFloat(savedCommission) || 10;
    }
  },

  setupSupabaseClient() {
    try {
      if (window.supabase && this.config.url && this.config.anonKey) {
        this.client = window.supabase.createClient(this.config.url, this.config.anonKey);
        this.isLiveSupabase = true;
        this.config.client = this.client;
        this.config.isLiveSupabase = true;
        console.log('EventSetu connected to live Supabase project!');
        if (window.EventSetuAuth && typeof window.EventSetuAuth.init === 'function') {
          window.EventSetuAuth.init();
        }
      }
    } catch (e) {
      console.warn('Could not initialize live Supabase client, using interactive local state:', e);
      this.isLiveSupabase = false;
      this.config.client = null;
      this.config.isLiveSupabase = false;
      this.initLocalStorageSeed();
    }
  },

  initLocalStorageSeed() {
    if (!localStorage.getItem('eventsetu_seeded_v3')) {
      localStorage.setItem('eventsetu_categories', JSON.stringify(INITIAL_SEED_DATA.categories));
      localStorage.setItem('eventsetu_vendors', JSON.stringify(INITIAL_SEED_DATA.vendors));
      localStorage.setItem('eventsetu_bookings', JSON.stringify(INITIAL_SEED_DATA.bookings));
      localStorage.setItem('eventsetu_users', JSON.stringify(INITIAL_SEED_DATA.users));
      localStorage.setItem('eventsetu_seeded_v3', 'true');
    }
  },

  saveCredentials(url, anonKey) {
    this.config.url = url;
    this.config.anonKey = anonKey;
    if (url && anonKey) {
      localStorage.setItem('eventsetu_supabase_url', url);
      localStorage.setItem('eventsetu_supabase_key', anonKey);
      this.setupSupabaseClient();
    } else {
      localStorage.removeItem('eventsetu_supabase_url');
      localStorage.removeItem('eventsetu_supabase_key');
      this.client = null;
      this.isLiveSupabase = false;
      this.initLocalStorageSeed();
    }
  },

  saveCommissionRate(rate) {
    const num = Math.min(Math.max(parseFloat(rate) || 10, 0), 50);
    this.config.commissionPercentage = num;
    localStorage.setItem('eventsetu_commission', num.toString());
    return num;
  },

  // ----------------- Categories -----------------
  async getCategories() {
    if (this.isLiveSupabase && this.client) {
      const { data, error } = await this.client.from('categories').select('*').order('name');
      if (!error && data && data.length > 0) return data;
    }
    const local = localStorage.getItem('eventsetu_categories');
    return local ? JSON.parse(local) : INITIAL_SEED_DATA.categories;
  },

  async addCategory(cat) {
    const newCat = {
      id: 'cat_' + Date.now(),
      name: cat.name,
      icon: cat.icon || '✨',
      description: cat.description || ''
    };
    if (this.isLiveSupabase && this.client) {
      await this.client.from('categories').insert(newCat);
    }
    const categories = await this.getCategories();
    categories.push(newCat);
    localStorage.setItem('eventsetu_categories', JSON.stringify(categories));
    return newCat;
  },

  // ----------------- Vendors -----------------
  async getVendors(filter = {}) {
    let vendors = [];
    if (this.isLiveSupabase && this.client) {
      let query = this.client.from('vendor_profiles').select('*, vendor_services(*), vendor_gallery(*), reviews(*)');
      if (filter.category && filter.category !== 'All') query = query.eq('category', filter.category);
      if (filter.city && filter.city !== 'All') query = query.ilike('city', `%${filter.city}%`);
      if (filter.onlyApproved !== false) query = query.eq('is_approved', true);
      const { data, error } = await query;
      if (!error && data) vendors = data;
    } else {
      const local = localStorage.getItem('eventsetu_vendors');
      vendors = local ? JSON.parse(local) : INITIAL_SEED_DATA.vendors;
    }

    if (filter.category && filter.category !== 'All') {
      vendors = vendors.filter(v => 
        (v.category && v.category.toLowerCase() === filter.category.toLowerCase()) ||
        (v.sub_category && v.sub_category.toLowerCase().includes(filter.category.toLowerCase()))
      );
    }

    if (filter.city && filter.city !== 'All') {
      vendors = vendors.filter(v => v.city && v.city.toLowerCase() === filter.city.toLowerCase());
    }

    if (filter.search && filter.search.trim()) {
      const term = filter.search.toLowerCase().trim();
      vendors = vendors.filter(v =>
        (v.business_name && v.business_name.toLowerCase().includes(term)) ||
        (v.category && v.category.toLowerCase().includes(term)) ||
        (v.location && v.location.toLowerCase().includes(term)) ||
        (v.description && v.description.toLowerCase().includes(term))
      );
    }

    if (filter.onlyApproved) {
      vendors = vendors.filter(v => v.is_approved);
    }

    return vendors;
  },

  async getVendorById(id) {
    if (this.isLiveSupabase && this.client) {
      const { data, error } = await this.client
        .from('vendor_profiles')
        .select('*, vendor_services(*), vendor_gallery(*), reviews(*)')
        .eq('id', id)
        .single();
      if (!error && data) return data;
    }
    const vendors = await this.getVendors({ onlyApproved: false });
    return vendors.find(v => v.id === id) || null;
  },

  async getVendorByUserId(userId) {
    const vendors = await this.getVendors({ onlyApproved: false });
    return vendors.find(v => v.user_id === userId) || null;
  },

  async updateVendorProfile(vendorId, updates) {
    if (this.isLiveSupabase && this.client) {
      await this.client.from('vendor_profiles').update(updates).eq('id', vendorId);
    }
    const vendors = await this.getVendors({ onlyApproved: false });
    const idx = vendors.findIndex(v => v.id === vendorId);
    if (idx !== -1) {
      vendors[idx] = { ...vendors[idx], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('eventsetu_vendors', JSON.stringify(vendors));
      return vendors[idx];
    }
    return null;
  },

  async addVendorService(vendorId, service) {
    const newService = {
      id: 'vs_' + Date.now(),
      vendor_id: vendorId,
      service_name: service.service_name,
      price: parseFloat(service.price) || 0,
      price_type: service.price_type || 'fixed',
      description: service.description || ''
    };
    if (this.isLiveSupabase && this.client) {
      await this.client.from('vendor_services').insert(newService);
    }
    const vendors = await this.getVendors({ onlyApproved: false });
    const v = vendors.find(item => item.id === vendorId);
    if (v) {
      if (!v.vendor_services) v.vendor_services = [];
      v.vendor_services.push(newService);
      localStorage.setItem('eventsetu_vendors', JSON.stringify(vendors));
    }
    return newService;
  },

  async deleteVendorService(serviceId, vendorId) {
    if (this.isLiveSupabase && this.client) {
      await this.client.from('vendor_services').delete().eq('id', serviceId);
    }
    const vendors = await this.getVendors({ onlyApproved: false });
    const v = vendors.find(item => item.id === vendorId);
    if (v && v.vendor_services) {
      v.vendor_services = v.vendor_services.filter(s => s.id !== serviceId);
      localStorage.setItem('eventsetu_vendors', JSON.stringify(vendors));
    }
    return true;
  },

  async addGalleryImage(vendorId, imageUrl) {
    const newImg = {
      id: 'vg_' + Date.now() + Math.floor(Math.random() * 100),
      vendor_id: vendorId,
      image_url: imageUrl,
      created_at: new Date().toISOString()
    };
    if (this.isLiveSupabase && this.client) {
      await this.client.from('vendor_gallery').insert(newImg);
    }
    const vendors = await this.getVendors({ onlyApproved: false });
    const v = vendors.find(item => item.id === vendorId);
    if (v) {
      if (!v.vendor_gallery) v.vendor_gallery = [];
      v.vendor_gallery.push(newImg);
      localStorage.setItem('eventsetu_vendors', JSON.stringify(vendors));
    }
    return newImg;
  },

  // ----------------- Bookings -----------------
  async getBookings() {
    if (this.isLiveSupabase && this.client) {
      const { data, error } = await this.client
        .from('bookings')
        .select('*, vendor_profiles(*), profiles(*)')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const local = localStorage.getItem('eventsetu_bookings');
    return local ? JSON.parse(local) : INITIAL_SEED_DATA.bookings;
  },

  async getBookingsForCustomer(customerId) {
    const all = await this.getBookings();
    return all.filter(b => b.customer_id === customerId);
  },

  async getBookingsForVendor(vendorId) {
    const all = await this.getBookings();
    return all.filter(b => b.vendor_id === vendorId);
  },

  async createBooking(booking) {
    const newBooking = {
      id: 'bk_' + Date.now(),
      ...booking,
      created_at: new Date().toISOString()
    };
    if (this.isLiveSupabase && this.client) {
      await this.client.from('bookings').insert(newBooking);
    }
    const all = await this.getBookings();
    all.unshift(newBooking);
    localStorage.setItem('eventsetu_bookings', JSON.stringify(all));
    return newBooking;
  },

  async updateBookingStatus(bookingId, updates) {
    if (this.isLiveSupabase && this.client) {
      await this.client.from('bookings').update(updates).eq('id', bookingId);
    }
    const all = await this.getBookings();
    const idx = all.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('eventsetu_bookings', JSON.stringify(all));
      return all[idx];
    }
    return null;
  },

  // ----------------- Reviews -----------------
  async addReview(review) {
    const newRev = {
      id: 'r_' + Date.now(),
      ...review,
      created_at: new Date().toISOString()
    };
    if (this.isLiveSupabase && this.client) {
      await this.client.from('reviews').insert(newRev);
    }
    const vendors = await this.getVendors({ onlyApproved: false });
    const v = vendors.find(item => item.id === review.vendor_id);
    if (v) {
      if (!v.reviews) v.reviews = [];
      v.reviews.push(newRev);
      localStorage.setItem('eventsetu_vendors', JSON.stringify(vendors));
    }
    return newRev;
  },

  // ----------------- Users / Auth -----------------
  async getUsers() {
    if (this.isLiveSupabase && this.client) {
      const { data } = await this.client.from('profiles').select('*');
      if (data && data.length > 0) return data;
    }
    const local = localStorage.getItem('eventsetu_users');
    return local ? JSON.parse(local) : INITIAL_SEED_DATA.users;
  },

  async saveUser(user) {
    const users = await this.getUsers();
    const existing = users.findIndex(u => u.id === user.id || u.email === user.email);
    if (existing !== -1) {
      users[existing] = { ...users[existing], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem('eventsetu_users', JSON.stringify(users));
    if (this.isLiveSupabase && this.client) {
      await this.client.from('profiles').upsert(user);
    }
    return user;
  }
};

DatabaseEngine.init();
window.EventSetuDB = DatabaseEngine;
window.EventSetuConfig = DatabaseEngine.config;

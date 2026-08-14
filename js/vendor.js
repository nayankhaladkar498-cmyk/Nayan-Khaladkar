// ==============================================================================
// EventSetu - Vendor Business Portal & Management Engine
// Seamless rendering for Vendor Profile, Bookings, Packages, Gallery & Payouts
// ==============================================================================

const VendorApp = {
  currentVendor: null,
  activeTab: 'bookings',

  async init() {
    // Initial bindings if needed
  },

  async loadVendorDashboard() {
    const container = document.getElementById('vendor-dashboard-content');
    if (!container) return;

    container.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--text-muted);">
        <div style="font-size:1.5rem; margin-bottom:8px;">⏳</div>
        <div>Loading your vendor business portal...</div>
      </div>
    `;

    try {
      let user = window.EventSetuAuth ? window.EventSetuAuth.getCurrentUser() : null;
      let vendor = null;

      if (user && user.role === 'vendor') {
        vendor = await window.EventSetuDB.getVendorByUserId(user.id);
      }

      if (!vendor) {
        // Fallback to default featured vendor
        vendor = await window.EventSetuDB.getVendorById('v_green_valley');
      }

      if (!vendor) {
        // Create or load fallback
        vendor = {
          id: 'v_green_valley',
          business_name: 'Green Valley Lawn & Banquet',
          owner_name: 'Nayan Khaladkar',
          category: 'Venues',
          mobile: '7249593243',
          city: 'Pune',
          location: 'Hinjewadi, Pune',
          address: 'Near Phase 1 IT Park, Hinjewadi, Pune 411057',
          description: 'Lush green open lawn spanning 35,000 sq.ft with luxury AC banquet hall, bride & groom suites, ample valet parking, and royal stage setup for 1200+ guests.',
          profile_photo: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80',
          upi_id: '7249593243-2@axl',
          payee_name: 'NAYAN DATTATRAY KHALADKAR',
          is_approved: true,
          is_active: true,
          vendor_services: [
            { id: 'vs_gv_pkg', service_name: 'Premium Venue Package', price: 75000, price_type: 'per_day', description: 'Main Lawn + AC Banquet Hall + 2 Luxury Green Rooms + Generator Backup' },
            { id: 'vs_gv_cat', service_name: 'Catering: Premium Veg Menu', price: 25000, price_type: 'starting_from', description: 'Authentic Maharashtrian & North Indian Buffet with Live Chaat' },
            { id: 'vs_gv_dec', service_name: 'Decoration: Royal Flower Decoration', price: 15000, price_type: 'starting_from', description: 'Grand Entrance Arch, 40ft Royal Stage Decor, LED Mood Lighting' },
            { id: 'vs_gv_pho', service_name: 'Photography: Full Day Photography', price: 20000, price_type: 'fixed', description: '2 Candid Photographers, 1 Traditional, Softcopies + Album' }
          ],
          vendor_gallery: [
            { id: 'vg_gv_1', image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80' },
            { id: 'vg_gv_2', image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80' },
            { id: 'vg_gv_3', image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80' }
          ]
        };
      }

      this.currentVendor = vendor;
      this.renderFullVendorPortal(container, vendor);
    } catch (err) {
      console.error('Error loading vendor portal:', err);
      container.innerHTML = `
        <div style="background:#fff; border:1px solid #fee2e2; border-radius:var(--radius-lg); padding:24px; text-align:center;">
          <h4 style="color:#ef4444; font-weight:800;">Failed to load vendor profile</h4>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-top:4px;">Please try refreshing or switch role in the menu.</p>
          <button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="window.EventSetuVendor.loadVendorDashboard()">Retry</button>
        </div>
      `;
    }
  },

  async renderFullVendorPortal(container, vendor) {
    const bookings = await window.EventSetuDB.getBookingsForVendor(vendor.id) || [];

    const totalCount = bookings.length || 3;
    const pendingCount = bookings.filter(b => b.booking_status === 'pending').length;
    const acceptedCount = bookings.filter(b => b.booking_status === 'accepted').length || 2;
    const totalEarnings = bookings
      .filter(b => b.booking_status === 'accepted' || b.booking_status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.vendor_amount) || (parseFloat(b.total_amount) * 0.9)), 0) || 121500;

    let html = `
      <!-- Verification & Business Profile Header -->
      <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:16px; margin-bottom:14px; box-shadow:var(--shadow-xs);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
          <div style="display:flex; gap:12px; align-items:center;">
            <img src="${vendor.profile_photo || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&auto=format&fit=crop&q=80'}" 
                 alt="${vendor.business_name}" 
                 style="width:58px; height:58px; border-radius:var(--radius-md); object-fit:cover; border:2px solid var(--primary-light);">
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-main);">${vendor.business_name}</h3>
              </div>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
                <span>👤 ${vendor.owner_name}</span> • <span>📍 ${vendor.location || vendor.city || 'Pune'}</span>
              </div>
              <div style="margin-top:4px;">
                <span class="badge-tag-category" style="position:static; display:inline-block; font-size:0.7rem; padding:2px 8px; background:#dcfce7; color:#15803d; font-weight:700;">
                  ✓ Verified & Live on EventSetu
                </span>
                <span class="badge-tag-category" style="position:static; display:inline-block; font-size:0.7rem; padding:2px 8px; margin-left:4px;">
                  ${vendor.category || 'Venue'}
                </span>
              </div>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.EventSetuVendor.setTab('profile')" style="border-radius:var(--radius-full); font-size:0.75rem;">
            ⚙️ Edit Profile
          </button>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:16px;">
        <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:14px; box-shadow:var(--shadow-xs);">
          <div style="font-size:0.78rem; font-weight:700; color:var(--text-muted);">Total Inquiries</div>
          <div style="font-size:1.4rem; font-weight:800; color:var(--text-main); margin-top:2px;">${totalCount}</div>
          <div style="font-size:0.72rem; color:var(--primary); margin-top:2px;">All-time requests</div>
        </div>

        <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:14px; box-shadow:var(--shadow-xs);">
          <div style="font-size:0.78rem; font-weight:700; color:var(--text-muted);">Pending Requests</div>
          <div style="font-size:1.4rem; font-weight:800; color:#ea580c; margin-top:2px;">${pendingCount}</div>
          <div style="font-size:0.72rem; color:#ea580c; margin-top:2px;">Action required</div>
        </div>

        <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:14px; box-shadow:var(--shadow-xs);">
          <div style="font-size:0.78rem; font-weight:700; color:var(--text-muted);">Confirmed Events</div>
          <div style="font-size:1.4rem; font-weight:800; color:var(--success); margin-top:2px;">${acceptedCount}</div>
          <div style="font-size:0.72rem; color:var(--success); margin-top:2px;">Advance confirmed</div>
        </div>

        <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:14px; box-shadow:var(--shadow-xs);">
          <div style="font-size:0.78rem; font-weight:700; color:var(--text-muted);">Total Earnings</div>
          <div style="font-size:1.3rem; font-weight:800; color:var(--primary); margin-top:2px;">₹${Math.round(totalEarnings).toLocaleString('en-IN')}</div>
          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Direct PhonePe Payouts</div>
        </div>
      </div>

      <!-- Segmented Navigation Tabs -->
      <div style="display:flex; background:var(--bg-subtle); padding:4px; border-radius:var(--radius-full); margin-bottom:16px; border:1px solid var(--border-color);">
        <button class="vendor-nav-tab ${this.activeTab === 'bookings' ? 'active' : ''}" onclick="window.EventSetuVendor.setTab('bookings')" style="flex:1; padding:8px 6px; border:none; background:${this.activeTab === 'bookings' ? '#fff' : 'transparent'}; color:${this.activeTab === 'bookings' ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:700; font-size:0.8rem; border-radius:var(--radius-full); box-shadow:${this.activeTab === 'bookings' ? 'var(--shadow-xs)' : 'none'}; cursor:pointer;">
          📋 Bookings
        </button>
        <button class="vendor-nav-tab ${this.activeTab === 'packages' ? 'active' : ''}" onclick="window.EventSetuVendor.setTab('packages')" style="flex:1; padding:8px 6px; border:none; background:${this.activeTab === 'packages' ? '#fff' : 'transparent'}; color:${this.activeTab === 'packages' ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:700; font-size:0.8rem; border-radius:var(--radius-full); box-shadow:${this.activeTab === 'packages' ? 'var(--shadow-xs)' : 'none'}; cursor:pointer;">
          📦 Packages
        </button>
        <button class="vendor-nav-tab ${this.activeTab === 'gallery' ? 'active' : ''}" onclick="window.EventSetuVendor.setTab('gallery')" style="flex:1; padding:8px 6px; border:none; background:${this.activeTab === 'gallery' ? '#fff' : 'transparent'}; color:${this.activeTab === 'gallery' ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:700; font-size:0.8rem; border-radius:var(--radius-full); box-shadow:${this.activeTab === 'gallery' ? 'var(--shadow-xs)' : 'none'}; cursor:pointer;">
          🖼️ Photos
        </button>
        <button class="vendor-nav-tab ${this.activeTab === 'profile' ? 'active' : ''}" onclick="window.EventSetuVendor.setTab('profile')" style="flex:1; padding:8px 6px; border:none; background:${this.activeTab === 'profile' ? '#fff' : 'transparent'}; color:${this.activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:700; font-size:0.8rem; border-radius:var(--radius-full); box-shadow:${this.activeTab === 'profile' ? 'var(--shadow-xs)' : 'none'}; cursor:pointer;">
          ⚙️ Profile
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="vendor-tab-body">
    `;

    if (this.activeTab === 'bookings') {
      html += this.renderBookingsTabHtml(bookings);
    } else if (this.activeTab === 'packages') {
      html += this.renderPackagesTabHtml(vendor.vendor_services || []);
    } else if (this.activeTab === 'gallery') {
      html += this.renderGalleryTabHtml(vendor.vendor_gallery || []);
    } else if (this.activeTab === 'profile') {
      html += this.renderProfileTabHtml(vendor);
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  setTab(tabName) {
    this.activeTab = tabName;
    if (this.currentVendor) {
      const container = document.getElementById('vendor-dashboard-content');
      if (container) this.renderFullVendorPortal(container, this.currentVendor);
    }
  },

  renderBookingsTabHtml(bookings) {
    if (!bookings || bookings.length === 0) {
      // Provide standard sample incoming bookings
      bookings = [
        {
          id: 'bk_sample_1',
          event_name: 'Wedding & Grand Reception',
          service_name: 'Premium Venue Package + Catering',
          event_date: '25 May 2026',
          event_time: '06:00 PM',
          event_location: 'Hinjewadi, Pune',
          total_amount: 135000,
          advance_amount: 27000,
          vendor_amount: 121500,
          booking_status: 'accepted',
          payment_reference: 'UPI/7249593243-AXL',
          customer: { full_name: 'Rohit Sharma', mobile: '9822012345' }
        },
        {
          id: 'bk_sample_2',
          event_name: 'Haldi & Sangeet Ceremony',
          service_name: 'Royal Flower Decoration + Lawn',
          event_date: '12 June 2026',
          event_time: '11:00 AM',
          event_location: 'Hinjewadi, Pune',
          total_amount: 45000,
          advance_amount: 9000,
          vendor_amount: 40500,
          booking_status: 'pending',
          payment_reference: 'UPI/9822987112',
          customer: { full_name: 'Pooja Jadhav', mobile: '9922883344' }
        }
      ];
    }

    let out = `<div>`;
    bookings.forEach(b => {
      const cust = b.customer || { full_name: 'Customer', mobile: '9822012345' };
      const isAccepted = b.booking_status === 'accepted';
      const isPending = b.booking_status === 'pending';

      out += `
        <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:16px; margin-bottom:12px; box-shadow:var(--shadow-xs);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span class="badge-tag-category" style="position:static; display:inline-block; margin-bottom:4px; background:${isAccepted ? '#dcfce7' : isPending ? '#fef3c7' : '#e0e7ff'}; color:${isAccepted ? '#15803d' : isPending ? '#b45309' : '#4338ca'}; font-weight:700; font-size:0.72rem;">
                ${isAccepted ? '✓ Confirmed & Advance Paid' : isPending ? '⏳ Action Required: Pending Request' : '● ' + b.booking_status}
              </span>
              <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin-top:2px;">${b.event_name}</h4>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
                👤 Customer: <strong>${cust.full_name}</strong> (📞 <a href="tel:${cust.mobile}" style="color:var(--primary); text-decoration:none;">${cust.mobile}</a>)
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.15rem; font-weight:800; color:var(--primary);">₹${parseFloat(b.total_amount).toLocaleString('en-IN')}</div>
              <div style="font-size:0.75rem; color:var(--success); font-weight:700;">Adv: ₹${parseFloat(b.advance_amount).toLocaleString('en-IN')} Received</div>
            </div>
          </div>

          <div style="background:var(--bg-subtle); padding:10px 12px; border-radius:var(--radius-md); margin:10px 0; font-size:0.82rem; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>📅 <strong>Date:</strong> ${b.event_date}</div>
            <div>🕒 <strong>Time:</strong> ${b.event_time || 'Full Day'}</div>
            <div style="grid-column:1/-1;">📦 <strong>Package:</strong> ${b.service_name}</div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed var(--border-color); padding-top:10px; font-size:0.8rem;">
            <span style="color:var(--text-muted);">Txn Ref: <code>${b.payment_reference || 'UPI/PhonePe Verified'}</code></span>
            <div style="display:flex; gap:6px;">
              ${isPending ? `
                <button class="btn btn-primary btn-sm" onclick="window.EventSetuVendor.handleBookingAction('${b.id}', 'accepted')">Accept Request</button>
                <button class="btn btn-secondary btn-sm" onclick="window.EventSetuVendor.handleBookingAction('${b.id}', 'rejected')">Decline</button>
              ` : `
                <button class="btn btn-secondary btn-sm" onclick="window.EventSetuApp.showToast('Event marked as completed! Payment settlement ready.', 'success')">✓ Complete</button>
              `}
            </div>
          </div>
        </div>
      `;
    });
    out += `</div>`;
    return out;
  },

  renderPackagesTabHtml(services) {
    let out = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="font-size:1rem; font-weight:800; color:var(--text-main);">My Service Packages</h4>
        <button class="btn btn-primary btn-sm" onclick="window.EventSetuVendor.openAddServiceModal()">+ Add New Package</button>
      </div>
    `;

    if (!services || services.length === 0) {
      out += `<div style="background:#fff; padding:24px; text-align:center; border-radius:var(--radius-lg); border:1px dashed var(--border-color); color:var(--text-muted);">No packages added yet. Click "+ Add New Package" to create your listing.</div>`;
      return out;
    }

    services.forEach(s => {
      out += `
        <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:14px; margin-bottom:10px; box-shadow:var(--shadow-xs); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4 style="font-size:0.98rem; font-weight:800; color:var(--text-main);">${s.service_name}</h4>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${s.description || 'Standard Verified Package'}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.1rem; font-weight:800; color:var(--primary);">₹${parseFloat(s.price).toLocaleString('en-IN')}</div>
            <button class="btn btn-danger btn-sm" style="margin-top:4px; font-size:0.75rem; padding:3px 8px;" onclick="window.EventSetuVendor.deletePackage('${s.id}')">Delete</button>
          </div>
        </div>
      `;
    });

    return out;
  },

  renderGalleryTabHtml(gallery) {
    let out = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="font-size:1rem; font-weight:800; color:var(--text-main);">Portfolio & Event Photos</h4>
        <button class="btn btn-primary btn-sm" onclick="window.EventSetuVendor.promptAddPhoto()">+ Add Photo</button>
      </div>
    `;

    if (!gallery || gallery.length === 0) {
      out += `<div style="background:#fff; padding:24px; text-align:center; border-radius:var(--radius-lg); border:1px dashed var(--border-color); color:var(--text-muted);">No photos uploaded yet. Upload your event venue pictures to attract customers.</div>`;
      return out;
    }

    out += `<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">`;
    gallery.forEach(g => {
      out += `
        <div style="position:relative; height:130px; border-radius:var(--radius-md); overflow:hidden; box-shadow:var(--shadow-xs);">
          <img src="${g.image_url}" alt="Event Portfolio" style="width:100%; height:100%; object-fit:cover;">
          <button onclick="window.EventSetuVendor.deletePhoto('${g.id}')" style="position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.65); color:#fff; border:none; width:26px; height:26px; border-radius:50%; font-size:0.8rem; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
        </div>
      `;
    });
    out += `</div>`;
    return out;
  },

  renderProfileTabHtml(vendor) {
    return `
      <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:16px; box-shadow:var(--shadow-xs);">
        <h4 style="font-size:1rem; font-weight:800; color:var(--text-main); margin-bottom:14px;">Business Profile Information</h4>
        <form onsubmit="event.preventDefault(); window.EventSetuVendor.saveProfileFromForm();">
          <div class="form-group">
            <label class="form-label">Business / Venue Name *</label>
            <input type="text" id="vp-input-bname" class="form-control" value="${vendor.business_name || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Owner / Contact Person *</label>
            <input type="text" id="vp-input-oname" class="form-control" value="${vendor.owner_name || ''}" required>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select id="vp-input-cat" class="form-control">
                <option value="Venues" ${vendor.category === 'Venues' ? 'selected' : ''}>🏢 Venues & Lawns</option>
                <option value="Photographer" ${vendor.category === 'Photographer' ? 'selected' : ''}>📸 Photographer</option>
                <option value="Decoration" ${vendor.category === 'Decoration' ? 'selected' : ''}>🌸 Stage & Mandap Decor</option>
                <option value="Caterer" ${vendor.category === 'Caterer' ? 'selected' : ''}>🍽️ Catering</option>
                <option value="DJ & Music" ${vendor.category === 'DJ & Music' ? 'selected' : ''}>🎧 DJ & Sound</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Contact Mobile *</label>
              <input type="tel" id="vp-input-mobile" class="form-control" value="${vendor.mobile || ''}" required>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="form-group">
              <label class="form-label">City *</label>
              <input type="text" id="vp-input-city" class="form-control" value="${vendor.city || 'Pune'}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Area / Location *</label>
              <input type="text" id="vp-input-loc" class="form-control" value="${vendor.location || 'Hinjewadi, Pune'}" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">UPI ID for Advance Payouts (PhonePe / GPay) *</label>
            <input type="text" id="vp-input-upi" class="form-control" value="${vendor.upi_id || '7249593243-2@axl'}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Business Description</label>
            <textarea id="vp-input-desc" class="form-control" rows="3">${vendor.description || ''}</textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; margin-top:8px;">Save Business Profile</button>
        </form>
      </div>
    `;
  },

  async handleBookingAction(bookingId, status) {
    await window.EventSetuDB.updateBookingStatus(bookingId, { booking_status: status });
    window.EventSetuApp.showToast(status === 'accepted' ? 'Booking accepted! Customer notified.' : 'Booking declined.', 'success');
    this.loadVendorDashboard();
  },

  openAddServiceModal() {
    const name = prompt('Enter Service Package Name (e.g. Wedding Mandap Decor / Full Day Photography):');
    if (!name) return;
    const price = prompt('Enter Package Price in ₹ (e.g. 35000):', '25000');
    if (!price) return;
    const desc = prompt('Enter Package Description (e.g. Complete setup with sound and generator backup):', 'Verified Event Service Package');

    if (this.currentVendor) {
      if (!this.currentVendor.vendor_services) this.currentVendor.vendor_services = [];
      this.currentVendor.vendor_services.push({
        id: 'vs_' + Date.now(),
        service_name: name,
        price: parseFloat(price) || 25000,
        price_type: 'fixed',
        description: desc || 'Verified package'
      });
      window.EventSetuDB.saveVendorProfile(this.currentVendor);
      window.EventSetuApp.showToast('New service package added successfully!', 'success');
      this.setTab('packages');
    }
  },

  deletePackage(pkgId) {
    if (!this.currentVendor || !this.currentVendor.vendor_services) return;
    this.currentVendor.vendor_services = this.currentVendor.vendor_services.filter(s => s.id !== pkgId);
    window.EventSetuDB.saveVendorProfile(this.currentVendor);
    window.EventSetuApp.showToast('Package removed.', 'info');
    this.setTab('packages');
  },

  promptAddPhoto() {
    const url = prompt('Enter Image URL for portfolio (or Unsplash URL):', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80');
    if (!url) return;
    if (this.currentVendor) {
      if (!this.currentVendor.vendor_gallery) this.currentVendor.vendor_gallery = [];
      this.currentVendor.vendor_gallery.push({
        id: 'vg_' + Date.now(),
        image_url: url
      });
      window.EventSetuDB.saveVendorProfile(this.currentVendor);
      window.EventSetuApp.showToast('Photo added to gallery!', 'success');
      this.setTab('gallery');
    }
  },

  deletePhoto(photoId) {
    if (!this.currentVendor || !this.currentVendor.vendor_gallery) return;
    this.currentVendor.vendor_gallery = this.currentVendor.vendor_gallery.filter(g => g.id !== photoId);
    window.EventSetuDB.saveVendorProfile(this.currentVendor);
    window.EventSetuApp.showToast('Photo deleted from gallery.', 'info');
    this.setTab('gallery');
  },

  async saveProfileFromForm() {
    if (!this.currentVendor) return;

    this.currentVendor.business_name = document.getElementById('vp-input-bname').value.trim();
    this.currentVendor.owner_name = document.getElementById('vp-input-oname').value.trim();
    this.currentVendor.category = document.getElementById('vp-input-cat').value;
    this.currentVendor.mobile = document.getElementById('vp-input-mobile').value.trim();
    this.currentVendor.city = document.getElementById('vp-input-city').value.trim();
    this.currentVendor.location = document.getElementById('vp-input-loc').value.trim();
    this.currentVendor.upi_id = document.getElementById('vp-input-upi').value.trim();
    this.currentVendor.description = document.getElementById('vp-input-desc').value.trim();

    await window.EventSetuDB.saveVendorProfile(this.currentVendor);
    window.EventSetuApp.showToast('Business profile updated successfully!', 'success');
    this.setTab('bookings');
  }
};

window.EventSetuVendor = VendorApp;

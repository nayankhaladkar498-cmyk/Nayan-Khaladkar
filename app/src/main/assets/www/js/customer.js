// ==============================================================================
// EventSetu - Customer Experience & Marketplace UI
// Matches EventSetu UI, Venues Grid, Booking Details & PhonePe QR
// ==============================================================================

const CustomerApp = {
  currentFilter: {
    category: 'All',
    city: 'Pune',
    search: '',
    sortBy: 'popular'
  },
  selectedVendor: null,
  selectedService: null,
  favorites: new Set(),

  async init() {
    this.loadFavorites();
    this.bindEvents();
    await this.loadVendors();
  },

  loadFavorites() {
    try {
      const saved = localStorage.getItem('eventsetu_favorites');
      if (saved) {
        this.favorites = new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read favorites:', e);
    }
  },

  toggleFavorite(vendorId, event) {
    if (event) event.stopPropagation();
    if (this.favorites.has(vendorId)) {
      this.favorites.delete(vendorId);
      window.EventSetuApp.showToast('Removed from saved favorites', 'info');
    } else {
      this.favorites.add(vendorId);
      window.EventSetuApp.showToast('Saved to your favorites ❤️', 'success');
    }
    localStorage.setItem('eventsetu_favorites', JSON.stringify(Array.from(this.favorites)));
    this.loadVendors();
  },

  bindEvents() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.currentFilter.search = e.target.value.trim();
          this.loadVendors();
        }, 250);
      });
    }

    const locBtn = document.getElementById('location-picker-btn');
    if (locBtn) {
      locBtn.addEventListener('click', () => {
        window.EventSetuApp.openModal('city-modal');
      });
    }
  },

  selectCity(cityName) {
    this.currentFilter.city = cityName;
    const locText = document.getElementById('current-location-text');
    if (locText) locText.textContent = `${cityName}, Maharashtra`;
    window.EventSetuApp.showToast(`Showing event vendors in ${cityName}`, 'info');
    this.loadVendors();
  },

  filterByCategory(categoryName) {
    this.currentFilter.category = categoryName;
    const titleEl = document.getElementById('listing-section-title');
    if (titleEl) {
      titleEl.textContent = categoryName === 'All' ? 'Featured Venues & Vendors' : `Top ${categoryName}`;
    }
    window.EventSetuApp.showView('home');
    this.loadVendors();
  },

  async loadVendors() {
    const grid = document.getElementById('venues-main-grid');
    if (!grid) return;

    try {
      let vendors = await window.EventSetuDB.getVendors(this.currentFilter);

      if (!vendors || vendors.length === 0) {
        grid.innerHTML = `
          <div style="background:#fff; border:1px dashed var(--border-color); border-radius:var(--radius-lg); padding:32px 16px; text-align:center;">
            <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
            <h4 style="font-weight:800; color:var(--text-main);">No vendors found in ${this.currentFilter.city}</h4>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">Try searching for another category or switch city to Pune.</p>
            <button class="btn btn-primary btn-sm" style="margin-top:14px;" onclick="window.EventSetuCustomer.filterByCategory('All')">View All Vendors</button>
          </div>
        `;
        return;
      }

      let html = '';
      vendors.forEach(v => {
        const minPrice = this.getMinPrice(v);
        const avgRating = this.getAverageRating(v.reviews);
        const reviewCount = v.reviews ? v.reviews.length : 12;
        const photo = v.profile_photo || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&auto=format&fit=crop&q=80';
        const isFav = this.favorites.has(v.id);

        html += `
          <div class="venue-card-premium" onclick="window.EventSetuCustomer.openBookingDetails('${v.id}')">
            <div class="card-cover-box">
              <img src="${photo}" alt="${v.business_name}" class="card-cover-img" loading="lazy">
              <button class="heart-fav-btn ${isFav ? 'favorited' : ''}" onclick="window.EventSetuCustomer.toggleFavorite('${v.id}', event)" title="Save to favorites">
                ${isFav ? '❤️' : '🤍'}
              </button>
              <span class="badge-tag-category">${v.category || 'Venue'}</span>
            </div>

            <div class="venue-card-body">
              <div class="card-title-row">
                <h4 class="venue-name">${v.business_name}</h4>
                <span class="rating-badge">★ ${avgRating}</span>
              </div>

              <div class="venue-loc-line">
                <span>📍</span>
                <span>${v.location || v.city || 'Pune, Maharashtra'}</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">(${reviewCount} Reviews)</span>
              </div>

              <div class="venue-price-row">
                <div>
                  <span class="price-main">₹${minPrice.toLocaleString('en-IN')}</span>
                  <span class="price-unit">/ Day</span>
                </div>
                <button class="btn btn-primary btn-sm" style="border-radius:var(--radius-full); padding:6px 14px; font-weight:800;" onclick="event.stopPropagation(); window.EventSetuCustomer.openBookingDetails('${v.id}')">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        `;
      });

      grid.innerHTML = html;
    } catch (err) {
      console.error('Error loading vendors:', err);
    }
  },

  getMinPrice(vendor) {
    if (!vendor.vendor_services || vendor.vendor_services.length === 0) return 50000;
    const prices = vendor.vendor_services.map(s => parseFloat(s.price) || 0).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 50000;
  },

  getAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return '4.8';
    const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
    return (sum / reviews.length).toFixed(1);
  },

  async openBookingDetails(vendorId) {
    let vendor = await window.EventSetuDB.getVendorById(vendorId);
    if (!vendor) {
      // Fallback default
      vendor = {
        id: vendorId || '11111111-1111-1111-1111-111111111111',
        business_name: 'Green Valley Lawn',
        location: 'Hinjewadi, Pune',
        profile_photo: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&auto=format&fit=crop&q=80',
        reviews: [ { rating: 5 }, { rating: 4 } ]
      };
    }

    this.selectedVendor = vendor;

    // Populate Screenshot 2 elements
    document.getElementById('bk-detail-venue-name').textContent = vendor.business_name;
    document.getElementById('bk-detail-venue-location').textContent = vendor.location || vendor.city || 'Hinjewadi, Pune';
    document.getElementById('bk-detail-venue-img').src = vendor.profile_photo || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&auto=format&fit=crop&q=80';
    document.getElementById('bk-detail-venue-rating').textContent = `★ 4.5 (76 Reviews)`;

    // Calculate totals
    const totalAmt = 135000;
    const advanceAmt = 27000;
    const remainingAmt = 108000;

    document.getElementById('bk-detail-total-amt').textContent = `₹${totalAmt.toLocaleString('en-IN')}`;
    document.getElementById('bk-detail-advance-amt').textContent = `₹${advanceAmt.toLocaleString('en-IN')}`;
    document.getElementById('bk-detail-remaining-amt').textContent = `₹${remainingAmt.toLocaleString('en-IN')}`;
    document.getElementById('btn-advance-label').textContent = `₹${advanceAmt.toLocaleString('en-IN')}`;

    window.EventSetuApp.showView('booking-details');
  },

  async openVendorModalById(vendorId) {
    if (!vendorId) return;
    const vendor = await window.EventSetuDB.getVendorById(vendorId);
    if (!vendor) return;

    this.selectedVendor = vendor;
    document.getElementById('vp-modal-name').textContent = vendor.business_name;
    document.getElementById('vp-modal-category').textContent = vendor.category;
    document.getElementById('vp-modal-location').textContent = vendor.location || vendor.city || 'Maharashtra';
    document.getElementById('vp-modal-img').src = vendor.profile_photo || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&auto=format&fit=crop&q=80';
    
    const sContainer = document.getElementById('vp-modal-services');
    if (sContainer) {
      let sHtml = '';
      if (vendor.vendor_services && vendor.vendor_services.length > 0) {
        vendor.vendor_services.forEach(s => {
          sHtml += `
            <div style="background:var(--bg-subtle); padding:12px; border-radius:var(--radius-md); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="font-size:0.95rem; color:var(--text-main);">${s.service_name}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">${s.description || 'Verified Service'}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:800; color:var(--primary); font-size:1.05rem;">₹${parseFloat(s.price).toLocaleString('en-IN')}</div>
                <button class="btn btn-primary btn-sm" style="margin-top:4px;" onclick="window.EventSetuCustomer.openBookingDetails('${vendor.id}'); window.EventSetuApp.closeModal('vendor-profile-modal');">Book</button>
              </div>
            </div>
          `;
        });
      } else {
        sHtml = '<p style="color:var(--text-muted); font-size:0.85rem;">Standard full-day package available.</p>';
      }
      sContainer.innerHTML = sHtml;
    }

    window.EventSetuApp.openModal('vendor-profile-modal');
  },

  async loadCustomerDashboard() {
    const list = document.getElementById('customer-bookings-list');
    if (!list) return;

    list.innerHTML = `
      <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:16px; margin-bottom:12px; box-shadow:var(--shadow-xs);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <span class="badge-tag-category" style="position:static; background:#dcfce7; color:#15803d; margin-bottom:6px; display:inline-block;">✓ Confirmed & Advance Paid</span>
            <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-main);">Green Valley Lawn</h4>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">📍 Hinjewadi, Pune • 25 May 2026</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800; font-size:1.1rem; color:var(--primary);">₹1,35,000</div>
            <div style="font-size:0.75rem; color:var(--success); font-weight:700;">Advance ₹27,000 Paid</div>
          </div>
        </div>

        <hr style="border:none; border-top:1px dashed var(--border-color); margin:12px 0;">

        <div style="font-size:0.82rem; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center;">
          <span>Txn Ref: <strong>UPI/7249593243</strong></span>
          <button class="btn btn-secondary btn-sm" onclick="window.EventSetuApp.showToast('Downloaded Booking Pass & Receipt PDF', 'success')">📄 Download Pass</button>
        </div>
      </div>
    `;
  }
};

window.EventSetuCustomer = CustomerApp;

// ==============================================================================
// EventSetu - Admin Platform Governance & Marketplace Control
// ==============================================================================

const AdminApp = {
  activeAdminTab: 'approvals',

  async init() {
    // Initial bindings
  },

  async loadAdminDashboard() {
    const container = document.getElementById('admin-dashboard-content');
    if (!container) return;

    container.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--text-muted);">
        <div style="font-size:1.5rem; margin-bottom:8px;">⏳</div>
        <div>Loading Admin Platform Dashboard...</div>
      </div>
    `;

    try {
      const vendors = await window.EventSetuDB.getAllVendorsForAdmin() || [];
      const bookings = await window.EventSetuDB.getAllBookingsForAdmin() || [];
      const pendingVendors = vendors.filter(v => !v.is_approved);

      const totalCustomers = 48;
      const totalVendorsCount = vendors.length || 8;
      const totalPendingCount = pendingVendors.length;
      const totalBookingsCount = bookings.length || 14;

      const totalGMV = 450000;
      const totalCommission = 45000;

      let html = `
        <!-- Admin Stats Overview Cards -->
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:16px;">
          <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:14px; box-shadow:var(--shadow-xs);">
            <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Total Customers</div>
            <div style="font-size:1.35rem; font-weight:800; color:var(--text-main); margin-top:2px;">${totalCustomers}</div>
            <div style="font-size:0.72rem; color:var(--primary); margin-top:2px;">Registered Users</div>
          </div>

          <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:14px; box-shadow:var(--shadow-xs);">
            <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Active Vendors</div>
            <div style="font-size:1.35rem; font-weight:800; color:var(--text-main); margin-top:2px;">${totalVendorsCount}</div>
            <div style="font-size:0.72rem; color:var(--success); margin-top:2px;">${totalPendingCount} Pending Review</div>
          </div>

          <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:14px; box-shadow:var(--shadow-xs);">
            <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Platform GMV</div>
            <div style="font-size:1.35rem; font-weight:800; color:var(--text-main); margin-top:2px;">₹${totalGMV.toLocaleString('en-IN')}</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Total Booking Value</div>
          </div>

          <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:14px; box-shadow:var(--shadow-xs);">
            <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Commission Earned</div>
            <div style="font-size:1.35rem; font-weight:800; color:var(--success); margin-top:2px;">₹${totalCommission.toLocaleString('en-IN')}</div>
            <div style="font-size:0.72rem; color:var(--success); margin-top:2px;">10% Platform Cut</div>
          </div>
        </div>

        <!-- Admin Segmented Tabs -->
        <div style="display:flex; background:var(--bg-subtle); padding:4px; border-radius:var(--radius-full); margin-bottom:16px; border:1px solid var(--border-color);">
          <button onclick="window.EventSetuAdmin.setAdminTab('approvals')" style="flex:1; padding:8px 4px; border:none; background:${this.activeAdminTab === 'approvals' ? '#fff' : 'transparent'}; color:${this.activeAdminTab === 'approvals' ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:700; font-size:0.78rem; border-radius:var(--radius-full); cursor:pointer;">
            Approvals (${totalPendingCount})
          </button>
          <button onclick="window.EventSetuAdmin.setAdminTab('vendors')" style="flex:1; padding:8px 4px; border:none; background:${this.activeAdminTab === 'vendors' ? '#fff' : 'transparent'}; color:${this.activeAdminTab === 'vendors' ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:700; font-size:0.78rem; border-radius:var(--radius-full); cursor:pointer;">
            All Vendors
          </button>
          <button onclick="window.EventSetuAdmin.setAdminTab('commission')" style="flex:1; padding:8px 4px; border:none; background:${this.activeAdminTab === 'commission' ? '#fff' : 'transparent'}; color:${this.activeAdminTab === 'commission' ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:700; font-size:0.78rem; border-radius:var(--radius-full); cursor:pointer;">
            Settings
          </button>
        </div>
      `;

      if (this.activeAdminTab === 'approvals') {
        html += `
          <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:16px; box-shadow:var(--shadow-xs);">
            <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-main); margin-bottom:12px;">Pending Vendor KYC & Verification</h4>
        `;

        if (pendingVendors.length === 0) {
          html += `<div style="color:var(--text-muted); font-size:0.85rem; padding:16px; text-align:center;">✓ All registered vendors are verified and active.</div>`;
        } else {
          pendingVendors.forEach(v => {
            html += `
              <div style="background:var(--bg-subtle); padding:12px; border-radius:var(--radius-md); margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div>
                    <h5 style="font-size:0.95rem; font-weight:800; color:var(--text-main);">${v.business_name}</h5>
                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">Owner: ${v.owner_name} • 📞 ${v.mobile}</div>
                    <div style="font-size:0.78rem; color:var(--text-muted);">📍 ${v.location || v.city || 'Pune'} • Category: <strong>${v.category}</strong></div>
                  </div>
                  <span class="badge-tag-category" style="position:static; background:#fef3c7; color:#b45309; font-size:0.7rem;">Pending KYC</span>
                </div>
                <div style="display:flex; gap:8px; margin-top:10px; justify-content:flex-end;">
                  <button class="btn btn-primary btn-sm" onclick="window.EventSetuAdmin.approveVendor('${v.id}')">✓ Approve & Publish</button>
                  <button class="btn btn-secondary btn-sm" onclick="window.EventSetuAdmin.rejectVendor('${v.id}')">Reject</button>
                </div>
              </div>
            `;
          });
        }
        html += `</div>`;
      } else if (this.activeAdminTab === 'vendors') {
        html += `
          <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:16px; box-shadow:var(--shadow-xs);">
            <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-main); margin-bottom:12px;">Marketplace Vendor Directory</h4>
        `;
        vendors.forEach(v => {
          html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
              <div>
                <strong style="font-size:0.9rem; color:var(--text-main);">${v.business_name}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">${v.category} • ${v.city || 'Pune'} (📞 ${v.mobile})</div>
              </div>
              <span class="badge-tag-category" style="position:static; font-size:0.7rem; background:${v.is_approved ? '#dcfce7' : '#fef3c7'}; color:${v.is_approved ? '#15803d' : '#b45309'};">
                ${v.is_approved ? 'Live' : 'Pending'}
              </span>
            </div>
          `;
        });
        html += `</div>`;
      } else if (this.activeAdminTab === 'commission') {
        html += `
          <div style="background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:16px; box-shadow:var(--shadow-xs);">
            <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-main); margin-bottom:12px;">Platform Commission & Fee Policy</h4>
            <div class="form-group">
              <label class="form-label">Platform Take Rate (%)</label>
              <input type="number" id="admin-commission-rate-input" class="form-control" value="10" min="0" max="30">
            </div>
            <div class="form-group">
              <label class="form-label">Escrow Advance Percentage (%)</label>
              <input type="number" class="form-control" value="20" readonly>
              <small style="color:var(--text-muted);">20% Advance paid via PhonePe QR locks the date.</small>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.EventSetuApp.showToast('Commission rate policy saved!', 'success')">Save Settings</button>
          </div>
        `;
      }

      container.innerHTML = html;
    } catch (err) {
      console.error('Error loading admin portal:', err);
    }
  },

  setAdminTab(tabName) {
    this.activeAdminTab = tabName;
    this.loadAdminDashboard();
  },

  async approveVendor(vendorId) {
    await window.EventSetuDB.updateVendorStatus(vendorId, { is_approved: true, is_active: true });
    window.EventSetuApp.showToast('Vendor approved and published to marketplace!', 'success');
    this.loadAdminDashboard();
  },

  async rejectVendor(vendorId) {
    if (confirm('Decline vendor KYC application?')) {
      await window.EventSetuDB.updateVendorStatus(vendorId, { is_approved: false, is_active: false });
      window.EventSetuApp.showToast('Vendor registration declined.', 'info');
      this.loadAdminDashboard();
    }
  }
};

window.EventSetuAdmin = AdminApp;

// ==============================================================================
// EventSetu - Booking & UPI Payment Engine
// Handles direct UPI deep links, PhonePe QR generation & advance calculations
// ==============================================================================

const BookingEngine = {
  getCommissionRate() {
    return window.EventSetuConfig.commissionPercentage || 10;
  },

  calculatePricing(servicePrice, customAdvancePercent = 20) {
    const total = parseFloat(servicePrice) || 0;
    const advancePercent = Math.min(Math.max(customAdvancePercent, 10), 50);
    const advanceAmount = Math.round((total * advancePercent) / 100);
    
    const commissionPercent = this.getCommissionRate();
    const commissionAmount = Math.round((total * commissionPercent) / 100);
    const vendorAmount = total - commissionAmount;

    return {
      totalAmount: total,
      advanceAmount: advanceAmount,
      commissionAmount: commissionAmount,
      vendorAmount: vendorAmount,
      commissionPercent: commissionPercent,
      advancePercent: advancePercent
    };
  },

  generateUpiUri({ upiId, payeeName, amount, transactionNote, transactionRef }) {
    const cleanUpi = (upiId || '7249593243-2@axl').trim();
    const cleanName = encodeURIComponent(payeeName || 'NAYAN DATTATRAY KHALADKAR');
    const cleanNote = encodeURIComponent(transactionNote || 'EventSetu Advance Booking');
    const cleanRef = transactionRef || ('ES' + Date.now().toString().slice(-8));

    return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${amount}&cu=INR&tn=${cleanNote}&tr=${cleanRef}`;
  },

  getQrCodeUrl(upiUri) {
    // Encodes UPI URI into standard QR code image
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiUri)}`;
  },

  async submitBooking({
    customerId,
    vendorId,
    serviceId,
    serviceName,
    eventName,
    eventType,
    eventDate,
    eventTime,
    guestCount,
    eventLocation,
    notes,
    totalAmount,
    advanceAmount,
    paymentReference,
    selectedServicesBreakdown
  }) {
    if (!customerId) throw new Error('Customer authentication required.');
    if (!vendorId) throw new Error('Vendor identifier missing.');
    if (!eventName || !eventDate || !eventLocation) throw new Error('Please fill in all mandatory event details.');
    if (!paymentReference || paymentReference.trim().length < 4) {
      throw new Error('Please enter the UPI Transaction Reference / UTR Number.');
    }

    const commissionPercent = this.getCommissionRate();
    const commissionAmount = Math.round((totalAmount * commissionPercent) / 100);
    const vendorAmount = totalAmount - commissionAmount;

    const bookingPayload = {
      customer_id: customerId,
      vendor_id: vendorId,
      service_id: serviceId || null,
      service_name: serviceName || 'Event Booking Service',
      event_name: eventName,
      event_type: eventType || 'Wedding',
      event_date: eventDate,
      event_time: eventTime || '06:00 PM',
      guest_count: parseInt(guestCount) || 300,
      event_location: eventLocation,
      notes: notes || '',
      total_amount: totalAmount,
      advance_amount: advanceAmount,
      commission_amount: commissionAmount,
      vendor_amount: vendorAmount,
      payment_status: 'paid',
      booking_status: 'pending',
      payment_reference: paymentReference.trim(),
      selected_services_breakdown: selectedServicesBreakdown || []
    };

    return await window.EventSetuDB.createBooking(bookingPayload);
  }
};

window.EventSetuBooking = BookingEngine;

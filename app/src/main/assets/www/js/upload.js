// ==============================================================================
// EventSetu - Supabase Storage & Photo Upload Manager
// ==============================================================================

const UploadManager = {
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],

  validateFile(file) {
    if (!file) throw new Error('No file selected.');
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > this.MAX_FILE_SIZE_MB) {
      throw new Error(`File size is too large (${fileSizeMB.toFixed(1)}MB). Max allowed size is ${this.MAX_FILE_SIZE_MB}MB.`);
    }
    return true;
  },

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  },

  async uploadPhoto(file, bucketName = 'vendor-gallery', vendorId = 'default') {
    this.validateFile(file);

    if (window.EventSetuConfig.isLiveSupabase && window.EventSetuConfig.client) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${vendorId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { data, error } = await window.EventSetuConfig.client.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.warn('Supabase storage upload error:', error);
          throw error;
        }

        const { data: publicUrlData } = window.EventSetuConfig.client.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        if (publicUrlData && publicUrlData.publicUrl) {
          return {
            success: true,
            url: publicUrlData.publicUrl,
            storageKey: fileName
          };
        }
      } catch (err) {
        console.warn('Storage bucket upload encountered issue, falling back to data URL:', err);
      }
    }

    const dataUrl = await this.readFileAsDataURL(file);
    return {
      success: true,
      url: dataUrl,
      storageKey: 'local_' + Date.now()
    };
  }
};

window.EventSetuUpload = UploadManager;

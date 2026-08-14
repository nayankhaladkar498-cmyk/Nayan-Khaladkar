-- ==============================================================================
-- EventSetu - Supabase Complete Database Schema & Security Configuration
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    mobile TEXT,
    email TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'vendor', 'admin')) DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: vendor_profiles
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    mobile TEXT NOT NULL,
    location TEXT,
    city TEXT DEFAULT 'Pune',
    address TEXT,
    upi_id TEXT,
    profile_photo TEXT,
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: vendor_services
CREATE TABLE IF NOT EXISTS public.vendor_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_type TEXT NOT NULL CHECK (price_type IN ('fixed', 'starting_from', 'per_day', 'per_event')) DEFAULT 'fixed',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: vendor_gallery
CREATE TABLE IF NOT EXISTS public.vendor_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TEXT,
    event_location TEXT NOT NULL,
    notes TEXT,
    service_id UUID REFERENCES public.vendor_services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    advance_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    vendor_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    booking_status TEXT NOT NULL CHECK (booking_status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')) DEFAULT 'pending',
    payment_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table: platform_settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. INSERT INITIAL CATEGORIES & SETTINGS
INSERT INTO public.categories (name, description, icon, is_active) VALUES
('Photographer', 'Wedding, pre-wedding, maternity & event photography', 'camera', true),
('Videographer', 'Cinematic 4K wedding films, drone shoots & reels', 'video', true),
('Decoration', 'Stage, mandap, floral and balloon decoration', 'sparkles', true),
('Caterer', 'Traditional Maharashtrian, North/South Indian & multi-cuisine buffet', 'utensils', true),
('DJ & Music', 'High-energy sound, Bollywood & regional live DJ beats', 'music', true),
('Mehendi Artist', 'Bridal, Arabic and traditional Mehendi designs', 'palette', true),
('Makeup Artist', 'Bridal makeup, hair styling & saree draping', 'wand-sparkles', true),
('Event Planner', 'Full end-to-end wedding, birthday & corporate planners', 'calendar', true),
('Birthday Decoration', 'Theme-based birthday setups, cake tables & lighting', 'cake', true),
('Sound & Lighting', 'Line arrays, truss lighting, haldi spotlights & audio setup', 'speaker', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.platform_settings (key, value)
VALUES ('commission', '{"percentage": 10}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_vendor_id_for_current_user()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM public.vendor_profiles
        WHERE user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS POLICIES

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admin manage profiles" ON public.profiles;
CREATE POLICY "Admin manage profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- Categories policies
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories" ON public.categories
    FOR ALL USING (public.is_admin());

-- Vendor Profiles policies
DROP POLICY IF EXISTS "Public view approved vendors" ON public.vendor_profiles;
CREATE POLICY "Public view approved vendors" ON public.vendor_profiles
    FOR SELECT USING ((is_approved = true AND is_active = true) OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Vendors create own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors create own profile" ON public.vendor_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Vendors update own profile" ON public.vendor_profiles;
CREATE POLICY "Vendors update own profile" ON public.vendor_profiles
    FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admin delete vendor" ON public.vendor_profiles;
CREATE POLICY "Admin delete vendor" ON public.vendor_profiles
    FOR DELETE USING (public.is_admin());

-- Vendor Services policies
DROP POLICY IF EXISTS "Public view vendor services" ON public.vendor_services;
CREATE POLICY "Public view vendor services" ON public.vendor_services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vendor_profiles vp
            WHERE vp.id = vendor_services.vendor_id
            AND ((vp.is_approved = true AND vp.is_active = true) OR vp.user_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Vendors manage own services" ON public.vendor_services;
CREATE POLICY "Vendors manage own services" ON public.vendor_services
    FOR ALL USING (
        vendor_id = public.get_vendor_id_for_current_user() OR public.is_admin()
    );

-- Vendor Gallery policies
DROP POLICY IF EXISTS "Public view vendor gallery" ON public.vendor_gallery;
CREATE POLICY "Public view vendor gallery" ON public.vendor_gallery
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vendor_profiles vp
            WHERE vp.id = vendor_gallery.vendor_id
            AND ((vp.is_approved = true AND vp.is_active = true) OR vp.user_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Vendors manage own gallery" ON public.vendor_gallery;
CREATE POLICY "Vendors manage own gallery" ON public.vendor_gallery
    FOR ALL USING (
        vendor_id = public.get_vendor_id_for_current_user() OR public.is_admin()
    );

-- Bookings policies
DROP POLICY IF EXISTS "Customers and Vendors view own bookings" ON public.bookings;
CREATE POLICY "Customers and Vendors view own bookings" ON public.bookings
    FOR SELECT USING (
        customer_id = auth.uid() 
        OR vendor_id = public.get_vendor_id_for_current_user() 
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Customers insert booking" ON public.bookings;
CREATE POLICY "Customers insert booking" ON public.bookings
    FOR INSERT WITH CHECK (
        customer_id = auth.uid()
    );

DROP POLICY IF EXISTS "Customer and Vendor update booking" ON public.bookings;
CREATE POLICY "Customer and Vendor update booking" ON public.bookings
    FOR UPDATE USING (
        customer_id = auth.uid() 
        OR vendor_id = public.get_vendor_id_for_current_user() 
        OR public.is_admin()
    );

-- Reviews policies
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers create review" ON public.reviews;
CREATE POLICY "Customers create review" ON public.reviews
    FOR INSERT WITH CHECK (
        customer_id = auth.uid()
    );

-- Platform settings policies
DROP POLICY IF EXISTS "Public read settings" ON public.platform_settings;
CREATE POLICY "Public read settings" ON public.platform_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage settings" ON public.platform_settings;
CREATE POLICY "Admin manage settings" ON public.platform_settings
    FOR ALL USING (public.is_admin());

-- 6. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, mobile)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        COALESCE(NEW.raw_user_meta_data->>'mobile', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        mobile = EXCLUDED.mobile;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. STORAGE BUCKETS SETUP (Run in SQL editor or configure in Storage UI)
-- Buckets: 'vendor-profile', 'vendor-gallery'
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-profile', 'vendor-profile', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-gallery', 'vendor-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public read vendor profile photos" ON storage.objects
    FOR SELECT USING (bucket_id IN ('vendor-profile', 'vendor-gallery'));

CREATE POLICY "Authenticated users upload vendor profile photos" ON storage.objects
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        bucket_id IN ('vendor-profile', 'vendor-gallery')
    );

CREATE POLICY "Users update own photos" ON storage.objects
    FOR UPDATE USING (
        auth.uid() = owner AND
        bucket_id IN ('vendor-profile', 'vendor-gallery')
    );

CREATE POLICY "Users delete own photos" ON storage.objects
    FOR DELETE USING (
        auth.uid() = owner AND
        bucket_id IN ('vendor-profile', 'vendor-gallery')
    );

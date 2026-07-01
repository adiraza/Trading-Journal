-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trades policies
CREATE POLICY "Users can view own trades" ON public.trades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON public.trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON public.trades
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" ON public.trades
    FOR DELETE USING (auth.uid() = user_id);

-- Trade Images policies
CREATE POLICY "Users can view own trade images" ON public.trade_images
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trade images" ON public.trade_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trade images" ON public.trade_images
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trade images" ON public.trade_images
    FOR DELETE USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view own settings" ON public.settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON public.settings
    FOR DELETE USING (auth.uid() = user_id);

-- Weekly Stats policies
CREATE POLICY "Users can view own weekly stats" ON public.weekly_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly stats" ON public.weekly_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly stats" ON public.weekly_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly stats" ON public.weekly_stats
    FOR DELETE USING (auth.uid() = user_id);

-- Monthly Stats policies
CREATE POLICY "Users can view own monthly stats" ON public.monthly_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly stats" ON public.monthly_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly stats" ON public.monthly_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly stats" ON public.monthly_stats
    FOR DELETE USING (auth.uid() = user_id);

-- Sync Queue policies
CREATE POLICY "Users can view own sync queue" ON public.sync_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync queue" ON public.sync_queue
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync queue" ON public.sync_queue
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync queue" ON public.sync_queue
    FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

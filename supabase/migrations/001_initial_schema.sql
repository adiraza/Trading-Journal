-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    trader_name TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table
CREATE TABLE public.trades (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    entry_date TEXT NOT NULL,
    entry_time TEXT NOT NULL,
    entry_day_name TEXT NOT NULL,
    entry_month TEXT NOT NULL,
    entry_week_number INTEGER NOT NULL,
    entry_year INTEGER NOT NULL,
    entry_session TEXT NOT NULL,
    instrument TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
    stop_loss NUMERIC NOT NULL,
    take_profit NUMERIC NOT NULL,
    entry_model TEXT NOT NULL,
    market_structure TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    trade_type TEXT NOT NULL,
    notes TEXT DEFAULT '',
    psychology_notes TEXT DEFAULT '',
    mistakes TEXT DEFAULT '',
    lessons TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('open', 'closed')),
    exit_date TEXT,
    exit_time TEXT,
    exit_day_name TEXT,
    exit_session TEXT,
    exit_reason TEXT CHECK (exit_reason IN ('manual_close', 'tp', 'sl', 'partial_close', 'be', 'trailing_stop', 'time_exit', 'other')),
    profit_loss NUMERIC,
    profit_loss_percent NUMERIC,
    risk_percent_actual NUMERIC,
    rr NUMERIC,
    roi NUMERIC,
    net_pnl NUMERIC,
    exit_notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trade Images table
CREATE TABLE public.trade_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trade_id TEXT REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    data TEXT NOT NULL, -- Base64 data or storage URL
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('before_entry', 'after_exit')),
    storage_url TEXT, -- Supabase Storage URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE public.settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    trader_name TEXT DEFAULT '',
    default_account_size NUMERIC DEFAULT 10000,
    default_currency TEXT DEFAULT 'USD',
    risk_per_trade NUMERIC DEFAULT 1,
    commission NUMERIC DEFAULT 0,
    spread NUMERIC DEFAULT 0,
    trading_days INTEGER[] DEFAULT '{1, 2, 3, 4, 5}',
    preferred_time_zone TEXT DEFAULT 'UTC',
    session_timings JSONB DEFAULT '[]',
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly Statistics table (cached analytics)
CREATE TABLE public.weekly_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    year INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    breakeven_trades INTEGER DEFAULT 0,
    total_profit NUMERIC DEFAULT 0,
    total_loss NUMERIC DEFAULT 0,
    net_pnl NUMERIC DEFAULT 0,
    net_rr NUMERIC DEFAULT 0,
    win_rate NUMERIC DEFAULT 0,
    average_rr NUMERIC DEFAULT 0,
    profit_factor NUMERIC DEFAULT 0,
    largest_win NUMERIC DEFAULT 0,
    largest_loss NUMERIC DEFAULT 0,
    average_win NUMERIC DEFAULT 0,
    average_loss NUMERIC DEFAULT 0,
    expectancy NUMERIC DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_win_streak INTEGER DEFAULT 0,
    longest_loss_streak INTEGER DEFAULT 0,
    best_trade NUMERIC DEFAULT 0,
    worst_trade NUMERIC DEFAULT 0,
    best_day TEXT,
    worst_day TEXT,
    best_session TEXT,
    worst_session TEXT,
    most_used_entry_model TEXT,
    highest_rr NUMERIC DEFAULT 0,
    lowest_rr NUMERIC DEFAULT 0,
    average_holding_time NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year, week_number)
);

-- Monthly Statistics table (cached analytics)
CREATE TABLE public.monthly_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    year INTEGER NOT NULL,
    month TEXT NOT NULL,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    breakeven_trades INTEGER DEFAULT 0,
    total_profit NUMERIC DEFAULT 0,
    total_loss NUMERIC DEFAULT 0,
    net_pnl NUMERIC DEFAULT 0,
    net_rr NUMERIC DEFAULT 0,
    win_rate NUMERIC DEFAULT 0,
    average_rr NUMERIC DEFAULT 0,
    profit_factor NUMERIC DEFAULT 0,
    largest_win NUMERIC DEFAULT 0,
    largest_loss NUMERIC DEFAULT 0,
    average_win NUMERIC DEFAULT 0,
    average_loss NUMERIC DEFAULT 0,
    expectancy NUMERIC DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_win_streak INTEGER DEFAULT 0,
    longest_loss_streak INTEGER DEFAULT 0,
    best_trade NUMERIC DEFAULT 0,
    worst_trade NUMERIC DEFAULT 0,
    best_day TEXT,
    worst_day TEXT,
    best_session TEXT,
    worst_session TEXT,
    most_used_entry_model TEXT,
    highest_rr NUMERIC DEFAULT 0,
    lowest_rr NUMERIC DEFAULT 0,
    average_holding_time NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year, month)
);

-- Sync Queue table (for offline synchronization)
CREATE TABLE public.sync_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    table_name TEXT NOT NULL CHECK (table_name IN ('trades', 'trade_images', 'settings')),
    record_id TEXT NOT NULL,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error TEXT
);

-- Create indexes for performance
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_entry_date ON public.trades(entry_date);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_trades_instrument ON public.trades(instrument);
CREATE INDEX idx_trades_entry_model ON public.trades(entry_model);
CREATE INDEX idx_trades_created_at ON public.trades(created_at DESC);

CREATE INDEX idx_trade_images_trade_id ON public.trade_images(trade_id);
CREATE INDEX idx_trade_images_user_id ON public.trade_images(user_id);

CREATE INDEX idx_settings_user_id ON public.settings(user_id);

CREATE INDEX idx_weekly_stats_user_id ON public.weekly_stats(user_id);
CREATE INDEX idx_weekly_stats_year_week ON public.weekly_stats(year, week_number);

CREATE INDEX idx_monthly_stats_user_id ON public.monthly_stats(user_id);
CREATE INDEX idx_monthly_stats_year_month ON public.monthly_stats(year, month);

CREATE INDEX idx_sync_queue_user_id ON public.sync_queue(user_id);
CREATE INDEX idx_sync_queue_processed ON public.sync_queue(processed_at) WHERE processed_at IS NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_stats_updated_at BEFORE UPDATE ON public.weekly_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_stats_updated_at BEFORE UPDATE ON public.monthly_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

# Trading Journal

A professional, offline-first trading journal application built with React, TypeScript, and Supabase. Track your trades, analyze performance, and improve your trading strategy.

## Features

- **Trade Management**: Create, edit, and delete trades with comprehensive details
- **Analytics**: Dashboard with profit/loss, win rate, RR ratios, and performance charts
- **Multi-Period Analysis**: Weekly, monthly, and session-based analytics
- **Entry Models**: Track and analyze different trading strategies
- **Instrument Analysis**: Performance breakdown by trading instruments
- **Calendar View**: Visual calendar of trading activity
- **Screenshot Gallery**: Store and organize trade screenshots
- **Export/Import**: Backup and restore your trading data
- **Profile Page**: Comprehensive lifetime trading statistics
- **Offline-First**: Works offline with automatic synchronization
- **PWA**: Installable on desktop and mobile devices
- **Authentication**: Email/password and Google OAuth support

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Recharts (charts)
- Day.js (date handling)
- Lucide React (icons)

### Backend
- Supabase (PostgreSQL database)
- Supabase Authentication
- Supabase Storage (screenshots)

### Hosting
- Cloudflare Pages

### Offline Storage
- IndexedDB (local cache)
- Dexie (IndexedDB wrapper)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- Cloudflare account (free tier works)

## Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

See `.env.example` for reference.

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

### 2. Run Database Migrations

In your Supabase dashboard:
1. Go to SQL Editor
2. Run the migration files in order:

```sql
-- Run: supabase/migrations/001_initial_schema.sql
-- Run: supabase/migrations/002_rls_policies.sql
```

### 3. Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Create a new bucket named `trade-screenshots`
3. Make it public
4. Enable RLS policies for the bucket

### 4. Configure Authentication

1. Go to Authentication → Providers
2. Enable Email provider
3. Enable Google OAuth (optional)
   - Add your Google OAuth credentials
   - Set redirect URL: `https://your-domain.com/auth/callback`

### 5. Get Environment Variables

1. Go to Project Settings → API
2. Copy `Project URL` → `VITE_SUPABASE_URL`
3. Copy `anon public` key → `VITE_SUPABASE_ANON_KEY`

## Local Development

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Supabase credentials
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5174`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment to Cloudflare Pages

### Option 1: Git Integration (Recommended)

1. Push your code to GitHub/GitLab
2. Go to Cloudflare Dashboard → Pages
3. Click "Create a project"
4. Connect your Git repository
5. Configure build settings:

```yaml
Build command: npm run build
Build output directory: dist
Root directory: (leave empty)
```

6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

7. Click "Save and Deploy"

### Option 2: Direct Upload

```bash
# Build the project
npm run build

# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist
```

### Custom Domain (Optional)

1. Go to your Pages project in Cloudflare dashboard
2. Click "Custom domains"
3. Add your domain
4. Update DNS records as instructed
5. Update Supabase redirect URL to match your custom domain

## Migration from Local to Cloud

The app supports both local (IndexedDB) and cloud (Supabase) storage. To migrate:

1. Export your data from the local app (Export page)
2. Sign up/login to the cloud version
3. Import your data (this feature will need to be implemented)

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Anonymous key is safe for client-side use
- Never expose service role keys in client code

## Performance Optimizations

- **Lazy Loading**: All pages are code-split and loaded on demand
- **Memoization**: Expensive calculations are cached
- **IndexedDB**: Local caching for offline access
- **Service Worker**: PWA caching for instant loads
- **Image Optimization**: Screenshots stored in Supabase CDN

## Offline Functionality

The app works offline by:
1. Storing data in IndexedDB
2. Queueing changes when offline
3. Automatically syncing when connection returns
4. Using service worker for asset caching

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues

1. Verify environment variables are set correctly
2. Check Supabase project is active
3. Verify RLS policies are enabled
4. Check browser console for specific errors

### PWA Not Installing

1. Ensure the app is served over HTTPS (required for PWA)
2. Check service worker is registered in browser DevTools
3. Verify manifest.json is accessible

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, etc.)
├── hooks/          # Custom React hooks
├── lib/            # Utilities (Supabase, storage, sync)
├── pages/          # Page components
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── db/             # IndexedDB configuration
```

## License

MIT

## Support

For issues and questions:
- Open an issue on GitHub
- Check Supabase documentation: https://supabase.com/docs
- Check Cloudflare Pages documentation: https://developers.cloudflare.com/pages

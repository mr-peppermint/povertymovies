# PovertyMovies

A React webpage for browsing movies and TV shows, searching titles, viewing details, and saving titles to a watch-later list.

## Run locally

Requirements: Node.js and npm.

```sh
npm install
```

Create a `.env` file in the project root:

```sh
VITE_TMDB_KEY=your_tmdb_api_key

# Supabase Credentials (for Username Auth & Live Watch Time Leaderboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open and run the provided [`supabase-schema.sql`](file:///Users/dex/Documents/GitHub/povertymovies/supabase-schema.sql) file.
4. Copy your **Project URL** and **anon / public key** from `Settings` -> `API` into your `.env` file.

*Note: If Supabase credentials are not set, the app automatically runs in a local demo mode so all features and leaderboard mechanics can still be tested locally.*

Start the development server at [http://localhost:5173](http://localhost:5173):

```sh
npm run dev
```

To create and preview a production build:

```sh
npm run build
```

## Features

- **Username Auth**: Pure username & password authentication with customizable avatar picker (powered by Supabase).
- **Watch Time Tracking**: Automatically tracks time spent watching movies and TV episodes with active tab detection and batch synchronization.
- **Watch Time Leaderboard**: Real-time podium and ranking table displaying top streamers, cinephile tiers (Cinema Legend, Binge Master, Film Buff, etc.), user progress indicators, and search filter.
- **Browse & Stream**: Movies, TV series, search, cast lists, and server selection.
- **Watch Later**: Offline/local bookmarking.


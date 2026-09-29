# PovertyMovies

A React webpage for browsing movies and TV shows, searching titles, viewing details, and saving titles to a watch-later list.

## Run locally

Requirements: Node.js and npm.

```sh
npm install
```

Create a `.env` file in the project root with a TMDB API key:

```sh
VITE_TMDB_KEY=your_tmdb_api_key
```

Start the development server at [http://localhost:5173](http://localhost:5173):

```sh
npm run dev
```

To create and preview a production build:

```sh
npm run build
npm run preview
```

## Worktree

- `src/pages/` — home, movies, TV, search, details, and watch-later pages.
- `src/components/` — shared page and media UI.
- `src/api/tmdb.js` — TMDB requests and video embed URL helpers.
- `src/hooks/` and `src/context/` — watch-later and app error state.
- `public/` — static assets.

## API

The webpage uses the [TMDB API v3](https://developer.themoviedb.org/docs) at `https://api.themoviedb.org/3`. Set `VITE_TMDB_KEY` in the root `.env`; Vite exposes `VITE_` variables to browser code, so this key is not a server-side secret. Do not commit a real key.

The API helper supports trending, popular, top-rated, search, title details (including credits and videos), TV season details, genres, and discovery/filtering. Images use TMDB's image service (`https://image.tmdb.org/t/p`). Video playback uses third-party VidSrc embed URLs.

TMDB API reference: [developer.themoviedb.org](https://developer.themoviedb.org/docs).

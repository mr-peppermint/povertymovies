import styles from './VideoPlayer.module.css'

const EMBED_BASE = 'https://vidsrc.sbs/embed'

/**
 * VideoPlayer
 *
 * Props:
 *  - mediaType: 'movie' | 'tv'
 *  - tmdbId: number | string
 *  - season: number (TV only)
 *  - episode: number (TV only)
 */
export default function VideoPlayer({ mediaType, tmdbId, season, episode }) {
  if (!tmdbId) return null

  // Build embed URL
  let src = ''
  if (mediaType === 'tv' && season && episode) {
    src = `${EMBED_BASE}/tv/${tmdbId}/${season}/${episode}`
  } else {
    src = `${EMBED_BASE}/movie/${tmdbId}`
  }

  // Append query params
  const params = new URLSearchParams({
    autoplay: '1',
    color: 'e50914',
    sub: 'en',
  })
  src = `${src}?${params.toString()}`

  return (
    <div className={styles.playerWrap}>
      <div className={styles.playerInner}>
        <iframe
          src={src}
          className={styles.iframe}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          title="Video Player"
          referrerPolicy="origin"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  )
}

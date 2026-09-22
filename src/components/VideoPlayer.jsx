export default function VideoPlayer({ src, title = 'Video Player' }) {
  if (!src) return null

  return (
    <div className="player-section">
      <h2>▶ Watch Now</h2>
      <div className="player-wrapper">
        <iframe
          src={src}
          title={title}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          referrerPolicy="origin"
          scrolling="no"
        />
      </div>
      <p style={{
        marginTop: '10px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        lineHeight: '1.6'
      }}>
        Having trouble? Try disabling your ad blocker or switching to a different browser.
      </p>
    </div>
  )
}

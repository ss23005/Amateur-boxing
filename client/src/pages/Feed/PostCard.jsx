import { useState, useRef } from 'react'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { timeAgo } from './feedUtils'

function HeartIcon({ filled }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"
      style={{ width: 22, height: 22 }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}

export default function PostCard({ post: initialPost, onOpenDetail }) {
  const { user } = useAuth()
  const [post,      setPost]      = useState(initialPost)
  const [heartAnim, setHeartAnim] = useState(false)
  const lastTap = useRef(0)

  const likedByMe = user && post.likes?.some(id =>
    (id._id ?? id).toString() === user._id.toString()
  )

  const triggerHeart = () => {
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 900)
  }

  const handleLike = async () => {
    if (!user) return
    const wasLiked = likedByMe
    setPost(p => ({
      ...p,
      likes: wasLiked
        ? p.likes.filter(id => (id._id ?? id).toString() !== user._id.toString())
        : [...p.likes, user._id],
    }))
    try {
      await api.put(`/feed/${post._id}/like`)
    } catch {
      setPost(initialPost)
    }
  }

  // Double-tap to like (touch)
  const handleTouchEnd = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      if (!likedByMe) handleLike()
      triggerHeart()
    }
    lastTap.current = now
  }

  const name    = post.author?.name ?? 'Anonymous'
  const initial = name.charAt(0).toUpperCase()
  const hasImage = post.media?.[0]

  return (
    <article className="ig-post">

      {/* Header */}
      <div className="ig-post-header">
        <div className="ig-avatar">{initial}</div>
        <div className="ig-post-header-info">
          <span className="ig-username">{name}</span>
          <span className="ig-post-time">{timeAgo(post.createdAt)}</span>
        </div>
      </div>

      {/* Media / text */}
      {hasImage ? (
        <div
          className="ig-post-media"
          onTouchEnd={handleTouchEnd}
          onClick={onOpenDetail ? () => onOpenDetail(post) : undefined}
          style={{ cursor: onOpenDetail ? 'pointer' : 'default' }}
        >
          <img src={post.media[0]} alt="" className="ig-post-image" loading="lazy" />
          {heartAnim && <div className="ig-heart-burst">♥</div>}
        </div>
      ) : (
        <div
          className="ig-post-textbg"
          onTouchEnd={handleTouchEnd}
          onClick={onOpenDetail ? () => onOpenDetail(post) : undefined}
          style={{ cursor: onOpenDetail ? 'pointer' : 'default' }}
        >
          <p className="ig-post-textbg-content">{post.content}</p>
          {heartAnim && <div className="ig-heart-burst">♥</div>}
        </div>
      )}

      {/* Actions */}
      <div className="ig-post-actions">
        <button
          className={`ig-action-btn${likedByMe ? ' liked' : ''}`}
          onClick={handleLike}
          aria-label="Like"
        >
          <HeartIcon filled={likedByMe} />
        </button>
        <button
          className="ig-action-btn"
          onClick={() => onOpenDetail?.(post)}
          aria-label="Comment"
        >
          <CommentIcon />
        </button>
        {user && (
          <button
            className="ig-action-btn ig-share-btn"
            aria-label="Share"
          >
            <ShareIcon />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="ig-post-stats">
        <p className="ig-like-count">
          {post.likes?.length ?? 0} {post.likes?.length === 1 ? 'like' : 'likes'}
        </p>
        {hasImage && post.content && (
          <p className="ig-caption">
            <span className="ig-caption-author">{name}</span> {post.content}
          </p>
        )}
        {post.comments?.length > 0 && (
          <button className="ig-view-comments" onClick={() => onOpenDetail?.(post)}>
            View all {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>



    </article>
  )
}

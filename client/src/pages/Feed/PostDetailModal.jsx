import { useState, useRef } from 'react'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { timeAgo } from './feedUtils'

export default function PostDetailModal({ post: initialPost, onClose, onLikeToggle }) {
  const { user } = useAuth()
  const [post,       setPost]       = useState(initialPost)
  const [commentText, setCommentText] = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const commentRef = useRef()

  const likedByMe = user && post.likes?.some(id =>
    (id._id ?? id).toString() === user._id.toString()
  )

  const handleLike = async () => {
    // Optimistic
    const wasLiked = likedByMe
    setPost(p => ({
      ...p,
      likes: wasLiked
        ? p.likes.filter(id => (id._id ?? id).toString() !== user._id.toString())
        : [...p.likes, user._id],
    }))
    onLikeToggle?.(post._id, wasLiked)
    try {
      await api.put(`/feed/${post._id}/like`)
    } catch {
      setPost(initialPost)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const { data: newComment } = await api.post(`/feed/${post._id}/comment`, {
        content: commentText,
      })
      setPost(p => ({ ...p, comments: [...p.comments, newComment] }))
      setCommentText('')
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const initial = post.author?.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="pdm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="pdm-modal">

        {/* Left — image */}
        <div className="pdm-image-col">
          {post.media?.[0] ? (
            <img src={post.media[0]} alt="" className="pdm-image" />
          ) : (
            <div className="pdm-text-bg">
              <p className="pdm-text-content">{post.content}</p>
            </div>
          )}
        </div>

        {/* Right — detail */}
        <div className="pdm-detail-col">

          {/* Header */}
          <div className="pdm-detail-header">
            <div className="ig-avatar">{initial}</div>
            <span className="pdm-username">{post.author?.name}</span>
            <button className="pdm-close-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Caption */}
          {post.content && post.media?.[0] && (
            <div className="pdm-caption-row">
              <div className="ig-avatar ig-avatar-sm">{initial}</div>
              <p className="pdm-caption">
                <strong>{post.author?.name}</strong> {post.content}
              </p>
            </div>
          )}

          {/* Comments */}
          <div className="pdm-comments">
            {post.comments?.length === 0 && (
              <p className="pdm-no-comments">No comments yet. Be the first.</p>
            )}
            {post.comments?.map(c => (
              <div key={c._id} className="pdm-comment-row">
                <div className="ig-avatar ig-avatar-sm">
                  {c.author?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="pdm-comment-body">
                  <span className="pdm-comment-author">{c.author?.name}</span>
                  {' '}
                  <span className="pdm-comment-text">{c.content}</span>
                  <p className="pdm-comment-time">{timeAgo(c.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action bar */}
          <div className="pdm-actions">
            <button
              className={`ig-action-btn${likedByMe ? ' liked' : ''}`}
              onClick={handleLike}
            >
              <HeartIcon filled={likedByMe} />
            </button>
            <button className="ig-action-btn" onClick={() => commentRef.current?.focus()}>
              <CommentIcon />
            </button>
          </div>

          <p className="pdm-like-count">
            {post.likes?.length ?? 0} {post.likes?.length === 1 ? 'like' : 'likes'}
          </p>
          <p className="pdm-post-time">{timeAgo(post.createdAt)}</p>

          {/* Add comment */}
          {user && (
            <form className="pdm-add-comment" onSubmit={handleComment}>
              <input
                ref={commentRef}
                className="pdm-comment-input"
                placeholder="Add a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                className="pdm-comment-submit"
                disabled={!commentText.trim() || submitting}
              >
                Post
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function HeartIcon({ filled }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

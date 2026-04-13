import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'
import PostDetailModal from './PostDetailModal'

const PAGE_SIZE = 8

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}

export default function Feed() {
  const { user } = useAuth()
  const [posts,       setPosts]       = useState([])
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(true)
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState('')
  const [showCreate,  setShowCreate]  = useState(false)
  const [detailPost,  setDetailPost]  = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const sentinelRef = useRef()

  // Track mobile breakpoint (for grid layout only)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Initial load
  useEffect(() => {
    setLoading(true)
    api.get(`/feed?page=1&limit=${PAGE_SIZE}`)
      .then(({ data }) => {
        setPosts(data.posts)
        setHasMore(data.hasMore)
        setPage(1)
      })
      .catch(() => setError('Failed to load feed.'))
      .finally(() => setLoading(false))
  }, [])

  // Load more
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const { data } = await api.get(`/feed?page=${nextPage}&limit=${PAGE_SIZE}`)
      setPosts(prev => [...prev, ...data.posts])
      setHasMore(data.hasMore)
      setPage(nextPage)
    } catch {
      // ignore
    } finally {
      setLoadingMore(false)
    }
  }, [page, hasMore, loadingMore])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  const handleCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev])
  }

  const handleLikeToggle = (postId) => {
    // PostCard manages its own optimistic state; this is a no-op hook for detail sync
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p
      const liked = p.likes.some(id => (id._id ?? id).toString() === user?._id?.toString())
      return {
        ...p,
        likes: liked
          ? p.likes.filter(id => (id._id ?? id).toString() !== user._id.toString())
          : [...p.likes, user._id],
      }
    }))
  }

  if (loading) return <div className="loading-state">Loading feed…</div>
  if (error)   return <div className="page"><div className="error-banner">{error}</div></div>

  return (
    <div className="feed-page">

      {/* ── Header ── */}
      <div className="feed-page-header" data-tutorial="feed-main">
        <div>
          <p className="feed-page-eyebrow">Community</p>
          <h1 className="feed-page-title">Feed</h1>
        </div>
        {user && (
          <button className="btn btn-outline btn-sm feed-new-btn" onClick={() => setShowCreate(true)}>
            <PlusIcon /> New Post
          </button>
        )}
      </div>

      {/* ── Empty state ── */}
      {posts.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">Nothing here yet</p>
          <p className="empty-state-desc">Be the first to share something with the community.</p>
          {user && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>
              Create First Post
            </button>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {posts.length > 0 && (
        <div className={isMobile ? 'ig-feed-mobile' : 'ig-feed-grid'}>
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onOpenDetail={setDetailPost}
            />
          ))}
        </div>
      )}

      {/* ── Infinite scroll sentinel ── */}
      <div ref={sentinelRef} className="feed-sentinel">
        {loadingMore && <div className="feed-loading-more">Loading…</div>}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {detailPost && (
        <PostDetailModal
          post={detailPost}
          onClose={() => setDetailPost(null)}
          onLikeToggle={handleLikeToggle}
        />
      )}
    </div>
  )
}

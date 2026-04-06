import { useFetch } from '../../hooks/useFetch'
import PostCard from './PostCard'

export default function Feed() {
  const { data: posts, loading, error } = useFetch('/feed')

  if (loading) return <p>Loading feed...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h2>Feed</h2>
      {posts?.length === 0 && <p>No posts yet.</p>}
      {posts?.map((post) => <PostCard key={post._id} post={post} />)}
    </div>
  )
}

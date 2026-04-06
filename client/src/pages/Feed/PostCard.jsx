export default function PostCard({ post }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <p><strong>{post.author?.name}</strong></p>
      <p>{post.content}</p>
      <p>{post.likes?.length ?? 0} likes · {post.comments?.length ?? 0} comments</p>
    </div>
  )
}

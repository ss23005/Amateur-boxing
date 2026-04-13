// Vercel serverless entry point — wraps the Express app
// Uses dynamic import because server/ uses ESM ("type":"module")
import app from '../server/server.js'

export default app

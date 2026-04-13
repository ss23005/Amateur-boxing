// Vercel serverless entry point
// CommonJS wrapper with dynamic import so ESM server module loads correctly
let app

module.exports = async (req, res) => {
  if (!app) {
    const mod = await import('../server/server.js')
    app = mod.default
  }
  return app(req, res)
}

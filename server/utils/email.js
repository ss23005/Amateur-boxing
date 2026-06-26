import sgMail from '@sendgrid/mail'

const APP      = 'Boxing Amateur'
const SLOGAN   = 'Grass roots to greatness'
const NAVY     = '#0a2463'
const RED      = '#e8192c'
const WHITE    = '#ffffff'
const BG       = '#f5f5f5'   // very light grey outer wrap — no blue tint
const BORDER   = '#e0e0e0'
const TEXT     = '#000000'
const TEXT_2   = '#333333'
const TEXT_3   = '#666666'

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap'
const FONT_DM  = "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const FONT_BAR = "'Barlow Condensed', 'Arial Narrow', Impact, sans-serif"

function baseTemplate({ preheader, body }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${APP}</title>
  <!--[if !mso]><!-->
  <link href="${FONT_URL}" rel="stylesheet" type="text/css">
  <!--<![endif]-->
  <style>
    @import url('${FONT_URL}');

    /* Force light mode — prevents Apple Mail dark-mode recolouring */
    :root { color-scheme: light !important; supported-color-schemes: light !important; }

    * { -webkit-text-size-adjust: 100%; }

    body,
    .email-bg,
    .email-body,
    .email-footer { background-color: #ffffff !important; }

    .email-outer { background-color: #f5f5f5 !important; }
    .email-header { background-color: #0a2463 !important; }
    .email-accent { background-color: #e8192c !important; }

    body, p, td, span, a { color: #000000 !important; }
    .text-muted { color: #666666 !important; }
    .text-white { color: #ffffff !important; }
    .text-navy  { color: #0a2463 !important; }
    .text-red   { color: #e8192c !important; }

    @media (prefers-color-scheme: dark) {
      body,
      .email-bg,
      .email-body,
      .email-footer { background-color: #ffffff !important; }
      .email-outer  { background-color: #f5f5f5 !important; }
      .email-header { background-color: #0a2463 !important; }
      .email-accent { background-color: #e8192c !important; }
      body, p, td, span { color: #000000 !important; }
      .text-muted { color: #666666 !important; }
      .text-white { color: #ffffff !important; }
      .text-navy  { color: #0a2463 !important; }
      .text-red   { color: #e8192c !important; }
    }
  </style>
</head>
<body class="email-bg" style="margin:0;padding:0;background-color:#f5f5f5 !important;font-family:${FONT_DM};-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly;">

  <!-- preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table class="email-outer" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f5f5 !important;padding:48px 16px 64px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

          <!-- ── Navy header ── -->
          <tr>
            <td class="email-header" style="background-color:#0a2463 !important;border-radius:14px 14px 0 0;padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background-color:#0a2463 !important;padding:32px 40px 28px;text-align:center;">
                    ${process.env.LOGO_URL ? `<img src="${process.env.LOGO_URL}" alt="${APP}" width="72" height="72" style="display:block;margin:0 auto 16px;border-radius:8px;">` : ''}
                    <p class="text-white" style="margin:0 0 8px;font-family:${FONT_BAR};font-size:38px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#ffffff !important;line-height:1;">${APP}</p>
                    <p class="text-red" style="margin:0;font-family:${FONT_BAR};font-size:13px;font-weight:700;font-style:italic;letter-spacing:2px;text-transform:uppercase;color:#e8192c !important;line-height:1;">${SLOGAN}</p>
                  </td>
                </tr>
                <tr>
                  <td class="email-accent" style="height:5px;background-color:#e8192c !important;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── White body ── -->
          <tr>
            <td class="email-body" style="background-color:#ffffff !important;padding:40px 40px 36px;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;">
              ${body}
            </td>
          </tr>

          <!-- ── White footer ── -->
          <tr>
            <td class="email-footer" style="background-color:#ffffff !important;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 14px 14px;padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr><td class="email-accent" style="height:3px;background-color:#e8192c !important;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background-color:#ffffff !important;padding:20px 40px 24px;text-align:center;">
                    <p class="text-navy" style="margin:0 0 4px;font-family:${FONT_BAR};font-size:16px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#0a2463 !important;">${APP}</p>
                    <p class="text-red" style="margin:0 0 14px;font-family:${FONT_BAR};font-size:12px;font-weight:700;font-style:italic;letter-spacing:1.5px;text-transform:uppercase;color:#e8192c !important;">${SLOGAN}</p>
                    <p class="text-muted" style="margin:0;font-family:${FONT_DM};font-size:11px;color:#666666 !important;line-height:1.6;">
                      You received this email because you created an account on ${APP}.<br>
                      If you didn't sign up, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// ── Clean system template (matches Login/Register auth-card style) ──────────
function systemBaseTemplate({ preheader, body }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${APP}</title>
  <!--[if !mso]><!-->
  <link href="${FONT_URL}" rel="stylesheet" type="text/css">
  <!--<![endif]-->
  <style>
    @import url('${FONT_URL}');
    :root { color-scheme: light !important; supported-color-schemes: light !important; }
    * { -webkit-text-size-adjust: 100%; }
    body, .sys-bg, .sys-card { background-color: #f5f5f5 !important; }
    .sys-card-inner, .sys-footer { background-color: #ffffff !important; }
    .sys-accent { background-color: #e8192c !important; }
    body, p, td, span, a { color: #000000 !important; }
    .sys-text-muted { color: #666666 !important; }
    .sys-text-navy  { color: #0a2463 !important; }
    .sys-text-red   { color: #e8192c !important; }
    @media (prefers-color-scheme: dark) {
      body, .sys-bg, .sys-card { background-color: #f5f5f5 !important; }
      .sys-card-inner, .sys-footer { background-color: #ffffff !important; }
      .sys-accent { background-color: #e8192c !important; }
      body, p, td, span { color: #000000 !important; }
      .sys-text-muted { color: #666666 !important; }
      .sys-text-navy  { color: #0a2463 !important; }
      .sys-text-red   { color: #e8192c !important; }
    }
  </style>
</head>
<body class="sys-bg" style="margin:0;padding:0;background-color:#f5f5f5 !important;font-family:${FONT_DM};-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table class="sys-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f5f5 !important;padding:48px 16px 64px;">
    <tr>
      <td align="center">
        <table class="sys-card" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;background-color:#f5f5f5 !important;">

          <!-- Red top accent stripe -->
          <tr>
            <td class="sys-accent" style="height:4px;background-color:#e8192c !important;border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Logo / wordmark -->
          <tr>
            <td class="sys-card-inner" style="background-color:#ffffff !important;padding:28px 40px 20px;text-align:center;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;">
              ${process.env.LOGO_URL ? `<img src="${process.env.LOGO_URL}" alt="${APP}" width="48" height="48" style="display:block;margin:0 auto 12px;border-radius:6px;">` : ''}
              <p class="sys-text-navy" style="margin:0;font-family:${FONT_BAR};font-size:24px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#0a2463 !important;line-height:1;">${APP}</p>
            </td>
          </tr>

          <!-- Hairline divider -->
          <tr>
            <td style="height:1px;background-color:#e0e0e0 !important;font-size:0;line-height:0;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="sys-card-inner" style="background-color:#ffffff !important;padding:36px 40px 32px;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="sys-footer" style="background-color:#ffffff !important;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px;padding:16px 40px 20px;text-align:center;">
              <p class="sys-text-muted" style="margin:0;font-family:${FONT_DM};font-size:11px;color:#666666 !important;line-height:1.6;">
                You received this email because you created an account on ${APP}.<br>
                If you didn't sign up, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

export async function sendSystemVerificationEmail(user, code) {
  if (!process.env.SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY is not set')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const digitBoxes = code.split('').map(d =>
    `<td style="width:52px;height:60px;background-color:#ffffff !important;border:2px solid #0a2463;border-radius:8px;text-align:center;vertical-align:middle;font-family:${FONT_BAR};font-size:32px;font-weight:800;color:#0a2463 !important;letter-spacing:0;line-height:1;">${d}</td>
     <td style="width:8px;font-size:0;">&nbsp;</td>`
  ).join('')

  const body = `
    <h1 style="margin:0 0 6px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:#0a2463 !important;line-height:1.1;">Verify your email</h1>
    <p style="margin:0 0 28px;font-family:${FONT_DM};font-size:15px;color:#333333 !important;line-height:1.65;">
      Hi <strong style="color:#000000 !important;font-weight:600;">${user.name}</strong>, welcome to ${APP}!<br>
      Enter this 6-digit code to verify your email address.
    </p>

    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 12px;">
      <tr>${digitBoxes}</tr>
    </table>

    <p style="margin:0 0 28px;font-family:${FONT_DM};font-size:12px;color:#666666 !important;text-align:center;">
      Expires in <strong>15 minutes</strong>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:0;">
      <tr><td style="height:1px;background-color:#e0e0e0 !important;font-size:0;">&nbsp;</td></tr>
    </table>
  `

  await sgMail.send({
    to:      user.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `${code} is your ${APP} verification code`,
    html:    systemBaseTemplate({
      preheader: `Your verification code is ${code}. It expires in 15 minutes.`,
      body,
    }),
  })
}

export async function sendMessageNotificationEmail(recipient, sender, content) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const clientUrl  = process.env.CLIENT_URL ?? 'https://boxingamateur.com'
  const preview    = content
    ? (content.length > 180 ? content.slice(0, 180).trimEnd() + '…' : content)
    : null

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:#0a2463 !important;line-height:1.1;">New Message</h1>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:15px;color:#333333 !important;line-height:1.65;">
      <strong style="color:#000000 !important;font-weight:600;">${sender.name}</strong> sent you a message on ${APP}.
    </p>

    ${preview ? `
    <!-- Message preview card -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#f5f5f5 !important;border:1px solid #e0e0e0;border-left:4px solid #0a2463;border-radius:8px;padding:16px 20px;">
          <p style="margin:0;font-family:${FONT_DM};font-size:14px;color:#333333 !important;line-height:1.7;">${preview}</p>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- CTA button -->
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background-color:#e8192c !important;border-radius:8px;padding:0;">
          <a href="${clientUrl}/discover" style="display:inline-block;padding:13px 28px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ffffff !important;text-decoration:none;">Open ${APP}</a>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr><td style="height:1px;background-color:#e0e0e0 !important;font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#666666 !important;line-height:1.6;">
      You received this because <strong>${sender.name}</strong> sent you a message on ${APP}.
    </p>
  `

  await sgMail.send({
    to:      recipient.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `${sender.name} sent you a message on ${APP}`,
    html:    baseTemplate({
      preheader: preview ?? `${sender.name} sent you a message on ${APP}.`,
      body,
    }),
  })
}

export async function sendPostNotificationEmail(follower, author, post) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const clientUrl = process.env.CLIENT_URL ?? 'https://boxingamateur.com'
  const discoverUrl = `${clientUrl}/discover`
  const preview = post.content
    ? (post.content.length > 180 ? post.content.slice(0, 180).trimEnd() + '…' : post.content)
    : null

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:#0a2463 !important;line-height:1.1;">New post</h1>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:15px;color:#333333 !important;line-height:1.65;">
      <strong style="color:#000000 !important;font-weight:600;">${author.name}</strong> just posted something new on ${APP}.
    </p>

    ${preview ? `
    <!-- Post preview card -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#f5f5f5 !important;border:1px solid #e0e0e0;border-left:4px solid #e8192c;border-radius:8px;padding:16px 20px;">
          <p style="margin:0;font-family:${FONT_DM};font-size:14px;color:#333333 !important;line-height:1.7;">${preview}</p>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- CTA button -->
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background-color:#0a2463 !important;border-radius:8px;padding:0;">
          <a href="${discoverUrl}" style="display:inline-block;padding:13px 28px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ffffff !important;text-decoration:none;">View on ${APP}</a>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr><td style="height:1px;background-color:#e0e0e0 !important;font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#666666 !important;line-height:1.6;">
      You're receiving this because you follow <strong>${author.name}</strong> on ${APP}.
    </p>
  `

  await sgMail.send({
    to:      follower.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `${author.name} just posted on ${APP}`,
    html:    baseTemplate({
      preheader: `${author.name} just shared a new post on ${APP}.`,
      body,
    }),
  })
}

export async function sendVerificationEmail(user, code) {
  if (!process.env.SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY is not set')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  // Render each digit in its own styled box
  const digitBoxes = code.split('').map(d =>
    `<td style="width:56px;height:64px;background-color:#ffffff !important;border:2px solid #0a2463;border-radius:10px;text-align:center;vertical-align:middle;font-family:${FONT_BAR};font-size:34px;font-weight:800;color:#0a2463 !important;letter-spacing:0;line-height:1;">${d}</td>
     <td style="width:8px;font-size:0;">&nbsp;</td>`
  ).join('')

  const body = `
    <h1 style="margin:0 0 6px;font-family:${FONT_BAR};font-size:32px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:#0a2463 !important;line-height:1.1;">Verify your email</h1>
    <p style="margin:0 0 32px;font-family:${FONT_DM};font-size:15px;color:#333333 !important;line-height:1.65;">
      Hi <strong style="color:#000000 !important;font-weight:600;">${user.name}</strong>, welcome to ${APP}!<br>
      Enter the 6-digit code below to verify your email address.
    </p>

    <!-- Code digits -->
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 12px;">
      <tr>${digitBoxes}</tr>
    </table>

    <p style="margin:0 0 32px;font-family:${FONT_DM};font-size:12px;color:#666666 !important;text-align:center;">
      Expires in <strong>15 minutes</strong>
    </p>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
      <tr><td style="height:1px;background-color:#e0e0e0 !important;font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#666666 !important;line-height:1.6;">
      Didn't create an account? You can safely ignore this email — no action is needed.
    </p>
  `

  await sgMail.send({
    to:      user.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `${code} is your ${APP} verification code`,
    html:    baseTemplate({ preheader: `Your verification code is ${code}. It expires in 15 minutes.`, body }),
  })
}

export async function sendApprovalEmail(user) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const clientUrl = process.env.CLIENT_URL ?? 'https://boxingamateur.com'

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:#0a2463 !important;line-height:1.1;">You're approved!</h1>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:15px;color:#333333 !important;line-height:1.65;">
      Hi <strong style="color:#000000 !important;font-weight:600;">${user.name}</strong>,<br>
      Your ${user.role} account on ${APP} has been reviewed and <strong>approved</strong>. You now have full access to post, follow fighters, message and interact with the community.
    </p>
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background-color:#0a2463 !important;border-radius:8px;padding:0;">
          <a href="${clientUrl}/feed" style="display:inline-block;padding:13px 28px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ffffff !important;text-decoration:none;">Go to ${APP}</a>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:0;">
      <tr><td style="height:1px;background-color:#e0e0e0 !important;font-size:0;">&nbsp;</td></tr>
    </table>
  `

  await sgMail.send({
    to:      user.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `You're approved on ${APP}!`,
    html:    systemBaseTemplate({ preheader: `Your ${user.role} account has been approved. Welcome to ${APP}!`, body }),
  })
}

export async function sendDenialEmail(user, message) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:#0a2463 !important;line-height:1.1;">Account Update</h1>
    <p style="margin:0 0 20px;font-family:${FONT_DM};font-size:15px;color:#333333 !important;line-height:1.65;">
      Hi <strong style="color:#000000 !important;font-weight:600;">${user.name}</strong>,<br>
      We've reviewed your ${user.role} account on ${APP} and have a message from our team:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#f5f5f5 !important;border:1px solid #e0e0e0;border-left:4px solid #e8192c;border-radius:8px;padding:16px 20px;">
          <p style="margin:0;font-family:${FONT_DM};font-size:14px;color:#333333 !important;line-height:1.7;">${message}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:14px;color:#666666 !important;line-height:1.65;">
      If you have any questions or believe this is a mistake, please reply to this email and we'll be happy to help.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:0;">
      <tr><td style="height:1px;background-color:#e0e0e0 !important;font-size:0;">&nbsp;</td></tr>
    </table>
  `

  await sgMail.send({
    to:      user.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `Your ${APP} account — important update`,
    html:    systemBaseTemplate({ preheader: `An update regarding your ${APP} account from the team.`, body }),
  })
}

export async function sendGymApprovalEmail(user, gym) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const clientUrl = process.env.CLIENT_URL ?? 'https://boxingamateur.com'

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:#0a2463 !important;line-height:1.1;">Gym approved!</h1>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:15px;color:#333333 !important;line-height:1.65;">
      Hi <strong style="color:#000000 !important;font-weight:600;">${user.name}</strong>,<br>
      <strong>${gym.name}</strong> has been reviewed and approved — it's now live in the gym directory on ${APP}.
    </p>
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background-color:#0a2463 !important;border-radius:8px;padding:0;">
          <a href="${clientUrl}/gyms" style="display:inline-block;padding:13px 28px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ffffff !important;text-decoration:none;">View Gym Directory</a>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:0;">
      <tr><td style="height:1px;background-color:#e0e0e0 !important;font-size:0;">&nbsp;</td></tr>
    </table>
  `

  await sgMail.send({
    to:      user.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `${gym.name} is now live on ${APP}!`,
    html:    systemBaseTemplate({ preheader: `${gym.name} has been approved and is now in the gym directory.`, body }),
  })
}

export async function sendGymDenialEmail(user, gym, message) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:#0a2463 !important;line-height:1.1;">Gym Update</h1>
    <p style="margin:0 0 20px;font-family:${FONT_DM};font-size:15px;color:#333333 !important;line-height:1.65;">
      Hi <strong style="color:#000000 !important;font-weight:600;">${user.name}</strong>,<br>
      Regarding the gym <strong>${gym.name}</strong> that you submitted to ${APP} — our team has a message for you:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#f5f5f5 !important;border:1px solid #e0e0e0;border-left:4px solid #e8192c;border-radius:8px;padding:16px 20px;">
          <p style="margin:0;font-family:${FONT_DM};font-size:14px;color:#333333 !important;line-height:1.7;">${message}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:14px;color:#666666 !important;line-height:1.65;">
      Reply to this email if you have any questions.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:0;">
      <tr><td style="height:1px;background-color:#e0e0e0 !important;font-size:0;">&nbsp;</td></tr>
    </table>
  `

  await sgMail.send({
    to:      user.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `${gym.name} — update from ${APP}`,
    html:    systemBaseTemplate({ preheader: `An update regarding the gym you submitted to ${APP}.`, body }),
  })
}

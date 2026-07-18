import sgMail from '@sendgrid/mail'

const APP      = 'Boxing Amateur'
const SLOGAN   = 'Grass roots to greatness'
const NAVY     = '#0a2463'
const RED      = '#e8192c'
const WHITE    = '#ffffff'
const BG       = '#f5f5f5'
const BORDER   = '#e5e5ea'
const TEXT     = '#1d1d1f'
const TEXT_2   = '#48484a'
const TEXT_3   = '#6e6e73'

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap'
const FONT_DM  = "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const FONT_BAR = "'Barlow Condensed', 'Arial Narrow', Impact, sans-serif"

// Escape user-supplied strings before inserting into HTML — prevents HTML injection in emails
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function baseTemplate({ preheader, body }) {
  return `<!DOCTYPE html>
<html lang="en">
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
    :root { color-scheme: light !important; }
    body { background-color: ${BG} !important; }
    @media (prefers-color-scheme: dark) {
      body, .ba-outer  { background-color: ${BG} !important; }
      .ba-card-navy    { background-color: ${NAVY} !important; }
      .ba-card-body    { background-color: ${WHITE} !important; }
      .ba-card-footer  { background-color: ${WHITE} !important; }
      .ba-stripe-red   { background-color: ${RED} !important; }
      h1, h2, p, span, td { color: inherit !important; }
    }
  </style>
</head>
<body class="ba-outer" style="margin:0;padding:0;background-color:${BG} !important;font-family:${FONT_DM};-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">

  <!-- preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${BG} !important;padding:48px 16px 64px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

          <!-- ── Navy header ── -->
          <tr>
            <td class="ba-card-navy" style="background-color:${NAVY} !important;border-radius:14px 14px 0 0;padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:32px 40px 28px;text-align:center;">
                    ${process.env.LOGO_URL ? `<img src="${process.env.LOGO_URL}" alt="${APP}" width="72" height="72" style="display:block;margin:0 auto 16px;border-radius:8px;">` : ''}
                    <p style="margin:0 0 8px;font-family:${FONT_BAR};font-size:38px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${WHITE} !important;line-height:1;">${APP}</p>
                    <p style="margin:0;font-family:${FONT_BAR};font-size:13px;font-weight:700;font-style:italic;letter-spacing:2px;text-transform:uppercase;color:${RED} !important;line-height:1;">${SLOGAN}</p>
                  </td>
                </tr>
                <!-- Red accent stripe -->
                <tr>
                  <td class="ba-stripe-red" style="height:5px;background-color:${RED} !important;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── White body ── -->
          <tr>
            <td class="ba-card-body" style="background-color:${WHITE} !important;padding:40px 40px 36px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              ${body}
            </td>
          </tr>

          <!-- ── White footer with navy/red accents ── -->
          <tr>
            <td class="ba-card-footer" style="background-color:${WHITE} !important;border:1px solid ${BORDER};border-top:none;border-radius:0 0 14px 14px;padding:0;">
              <!-- Red top rule -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr><td class="ba-stripe-red" style="height:3px;background-color:${RED} !important;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:20px 40px 24px;text-align:center;">
                    <p style="margin:0 0 4px;font-family:${FONT_BAR};font-size:16px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${NAVY} !important;">${APP}</p>
                    <p style="margin:0 0 14px;font-family:${FONT_BAR};font-size:12px;font-weight:700;font-style:italic;letter-spacing:1.5px;text-transform:uppercase;color:${RED} !important;">${SLOGAN}</p>
                    <p style="margin:0;font-family:${FONT_DM};font-size:11px;color:#aeaeb2 !important;line-height:1.6;">
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

// Clean white-card template used for in-system transactional emails (verify, approve, deny)
function systemBaseTemplate({ preheader, body }) {
  return `<!DOCTYPE html>
<html lang="en">
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
    :root { color-scheme: light !important; }
    body { background-color: #f5f5f5 !important; }
    @media (prefers-color-scheme: dark) {
      body, .sys-outer   { background-color: #f5f5f5 !important; }
      .sys-card-body     { background-color: ${WHITE} !important; }
      .sys-card-footer   { background-color: #f9f9f9 !important; }
      .sys-stripe-red    { background-color: ${RED} !important; }
      .sys-stripe-top    { background-color: ${RED} !important; border-radius: 14px 14px 0 0 !important; }
      h1, h2, p, span, td { color: inherit !important; }
    }
  </style>
</head>
<body class="sys-outer" style="margin:0;padding:0;background-color:#f5f5f5 !important;font-family:${FONT_DM};-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f5f5 !important;padding:40px 16px 56px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;">

          <!-- Red top stripe + branding -->
          <tr>
            <td class="sys-card-body" style="background-color:${WHITE} !important;border-radius:14px 14px 0 0;border:1px solid ${BORDER};border-bottom:none;padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr><td class="sys-stripe-top" style="height:4px;background-color:${RED} !important;border-radius:14px 14px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:28px 36px 20px;">
                    <p style="margin:0;font-family:${FONT_BAR};font-size:20px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${NAVY} !important;">${APP}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- White body -->
          <tr>
            <td class="sys-card-body" style="background-color:${WHITE} !important;padding:0 36px 32px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="sys-card-footer" style="background-color:#f9f9f9 !important;border:1px solid ${BORDER};border-top:none;border-radius:0 0 14px 14px;padding:18px 36px 20px;">
              <p style="margin:0;font-family:${FONT_DM};font-size:11px;color:#aeaeb2 !important;line-height:1.6;">
                You received this because you have an account on ${APP}.<br>
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

export async function sendMessageNotificationEmail(recipient, sender, content) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const clientUrl  = process.env.CLIENT_URL ?? 'https://boxingamateur.com'
  const rawPreview = content
    ? (content.length > 180 ? content.slice(0, 180).trimEnd() + '…' : content)
    : null
  const preview = rawPreview ? esc(rawPreview) : null

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">New Message</h1>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      <strong style="color:${TEXT};font-weight:600;">${esc(sender.name)}</strong> sent you a message on ${APP}.
    </p>

    ${preview ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="background:#f5f5f5;border:1px solid ${BORDER};border-left:4px solid ${NAVY};border-radius:8px;padding:16px 20px;">
          <p style="margin:0;font-family:${FONT_DM};font-size:14px;color:${TEXT_2};line-height:1.7;">${preview}</p>
        </td>
      </tr>
    </table>
    ` : ''}

    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background:${RED};border-radius:8px;padding:0;">
          <a href="${clientUrl}/discover" style="display:inline-block;padding:13px 28px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${WHITE};text-decoration:none;">Open ${APP}</a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr><td style="height:1px;background:${BORDER};font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#aeaeb2;line-height:1.6;">
      You received this because <strong>${esc(sender.name)}</strong> sent you a message on ${APP}.
    </p>
  `

  await sgMail.send({
    to:      recipient.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `${esc(sender.name)} sent you a message on ${APP}`,
    html:    baseTemplate({
      preheader: rawPreview ?? `${sender.name} sent you a message on ${APP}.`,
      body,
    }),
  })
}

export async function sendPostNotificationEmail(follower, author, post) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const clientUrl  = process.env.CLIENT_URL ?? 'https://boxingamateur.com'
  const rawPreview = post.content
    ? (post.content.length > 180 ? post.content.slice(0, 180).trimEnd() + '…' : post.content)
    : null
  const preview = rawPreview ? esc(rawPreview) : null

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">New post</h1>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      <strong style="color:${TEXT};font-weight:600;">${esc(author.name)}</strong> just posted something new on ${APP}.
    </p>

    ${preview ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="background:#f5f5f5;border:1px solid ${BORDER};border-left:4px solid ${RED};border-radius:8px;padding:16px 20px;">
          <p style="margin:0;font-family:${FONT_DM};font-size:14px;color:${TEXT_2};line-height:1.7;">${preview}</p>
        </td>
      </tr>
    </table>
    ` : ''}

    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background:${NAVY};border-radius:8px;padding:0;">
          <a href="${clientUrl}/discover" style="display:inline-block;padding:13px 28px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${WHITE};text-decoration:none;">View on ${APP}</a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr><td style="height:1px;background:${BORDER};font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#aeaeb2;line-height:1.6;">
      You're receiving this because you follow <strong>${esc(author.name)}</strong> on ${APP}.
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

  const digitBoxes = code.split('').map(d =>
    `<td style="width:56px;height:64px;background:${WHITE};border:2px solid ${NAVY};border-radius:10px;text-align:center;vertical-align:middle;font-family:${FONT_BAR};font-size:34px;font-weight:800;color:${NAVY};letter-spacing:0;line-height:1;">${d}</td>
     <td style="width:8px;font-size:0;">&nbsp;</td>`
  ).join('')

  const body = `
    <h1 style="margin:0 0 6px;font-family:${FONT_BAR};font-size:32px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">Verify your email</h1>
    <p style="margin:0 0 32px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      Hi <strong style="color:${TEXT};font-weight:600;">${esc(user.name)}</strong>, welcome to ${APP}!<br>
      Enter the 6-digit code below to verify your email address.
    </p>

    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 12px;">
      <tr>${digitBoxes}</tr>
    </table>

    <p style="margin:0 0 32px;font-family:${FONT_DM};font-size:12px;color:${TEXT_3};text-align:center;">
      Expires in <strong>15 minutes</strong>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
      <tr><td style="height:1px;background:${BORDER};font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#aeaeb2;line-height:1.6;">
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

// Same as sendVerificationEmail but uses the clean system template (not pre-launch branded)
export async function sendSystemVerificationEmail(user, code) {
  if (!process.env.SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY is not set')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const digitBoxes = code.split('').map(d =>
    `<td style="width:52px;height:60px;background:#f5f5f5;border:2px solid ${NAVY};border-radius:10px;text-align:center;vertical-align:middle;font-family:${FONT_BAR};font-size:32px;font-weight:800;color:${NAVY};letter-spacing:0;line-height:1;">${d}</td>
     <td style="width:6px;font-size:0;">&nbsp;</td>`
  ).join('')

  const body = `
    <h1 style="margin:0 0 6px;font-family:${FONT_BAR};font-size:30px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">Verify your email</h1>
    <p style="margin:0 0 28px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      Hi <strong style="color:${TEXT};font-weight:600;">${esc(user.name)}</strong>, welcome to ${APP}!<br>
      Enter the code below to verify your email address.
    </p>

    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 10px;">
      <tr>${digitBoxes}</tr>
    </table>

    <p style="margin:0 0 28px;font-family:${FONT_DM};font-size:12px;color:${TEXT_3};text-align:center;">
      Expires in <strong>15 minutes</strong>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr><td style="height:1px;background:${BORDER};font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#aeaeb2;line-height:1.6;">
      Didn't create an account? You can safely ignore this email.
    </p>
  `

  await sgMail.send({
    to:      user.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `${code} is your ${APP} verification code`,
    html:    systemBaseTemplate({ preheader: `Your verification code is ${code}. It expires in 15 minutes.`, body }),
  })
}

export async function sendApprovalEmail(user) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const clientUrl = process.env.CLIENT_URL ?? 'https://boxingamateur.com'
  const roleLabel = user.role === 'gym' ? 'gym' : 'fighter'

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:30px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">You're approved!</h1>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      Hi <strong style="color:${TEXT};font-weight:600;">${esc(user.name)}</strong>,<br><br>
      Your ${roleLabel} account on ${APP} has been reviewed and <strong style="color:#22c55e;">approved</strong>.
      You now have full access to post, comment, message, and appear on the leaderboard.
    </p>

    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background:${RED};border-radius:8px;padding:0;">
          <a href="${clientUrl}/feed" style="display:inline-block;padding:13px 28px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${WHITE};text-decoration:none;">Go to ${APP}</a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr><td style="height:1px;background:${BORDER};font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#aeaeb2;line-height:1.6;">
      Welcome to the community — we look forward to seeing you compete.
    </p>
  `

  await sgMail.send({
    to:      user.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `Your ${APP} account has been approved`,
    html:    systemBaseTemplate({ preheader: `Your account has been approved — welcome to ${APP}!`, body }),
  })
}

export async function sendDenialEmail(user, message) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const roleLabel = user.role === 'gym' ? 'gym' : 'fighter'

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:30px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">Account update</h1>
    <p style="margin:0 0 20px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      Hi <strong style="color:${TEXT};font-weight:600;">${esc(user.name)}</strong>,<br><br>
      After reviewing your ${roleLabel} account, we weren't able to approve it at this time.
    </p>

    ${message ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr>
        <td style="background:#fff5f5;border:1px solid #fecaca;border-left:4px solid ${RED};border-radius:8px;padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:${FONT_DM};font-size:12px;font-weight:600;color:${RED};text-transform:uppercase;letter-spacing:0.5px;">Note from the team</p>
          <p style="margin:0;font-family:${FONT_DM};font-size:14px;color:${TEXT_2};line-height:1.7;">${esc(message)}</p>
        </td>
      </tr>
    </table>
    ` : ''}

    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:14px;color:${TEXT_3};line-height:1.65;">
      If you believe this is a mistake or have questions, please reach out to us.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr><td style="height:1px;background:${BORDER};font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#aeaeb2;line-height:1.6;">
      This decision was made by the ${APP} admin team.
    </p>
  `

  await sgMail.send({
    to:      user.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `Your ${APP} account application`,
    html:    systemBaseTemplate({ preheader: `An update on your ${APP} account.`, body }),
  })
}

export async function sendGymApprovalEmail(user, gym) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const clientUrl = process.env.CLIENT_URL ?? 'https://boxingamateur.com'

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:30px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">Gym approved!</h1>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      Hi <strong style="color:${TEXT};font-weight:600;">${esc(user.name)}</strong>,<br><br>
      <strong style="color:${TEXT};">${esc(gym.name)}</strong> has been reviewed and is now <strong style="color:#22c55e;">live</strong> on the ${APP} gym directory.
      Fighters and coaches will now be able to find and join your gym.
    </p>

    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background:${RED};border-radius:8px;padding:0;">
          <a href="${clientUrl}/gyms" style="display:inline-block;padding:13px 28px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${WHITE};text-decoration:none;">View gym directory</a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr><td style="height:1px;background:${BORDER};font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#aeaeb2;line-height:1.6;">
      Congratulations — your gym is now part of the ${APP} community.
    </p>
  `

  await sgMail.send({
    to:      user.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `${gym.name} is now live on ${APP}`,
    html:    systemBaseTemplate({ preheader: `Your gym ${gym.name} has been approved and is now live.`, body }),
  })
}

export async function sendFollowerNotificationEmail(recipient, follower) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const clientUrl  = process.env.CLIENT_URL ?? 'https://boxingamateur.com'
  const initial    = esc((follower.name ?? '?').charAt(0).toUpperCase())
  const ROLE_LABEL = { fighter: 'Amateur Fighter', gym: 'Gym', fan: 'Fan' }
  const roleLabel  = ROLE_LABEL[follower.role] ?? 'Member'

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">New Follower</h1>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      <strong style="color:${TEXT};font-weight:600;">${esc(follower.name)}</strong> is now following you on ${APP}.
    </p>

    <!-- Follower card -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
      <tr>
        <td style="background:#f5f5f5;border:1px solid ${BORDER};border-radius:10px;padding:16px 20px;">
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="vertical-align:middle;padding-right:16px;">
                <table width="48" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="width:48px;height:48px;background:${NAVY};border-radius:10px;text-align:center;vertical-align:middle;font-family:${FONT_BAR};font-size:22px;font-weight:700;color:${WHITE};">${initial}</td>
                  </tr>
                </table>
              </td>
              <td style="vertical-align:middle;">
                <p style="margin:0 0 2px;font-family:${FONT_DM};font-size:15px;font-weight:600;color:${TEXT};">${esc(follower.name)}</p>
                ${follower.username ? `<p style="margin:0 0 2px;font-family:${FONT_DM};font-size:13px;color:${TEXT_3};">@${esc(follower.username)}</p>` : ''}
                <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:${TEXT_3};">${roleLabel}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background:${RED};border-radius:8px;padding:0;">
          <a href="${clientUrl}/users/${esc(follower.username ?? '')}" style="display:inline-block;padding:13px 28px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${WHITE};text-decoration:none;">View Profile</a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr><td style="height:1px;background:${BORDER};font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#aeaeb2;line-height:1.6;">
      You received this because <strong>${esc(follower.name)}</strong> started following you on ${APP}.
    </p>
  `

  await sgMail.send({
    to:      recipient.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `${esc(follower.name)} is now following you on ${APP}`,
    html:    systemBaseTemplate({
      preheader: `${follower.name} started following you on ${APP}.`,
      body,
    }),
  })
}

export async function sendGymDenialEmail(user, gym, message) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:30px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">Gym listing update</h1>
    <p style="margin:0 0 20px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      Hi <strong style="color:${TEXT};font-weight:600;">${esc(user.name)}</strong>,<br><br>
      After reviewing <strong style="color:${TEXT};">${esc(gym.name)}</strong>, we weren't able to approve the gym listing at this time.
    </p>

    ${message ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr>
        <td style="background:#fff5f5;border:1px solid #fecaca;border-left:4px solid ${RED};border-radius:8px;padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:${FONT_DM};font-size:12px;font-weight:600;color:${RED};text-transform:uppercase;letter-spacing:0.5px;">Note from the team</p>
          <p style="margin:0;font-family:${FONT_DM};font-size:14px;color:${TEXT_2};line-height:1.7;">${esc(message)}</p>
        </td>
      </tr>
    </table>
    ` : ''}

    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:14px;color:${TEXT_3};line-height:1.65;">
      If you have questions or would like to resubmit with changes, please get in touch.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr><td style="height:1px;background:${BORDER};font-size:0;">&nbsp;</td></tr>
    </table>

    <p style="margin:0;font-family:${FONT_DM};font-size:12px;color:#aeaeb2;line-height:1.6;">
      This decision was made by the ${APP} admin team.
    </p>
  `

  await sgMail.send({
    to:      user.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `Update on your ${APP} gym listing`,
    html:    systemBaseTemplate({ preheader: `An update on the gym listing for ${gym.name}.`, body }),
  })
}

export async function sendJoinRequestEmail(gymOwner, fighter, gym) {
  if (!process.env.SENDGRID_API_KEY) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const clientUrl = process.env.CLIENT_URL ?? 'https://boxingamateur.com'
  const wins   = fighter.record?.wins   ?? 0
  const losses = fighter.record?.losses ?? 0
  const draws  = fighter.record?.draws  ?? 0
  const record = `${wins}W · ${losses}L${draws > 0 ? ` · ${draws}D` : ''}`

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">New Join Request</h1>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      A fighter has requested to join <strong style="color:${TEXT}">${esc(gym.name)}</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr>
        <td style="background:#f5f5f5;border:1px solid ${BORDER};border-radius:10px;padding:20px 24px;">
          <p style="margin:0 0 4px;font-family:${FONT_DM};font-size:16px;font-weight:600;color:${TEXT};">${esc(fighter.name)}</p>
          ${fighter.username ? `<p style="margin:0 0 6px;font-family:${FONT_DM};font-size:13px;color:${TEXT_3};">@${esc(fighter.username)}</p>` : ''}
          <p style="margin:0 0 4px;font-family:${FONT_DM};font-size:13px;color:${TEXT_3};">Record: ${esc(record)}</p>
          ${fighter.weightClass ? `<p style="margin:0;font-family:${FONT_DM};font-size:13px;color:${TEXT_3};">${esc(fighter.weightClass)}</p>` : ''}
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-family:${FONT_DM};font-size:14px;color:${TEXT_2};line-height:1.65;">
      Log in to approve or reject this request from your account page.
    </p>

    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background:${NAVY};border-radius:8px;padding:0;">
          <a href="${clientUrl}/account" style="display:inline-block;padding:13px 28px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${WHITE};text-decoration:none;">Review Request</a>
        </td>
      </tr>
    </table>
  `

  await sgMail.send({
    to:      gymOwner.email,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `${esc(fighter.name)} wants to join ${esc(gym.name)} — ${APP}`,
    html:    systemBaseTemplate({ preheader: `${fighter.name} has requested to join ${gym.name} on ${APP}.`, body }),
  })
}

export async function sendAdminNewGymEmail(gym, owner) {
  if (!process.env.SENDGRID_API_KEY) return
  if (!process.env.ADMIN_EMAIL) return
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const clientUrl = process.env.CLIENT_URL ?? 'https://boxingamateur.com'

  const body = `
    <h1 style="margin:0 0 8px;font-family:${FONT_BAR};font-size:28px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">New Gym Sign-Up</h1>
    <p style="margin:0 0 24px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      A new gym has just registered on ${APP}.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr>
        <td style="background:#f5f5f5;border:1px solid ${BORDER};border-radius:10px;padding:20px 24px;">
          <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tr><td style="padding-bottom:8px;">
              <p style="margin:0;font-family:${FONT_BAR};font-size:20px;font-weight:800;color:${NAVY};letter-spacing:0.5px;text-transform:uppercase;">${esc(gym.name)}</p>
            </td></tr>
            ${gym.city || gym.country ? `<tr><td style="padding-bottom:4px;"><p style="margin:0;font-family:${FONT_DM};font-size:13px;color:${TEXT_3};">${esc([gym.city, gym.postcode, gym.country].filter(Boolean).join(', '))}</p></td></tr>` : ''}
            ${gym.address ? `<tr><td style="padding-bottom:4px;"><p style="margin:0;font-family:${FONT_DM};font-size:13px;color:${TEXT_3};">${esc(gym.address)}</p></td></tr>` : ''}
            <tr><td style="padding-top:12px;border-top:1px solid ${BORDER};margin-top:12px;">
              <p style="margin:0 0 2px;font-family:${FONT_DM};font-size:13px;color:${TEXT_2};"><strong>Owner:</strong> ${esc(owner.name)}</p>
              <p style="margin:0;font-family:${FONT_DM};font-size:13px;color:${TEXT_3};">${esc(owner.email)}</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background:${NAVY};border-radius:8px;padding:0;">
          <a href="${clientUrl}/admin" style="display:inline-block;padding:13px 28px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${WHITE};text-decoration:none;">View in Admin Panel</a>
        </td>
      </tr>
    </table>
  `

  await sgMail.send({
    to:      process.env.ADMIN_EMAIL,
    from:    { email: process.env.FROM_EMAIL, name: APP },
    subject: `New gym sign-up: ${gym.name} — ${APP}`,
    html:    systemBaseTemplate({ preheader: `${gym.name} just registered on ${APP}.`, body }),
  })
}

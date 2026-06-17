import sgMail from '@sendgrid/mail'

const APP      = 'Boxing Amateur'
const NAVY     = '#0a2463'
const RED      = '#e8192c'
const WHITE    = '#ffffff'
const BG       = '#f0f4ff'   // very light navy tint for outer wrap only
const BORDER   = '#e5e5ea'
const TEXT     = '#1d1d1f'
const TEXT_2   = '#48484a'
const TEXT_3   = '#6e6e73'

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap'
const FONT_DM  = "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const FONT_BAR = "'Barlow Condensed', 'Arial Narrow', Impact, sans-serif"

function baseTemplate({ preheader, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${APP}</title>
  <!--[if !mso]><!-->
  <link href="${FONT_URL}" rel="stylesheet" type="text/css">
  <!--<![endif]-->
  <style>
    @import url('${FONT_URL}');
  </style>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:${FONT_DM};-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">

  <!-- preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BG};padding:48px 16px 64px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

          <!-- ── Navy header ── -->
          <tr>
            <td style="background:${NAVY};border-radius:14px 14px 0 0;padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:32px 40px 28px;text-align:center;">
                    <p style="margin:0 0 6px;font-family:${FONT_BAR};font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.45);">The Home of Amateur Boxing</p>
                    <p style="margin:0;font-family:${FONT_BAR};font-size:36px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${WHITE};line-height:1;">${APP}</p>
                  </td>
                </tr>
                <!-- Red accent stripe -->
                <tr>
                  <td style="height:5px;background:${RED};font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── White body ── -->
          <tr>
            <td style="background:${WHITE};padding:40px 40px 36px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              ${body}
            </td>
          </tr>

          <!-- ── White footer with navy/red accents ── -->
          <tr>
            <td style="background:${WHITE};border:1px solid ${BORDER};border-top:none;border-radius:0 0 14px 14px;padding:0;">
              <!-- Red top rule -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr><td style="height:3px;background:${RED};font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:20px 40px 24px;text-align:center;">
                    <p style="margin:0 0 2px;font-family:${FONT_BAR};font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${NAVY};">${APP}</p>
                    <p style="margin:0 0 14px;font-family:${FONT_DM};font-size:12px;color:${TEXT_3};">The home of amateur boxing</p>
                    <p style="margin:0;font-family:${FONT_DM};font-size:11px;color:#aeaeb2;line-height:1.6;">
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

export async function sendVerificationEmail(user, code) {
  if (!process.env.SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY is not set')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  // Render each digit in its own styled box
  const digitBoxes = code.split('').map(d =>
    `<td style="width:56px;height:64px;background:${WHITE};border:2px solid ${NAVY};border-radius:10px;text-align:center;vertical-align:middle;font-family:${FONT_BAR};font-size:34px;font-weight:800;color:${NAVY};letter-spacing:0;line-height:1;">${d}</td>
     <td style="width:8px;font-size:0;">&nbsp;</td>`
  ).join('')

  const body = `
    <h1 style="margin:0 0 6px;font-family:${FONT_BAR};font-size:32px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:${NAVY};line-height:1.1;">Verify your email</h1>
    <p style="margin:0 0 32px;font-family:${FONT_DM};font-size:15px;color:${TEXT_2};line-height:1.65;">
      Hi <strong style="color:${TEXT};font-weight:600;">${user.name}</strong>, welcome to ${APP}!<br>
      Enter the 6-digit code below to verify your email address.
    </p>

    <!-- Code digits -->
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 12px;">
      <tr>${digitBoxes}</tr>
    </table>

    <p style="margin:0 0 32px;font-family:${FONT_DM};font-size:12px;color:${TEXT_3};text-align:center;">
      Expires in <strong>15 minutes</strong>
    </p>

    <!-- Divider -->
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

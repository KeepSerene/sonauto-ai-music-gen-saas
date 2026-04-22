export function getVerificationEmailHtml({
  name,
  url,
  appUrl,
}: {
  name: string;
  url: string;
  appUrl: string;
}) {
  const bg = "#f8fafc";
  const foreground = "#0f172a";
  const primary = "#a855f7";
  const primaryHover = "#9333ea";
  const muted = "#64748b";
  const border = "#e2e8f0";

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>

    <style>
      .button {
        background-color: ${primary};
        color: #ffffff !important;
        transition: background-color 0.2s ease;
      }
      .button:hover, .button:focus {
        background-color: ${primaryHover} !important;
      }
    </style>
  </head>

  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: ${bg}; border-radius: 12px; border: 1px solid ${border}; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 600px;">
            <tr>
              <td style="padding: 40px 40px 20px 40px; text-align: center;">
                <img src="${appUrl}/images/logo-email.png" alt="Sonauto Logo" width="64" height="64" style="display: block; margin: 0 auto; margin-bottom: 24px;" />
                
                <h1 style="margin: 0; color: ${foreground}; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                  Verify your email
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding: 20px 40px 40px 40px; color: ${foreground}; font-size: 16px; line-height: 1.6;">
                <p style="margin-top: 0; margin-bottom: 24px;">Hi ${name},</p>
                <p style="margin-top: 0; margin-bottom: 32px;">Welcome to <strong>Sonauto</strong>! To get started generating your first track, we just need to verify your email address.</p>
                
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <a href="${url}" class="button" style="display: inline-block; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        Verify Email Address
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid ${border}; text-align: center; color: ${muted}; font-size: 13px; line-height: 1.5;">
                <p style="margin: 0;">If you didn't create a Sonauto account, you can safely delete this email.</p>
                <p style="margin: 8px 0 0 0;">&copy; ${new Date().getFullYear()} Sonauto. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

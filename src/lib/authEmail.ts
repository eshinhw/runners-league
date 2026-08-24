// Branded HTML/text for the magic-link sign-in email, replacing Auth.js's
// generic default template. Colors are pulled from the site's "Track Red"
// palette (src/app/globals.css) rather than Tailwind classes, since email
// clients don't run Tailwind and mostly ignore <style> blocks — everything
// here is plain inline CSS for maximum client compatibility. Kept to a
// light theme regardless of the recipient's OS setting: dark-mode HTML
// email support is inconsistent enough (Outlook/Gmail auto-inversion) that
// a single reliable light layout beats a flaky dark one.
const INK = "#211a14";
const MUTED = "#8f7960";
const ACCENT = "#c1440e";
const BORDER = "#e8dac5";
const CARD_BG = "#ffffff";
const PAGE_BG = "#faf6f1";

function logoBarsHtml(): string {
  const bar = (color: string, height: number) =>
    `<td style="padding:0 1px;vertical-align:bottom;"><div style="width:6px;height:${height}px;background:${color};border-radius:2px;"></div></td>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table;vertical-align:middle;"><tr>${bar("#b49a76", 10)}${bar("#8f7960", 15)}${bar(ACCENT, 20)}</tr></table>`;
}

type VerificationEmailParams = {
  url: string;
  host: string;
  // Only known for an existing user signing back in — a brand-new account
  // doesn't exist yet at send time (createUser runs after they click the
  // link), so both are omitted and the email falls back to the plain
  // wordmark greeting.
  avatarUrl?: string | null;
  displayName?: string | null;
};

export function verificationEmailHtml({ url, host, avatarUrl, displayName }: VerificationEmailParams): string {
  const avatarHtml = avatarUrl
    ? `<tr>
         <td align="center" style="padding-bottom:16px;">
           <img src="${avatarUrl}" alt="" width="64" height="64" style="width:64px;height:64px;border-radius:50%;object-fit:cover;display:block;" />
         </td>
       </tr>`
    : "";
  const heading = displayName ? `Welcome back, ${displayName}` : "Sign in to Runners League";

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${PAGE_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG};padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:32px;">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                ${logoBarsHtml()}
                <span style="display:inline-block;vertical-align:middle;margin-left:8px;font-size:16px;font-weight:600;color:${INK};">Runners League</span>
              </td>
            </tr>
            ${avatarHtml}
            <tr>
              <td align="center">
                <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:${INK};">${heading}</h1>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:${MUTED};">
                  Click the button below to finish signing in on <strong style="color:${INK};">${host}</strong>. This link expires in 24 hours and can only be used once.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${url}" target="_blank" style="display:inline-block;background:${ACCENT};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:6px;">
                  Sign in
                </a>
              </td>
            </tr>
            <tr>
              <td align="center">
                <p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED};">
                  Didn't request this? You can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function verificationEmailText({ url, host, displayName }: VerificationEmailParams): string {
  const heading = displayName ? `Welcome back, ${displayName}` : "Sign in to Runners League";
  return `${heading}\n\nUse the link below to finish signing in on ${host}. It expires in 24 hours and can only be used once.\n\n${url}\n\nDidn't request this? You can safely ignore this email.`;
}

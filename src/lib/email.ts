import nodemailer from 'nodemailer';

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || 'noreply@globalelectionnetwork.com';

  if (!host || !user || !pass) return null;

  return { transporter: nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }), from };
}

export async function sendObserverCredentials(opts: {
  name: string;
  email: string;
  username: string;
  password: string;
  electionName?: string;
}) {
  const t = getTransport();
  if (!t) {
    console.warn('[email] SMTP not configured — skipping email to', opts.email);
    return false;
  }

  const { transporter, from } = t;
  const subject = `Your Observer Access — ${opts.electionName ?? 'Global Election Network'}`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <h2 style="color:#065f46;margin-top:0">Welcome, ${opts.name}!</h2>
      <p style="color:#475569">You have been registered as an election observer. Use the credentials below to log in.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:0 0 8px;color:#64748b;font-size:13px"><strong>Login URL:</strong> <a href="https://globalelectionnetwork.com/login">globalelectionnetwork.com/login</a></p>
        <p style="margin:0 0 8px;color:#64748b;font-size:13px"><strong>Email / Username:</strong> ${opts.email}</p>
        <p style="margin:0;color:#64748b;font-size:13px"><strong>Password:</strong> <code style="background:#e2e8f0;padding:2px 6px;border-radius:4px">${opts.password}</code></p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin-bottom:0">Please change your password after first login. Do not share these credentials.</p>
    </div>
  `;

  await transporter.sendMail({ from, to: opts.email, subject, html });
  return true;
}

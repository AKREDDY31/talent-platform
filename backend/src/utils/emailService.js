import nodemailer from "nodemailer";

let transporter;

const sendWithResend = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || process.env.SMTP_FROM;

  if (!apiKey || !from) {
    return { delivered: false, reason: "resend_not_configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    return {
      delivered: false,
      reason: `resend_http_${response.status}`,
      error: bodyText.slice(0, 500),
    };
  }

  return { delivered: true };
};

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return null;
  }

  // Gmail app passwords are often copied with spaces; normalize safely.
  const normalizedPass = String(SMTP_PASS).replace(/\s+/g, "");

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    // Avoid long hangs when SMTP is slow/unreachable.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: SMTP_USER,
      pass: normalizedPass,
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const provider = String(process.env.EMAIL_PROVIDER || "").toLowerCase().trim();

  if (provider === "resend") {
    const resendResult = await sendWithResend({ to, subject, html });
    if (!resendResult.delivered) {
      console.error("[mail-resend-failed]", {
        to,
        subject,
        reason: resendResult.reason,
        error: resendResult.error,
      });
    }
    return resendResult;
  }

  const sender = process.env.SMTP_FROM;
  const tx = getTransporter();

  if (!tx || !sender) {
    console.log("[mail-disabled]", { to, subject });
    return { delivered: false, reason: "smtp_not_configured" };
  }

  await tx.sendMail({
    from: sender,
    to,
    subject,
    html,
  });

  return { delivered: true };
};

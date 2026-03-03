import nodemailer from "nodemailer";

let transporter;

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

import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const buildCertificateNumber = ({ projectId, userId }) => {
  const userCode = String(userId || "").replaceAll("-", "").slice(0, 6).toUpperCase();
  const projectCode = String(projectId || "").replaceAll("-", "").slice(0, 6).toUpperCase();
  return `TP-${userCode}-${projectCode}`;
};

export const generateCertificate = async (res, payload) => {
  const {
    userName,
    userEmail,
    projectTitle,
    projectLink,
    score,
    issuedAt,
    projectId,
    userId,
    verificationUrl,
  } = payload;

  const issueDate = issuedAt ? new Date(issuedAt) : new Date();
  const certificateNumber = buildCertificateNumber({ projectId, userId });

  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 2,
    width: 180,
    errorCorrectionLevel: "M",
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
  const qrBuffer = Buffer.from(qrBase64, "base64");

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${certificateNumber}.pdf`);

  doc.pipe(res);

  doc.rect(0, 0, 841.89, 595.28).fill("#f8fafc");
  doc.rect(24, 24, 793.89, 547.28).lineWidth(2).stroke("#1d4ed8");
  doc.rect(36, 36, 769.89, 523.28).lineWidth(1).stroke("#93c5fd");

  doc.rect(36, 36, 769.89, 72).fill("#0f172a");
  doc.fillColor("#e2e8f0").fontSize(12).text("Talent Platform", 60, 56, { continued: true });
  doc.fillColor("#93c5fd").text("  |  Technical Evaluation Board");

  doc.fillColor("#0f172a").fontSize(40).text("Certificate of Achievement", 0, 140, { align: "center" });
  doc.fillColor("#334155").fontSize(14).text("This certificate is proudly presented to", 0, 196, {
    align: "center",
  });

  doc.fillColor("#1d4ed8").fontSize(34).text(userName, 0, 226, { align: "center" });

  doc.fillColor("#334155").fontSize(14).text(
    "for successful project completion with qualifying evaluation score and interview progression.",
    90,
    282,
    { width: 660, align: "center" }
  );

  doc.roundedRect(78, 326, 532, 180, 10).fillAndStroke("#ffffff", "#bfdbfe");

  doc.fillColor("#0f172a").fontSize(12).text("Candidate Email", 98, 350);
  doc.fillColor("#1f2937").fontSize(13).text(userEmail || "N/A", 250, 350);

  doc.fillColor("#0f172a").fontSize(12).text("Project Title", 98, 382);
  doc.fillColor("#1f2937").fontSize(13).text(projectTitle || "N/A", 250, 382, { width: 330 });

  doc.fillColor("#0f172a").fontSize(12).text("Project Repository", 98, 426);
  doc.fillColor("#1d4ed8").fontSize(12).text(projectLink || "N/A", 250, 426, {
    width: 330,
    link: projectLink || undefined,
    underline: Boolean(projectLink),
  });

  doc.fillColor("#0f172a").fontSize(12).text("Evaluation Score", 98, 462);
  doc.fillColor("#15803d").fontSize(16).text(`${score}/100`, 250, 458);

  doc.roundedRect(634, 326, 138, 180, 10).fillAndStroke("#ffffff", "#bfdbfe");
  doc.image(qrBuffer, 654, 342, { fit: [98, 98], align: "center", valign: "center" });
  doc.fillColor("#334155").fontSize(9).text("Scan to verify and view certificate details", 646, 448, {
    width: 116,
    align: "center",
  });

  doc.fillColor("#334155").fontSize(11).text(`Certificate No: ${certificateNumber}`, 78, 525);
  doc.text(`Issued On: ${formatDate(issueDate)}`, 380, 525);

  doc.fillColor("#0f172a").fontSize(11).text("Authorized by Talent Platform Review Panel", 78, 545);

  doc.moveTo(560, 542).lineTo(760, 542).strokeColor("#64748b").lineWidth(1).stroke();
  // Compact authority signature styling (no external font file required).
  doc.fillColor("#0f172a").font("Helvetica-Oblique").fontSize(14).text("Anil Kumar Reddy Chipati", 582, 520);
  doc.moveTo(582, 539).lineTo(740, 539).strokeColor("#0f172a").lineWidth(0.9).stroke();

  doc.fillColor("#334155").fontSize(10).text("Certification Authority", 608, 548);

  doc.end();
};

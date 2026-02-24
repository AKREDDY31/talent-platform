import PDFDocument from "pdfkit";

export const generateCertificate = (res, userName, projectTitle, score) => {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=certificate.pdf"
  );

  doc.pipe(res);

  doc.fontSize(24).text("Certificate of Completion", { align: "center" });
  doc.moveDown();
  doc.fontSize(18).text(`Awarded to: ${userName}`);
  doc.moveDown();
  doc.text(`Project: ${projectTitle}`);
  doc.moveDown();
  doc.text(`Score: ${score}`);
  doc.moveDown();
  doc.text("Congratulations on successful completion!");

  doc.end();
};
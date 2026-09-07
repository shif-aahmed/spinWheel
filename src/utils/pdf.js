import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a clean PDF of the winners list.
 * @param {string[]} winners
 */
export function exportWinnersToPdf(winners = []) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(37, 99, 235); // #2563eb
  doc.rect(0, 0, 210, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('Wheel of Names - Winners List', 14, 21);

  // Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const now = new Date();
  const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
  doc.text(`Generated: ${dateStr}`, 14, 42);
  doc.text(`Total Winners: ${winners.length}`, 14, 48);

  // Divider Line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(14, 52, 196, 52);

  if (winners.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(130, 130, 130);
    doc.text('No winners have been recorded yet.', 14, 65);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Spin the wheel to record winners and download them anytime.', 14, 73);
  } else {
    // Table Header
    doc.setFillColor(245, 247, 250);
    doc.rect(14, 56, 182, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text('#', 20, 63);
    doc.text('Winner Name', 40, 63);

    // Table Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);

    let y = 73;
    winners.forEach((winner, idx) => {
      // Add page if content overflows
      if (y > 275) {
        doc.addPage();
        y = 25;
      }

      // Alternate row highlight
      if (idx % 2 === 0) {
        doc.setFillColor(250, 250, 252);
        doc.rect(14, y - 5, 182, 9, 'F');
      }

      doc.text(String(idx + 1), 20, y + 1);
      doc.text(String(winner), 40, y + 1);
      y += 10;
    });
  }

  doc.save('winners-list.pdf');
}

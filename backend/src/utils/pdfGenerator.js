'use strict';

const PDFDocument = require('pdfkit');

/**
 * createPDF
 * 
 * Generates a formatted PDF using PDFKit and streams it directly to the
 * Express Response object, avoiding saving to disk.
 * 
 * @param {Object} content - The structured text from AI { title, content, sections }
 * @param {Object} claimData - For claimant details { claimantName }
 * @param {Object} res - Express Response object to pipe the stream to
 * @param {string} filename - The download filename
 */
function createPDF(content, claimData, res, filename = 'Varasat_Document.pdf') {
  return new Promise((resolve, reject) => {
    try {
      // Set headers for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Initialize PDF document
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      // Pipe to HTTP response
      doc.pipe(res);

      // Listen for completion
      res.on('finish', () => resolve());
      res.on('error', reject);

      // --- Formatting Document ---

      // Header Date
      const currentDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      doc.fontSize(10).text(`Date: ${currentDate}`, { align: 'right' });
      doc.moveDown(2);

      // Title
      doc.fontSize(20).font('Helvetica-Bold')
         .text(content.title || 'Legal Document', { align: 'center', underline: true });
      doc.moveDown(2);

      // Main Content / Preamble
      doc.fontSize(12).font('Helvetica')
         .text(content.content || '', { align: 'justify', lineGap: 6 });
      doc.moveDown(1.5);

      // Sections
      if (Array.isArray(content.sections)) {
        content.sections.forEach(section => {
          doc.text(section, { align: 'justify', lineGap: 6 });
          doc.moveDown(1);
        });
      }
      doc.moveDown(3);

      // Signature Area
      const ySig = doc.y;
      doc.font('Helvetica-Bold').text('Signature / Thumb Impression:', 50, ySig);
      doc.font('Helvetica').text('___________________________', 50, ySig + 20);
      doc.text(claimData.claimantName || 'Claimant', 50, ySig + 40);

      // Draw line before footer
      doc.moveTo(50, doc.page.height - 80)
         .lineTo(doc.page.width - 50, doc.page.height - 80)
         .stroke();

      // Disclaimer Footer (LEGAL SAFETY REQUIREMENT)
      doc.fontSize(8).fillColor('gray')
         .text(
           "This document is AI-generated for assistance purposes. Requirements should be verified with the concerned institution or legal professional before submission.",
           50, doc.page.height - 65,
           { align: 'center', width: doc.page.width - 100 }
         );

      // Finalize
      doc.end();

    } catch (error) {
      console.error('[PDFGenerator] Failed to create PDF stream:', error);
      res.status(500).end();
      reject(error);
    }
  });
}

module.exports = { createPDF };

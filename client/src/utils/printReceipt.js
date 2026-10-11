/**
 * Thermal Bill Printing Utility
 * Handles dynamic @page sizing for POS thermal roll printers (80mm & 58mm) and A4,
 * ensuring the receipt precisely fills the bill size page with 0 extra empty pages.
 */

export function applyReceiptPrintStyles(printerType = 'thermal80') {
  document.body.classList.remove('printing-barcodes');
  document.body.classList.add('printing-receipt');

  let printStyle = document.getElementById('receipt-print-page-style');
  if (!printStyle) {
    printStyle = document.createElement('style');
    printStyle.id = 'receipt-print-page-style';
    document.head.appendChild(printStyle);
  }

  if (printerType === 'thermal58') {
    printStyle.innerHTML = `
      @page {
        size: 58mm auto;
        margin: 0;
      }
      @media print {
        html, body {
          width: 58mm !important;
          max-width: 58mm !important;
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          min-height: 0 !important;
        }
        .receipt-paper {
          width: 100% !important;
          max-width: 58mm !important;
          padding: 1.5mm 2mm 3mm 2mm !important;
        }
      }
    `;
  } else if (printerType === 'a4') {
    printStyle.innerHTML = `
      @page {
        size: A4 portrait;
        margin: 8mm;
      }
      @media print {
        html, body {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          min-height: 0 !important;
        }
        .receipt-paper {
          width: 80mm !important;
          max-width: 80mm !important;
          margin: 0 auto !important;
        }
      }
    `;
  } else {
    // Default 80mm Thermal Receipt (Standard POS)
    printStyle.innerHTML = `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        html, body {
          width: 80mm !important;
          max-width: 80mm !important;
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          min-height: 0 !important;
        }
        .receipt-paper {
          width: 100% !important;
          max-width: 80mm !important;
        }
      }
    `;
  }
}

export function removeReceiptPrintStyles() {
  document.body.classList.remove('printing-receipt');
  const s = document.getElementById('receipt-print-page-style');
  if (s) {
    s.remove();
  }
}

export function triggerPrintReceipt(printerType = 'thermal80', onDone) {
  applyReceiptPrintStyles(printerType);

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    removeReceiptPrintStyles();
    if (typeof onDone === 'function') {
      onDone();
    }
  };

  const handleAfterPrint = () => {
    window.removeEventListener('afterprint', handleAfterPrint);
    cleanup();
  };
  window.addEventListener('afterprint', handleAfterPrint);

  setTimeout(() => {
    window.print();
    // Safety fallback in case browser does not trigger afterprint event
    setTimeout(cleanup, 1200);
  }, 250);
}

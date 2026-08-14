/**
 * Robust Printing Utility for A4 Loan Agreements, Schedules & Receipts
 */

export const printDocument = (elementId: string, docTitle: string = 'ឯកសារ') => {
  let targetElement = document.getElementById(elementId);

  if (!targetElement) {
    console.warn(`Print element with ID '${elementId}' not found. Falling back to window.print()`);
    window.print();
    return;
  }

  // Clone content and strip no-print interactive controls
  const clone = targetElement.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.no-print').forEach((el) => el.remove());

  const htmlContent = clone.outerHTML;

  try {
    let printIframe = document.getElementById('app-print-frame') as HTMLIFrameElement;
    if (printIframe) {
      document.body.removeChild(printIframe);
    }

    printIframe = document.createElement('iframe');
    printIframe.id = 'app-print-frame';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0px';
    printIframe.style.height = '0px';
    printIframe.style.border = '0px';
    printIframe.style.opacity = '0';
    document.body.appendChild(printIframe);

    const frameDoc = printIframe.contentWindow?.document || printIframe.contentDocument;

    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${docTitle}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Kantumruuy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
              *, *::before, *::after {
                box-sizing: border-box;
                font-family: 'Kantumruuy Pro', system-ui, sans-serif !important;
              }
              body {
                margin: 0;
                padding: 10px;
                background-color: #ffffff !important;
                color: #0f172a !important;
                font-size: 11pt;
                line-height: 1.6;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
              .printable-a4 {
                width: 100% !important;
                max-width: 100% !important;
                background: #ffffff !important;
                color: #000000 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
              table {
                width: 100%;
                border-collapse: collapse !important;
                margin-top: 10px;
                margin-bottom: 10px;
                font-size: 10pt;
              }
              th, td {
                border: 1px solid #94a3b8 !important;
                padding: 6px 8px !important;
                text-align: left;
                line-height: 1.5 !important;
                color: #0f172a !important;
              }
              th {
                background-color: #f1f5f9 !important;
                font-weight: 700;
                color: #0f172a !important;
              }
              .text-center { text-align: center !important; }
              .text-right { text-align: right !important; }
              .font-bold { font-weight: 700 !important; }
              .font-medium { font-weight: 500 !important; }
              .font-serif { font-family: 'Kantumruuy Pro', serif !important; }
              .font-mono { font-family: monospace !important; }
              .text-emerald-700 { color: #047857 !important; }
              .text-emerald-800 { color: #065f46 !important; }
              .text-slate-900 { color: #0f172a !important; }
              .text-slate-800 { color: #1e293b !important; }
              .text-slate-700 { color: #334155 !important; }
              .text-slate-600 { color: #475569 !important; }
              .text-slate-500 { color: #64748b !important; }
              .bg-slate-50\/50, .bg-slate-50, .bg-slate-100 { background-color: #f8fafc !important; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
              .p-3 { padding: 12px !important; }
              .p-4 { padding: 16px !important; }
              .p-8 { padding: 24px !important; }
              .border { border: 1px solid #cbd5e1 !important; }
              .border-b { border-bottom: 1px solid #cbd5e1 !important; }
              .border-t { border-top: 1px solid #cbd5e1 !important; }
              .rounded-lg { border-radius: 8px !important; }
              .uppercase { text-transform: uppercase !important; }
              .tracking-wide { letter-spacing: 0.05em !important; }
              .space-y-1 > * + * { margin-top: 4px; }
              .space-y-2 > * + * { margin-top: 8px; }
              .space-y-4 > * + * { margin-top: 16px; }
              .space-y-6 > * + * { margin-top: 24px; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
        } catch (e) {
          console.error('Print iframe error:', e);
          window.print();
        }
      }, 300);

      return;
    }
  } catch (err) {
    console.error('Error setting up print iframe:', err);
  }

  window.print();
};

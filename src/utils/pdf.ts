// @ts-ignore
import html2pdf from 'html2pdf.js';
import { printDocument } from './print';

/**
 * Robust Utility to export any HTML container directly to a crisp A4 PDF file
 * with immediate fallback to native browser Print/Save-as-PDF.
 */
export const downloadElementAsPDF = async (elementId: string, filename: string = 'document') => {
  let element = document.getElementById(elementId);

  // If element is not in DOM yet (e.g., view mode transition), wait up to 300ms
  if (!element) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    element = document.getElementById(elementId);
  }

  // Fallback to printDocument if element still not found
  if (!element) {
    console.warn(`Element with ID '${elementId}' not found. Falling back to print utility.`);
    printDocument(elementId, filename);
    return;
  }

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Create offscreen container with clean white background for html2canvas
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.width = '210mm';
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.color = '#000000';
  wrapper.style.zIndex = '-9999';

  const clone = element.cloneNode(true) as HTMLElement;

  // Strip no-print elements
  clone.querySelectorAll('.no-print').forEach((el) => el.remove());

  // Convert inputs or textareas in clone to static text if any
  clone.querySelectorAll('input, textarea').forEach((input) => {
    const value = (input as HTMLInputElement).value;
    const span = document.createElement('span');
    span.textContent = value;
    input.parentNode?.replaceChild(span, input);
  });

  // Ensure high-contrast light theme styles for PDF output
  clone.style.width = '210mm';
  clone.style.margin = '0 auto';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#0f172a';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';

  // If cloned element contained dark theme classes, recursively clean background and text colors
  clone.querySelectorAll('*').forEach((child) => {
    const el = child as HTMLElement;
    // Strip dark slate backgrounds
    if (el.classList) {
      el.classList.forEach((cls) => {
        if (cls.startsWith('bg-slate-9') || cls.startsWith('bg-slate-8') || cls.startsWith('bg-slate-950')) {
          el.style.backgroundColor = '#ffffff';
        }
        if (cls.startsWith('text-slate-1') || cls.startsWith('text-slate-2') || cls.startsWith('text-slate-3') || cls.startsWith('text-slate-4')) {
          el.style.color = '#0f172a';
        }
        if (cls.startsWith('border-slate-8') || cls.startsWith('border-slate-9')) {
          el.style.borderColor = '#cbd5e1';
        }
      });
    }
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const opt = {
      margin: [6, 6, 6, 6],
      filename: cleanFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollY: 0,
        scrollX: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use html2pdf worker to output a blob and trigger browser download
    const worker = html2pdf().set(opt).from(clone);
    const pdfBlob = await worker.output('blob');

    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);
  } catch (error) {
    console.warn('html2pdf generation failed, falling back to browser print/save-as-pdf:', error);
    printDocument(elementId, filename);
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
};

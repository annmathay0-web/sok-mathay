import React from 'react';
import { X, FileDown, Landmark, CheckCircle, ShieldCheck, Printer } from 'lucide-react';
import { Borrower, Loan, ScheduleInstallment } from '../types';
import { formatCurrency, formatDateKhmer, toKhmerNumeral, generateId } from '../utils/calculator';
import { downloadElementAsPDF } from '../utils/pdf';
import { printDocument } from '../utils/print';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  installment: ScheduleInstallment | null;
  borrowers?: Borrower[];
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  loan,
  installment,
  borrowers = [],
}) => {
  if (!isOpen || !loan || !installment) return null;

  const borrowerPhoto = borrowers.find((b) => b.id === loan.borrowerId)?.photoUrl;

  const receiptNumber = `REC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${installment.installmentNumber}`;
  const todayStr = new Date().toISOString().split('T')[0];

  const handleDownloadPDF = () => {
    downloadElementAsPDF('printable-payment-receipt', `បង្កាន់ដៃទទួលប្រាក់_${receiptNumber}`);
  };

  const handlePrint = () => {
    printDocument('printable-payment-receipt', `បង្កាន់ដៃទទួលប្រាក់_${receiptNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn no-print-backdrop">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl printable-area">
        
        {/* Modal Controls (Hidden during window.print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              បង្កាន់ដៃទទួលប្រាក់ (Payment Receipt)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              title="ទាញយកជា PDF"
            >
              <FileDown className="w-4 h-4" />
              <span>ទាញយក PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
              title="បោះពុម្ព (Print)"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>បោះពុម្ព</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Voucher Body (Styled for screen & print) */}
        <div id="printable-payment-receipt" className="p-8 bg-white text-slate-900 font-serif">
          
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Landmark className="w-7 h-7 text-emerald-700" />
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                គ្រឹះស្ថានហិរញ្ញវត្ថុ ស្រួលខ្ចី
              </h1>
            </div>
            <p className="text-xs font-sans text-slate-600">
              ប្រព័ន្ធគ្រប់គ្រងការចងការប្រាក់ និងប្រាក់កម្ចី • អាសយដ្ឋាន៖ រាជធានីភ្នំពេញ • ទូរស័ព្ទ៖ 012 345 678
            </p>
            <div className="mt-3 inline-block px-4 py-1 bg-slate-100 text-slate-900 font-bold text-sm tracking-wider border border-slate-300 rounded">
              បង្កាន់ដៃទទួលប្រាក់ (PAYMENT RECEIPT)
            </div>
          </div>

          {/* Receipt Info Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs font-sans mb-6 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <span className="text-slate-500 block">លេខបង្កាន់ដៃ (Receipt No):</span>
              <span className="font-bold font-mono text-slate-900">{receiptNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">កាលបរិច្ឆេទ (Date):</span>
              <span className="font-bold text-slate-900">{formatDateKhmer(installment.paidDate || todayStr)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">លេខកូដកម្ចី (Loan ID):</span>
              <span className="font-bold font-mono text-emerald-700">{loan.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block">វគ្គបង់ប្រាក់ (Installment):</span>
              <span className="font-bold text-slate-900">លើកទី #{installment.installmentNumber}</span>
            </div>
          </div>

          {/* Borrower Details */}
          <div className="mb-6 space-y-1.5 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 py-1.5">
              <span className="text-slate-600">ឈ្មោះអ្នកបង់ប្រាក់ (Borrower):</span>
              <div className="flex items-center gap-2">
                <img
                  src={borrowerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={loan.borrowerName}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300 bg-slate-100 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                  }}
                />
                <span className="font-bold text-slate-900">{loan.borrowerName}</span>
              </div>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1">
              <span className="text-slate-600">លេខទូរស័ព្ទ (Phone):</span>
              <span className="font-mono text-slate-900">{loan.borrowerPhone}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1">
              <span className="text-slate-600">ប្រភេទការប្រាក់:</span>
              <span className="font-semibold text-slate-900">
                {loan.interestType === 'simple' ? 'ការប្រាក់ថេរ' : 'ការប្រាក់ថយចុះ'}
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-300 rounded overflow-hidden mb-6">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2">បរិយាយ (Description)</th>
                  <th className="p-2 text-right">ចំនួនប្រាក់ ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                <tr>
                  <td className="p-2 font-serif">ប្រាក់ដើមត្រូវបង់ (Principal)</td>
                  <td className="p-2 text-right font-semibold">{formatCurrency(installment.principalAmount)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-serif">ការប្រាក់ (Interest Portion)</td>
                  <td className="p-2 text-right font-semibold text-teal-800">{formatCurrency(installment.interestAmount)}</td>
                </tr>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-900">
                  <td className="p-2 text-slate-900 font-serif">សរុបបានបង់ (Total Amount Paid)</td>
                  <td className="p-2 text-right text-emerald-700 text-sm">{formatCurrency(installment.totalInstallmentAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remaining Balance Footer */}
          <div className="flex justify-between items-center text-xs font-sans bg-slate-100 p-3 rounded border border-slate-200 mb-8">
            <span className="font-semibold text-slate-700">ប្រាក់ដើមនៅសល់ចុងក្រោយ (Remaining Principal):</span>
            <span className="font-bold text-slate-900 text-sm font-mono">{formatCurrency(installment.remainingBalance)}</span>
          </div>

          {/* Signature Signoff */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs font-serif pt-4 border-t border-slate-300">
            <div>
              <p className="font-bold text-slate-900 mb-12">ហត្ថលេខាអ្នកបង់ប្រាក់</p>
              <p className="text-slate-500">( {loan.borrowerName} )</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-12">ហត្ថលេខា និងត្រាអ្នកទទួល</p>
              <p className="text-slate-500">( បេឡាធិការ / គណនេយ្យករ )</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

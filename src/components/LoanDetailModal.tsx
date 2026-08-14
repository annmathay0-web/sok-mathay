import React from 'react';
import { X, FileText, User, Phone, Calendar, FileDown, CheckCircle2, Clock, AlertTriangle, Receipt, FileSpreadsheet, Printer } from 'lucide-react';
import { Borrower, Loan, ScheduleInstallment } from '../types';
import { formatCurrency, formatDateKhmer, toKhmerNumeral } from '../utils/calculator';
import { downloadElementAsPDF } from '../utils/pdf';
import { printDocument } from '../utils/print';
import { exportSingleLoanScheduleToExcel } from '../utils/excel';

interface LoanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  borrowers?: Borrower[];
  onToggleStatus: (loanId: string, installmentNumber: number, newStatus: 'paid' | 'pending' | 'overdue') => void;
  onOpenReceipt: (loan: Loan, installment: ScheduleInstallment) => void;
}

export const LoanDetailModal: React.FC<LoanDetailModalProps> = ({
  isOpen,
  onClose,
  loan,
  borrowers = [],
  onToggleStatus,
  onOpenReceipt,
}) => {
  if (!isOpen || !loan) return null;

  const borrowerPhoto = borrowers.find((b) => b.id === loan.borrowerId)?.photoUrl;

  const handleDownloadPDF = () => {
    downloadElementAsPDF('printable-loan-detail', `តារាងបង់ប្រាក់កម្ចី_${loan.id}`);
  };

  const handlePrint = () => {
    printDocument('printable-loan-detail', `តារាងបង់ប្រាក់កម្ចី_${loan.id}`);
  };

  const paidCount = loan.schedule.filter((s) => s.status === 'paid').length;
  const overdueCount = loan.schedule.filter((s) => s.status === 'overdue').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div id="printable-loan-detail" className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl printable-area">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 no-print">
          <div className="flex items-center gap-3.5">
            <img
              src={borrowerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={loan.borrowerName}
              className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-md bg-slate-950 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
              }}
            />
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>ព័ត៌មានលម្អិតនៃកម្ចី</span>
                <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {loan.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                អ្នកខ្ចី៖ <strong className="text-slate-200">{loan.borrowerName}</strong> ({loan.borrowerPhone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSingleLoanScheduleToExcel(loan)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              title="ទាញយកជា Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all"
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

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Summary Figures Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 font-sans">
            <div>
              <span className="text-[11px] text-slate-400 block">ប្រាក់ដើម ($P)</span>
              <span className="text-base font-bold text-slate-100">
                {formatCurrency(loan.principalAmount)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">ការប្រាក់សរុប</span>
              <span className="text-base font-bold text-teal-400">
                {formatCurrency(loan.totalInterestAmount)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">ប្រាក់ត្រូវបង់សរុប</span>
              <span className="text-base font-bold text-emerald-400">
                {formatCurrency(loan.totalRepaymentAmount)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">ប្រភេទការប្រាក់</span>
              <span className="text-xs font-bold text-amber-400 font-serif">
                {loan.interestType === 'simple' ? 'ការប្រាក់ថេរ' : 'ការប្រាក់ថយចុះ'} ({loan.interestRatePerMonth}% / {loan.repaymentFrequency === 'daily' ? 'ថ្ងៃ' : loan.repaymentFrequency === 'weekly' ? 'អាទិត្យ' : 'ខែ'})
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">វគ្គនៃការបង់</span>
              <span className="text-xs font-bold text-emerald-300">
                {loan.repaymentFrequency === 'daily'
                  ? `ប្រចាំថ្ងៃ (${toKhmerNumeral(loan.durationMonths)} ថ្ងៃ)`
                  : loan.repaymentFrequency === 'weekly'
                  ? `ប្រចាំអាទិត្យ (${toKhmerNumeral(loan.durationMonths)} អាទិត្យ)`
                  : `ប្រចាំខែ (${toKhmerNumeral(loan.durationMonths)} ខែ)`}
              </span>
            </div>
          </div>

          {loan.collateralNotes && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
              <strong className="text-slate-200">ទ្រព្យបញ្ចាំ / សម្គាល់៖</strong> {loan.collateralNotes}
            </div>
          )}

          {/* Schedule Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">
                តារាងបង់ប្រាក់ ({toKhmerNumeral(paidCount)}/{toKhmerNumeral(loan.schedule.length)} វគ្គបង់រួច)
              </span>
              {overdueCount > 0 && (
                <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {toKhmerNumeral(overdueCount)} វគ្គហួសកំណត់
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-sans">
                <thead className="bg-slate-900 text-slate-400 font-semibold">
                  <tr>
                    <th className="p-3 whitespace-nowrap">លើកទី</th>
                    <th className="p-3 whitespace-nowrap">ថ្ងៃត្រូវបង់</th>
                    <th className="p-3 text-right whitespace-nowrap">ប្រាក់ដើម ($)</th>
                    <th className="p-3 text-right whitespace-nowrap">ការប្រាក់ ($)</th>
                    <th className="p-3 text-right whitespace-nowrap">សរុបត្រូវបង់ ($)</th>
                    <th className="p-3 text-right whitespace-nowrap">ប្រាក់ដើមនៅសល់</th>
                    <th className="p-3 text-center whitespace-nowrap">ស្ថានភាព</th>
                    <th className="p-3 text-center no-print whitespace-nowrap">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {loan.schedule.map((item) => (
                    <tr key={item.installmentNumber} className="hover:bg-slate-900/60 align-middle">
                      <td className="p-3 font-bold text-slate-400 align-middle whitespace-nowrap">#{item.installmentNumber}</td>
                      <td className="p-3 align-middle whitespace-nowrap">
                        <div className="font-medium text-slate-100 text-xs leading-normal">
                          {formatDateKhmer(item.dueDate, true)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.dueDate}
                          {item.notes && (
                            <span className="ml-1 text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded text-[9px]">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right align-middle whitespace-nowrap">{formatCurrency(item.principalAmount)}</td>
                      <td className="p-3 text-right text-teal-400 align-middle whitespace-nowrap">{formatCurrency(item.interestAmount)}</td>
                      <td className="p-3 text-right font-bold text-emerald-400 align-middle whitespace-nowrap">{formatCurrency(item.totalInstallmentAmount)}</td>
                      <td className="p-3 text-right font-mono text-slate-400 align-middle whitespace-nowrap">{formatCurrency(item.remainingBalance)}</td>
                      <td className="p-3 text-center align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold leading-none whitespace-nowrap ${
                            item.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : item.status === 'overdue'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {item.status === 'paid' ? 'បង់រួច' : item.status === 'overdue' ? 'ហួសកំណត់' : 'មិនទាន់បង់'}
                        </span>
                      </td>
                      <td className="p-3 text-center no-print">
                        <button
                          onClick={() => onOpenReceipt(loan, item)}
                          className="p-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
                          title="មើលបង្កាន់ដៃ"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

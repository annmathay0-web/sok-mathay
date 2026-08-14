import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  CheckSquare,
  Square,
  FileText,
  Plus,
  Receipt,
  MessageSquare,
  Banknote,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Edit3,
  FileSpreadsheet,
  Download,
  FileDown,
  Printer
} from 'lucide-react';
import { Borrower, Loan, ScheduleInstallment } from '../types';
import { formatCurrency, formatDateKhmer, toKhmerNumeral } from '../utils/calculator';
import { exportSingleLoanScheduleToExcel } from '../utils/excel';
import { downloadElementAsPDF } from '../utils/pdf';
import { printDocument } from '../utils/print';
import { Language } from '../utils/translations';

interface BorrowerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrower: Borrower | null;
  loans: Loan[];
  onToggleInstallmentStatus: (
    loanId: string,
    installmentNumber: number,
    newStatus: 'paid' | 'pending' | 'overdue'
  ) => void;
  onUpdateInstallmentNote: (
    loanId: string,
    installmentNumber: number,
    notes: string
  ) => void;
  onOpenReceipt: (loan: Loan, installment: ScheduleInstallment) => void;
  onCreateLoan: (borrower: Borrower) => void;
  lang?: Language;
}

export const BorrowerDetailModal: React.FC<BorrowerDetailModalProps> = ({
  isOpen,
  onClose,
  borrower,
  loans,
  onToggleInstallmentStatus,
  onUpdateInstallmentNote,
  onOpenReceipt,
  onCreateLoan,
  lang = 'km',
}) => {
  if (!isOpen || !borrower) return null;

  // Filter loans belonging to this borrower
  const borrowerLoans = loans.filter((l) => l.borrowerId === borrower.id);
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    borrowerLoans[0]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'interactive' | 'a4'>('interactive');
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  const activeLoan = borrowerLoans.find((l) => l.id === selectedLoanId) || borrowerLoans[0];

  const handleDownloadPDF = async () => {
    if (viewMode !== 'a4') {
      setViewMode('a4');
      await new Promise((res) => setTimeout(res, 120));
    }
    await downloadElementAsPDF('printable-a4-contract', `លិខិតសន្យាកម្ចី_${borrower?.name || ''}`);
  };

  const handlePrint = async () => {
    if (viewMode !== 'a4') {
      setViewMode('a4');
      await new Promise((res) => setTimeout(res, 120));
    }
    printDocument('printable-a4-contract', `លិខិតសន្យាកម្ចី_${borrower?.name || ''}`);
  };

  const handleSaveNote = (loanId: string, installmentNumber: number) => {
    onUpdateInstallmentNote(loanId, installmentNumber, tempNoteText.trim());
    setEditingNoteIndex(null);
    setTempNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl my-auto overflow-hidden shadow-2xl flex flex-col max-h-[92vh] printable-area">
        
        {/* Modal Top Header Bar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/80 no-print gap-3">
          <div className="flex items-center gap-3">
            <img
              src={borrower.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={borrower.name}
              className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">{borrower.name}</h3>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {borrower.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                {borrower.phone} • {borrower.gender} • {borrower.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle Switch */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setViewMode('interactive')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'interactive'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>កាលវិភាគថ្ងៃបង់</span>
              </button>
              <button
                onClick={() => setViewMode('a4')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'a4'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>មើលទម្រង់ A4</span>
              </button>
            </div>

            {/* Action Buttons: Excel, PDF & Print */}
            <div className="flex items-center gap-2">
              {activeLoan && (
                <button
                  onClick={() => exportSingleLoanScheduleToExcel(activeLoan)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  title="ទាញយកកាលវិភាគបង់ប្រាក់ជា Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Excel</span>
                </button>
              )}

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                title="ទាញយកជា PDF"
              >
                <FileDown className="w-4 h-4" />
                <span>ទាញយក PDF</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-md"
                title="បោះពុម្ព (Print / Save as PDF)"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">បោះពុម្ព</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* INTERACTIVE MODE */}
          {viewMode === 'interactive' && (
            <div className="space-y-6">
              
              {/* Borrower Profile Overview Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 block">អត្តសញ្ញាណប័ណ្ណ (National ID)</span>
                  <span className="font-mono text-slate-200 font-bold">{borrower.nationalId || 'មិនមាន'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">ថ្ងៃខែឆ្នាំកំណើត (DOB)</span>
                  <span className="text-slate-200 font-medium">{formatDateKhmer(borrower.dob)}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">អាសយដ្ឋាន (Address)</span>
                  <span className="text-slate-200 font-medium truncate block">{borrower.address}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">កំណត់ចំណាំអ្នកខ្ចី (Notes)</span>
                  <span className="text-amber-300 font-medium truncate block">{borrower.notes || 'គ្មាន'}</span>
                </div>
              </div>

              {/* Loan Selection Tabs */}
              {borrowerLoans.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <Banknote className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 font-medium">អ្នកខ្ចីរូបនេះពុំទាន់មានសំណុំកម្ចីនៅឡើយទេ</p>
                  <button
                    onClick={() => {
                      onClose();
                      onCreateLoan(borrower);
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>បង្កើតកម្ចីដំបូងឥឡូវនេះ</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tabs header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <span className="text-xs font-bold text-slate-400 mr-2 shrink-0">ជ្រើសរើសកម្ចី៖</span>
                      {borrowerLoans.map((loan, idx) => (
                        <button
                          key={loan.id}
                          onClick={() => setSelectedLoanId(loan.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                            (activeLoan?.id === loan.id)
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>កម្ចីទី{toKhmerNumeral(idx + 1)} ({formatCurrency(loan.principalAmount)})</span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onCreateLoan(borrower);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>បន្ថែមថែមទៀត</span>
                    </button>
                  </div>

                  {activeLoan && (
                    <div className="space-y-4">
                      {/* Active Loan Details Bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                        <div className="space-y-1">
                          <span className="text-slate-400 block text-xs font-medium">ប្រាក់ដើមខ្ចី ($P)</span>
                          <span className="text-base font-bold text-emerald-400 block leading-normal">
                            {formatCurrency(activeLoan.principalAmount)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 block text-xs font-medium">អត្រាការប្រាក់</span>
                          <span className="text-sm font-bold text-teal-300 block leading-normal">
                            {activeLoan.interestRatePerMonth}%/{activeLoan.repaymentFrequency === 'daily' ? 'ថ្ងៃ' : activeLoan.repaymentFrequency === 'weekly' ? 'អាទិត្យ' : 'ខែ'} ({activeLoan.interestType === 'simple' ? 'ថេរ' : 'ថយចុះ'})
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 block text-xs font-medium">ប្រភេទនៃការបង់</span>
                          <span className="text-sm font-bold text-slate-200 block leading-normal">
                            {activeLoan.repaymentFrequency === 'daily' ? 'ប្រចាំថ្ងៃ' : activeLoan.repaymentFrequency === 'weekly' ? 'ប្រចាំអាទិត្យ' : 'ប្រចាំខែ'} ({toKhmerNumeral(activeLoan.durationMonths)} វគ្គ)
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 block text-xs font-medium">ប្រាក់សរុបត្រូវបង់</span>
                          <span className="text-base font-bold text-emerald-300 block leading-normal">
                            {formatCurrency(activeLoan.totalRepaymentAmount)}
                          </span>
                        </div>
                      </div>

                      {activeLoan.collateralNotes && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                          <strong>ទ្រព្យបញ្ចាំ/សម្គាល់៖</strong> {activeLoan.collateralNotes}
                        </div>
                      )}

                      {/* Payment Schedule Table with Checkboxes & Notes */}
                      <div id="printable-schedule-table" className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                        <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 text-xs no-print">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-slate-100">
                              កាលវិភាគថ្ងៃបង់ប្រាក់ និង ការកត់ត្រា (គ្រីស ឬ សរសេរ)
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-sans">
                            {activeLoan.schedule.length} ដំណាក់កាល
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                              <tr>
                                <th className="p-3 text-center w-12 whitespace-nowrap">គ្រីស</th>
                                <th className="p-3 whitespace-nowrap">លើកទី</th>
                                <th className="p-3 whitespace-nowrap">ថ្ងៃត្រូវបង់ (Due Date)</th>
                                <th className="p-3 text-right whitespace-nowrap">ប្រាក់ដើម ($)</th>
                                <th className="p-3 text-right whitespace-nowrap">ការប្រាក់ ($)</th>
                                <th className="p-3 text-right whitespace-nowrap">ត្រូវបង់ ($)</th>
                                <th className="p-3 text-right whitespace-nowrap">នៅសល់</th>
                                <th className="p-3 text-center whitespace-nowrap">ស្ថានភាព</th>
                                <th className="p-3 whitespace-nowrap">សរសេរចំណាំ (Notes)</th>
                                <th className="p-3 text-center whitespace-nowrap">បង្កាន់ដៃ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {activeLoan.schedule.map((item, idx) => {
                                const isPaid = item.status === 'paid';
                                const isEditingNote = editingNoteIndex === idx;

                                return (
                                  <tr
                                    key={item.installmentNumber}
                                    className={`transition-colors align-middle ${
                                      isPaid ? 'bg-emerald-950/20' : 'hover:bg-slate-900/50'
                                    }`}
                                  >
                                    {/* Checkbox / គ្រីស */}
                                    <td className="p-3 text-center align-middle">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onToggleInstallmentStatus(
                                            activeLoan.id,
                                            item.installmentNumber,
                                            isPaid ? 'pending' : 'paid'
                                          )
                                        }
                                        className={`p-1 rounded-lg transition-all inline-flex items-center justify-center ${
                                          isPaid
                                            ? 'text-emerald-400 hover:text-rose-400'
                                            : 'text-slate-600 hover:text-emerald-400'
                                        }`}
                                        title={isPaid ? 'ចុចដើម្បប្តូរជាមិនទាន់បង់' : 'ចុចដើម្បីគ្រីសបង់រួច'}
                                      >
                                        {isPaid ? (
                                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                          <Square className="w-5 h-5 text-slate-500" />
                                        )}
                                      </button>
                                    </td>

                                    {/* Installment number */}
                                    <td className="p-3 font-bold text-slate-400 align-middle whitespace-nowrap">
                                      #{item.installmentNumber}
                                    </td>

                                    {/* Payment Date */}
                                    <td className="p-3 align-middle whitespace-nowrap">
                                      <div className="font-bold text-slate-100 leading-normal">
                                        {formatDateKhmer(item.dueDate, true)}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-mono">
                                        {item.dueDate}
                                      </div>
                                    </td>

                                    {/* Amounts */}
                                    <td className="p-3 text-right align-middle whitespace-nowrap">{formatCurrency(item.principalAmount)}</td>
                                    <td className="p-3 text-right text-teal-400 align-middle whitespace-nowrap">{formatCurrency(item.interestAmount)}</td>
                                    <td className="p-3 text-right font-bold text-emerald-400 align-middle whitespace-nowrap">{formatCurrency(item.totalInstallmentAmount)}</td>
                                    <td className="p-3 text-right font-mono text-slate-400 align-middle whitespace-nowrap">{formatCurrency(item.remainingBalance)}</td>

                                    {/* Status Badge */}
                                    <td className="p-3 text-center align-middle whitespace-nowrap">
                                      <span
                                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold leading-none whitespace-nowrap ${
                                          isPaid
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : item.status === 'overdue'
                                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        }`}
                                      >
                                        {isPaid ? 'បង់រួច' : item.status === 'overdue' ? 'ហួសកំណត់' : 'មិនទាន់បង់'}
                                      </span>
                                    </td>

                                    {/* Notes / សរសេរចំណាំ */}
                                    <td className="p-3 min-w-[180px]">
                                      {isEditingNote ? (
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="text"
                                            autoFocus
                                            value={tempNoteText}
                                            onChange={(e) => setTempNoteText(e.target.value)}
                                            placeholder="សរសេរចំណាំទីនេះ..."
                                            className="w-full px-2 py-1 bg-slate-900 border border-emerald-500 rounded-lg text-xs text-slate-100 focus:outline-none"
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleSaveNote(activeLoan.id, item.installmentNumber);
                                            }}
                                          />
                                          <button
                                            onClick={() => handleSaveNote(activeLoan.id, item.installmentNumber)}
                                            className="p-1 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] shrink-0"
                                          >
                                            រក្សាទុក
                                          </button>
                                        </div>
                                      ) : (
                                        <div
                                          onClick={() => {
                                            setEditingNoteIndex(idx);
                                            setTempNoteText(item.notes || '');
                                          }}
                                          className="cursor-pointer flex items-center justify-between group p-1 rounded-lg hover:bg-slate-900/80 border border-transparent hover:border-slate-800"
                                        >
                                          <span className="text-xs text-slate-300 italic truncate max-w-[140px]">
                                            {item.notes || <span className="text-slate-600 font-sans text-[11px]">+ សរសេរចំណាំ</span>}
                                          </span>
                                          <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                      )}
                                    </td>

                                    {/* Receipt */}
                                    <td className="p-3 text-center">
                                      <button
                                        onClick={() => onOpenReceipt(activeLoan, item)}
                                        className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
                                        title="មើលបង្កាន់ដៃ"
                                      >
                                        <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* A4 PRINTABLE DOCUMENT PREVIEW MODE */}
          {viewMode === 'a4' && (
            <div className="bg-slate-950 p-2 sm:p-6 rounded-2xl border border-slate-800 overflow-x-auto flex justify-center">
              
              {/* Standard A4 Paper Box */}
              <div id="printable-a4-contract" className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-10 rounded-sm shadow-2xl font-sans space-y-6 printable-a4 mx-auto text-xs leading-relaxed border border-slate-200">
                
                {/* A4 Document Header */}
                <div className="text-center space-y-1 border-b border-slate-300 pb-4">
                  <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    ព្រះរាជាណាចក្រកម្ពុជា
                  </h1>
                  <h2 className="text-xs font-serif font-bold text-slate-700">
                    ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </h2>
                  <div className="w-24 h-0.5 bg-slate-800 mx-auto my-2"></div>
                  <h3 className="text-base font-bold text-slate-900 pt-1">
                    លិខិតសន្យា និង តារាងកាលវិភាគបង់ប្រាក់កម្ចី
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    កាលបរិច្ឆេទចេញ៖ {formatDateKhmer(new Date().toISOString().split('T')[0])} | លេខកម្ចី៖ {activeLoan?.id || borrower.id}
                  </p>
                </div>

                {/* Borrower & Loan Details Two-Column Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {/* Left: Borrower Details */}
                  <div className="p-3 border border-slate-300 rounded-lg bg-slate-50/50 space-y-1.5">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-[11px]">
                      ១. ព័ត៌មានអ្នកខ្ចី (Borrower Information)
                    </h4>
                    <div><span className="font-bold text-slate-700">ឈ្មោះ៖</span> {borrower.name}</div>
                    <div><span className="font-bold text-slate-700">ភេទ៖</span> {borrower.gender}</div>
                    <div><span className="font-bold text-slate-700">លេខទូរស័ព្ទ៖</span> {borrower.phone}</div>
                    <div><span className="font-bold text-slate-700">អត្តសញ្ញាណប័ណ្ណ៖</span> {borrower.nationalId || 'មិនមាន'}</div>
                    <div><span className="font-bold text-slate-700">អាសយដ្ឋាន៖</span> {borrower.address}</div>
                  </div>

                  {/* Right: Loan Terms */}
                  <div className="p-3 border border-slate-300 rounded-lg bg-slate-50/50 space-y-1.5">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-[11px]">
                      ២. លក្ខខណ្ឌកម្ចី (Loan Terms)
                    </h4>
                    <div><span className="font-bold text-slate-700">ចំនួនប្រាក់ខ្ចី៖</span> <strong className="text-emerald-700">{formatCurrency(activeLoan?.principalAmount || 0)}</strong></div>
                    <div><span className="font-bold text-slate-700">អត្រាការប្រាក់៖</span> {activeLoan?.interestRatePerMonth}%/{activeLoan?.repaymentFrequency === 'daily' ? 'ថ្ងៃ' : activeLoan?.repaymentFrequency === 'weekly' ? 'អាទិត្យ' : 'ខែ'} ({activeLoan?.interestType === 'simple' ? 'ការប្រាក់ថេរ' : 'ការប្រាក់ថយចុះ'})</div>
                    <div><span className="font-bold text-slate-700">រយៈពេលខ្ចី៖</span> {toKhmerNumeral(activeLoan?.durationMonths || 0)} {activeLoan?.repaymentFrequency === 'daily' ? 'ថ្ងៃ' : activeLoan?.repaymentFrequency === 'weekly' ? 'អាទិត្យ' : 'ខែ'}</div>
                    <div><span className="font-bold text-slate-700">ថ្ងៃចាប់ផ្តើមខ្ចី៖</span> {formatDateKhmer(activeLoan?.startDate || '')}</div>
                    <div><span className="font-bold text-slate-700">ទ្រព្យបញ្ចាំ៖</span> {activeLoan?.collateralNotes || 'គ្មាន'}</div>
                  </div>
                </div>

                {/* Schedule Table on A4 */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-[11px]">
                    ៣. តារាងកាលវិភាគបង់ប្រាក់លម្អិត (Repayment Schedule)
                  </h4>
                  <table className="w-full border-collapse border border-slate-400 text-[10px] text-left">
                    <thead className="bg-slate-100 text-slate-900 font-bold">
                      <tr>
                        <th className="border border-slate-400 p-1.5 text-center">លើកទី</th>
                        <th className="border border-slate-400 p-1.5">ថ្ងៃត្រូវបង់</th>
                        <th className="border border-slate-400 p-1.5 text-right">ប្រាក់ដើម</th>
                        <th className="border border-slate-400 p-1.5 text-right">ការប្រាក់</th>
                        <th className="border border-slate-400 p-1.5 text-right">ត្រូវបង់សរុប</th>
                        <th className="border border-slate-400 p-1.5 text-right">នៅសល់</th>
                        <th className="border border-slate-400 p-1.5 text-center">ស្ថានភាព</th>
                        <th className="border border-slate-400 p-1.5">ចំណាំ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLoan?.schedule.map((item) => (
                        <tr key={item.installmentNumber} className="border-b border-slate-300">
                          <td className="border border-slate-300 p-1.5 text-center font-bold">#{item.installmentNumber}</td>
                          <td className="border border-slate-300 p-1.5 font-medium">{formatDateKhmer(item.dueDate, true)}</td>
                          <td className="border border-slate-300 p-1.5 text-right">{formatCurrency(item.principalAmount)}</td>
                          <td className="border border-slate-300 p-1.5 text-right">{formatCurrency(item.interestAmount)}</td>
                          <td className="border border-slate-300 p-1.5 text-right font-bold">{formatCurrency(item.totalInstallmentAmount)}</td>
                          <td className="border border-slate-300 p-1.5 text-right font-mono">{formatCurrency(item.remainingBalance)}</td>
                          <td className="border border-slate-300 p-1.5 text-center font-bold">
                            {item.status === 'paid' ? 'បង់រួច' : item.status === 'overdue' ? 'ហួសកំណត់' : 'មិនទាន់បង់'}
                          </td>
                          <td className="border border-slate-300 p-1.5 italic text-slate-600">{item.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Terms Disclaimer & Signatures */}
                <div className="pt-6 space-y-6 border-t border-slate-300">
                  <p className="text-[10px] text-slate-600 italic">
                    * ភាគីទាំងពីរបានព្រមព្រៀងគ្នាលើលក្ខខណ្ឌ និងកាលវិភាគបង់ប្រាក់ខាងលើដោយស្ម័គ្រចិត្ត និងគ្មានការបង្ខិតបង្ខំឡើយ។
                  </p>

                  <div className="grid grid-cols-2 gap-8 text-center pt-2">
                    <div className="space-y-12">
                      <p className="font-bold text-slate-900 text-xs">
                        ស្នាមមេដៃ / ហត្ថលេខាអ្នកខ្ចី
                      </p>
                      <div className="pt-4 text-slate-700 font-bold">
                        {borrower.name}
                      </div>
                    </div>

                    <div className="space-y-12">
                      <p className="font-bold text-slate-900 text-xs">
                        ស្នាមមេដៃ / ហត្ថលេខាអ្នកផ្តល់កម្ចី
                      </p>
                      <div className="pt-4 text-slate-700 font-bold">
                        (ម្ចាស់កម្ចី)
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

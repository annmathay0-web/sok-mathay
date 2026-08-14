import React, { useState } from 'react';
import { Loan, ScheduleInstallment } from '../types';
import {
  CheckSquare,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  ChevronDown,
  ChevronUp,
  User,
  ListFilter,
  Users
} from 'lucide-react';
import { formatCurrency, formatDateKhmer, toKhmerNumeral } from '../utils/calculator';
import { matchesSearchTerm } from '../utils/search';
import { Language, translations } from '../utils/translations';
import confetti from 'canvas-confetti';

interface PaymentTrackerProps {
  loans: Loan[];
  borrowers?: Borrower[];
  onToggleStatus: (loanId: string, installmentNumber: number, newStatus: 'paid' | 'pending' | 'overdue') => void;
  onOpenReceipt: (loan: Loan, installment: ScheduleInstallment) => void;
  searchTerm: string;
  lang?: Language;
}

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({
  loans,
  borrowers = [],
  onToggleStatus,
  onOpenReceipt,
  searchTerm,
  lang = 'km',
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  
  // Track expanded loans by loan ID (default first loan expanded)
  const [expandedLoanIds, setExpandedLoanIds] = useState<Record<string, boolean>>(() => {
    if (loans.length > 0) {
      return { [loans[0].id]: true };
    }
    return {};
  });

  const t = translations[lang];
  const query = (searchTerm || localSearch).trim();

  const toggleExpand = (loanId: string) => {
    setExpandedLoanIds((prev) => ({
      ...prev,
      [loanId]: !prev[loanId],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    loans.forEach((l) => {
      allExpanded[l.id] = true;
    });
    setExpandedLoanIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedLoanIds({});
  };

  // Extract all installments flat array with loan & borrower metadata
  const allInstallments = loans.flatMap((loan) =>
    loan.schedule.map((sch) => ({
      loan,
      installment: sch,
    }))
  );

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      matchesSearchTerm(loan.borrowerName, query) ||
      matchesSearchTerm(loan.borrowerPhone, query) ||
      matchesSearchTerm(loan.id, query);

    const hasMatchingInstallment = loan.schedule.some((sch) => {
      const matchesStatus = selectedStatus === 'all' || sch.status === selectedStatus;
      const matchesMonth = !selectedMonth || sch.dueDate.startsWith(selectedMonth);
      const matchesDateSearch = matchesSearchTerm(sch.dueDate, query);
      return matchesStatus && matchesMonth && (query ? matchesSearch || matchesDateSearch : true);
    });

    return query ? matchesSearch || hasMatchingInstallment : hasMatchingInstallment;
  });

  const filteredInstallments = allInstallments.filter(({ loan, installment }) => {
    const matchesSearch =
      matchesSearchTerm(loan.borrowerName, query) ||
      matchesSearchTerm(loan.borrowerPhone, query) ||
      matchesSearchTerm(loan.id, query) ||
      matchesSearchTerm(installment.dueDate, query);

    const matchesStatus =
      selectedStatus === 'all' || installment.status === selectedStatus;

    const matchesMonth =
      !selectedMonth || installment.dueDate.startsWith(selectedMonth);

    return matchesSearch && matchesStatus && matchesMonth;
  });

  const paidCount = allInstallments.filter((i) => i.installment.status === 'paid').length;
  const pendingCount = allInstallments.filter((i) => i.installment.status === 'pending').length;
  const overdueCount = allInstallments.filter((i) => i.installment.status === 'overdue').length;

  const handleQuickStatusToggle = (
    loanId: string,
    installmentNumber: number,
    currentStatus: string
  ) => {
    let newStatus: 'paid' | 'pending' | 'overdue' = 'paid';
    if (currentStatus === 'paid') {
      newStatus = 'pending';
    } else if (currentStatus === 'pending') {
      newStatus = 'paid';
    } else if (currentStatus === 'overdue') {
      newStatus = 'paid';
    }

    onToggleStatus(loanId, installmentNumber, newStatus);

    if (newStatus === 'paid') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>{t.paymentTracker}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'km' 
              ? 'គ្រប់គ្រងការបង់ប្រាក់តាមអ្នកខ្ចី ឬទិដ្ឋភាពរួម ចុចលើអ្នកខ្ចីដើម្បីមើលព័ត៌មានលម្អិត'
              : 'Track payments grouped by borrower or in flat view'}
          </p>
        </div>

        {/* View Mode & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* View Mode Toggle */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center mr-2">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grouped'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{lang === 'km' ? 'តាមអ្នកខ្ចី' : 'By Borrower'}</span>
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'flat'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>{lang === 'km' ? 'បញ្ជីរួម' : 'Flat List'}</span>
            </button>
          </div>

          {/* Status Filter Tabs */}
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedStatus === 'all'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {t.all} ({lang === 'km' ? toKhmerNumeral(allInstallments.length) : allInstallments.length})
          </button>

          <button
            onClick={() => setSelectedStatus('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              selectedStatus === 'paid'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-950 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.paid} ({lang === 'km' ? toKhmerNumeral(paidCount) : paidCount})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              selectedStatus === 'pending'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-950 text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t.pending} ({lang === 'km' ? toKhmerNumeral(pendingCount) : pendingCount})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              selectedStatus === 'overdue'
                ? 'bg-rose-500 text-slate-950 border-rose-400'
                : 'bg-slate-950 text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.overdue} ({lang === 'km' ? toKhmerNumeral(overdueCount) : overdueCount})</span>
          </button>

        </div>
      </div>

      {/* Filter and Controls Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">
            {viewMode === 'grouped'
              ? lang === 'km' ? `បញ្ជីអ្នកខ្ចី (${toKhmerNumeral(filteredLoans.length)} នាក់)` : `Borrowers (${filteredLoans.length})`
              : lang === 'km' ? `បញ្ជីបង់ប្រាក់ (${toKhmerNumeral(filteredInstallments.length)} វគ្គ)` : `Installments (${filteredInstallments.length})`}
          </span>
          {viewMode === 'grouped' && filteredLoans.length > 0 && (
            <div className="flex items-center gap-1.5 ml-2 text-xs">
              <button
                onClick={expandAll}
                className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline text-[11px]"
              >
                {lang === 'km' ? 'ពង្រីកទាំងអស់' : 'Expand All'}
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={collapseAll}
                className="text-slate-400 hover:text-slate-300 font-medium hover:underline text-[11px]"
              >
                {lang === 'km' ? 'បង្រួមទាំងអស់' : 'Collapse All'}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Local Search Input */}
          <div className="relative w-full sm:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{lang === 'km' ? 'តម្រងតាមខែ៖' : 'Month:'}</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            />
            {selectedMonth && (
              <button
                onClick={() => setSelectedMonth('')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                {lang === 'km' ? 'លុបតម្រង' : 'Clear'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'grouped' ? (
        /* GROUPED BY BORROWER / LOAN VIEW */
        <div className="space-y-4">
          {filteredLoans.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 font-serif">
              {lang === 'km' ? 'ពុំមានទិន្នន័យអ្នកខ្ចីក្នុងតម្រងនេះទេ' : 'No borrower data found matching criteria'}
            </div>
          ) : (
            filteredLoans.map((loan) => {
              const isExpanded = query ? true : !!expandedLoanIds[loan.id];
              const borrowerPhoto = borrowers.find((b) => b.id === loan.borrowerId)?.photoUrl;
              const schedule = loan.schedule.filter((sch) => {
                const matchesStatus = selectedStatus === 'all' || sch.status === selectedStatus;
                const matchesMonth = !selectedMonth || sch.dueDate.startsWith(selectedMonth);
                return matchesStatus && matchesMonth;
              });

              const paidCountLoan = loan.schedule.filter((s) => s.status === 'paid').length;
              const totalCountLoan = loan.schedule.length;
              const hasOverdue = loan.schedule.some((s) => s.status === 'overdue');
              const isFullyPaid = paidCountLoan === totalCountLoan;
              const percentPaid = Math.round((paidCountLoan / (totalCountLoan || 1)) * 100);

              const freqText =
                loan.repaymentFrequency === 'daily'
                  ? lang === 'km' ? 'ប្រចាំថ្ងៃ' : 'Daily'
                  : loan.repaymentFrequency === 'weekly'
                  ? lang === 'km' ? 'ប្រចាំសប្តាហ៍' : 'Weekly'
                  : lang === 'km' ? 'ប្រចាំខែ' : 'Monthly';

              return (
                <div
                  key={loan.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all hover:border-slate-700"
                >
                  {/* Borrower Accordion Header Row */}
                  <div
                    onClick={() => toggleExpand(loan.id)}
                    className="p-4 bg-slate-950/80 hover:bg-slate-800/50 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 transition-all select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={borrowerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                        alt={loan.borrowerName}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-md bg-slate-950 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-100 font-serif text-sm">
                            {loan.borrowerName}
                          </h3>
                          <span className="font-mono text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                            {loan.id}
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                            {freqText}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                          <span>{loan.borrowerPhone}</span>
                          <span>•</span>
                          <span>
                            {lang === 'km' ? 'ប្រាក់ដើមដើម៖ ' : 'Principal: '}
                            <strong className="text-slate-200">{formatCurrency(loan.principalAmount)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress & Expand Indicator */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <span className="text-slate-400">
                            {lang === 'km'
                              ? `បានបង់ ${toKhmerNumeral(paidCountLoan)} / ${toKhmerNumeral(totalCountLoan)} លើក`
                              : `Paid ${paidCountLoan}/${totalCountLoan}`}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isFullyPaid
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : hasOverdue
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isFullyPaid
                              ? lang === 'km' ? 'បានបង់គ្រប់' : 'Fully Paid'
                              : hasOverdue
                              ? lang === 'km' ? 'មានហួសកំណត់' : 'Overdue'
                              : lang === 'km' ? 'កំពុងដំណើរសកម្ម' : 'Active'}
                          </span>
                        </div>

                        {/* Mini Progress Bar */}
                        <div className="w-36 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mt-1.5 ml-auto">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isFullyPaid
                                ? 'bg-emerald-400'
                                : hasOverdue
                                ? 'bg-rose-500'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${percentPaid}%` }}
                          />
                        </div>
                      </div>

                      <button
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
                        title={isExpanded ? 'បង្រួម' : 'មើលព័ត៌មានលម្អិត'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Schedule Sub-Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto border-t border-slate-800/60 bg-slate-950/40">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="p-3 whitespace-nowrap pl-5">
                              {lang === 'km' ? 'លើកទី' : 'Installment'}
                            </th>
                            <th className="p-3 whitespace-nowrap">{t.dueDate}</th>
                            <th className="p-3 text-right whitespace-nowrap">{t.principal}</th>
                            <th className="p-3 text-right whitespace-nowrap">{t.interest}</th>
                            <th className="p-3 text-right whitespace-nowrap">{t.totalAmount}</th>
                            <th className="p-3 text-center whitespace-nowrap">{t.status}</th>
                            <th className="p-3 text-center whitespace-nowrap pr-5">{t.actions}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 font-sans">
                          {schedule.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-6 text-slate-500 font-serif">
                                {lang === 'km' ? 'ពុំមានការបង់ប្រាក់ត្រូវនឹងតម្រងនេះទេ' : 'No matching schedule items'}
                              </td>
                            </tr>
                          ) : (
                            schedule.map((installment) => {
                              const isPaid = installment.status === 'paid';
                              const isOverdue = installment.status === 'overdue';

                              return (
                                <tr
                                  key={installment.installmentNumber}
                                  className={`hover:bg-slate-800/40 transition-all align-middle ${
                                    isOverdue ? 'bg-rose-500/5' : ''
                                  }`}
                                >
                                  {/* Installment # */}
                                  <td className="p-3 pl-5 font-mono text-[11px] font-bold text-slate-300 align-middle">
                                    {lang === 'km'
                                      ? `លើកទី #${toKhmerNumeral(installment.installmentNumber)}`
                                      : `#${installment.installmentNumber}`}
                                  </td>

                                  {/* Due Date */}
                                  <td className="p-3 text-slate-200 align-middle whitespace-nowrap">
                                    <div className="font-medium text-slate-100 text-xs">
                                      {formatDateKhmer(installment.dueDate, true)}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                      <span>{installment.dueDate}</span>
                                      {installment.notes && (
                                        <span className="text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded text-[9px]">
                                          {installment.notes}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Principal */}
                                  <td className="p-3 text-right text-slate-300 align-middle whitespace-nowrap">
                                    {formatCurrency(installment.principalAmount)}
                                  </td>

                                  {/* Interest */}
                                  <td className="p-3 text-right text-teal-400 font-semibold align-middle whitespace-nowrap">
                                    {formatCurrency(installment.interestAmount)}
                                  </td>

                                  {/* Total */}
                                  <td className="p-3 text-right font-bold text-emerald-400 text-sm align-middle whitespace-nowrap">
                                    {formatCurrency(installment.totalInstallmentAmount)}
                                  </td>

                                  {/* Status Toggle */}
                                  <td className="p-3 text-center align-middle whitespace-nowrap">
                                    <button
                                      onClick={() =>
                                        handleQuickStatusToggle(
                                          loan.id,
                                          installment.installmentNumber,
                                          installment.status
                                        )
                                      }
                                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 whitespace-nowrap leading-none ${
                                        isPaid
                                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                          : isOverdue
                                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                      }`}
                                      title={lang === 'km' ? 'ចុចដើម្បីប្តូរស្ថានភាព Real-time' : 'Click to toggle status'}
                                    >
                                      {isPaid ? (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>{t.paid}</span>
                                        </>
                                      ) : isOverdue ? (
                                        <>
                                          <AlertTriangle className="w-3.5 h-3.5" />
                                          <span>{t.overdue}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3.5 h-3.5" />
                                          <span>{t.pending}</span>
                                        </>
                                      )}
                                    </button>
                                  </td>

                                  {/* Receipt */}
                                  <td className="p-3 text-center pr-5 align-middle">
                                    <button
                                      onClick={() => onOpenReceipt(loan, installment)}
                                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                                    >
                                      <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>{t.receipt}</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* FLAT LIST VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">{t.borrowerName}</th>
                  <th className="p-3.5 whitespace-nowrap">{lang === 'km' ? 'កម្ចី & លើកទី' : 'Loan & Installment'}</th>
                  <th className="p-3.5 whitespace-nowrap">{t.dueDate}</th>
                  <th className="p-3.5 text-right whitespace-nowrap">{t.principal}</th>
                  <th className="p-3.5 text-right whitespace-nowrap">{t.interest}</th>
                  <th className="p-3.5 text-right whitespace-nowrap">{t.totalAmount}</th>
                  <th className="p-3.5 text-center whitespace-nowrap">{t.status}</th>
                  <th className="p-3.5 text-center whitespace-nowrap">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredInstallments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500 font-serif">
                      {lang === 'km' ? 'ពុំមានការបង់ប្រាក់ក្នុងតម្រងនេះទេ' : 'No payments found matching criteria'}
                    </td>
                  </tr>
                ) : (
                  filteredInstallments.map(({ loan, installment }) => {
                    const isPaid = installment.status === 'paid';
                    const isOverdue = installment.status === 'overdue';
                    const borrowerPhoto = borrowers.find((b) => b.id === loan.borrowerId)?.photoUrl;

                    return (
                      <tr
                        key={`${loan.id}-${installment.installmentNumber}`}
                        className={`hover:bg-slate-800/40 transition-all align-middle ${
                          isOverdue ? 'bg-rose-500/5' : ''
                        }`}
                      >
                        {/* Borrower */}
                        <td className="p-3.5 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={borrowerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                              alt={loan.borrowerName}
                              className="w-9 h-9 rounded-xl object-cover border border-emerald-500/30 shadow-sm bg-slate-950 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                              }}
                            />
                            <div>
                              <div className="font-bold text-slate-100 font-serif leading-normal">
                                {loan.borrowerName}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {loan.borrowerPhone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Loan ID & Installment */}
                        <td className="p-3.5 font-mono text-[11px] align-middle whitespace-nowrap">
                          <span className="text-emerald-400 font-bold">{loan.id}</span>
                          <span className="text-slate-400 block">
                            {lang === 'km' ? `លើកទី #${toKhmerNumeral(installment.installmentNumber)}` : `#${installment.installmentNumber}`}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td className="p-3.5 text-slate-200 align-middle whitespace-nowrap">
                          <div className="font-medium text-slate-100 text-xs leading-normal">
                            {formatDateKhmer(installment.dueDate, true)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <span>{installment.dueDate}</span>
                            {installment.notes && (
                              <span className="text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded text-[9px]">
                                {installment.notes}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Principal */}
                        <td className="p-3.5 text-right text-slate-300 align-middle whitespace-nowrap">
                          {formatCurrency(installment.principalAmount)}
                        </td>

                        {/* Interest */}
                        <td className="p-3.5 text-right text-teal-400 font-semibold align-middle whitespace-nowrap">
                          {formatCurrency(installment.interestAmount)}
                        </td>

                        {/* Total */}
                        <td className="p-3.5 text-right font-bold text-emerald-400 text-sm align-middle whitespace-nowrap">
                          {formatCurrency(installment.totalInstallmentAmount)}
                        </td>

                        {/* Status Toggle */}
                        <td className="p-3.5 text-center align-middle whitespace-nowrap">
                          <button
                            onClick={() =>
                              handleQuickStatusToggle(
                                loan.id,
                                installment.installmentNumber,
                                installment.status
                              )
                            }
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 whitespace-nowrap leading-none ${
                              isPaid
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : isOverdue
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}
                            title={lang === 'km' ? 'ចុចដើម្បីប្តូរស្ថានភាព Real-time' : 'Click to toggle status'}
                          >
                            {isPaid ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{t.paid}</span>
                              </>
                            ) : isOverdue ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>{t.overdue}</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" />
                                <span>{t.pending}</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Receipt */}
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => onOpenReceipt(loan, installment)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t.receipt}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { Loan, Borrower, ScheduleInstallment } from '../types';
import { formatCurrency, formatDateKhmer, toKhmerNumeral } from '../utils/calculator';
import { Language, translations } from '../utils/translations';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Phone,
  Send,
  Calendar,
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodayDueWidgetProps {
  loans: Loan[];
  borrowers?: Borrower[];
  onToggleStatus: (loanId: string, installmentNumber: number, newStatus: 'paid' | 'pending' | 'overdue') => void;
  onOpenReceipt: (loan: Loan, installment: ScheduleInstallment) => void;
  lang?: Language;
}

export const TodayDueWidget: React.FC<TodayDueWidgetProps> = ({
  loans,
  borrowers = [],
  onToggleStatus,
  onOpenReceipt,
  lang = 'km',
}) => {
  const [filterMode, setFilterMode] = useState<'overdue' | 'today' | 'upcoming'>('today');
  const t = translations[lang];

  const todayStr = new Date().toISOString().split('T')[0];

  // Flat collection items
  const allScheduleItems = loans.flatMap((loan) => {
    const borrower = borrowers.find((b) => b.id === loan.borrowerId);
    return loan.schedule.map((sch) => ({
      loan,
      installment: sch,
      borrower,
    }));
  });

  // Overdue items
  const overdueItems = allScheduleItems.filter(
    (item) => item.installment.status !== 'paid' && (item.installment.status === 'overdue' || item.installment.dueDate < todayStr)
  );

  // Today items
  const todayItems = allScheduleItems.filter(
    (item) => item.installment.status !== 'paid' && item.installment.dueDate === todayStr
  );

  // Upcoming items (next 7 days)
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

  const upcomingItems = allScheduleItems.filter(
    (item) =>
      item.installment.status !== 'paid' &&
      item.installment.dueDate > todayStr &&
      item.installment.dueDate <= nextWeekStr
  );

  const displayItems = filterMode === 'overdue' ? overdueItems : filterMode === 'today' ? todayItems : upcomingItems;

  const handleQuickPay = (loanId: string, installmentNumber: number) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#14b8a6', '#06b6d4'],
    });
    onToggleStatus(loanId, installmentNumber, 'paid');
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>{lang === 'km' ? 'ប្រព័ន្ធប្រមូលប្រាក់រហ័ស' : 'Quick Payment Hub'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                {lang === 'km' ? 'ងាយស្រួល ១-ចុច' : '1-Click Collect'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'km' ? 'គ្រប់គ្រងការទារប្រាក់ប្រចាំថ្ងៃ និងតាមដានការហួសកំណត់' : 'Collect payments fast & notify borrowers'}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterMode('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterMode === 'today'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'km' ? 'ត្រូវបង់ថ្ងៃនេះ' : 'Due Today'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${filterMode === 'today' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
              {todayItems.length}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterMode === 'overdue'
                ? 'bg-rose-500 text-slate-100 shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lang === 'km' ? 'ហួសកំណត់' : 'Overdue'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${filterMode === 'overdue' ? 'bg-slate-950/30 text-slate-100' : 'bg-rose-500/20 text-rose-300'}`}>
              {overdueItems.length}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterMode === 'upcoming'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{lang === 'km' ? '៧ ថ្ងៃខាងមុខ' : 'Next 7 Days'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${filterMode === 'upcoming' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
              {upcomingItems.length}
            </span>
          </button>
        </div>
      </div>

      {/* Item List */}
      {displayItems.length === 0 ? (
        <div className="py-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80 my-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-200">
            {filterMode === 'today'
              ? (lang === 'km' ? 'គ្មានកម្ចីត្រូវបង់ថ្ងៃនេះទេ! 🥳' : 'No payments due today! 🎉')
              : filterMode === 'overdue'
              ? (lang === 'km' ? 'គ្មានកម្ចីយឺតយ៉ាវទេ! ល្អណាស់! ✨' : 'No overdue payments! Great job! ✨')
              : (lang === 'km' ? 'គ្មានកម្ចីត្រូវបង់ក្នុង ៧ ថ្ងៃខាងមុខទេ' : 'No upcoming payments in next 7 days')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'km' ? 'ប្រព័ន្ធដំណើរការយ៉ាងរលូន' : 'All accounts are updated'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 relative z-10">
          {displayItems.map(({ loan, installment, borrower }) => {
            const isOverdue = installment.dueDate < todayStr;
            const photoUrl = borrower?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

            return (
              <div
                key={`${loan.id}-${installment.installmentNumber}`}
                className="bg-slate-950/80 rounded-2xl border border-slate-800 p-3.5 sm:p-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3 shadow-md group"
              >
                {/* Borrower Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={photoUrl}
                      alt={loan.borrowerName}
                      className="w-11 h-11 rounded-xl object-cover border-2 border-slate-700/80 shadow-sm shrink-0 group-hover:border-emerald-500/50 transition-all"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 truncate">
                        {loan.borrowerName}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-teal-400 shrink-0" />
                        <span className="truncate">{loan.borrowerPhone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Due Date Badge */}
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isOverdue
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : installment.dueDate === todayStr
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                      }`}
                    >
                      {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{formatDateKhmer(installment.dueDate)}</span>
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {lang === 'km' ? `លើកទី ${toKhmerNumeral(installment.installmentNumber)}` : `Inst. #${installment.installmentNumber}`}
                    </div>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                  <div className="text-xs text-slate-400">
                    <span>{lang === 'km' ? 'ប្រាក់ត្រូវបង់សរុប' : 'Total Due'}:</span>
                    <div className="text-[10px] text-slate-400">
                      (ដើម: {formatCurrency(installment.principalAmount)} + ការ: {formatCurrency(installment.interestAmount)})
                    </div>
                  </div>
                  <div className="text-base font-extrabold text-amber-400 font-mono">
                    {formatCurrency(installment.totalInstallmentAmount)}
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                  <button
                    onClick={() => handleQuickPay(loan.id, installment.installmentNumber)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'km' ? 'ប្រមូលប្រាក់រួច' : 'Mark Paid'}</span>
                  </button>

                  <button
                    onClick={() => onOpenReceipt(loan, installment)}
                    title={lang === 'km' ? 'ចេញវិក្កយបត្រ' : 'Receipt'}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all border border-slate-700/60 shrink-0"
                  >
                    <Receipt className="w-4 h-4 text-emerald-400" />
                  </button>

                  <a
                    href={`tel:${loan.borrowerPhone.replace(/\s+/g, '')}`}
                    title={lang === 'km' ? 'ទូរស័ព្ទទៅអ្នកខ្ចី' : 'Call borrower'}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all border border-slate-700/60 shrink-0"
                  >
                    <Phone className="w-4 h-4 text-teal-400" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

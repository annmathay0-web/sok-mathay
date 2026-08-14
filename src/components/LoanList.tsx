import React, { useState } from 'react';
import { Borrower, Loan } from '../types';
import { FileText, User, Phone, Eye, Trash2, FileSpreadsheet, Search } from 'lucide-react';
import { formatCurrency, toKhmerNumeral } from '../utils/calculator';
import { exportLoansReportToExcel, exportSingleLoanScheduleToExcel } from '../utils/excel';
import { matchesSearchTerm } from '../utils/search';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { Language, translations } from '../utils/translations';

interface LoanListProps {
  loans: Loan[];
  borrowers?: Borrower[];
  onViewLoanDetail: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  searchTerm: string;
  lang?: Language;
}

export const LoanList: React.FC<LoanListProps> = ({
  loans,
  borrowers = [],
  onViewLoanDetail,
  onDeleteLoan,
  searchTerm,
  lang = 'km',
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);

  const t = translations[lang];
  const query = (searchTerm || localSearch).trim();

  const filteredLoans = loans.filter((loan) => {
    const matchesQuery =
      matchesSearchTerm(loan.id, query) ||
      matchesSearchTerm(loan.borrowerName, query) ||
      matchesSearchTerm(loan.borrowerPhone, query) ||
      matchesSearchTerm(loan.collateralNotes, query);

    const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>{t.loans}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'km' 
              ? `ចំនួនកម្ចីសរុប ${toKhmerNumeral(loans.length)} កម្ចី (បង្ហាញ ${toKhmerNumeral(filteredLoans.length)})`
              : `Total loans: ${loans.length} (Showing ${filteredLoans.length})`}
          </p>
        </div>

        {/* Search, Filter and Export */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Local Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'active' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.active}
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'completed' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.completed}
            </button>
          </div>

          <button
            onClick={() => exportLoansReportToExcel(loans)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-medium border border-slate-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.exportExcel}</span>
          </button>
        </div>
      </div>

      {/* Loans Grid */}
      {filteredLoans.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">
            {lang === 'km' ? 'ពុំមានទិន្នន័យកម្ចីក្នុងតម្រងនេះទេ' : 'No loans found in this filter'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoans.map((loan) => {
            const paidInstallments = loan.schedule.filter((s) => s.status === 'paid').length;
            const overdueInstallments = loan.schedule.filter((s) => s.status === 'overdue').length;
            const totalInstallments = loan.schedule.length;
            const progressPercent = Math.round((paidInstallments / totalInstallments) * 100);

            return (
              <div
                key={loan.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {loan.id}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        {loan.repaymentFrequency === 'daily'
                          ? (lang === 'km' ? 'ប្រចាំថ្ងៃ' : 'Daily')
                          : loan.repaymentFrequency === 'weekly'
                          ? (lang === 'km' ? 'ប្រចាំអាទិត្យ' : 'Weekly')
                          : (lang === 'km' ? 'ប្រចាំខែ' : 'Monthly')}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                        {loan.interestType === 'simple' ? t.flatInterest : t.reducingInterest}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        loan.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : overdueInstallments > 0
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                      }`}
                    >
                      {loan.status === 'completed'
                        ? t.completed
                        : overdueInstallments > 0
                        ? `${lang === 'km' ? toKhmerNumeral(overdueInstallments) : overdueInstallments} ${t.overdue}`
                        : t.active}
                    </span>
                  </div>

                  {/* Borrower Name & Photo Avatar */}
                  <div className="mb-4 flex items-center gap-3">
                    <img
                      src={borrowers.find((b) => b.id === loan.borrowerId)?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={loan.borrowerName}
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30 shadow-sm bg-slate-950 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-100 leading-tight">
                        {loan.borrowerName}
                      </h3>
                      <p className="text-xs text-slate-400 font-sans mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-teal-400" />
                        <span>{loan.borrowerPhone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Figures Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4 font-sans">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t.principalAmount}</span>
                      <span className="text-sm font-bold text-slate-100">
                        {formatCurrency(loan.principalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t.totalInterest}</span>
                      <span className="text-sm font-bold text-teal-400">
                        {formatCurrency(loan.totalInterestAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        {loan.repaymentFrequency === 'daily'
                          ? (lang === 'km' ? 'អត្រាការប្រាក់/ថ្ងៃ' : 'Interest Rate/Day')
                          : loan.repaymentFrequency === 'weekly'
                          ? (lang === 'km' ? 'អត្រាការប្រាក់/សប្ដាហ៍' : 'Interest Rate/Week')
                          : t.monthlyInterestRate}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {loan.interestRatePerMonth}% / {loan.repaymentFrequency === 'daily' ? (lang === 'km' ? 'ថ្ងៃ' : 'day') : loan.repaymentFrequency === 'weekly' ? (lang === 'km' ? 'អាទិត្យ' : 'week') : (lang === 'km' ? 'ខែ' : 'month')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        {loan.repaymentFrequency === 'daily'
                          ? (lang === 'km' ? 'រយៈពេល (ថ្ងៃ)' : 'Duration (Days)')
                          : loan.repaymentFrequency === 'weekly'
                          ? (lang === 'km' ? 'រយៈពេល (សប្ដាហ៍)' : 'Duration (Weeks)')
                          : t.durationMonths}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {loan.repaymentFrequency === 'daily'
                          ? (lang === 'km' ? `${toKhmerNumeral(loan.durationMonths)} ថ្ងៃ` : `${loan.durationMonths} days`)
                          : loan.repaymentFrequency === 'weekly'
                          ? (lang === 'km' ? `${toKhmerNumeral(loan.durationMonths)} អាទិត្យ` : `${loan.durationMonths} wks`)
                          : (lang === 'km' ? `${toKhmerNumeral(loan.durationMonths)} ខែ` : `${loan.durationMonths} mos`)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>
                        {lang === 'km' 
                          ? `វគ្គបង់រួច៖ ${toKhmerNumeral(paidInstallments)}/${toKhmerNumeral(totalInstallments)}`
                          : `Paid: ${paidInstallments}/${totalInstallments}`}
                      </span>
                      <span className="font-bold text-emerald-400 font-sans">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {loan.collateralNotes && (
                    <p className="text-[11px] text-slate-400 truncate bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                      <span className="font-semibold text-slate-300">{t.collateral}:</span> {loan.collateralNotes}
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {t.startDate}: {loan.startDate}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => exportSingleLoanScheduleToExcel(loan)}
                      className="p-1.5 rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-slate-950 transition-all"
                      title={lang === 'km' ? 'ទាញយកកាលវិភាគជា Excel' : 'Export Schedule to Excel'}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onViewLoanDetail(loan)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 text-xs font-bold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.viewSchedule}</span>
                    </button>

                    <button
                      onClick={() => setLoanToDelete(loan)}
                      className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Deleting Loan */}
      <ConfirmDeleteModal
        isOpen={!!loanToDelete}
        onClose={() => setLoanToDelete(null)}
        onConfirm={() => {
          if (loanToDelete) {
            onDeleteLoan(loanToDelete.id);
            setLoanToDelete(null);
          }
        }}
        title={lang === 'km' ? 'លុបទិន្នន័យកម្ចី' : 'Delete Loan Record'}
        itemName={loanToDelete ? `${loanToDelete.id} (${loanToDelete.borrowerName})` : ''}
        description={
          lang === 'km'
            ? `តើអ្នកពិតជាចង់លុបទិន្នន័យកម្ចីលេខ ${loanToDelete?.id} របស់អ្នកខ្ចី "${loanToDelete?.borrowerName}" មែនទេ? រាល់តារាងបង់ប្រាក់ និងប្រវត្តិទាំងអស់នឹងត្រូវលុបចេញពីប្រព័ន្ធ។`
            : `Are you sure you want to delete loan ${loanToDelete?.id} for borrower "${loanToDelete?.borrowerName}"? All repayment schedule history will be permanently deleted.`
        }
        lang={lang}
      />

    </div>
  );
};

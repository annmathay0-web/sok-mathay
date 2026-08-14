import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SummaryCards } from './components/SummaryCards';
import { BorrowerList } from './components/BorrowerList';
import { LoanCalculator } from './components/LoanCalculator';
import { LoanList } from './components/LoanList';
import { PaymentTracker } from './components/PaymentTracker';
import { BorrowerModal } from './components/BorrowerModal';
import { BorrowerDetailModal } from './components/BorrowerDetailModal';
import { ReceiptModal } from './components/ReceiptModal';
import { LoanDetailModal } from './components/LoanDetailModal';
import { TodayDueWidget } from './components/TodayDueWidget';

import { Borrower, Loan, DashboardMetrics, ScheduleInstallment } from './types';
import { INITIAL_BORROWERS, getInitialLoans } from './data/initialData';
import { exportBorrowersToExcel, exportLoansReportToExcel } from './utils/excel';
import { Language, Theme, translations } from './utils/translations';
import { FileSpreadsheet, Plus, CheckCircle, Calculator, Users, Clock, AlertTriangle } from 'lucide-react';

import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  // Language & Theme state
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('loan_app_lang') as Language) || 'km';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('loan_app_theme') as Theme) || 'dark';
  });

  // Sync theme to root class
  useEffect(() => {
    localStorage.setItem('loan_app_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('loan_app_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const t = translations[lang];

  // LocalStorage state initialization
  const [borrowers, setBorrowers] = useState<Borrower[]>(() => {
    const saved = localStorage.getItem('loan_app_borrowers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_BORROWERS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('loan_app_loans');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return getInitialLoans();
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isBorrowerModalOpen, setIsBorrowerModalOpen] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState<Borrower | null>(null);

  const [selectedLoanForDetail, setSelectedLoanForDetail] = useState<Loan | null>(null);
  const [selectedBorrowerForDetail, setSelectedBorrowerForDetail] = useState<Borrower | null>(null);

  const [selectedReceiptData, setSelectedReceiptData] = useState<{
    loan: Loan;
    installment: ScheduleInstallment;
  } | null>(null);

  const [preselectedBorrowerForLoan, setPreselectedBorrowerForLoan] = useState<Borrower | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('loan_app_borrowers', JSON.stringify(borrowers));
  }, [borrowers]);

  useEffect(() => {
    localStorage.setItem('loan_app_loans', JSON.stringify(loans));
  }, [loans]);

  // Compute Dashboard Metrics dynamically
  const metrics: DashboardMetrics = useMemo(() => {
    const activeLoans = loans.filter((l) => l.status === 'active');
    
    const totalPrincipal = activeLoans.reduce((sum, l) => sum + l.principalAmount, 0);

    // Expected monthly interest (from active loans)
    const expectedMonthlyInterest = activeLoans.reduce((sum, l) => {
      let monthlyInterest = 0;

      if (l.repaymentFrequency === 'daily') {
        // Daily loan: aggregate 30 days of daily interest
        const pending = l.schedule.filter((s) => s.status !== 'paid');
        if (pending.length >= 30) {
          monthlyInterest = pending.slice(0, 30).reduce((acc, s) => acc + s.interestAmount, 0);
        } else if (pending.length > 0) {
          const avgDaily = pending.reduce((acc, s) => acc + s.interestAmount, 0) / pending.length;
          monthlyInterest = avgDaily * 30;
        } else if (l.schedule.length > 0) {
          const avgDaily = l.schedule.reduce((acc, s) => acc + s.interestAmount, 0) / l.schedule.length;
          monthlyInterest = avgDaily * 30;
        } else {
          monthlyInterest = l.principalAmount * (l.interestRatePerMonth / 100);
        }
      } else if (l.repaymentFrequency === 'weekly') {
        // Weekly loan: aggregate 4 weeks of weekly interest
        const pending = l.schedule.filter((s) => s.status !== 'paid');
        if (pending.length >= 4) {
          monthlyInterest = pending.slice(0, 4).reduce((acc, s) => acc + s.interestAmount, 0);
        } else if (pending.length > 0) {
          const avgWeekly = pending.reduce((acc, s) => acc + s.interestAmount, 0) / pending.length;
          monthlyInterest = avgWeekly * 4;
        } else if (l.schedule.length > 0) {
          const avgWeekly = l.schedule.reduce((acc, s) => acc + s.interestAmount, 0) / l.schedule.length;
          monthlyInterest = avgWeekly * 4;
        } else {
          monthlyInterest = l.principalAmount * (l.interestRatePerMonth / 100);
        }
      } else {
        // Monthly loan: single installment interest
        const firstPending = l.schedule.find((s) => s.status !== 'paid') || l.schedule[0];
        monthlyInterest = firstPending ? firstPending.interestAmount : (l.principalAmount * (l.interestRatePerMonth / 100));
      }

      // Fallback safeguard for unadjusted or initial zero edge cases
      if (monthlyInterest <= 0) {
        monthlyInterest = l.principalAmount * (l.interestRatePerMonth / 100);
      }

      return sum + monthlyInterest;
    }, 0);

    const totalBorrowersCount = borrowers.length;
    const activeLoansCount = activeLoans.length;

    // Overdue installments across all active loans
    const overdueInstallmentsCount = loans.reduce((count, l) => {
      return count + l.schedule.filter((s) => s.status === 'overdue').length;
    }, 0);

    // Total collected amount ($)
    const totalCollectedThisMonth = loans.reduce((total, l) => {
      const paidSum = l.schedule
        .filter((s) => s.status === 'paid')
        .reduce((s, item) => s + item.paidAmount, 0);
      return total + paidSum;
    }, 0);

    return {
      totalPrincipal,
      expectedMonthlyInterest,
      totalBorrowersCount,
      activeLoansCount,
      overdueInstallmentsCount,
      totalCollectedThisMonth,
    };
  }, [borrowers, loans]);

  // Handlers for Borrower CRUD
  const handleSaveBorrower = (borrower: Borrower, initialLoan?: Loan | null) => {
    if (editingBorrower) {
      setBorrowers((prev) => prev.map((b) => (b.id === borrower.id ? borrower : b)));
      addToast(lang === 'km' ? 'បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានអ្នកខ្ចី!' : 'Borrower updated successfully!', 'success');
    } else {
      setBorrowers((prev) => [borrower, ...prev]);
      if (initialLoan) {
        setLoans((prev) => [initialLoan, ...prev]);
        addToast(
          lang === 'km'
            ? 'បានបន្ថែមអ្នកខ្ចី និងបង្កើតកម្ចីថ្មីជោគជ័យ!'
            : 'Borrower and initial loan created successfully!',
          'success'
        );
      } else {
        addToast(lang === 'km' ? 'បានបន្ថែមអ្នកខ្ចីថ្មីជោគជ័យ!' : 'Borrower added successfully!', 'success');
      }
    }
  };

  const handleDeleteBorrower = (id: string) => {
    setBorrowers((prev) => prev.filter((b) => b.id !== id));
    setLoans((prev) => prev.filter((l) => l.borrowerId !== id));
    addToast(lang === 'km' ? 'បានលុបអ្នកខ្ចីរួចរាល់!' : 'Borrower deleted!', 'info');
  };

  // Handlers for Loan CRUD
  const handleCreateLoan = (newLoan: Loan) => {
    setLoans((prev) => [newLoan, ...prev]);
    setActiveTab('loans');
    addToast(lang === 'km' ? 'បានបង្កើតកម្ចីថ្មីជោគជ័យ!' : 'Loan created successfully!', 'success');
  };

  const handleDeleteLoan = (loanId: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== loanId));
    addToast(lang === 'km' ? 'បានលុបកម្ចីរួចរាល់!' : 'Loan deleted!', 'info');
  };

  // Real-time Payment Tracker Status Toggle
  const handleToggleInstallmentStatus = (
    loanId: string,
    installmentNumber: number,
    newStatus: 'paid' | 'pending' | 'overdue'
  ) => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) => {
        if (loan.id !== loanId) return loan;

        const updatedSchedule = loan.schedule.map((sch) => {
          if (sch.installmentNumber === installmentNumber) {
            const todayStr = new Date().toISOString().split('T')[0];
            return {
              ...sch,
              status: newStatus,
              paidAmount: newStatus === 'paid' ? sch.totalInstallmentAmount : 0,
              paidDate: newStatus === 'paid' ? todayStr : undefined,
            };
          }
          return sch;
        });

        // Check if all installments are paid -> complete loan
        const isAllPaid = updatedSchedule.every((s) => s.status === 'paid');

        return {
          ...loan,
          schedule: updatedSchedule,
          status: isAllPaid ? 'completed' : 'active',
        };
      })
    );

    const statusMap = {
      paid: lang === 'km' ? 'បានកត់ត្រាការបង់ប្រាក់រួចរាល់!' : 'Marked as paid!',
      pending: lang === 'km' ? 'បានប្តូរជាកំពុងរង់ចាំ!' : 'Marked as pending!',
      overdue: lang === 'km' ? 'បានប្តូរជាយឺតយ៉ាវ!' : 'Marked as overdue!',
    };
    addToast(statusMap[newStatus], newStatus === 'paid' ? 'success' : 'info');
  };

  // Update Installment Notes
  const handleUpdateInstallmentNote = (
    loanId: string,
    installmentNumber: number,
    notes: string
  ) => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) => {
        if (loan.id !== loanId) return loan;
        const updatedSchedule = loan.schedule.map((sch) => {
          if (sch.installmentNumber === installmentNumber) {
            return { ...sch, notes };
          }
          return sch;
        });
        return { ...loan, schedule: updatedSchedule };
      })
    );
    addToast(lang === 'km' ? 'បានរក្សាទុកចំណាំ!' : 'Note saved successfully!', 'success');
  };

  // Open Calculator preselected for specific borrower
  const handleCreateLoanForBorrower = (borrower: Borrower) => {
    setPreselectedBorrowerForLoan(borrower);
    setActiveTab('calculator');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenAddBorrower={() => {
          setEditingBorrower(null);
          setIsBorrowerModalOpen(true);
        }}
        onOpenAddLoan={() => {
          setPreselectedBorrowerForLoan(null);
          setActiveTab('calculator');
        }}
        overdueCount={metrics.overdueInstallmentsCount}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
      />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6 gap-3 sm:gap-6">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          overdueCount={metrics.overdueInstallmentsCount}
          totalBorrowers={metrics.totalBorrowersCount}
          activeLoansCount={metrics.activeLoansCount}
          lang={lang}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* Always show interactive top metrics summary cards */}
          <SummaryCards
            metrics={metrics}
            onFilterClick={(tab) => setActiveTab(tab)}
            lang={lang}
          />

          {/* Tab 1: Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Quick Today Due & Overdue Collection Hub */}
              <TodayDueWidget
                loans={loans}
                borrowers={borrowers}
                onToggleStatus={handleToggleInstallmentStatus}
                onOpenReceipt={(loan, installment) => setSelectedReceiptData({ loan, installment })}
                lang={lang}
              />

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setEditingBorrower(null);
                    setIsBorrowerModalOpen(true);
                  }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 hover:border-emerald-500/60 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{t.addBorrowerNew}</h3>
                  <p className="text-xs text-slate-400 mt-1">{lang === 'km' ? 'បញ្ចូលទិន្នន័យផ្ទាល់ខ្លួន និងរូបថតអ្នកខ្ចី' : 'Enter personal info & photo avatar'}</p>
                </button>

                <button
                  onClick={() => setActiveTab('calculator')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/5 border border-teal-500/30 hover:border-teal-500/60 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{t.calculator}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t.calcSubtitle}</p>
                </button>
              </div>

              {/* Payment Tracker Preview on Dashboard */}
              <PaymentTracker
                loans={loans}
                borrowers={borrowers}
                onToggleStatus={handleToggleInstallmentStatus}
                onOpenReceipt={(loan, installment) => setSelectedReceiptData({ loan, installment })}
                searchTerm={searchTerm}
                lang={lang}
              />

            </div>
          )}

          {/* Tab 2: Borrower Management */}
          {activeTab === 'borrowers' && (
            <BorrowerList
              borrowers={borrowers}
              loans={loans}
              onAddBorrower={() => {
                setEditingBorrower(null);
                setIsBorrowerModalOpen(true);
              }}
              onEditBorrower={(b) => {
                setEditingBorrower(b);
                setIsBorrowerModalOpen(true);
              }}
              onDeleteBorrower={handleDeleteBorrower}
              onCreateLoanForBorrower={handleCreateLoanForBorrower}
              onViewBorrowerDetail={(b) => setSelectedBorrowerForDetail(b)}
              searchTerm={searchTerm}
              lang={lang}
            />
          )}

          {/* Tab 3: Loan Engine Calculator */}
          {activeTab === 'calculator' && (
            <LoanCalculator
              borrowers={borrowers}
              onCreateLoan={handleCreateLoan}
              preselectedBorrower={preselectedBorrowerForLoan}
            />
          )}

          {/* Tab 4: All Loans */}
          {activeTab === 'loans' && (
            <LoanList
              loans={loans}
              borrowers={borrowers}
              onViewLoanDetail={(loan) => setSelectedLoanForDetail(loan)}
              onDeleteLoan={handleDeleteLoan}
              searchTerm={searchTerm}
              lang={lang}
            />
          )}

          {/* Tab 5: Payment Tracker & Attendance */}
          {activeTab === 'tracker' && (
            <PaymentTracker
              loans={loans}
              borrowers={borrowers}
              onToggleStatus={handleToggleInstallmentStatus}
              onOpenReceipt={(loan, installment) => setSelectedReceiptData({ loan, installment })}
              searchTerm={searchTerm}
              lang={lang}
            />
          )}

          {/* Tab 6: Excel Reports */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h2 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>របាយការណ៍ និងការគ្រប់គ្រងឯកសារ Excel</span>
                </h2>
                <p className="text-xs text-slate-400 mb-6">
                  អ្នកអាចទាញយករាល់ទិន្នន័យអ្នកខ្ចី តារាងកម្ចីសរុប និងរបាយការណ៍បង់ប្រាក់ជាឯកសារ Excel (.xlsx) បានគ្រប់ពេលវេលា
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => exportBorrowersToExcel(borrowers)}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all"
                  >
                    <h3 className="text-sm font-bold text-slate-200">ទាញយកបញ្ជីអ្នកខ្ចីជា Excel</h3>
                    <p className="text-xs text-slate-500 mt-1">នាំចេញឈ្មោះ, ភេទ, ទូរស័ព្ទ, និងអត្តសញ្ញាណប័ណ្ណ</p>
                  </button>

                  <button
                    onClick={() => exportLoansReportToExcel(loans)}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all"
                  >
                    <h3 className="text-sm font-bold text-slate-200">ទាញយករកបាយការណ៍កម្ចីសរុបជា Excel</h3>
                    <p className="text-xs text-slate-500 mt-1">នាំចេញតារាងបង់ប្រាក់, ប្រាក់ដើម, និងការប្រាក់</p>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modals Container */}
      <BorrowerModal
        isOpen={isBorrowerModalOpen}
        onClose={() => setIsBorrowerModalOpen(false)}
        onSave={handleSaveBorrower}
        editingBorrower={editingBorrower}
      />

      <ReceiptModal
        isOpen={!!selectedReceiptData}
        onClose={() => setSelectedReceiptData(null)}
        loan={selectedReceiptData?.loan || null}
        installment={selectedReceiptData?.installment || null}
        borrowers={borrowers}
      />

      <LoanDetailModal
        isOpen={!!selectedLoanForDetail}
        onClose={() => setSelectedLoanForDetail(null)}
        loan={selectedLoanForDetail}
        borrowers={borrowers}
        onToggleStatus={handleToggleInstallmentStatus}
        onOpenReceipt={(loan, installment) => setSelectedReceiptData({ loan, installment })}
      />

      <BorrowerDetailModal
        isOpen={!!selectedBorrowerForDetail}
        onClose={() => setSelectedBorrowerForDetail(null)}
        borrower={selectedBorrowerForDetail}
        loans={loans}
        onToggleInstallmentStatus={handleToggleInstallmentStatus}
        onUpdateInstallmentNote={handleUpdateInstallmentNote}
        onOpenReceipt={(loan, installment) => setSelectedReceiptData({ loan, installment })}
        onCreateLoan={handleCreateLoanForBorrower}
        lang={lang}
      />

      {/* Global Toast Notification Overlay */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

    </div>
  );
}

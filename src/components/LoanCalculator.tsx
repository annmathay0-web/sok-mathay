import React, { useState, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  Clock,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  Info,
  TrendingDown,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { Borrower, InterestType, RepaymentFrequency, Loan } from '../types';
import {
  formatCurrency,
  formatDateKhmer,
  generateLoanSchedule,
  toKhmerNumeral,
  generateId
} from '../utils/calculator';
import { exportLoansReportToExcel } from '../utils/excel';

interface LoanCalculatorProps {
  borrowers: Borrower[];
  onCreateLoan: (loan: Loan) => void;
  preselectedBorrower?: Borrower | null;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  borrowers,
  onCreateLoan,
  preselectedBorrower
}) => {
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>(
    preselectedBorrower ? preselectedBorrower.id : borrowers[0]?.id || ''
  );

  const [principalInput, setPrincipalInput] = useState<string>('3000');
  const [interestRateInput, setInterestRateInput] = useState<string>('2.0');
  const [durationInput, setDurationInput] = useState<string>('12');

  const principal = Math.max(0, parseFloat(principalInput) || 0);
  const interestRate = Math.max(0, parseFloat(interestRateInput) || 0);
  const durationMonths = Math.max(1, parseInt(durationInput, 10) || 1);

  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [interestType, setInterestType] = useState<InterestType>('simple');
  const [frequency, setFrequency] = useState<RepaymentFrequency>('monthly');
  const [skipWeekends, setSkipWeekends] = useState<boolean>(true);
  const [skipHolidays, setSkipHolidays] = useState<boolean>(true);
  const [collateral, setCollateral] = useState<string>('');

  const handleFrequencyChange = (newFreq: RepaymentFrequency) => {
    setFrequency(newFreq);
    if (newFreq === 'daily' && (durationInput === '12' || durationInput === '6')) {
      setDurationInput('30');
    } else if (newFreq === 'monthly' && (durationInput === '30' || durationInput === '15')) {
      setDurationInput('12');
    }
  };

  // Auto-calculate schedule & figures using memo
  const calculationResult = useMemo(() => {
    return generateLoanSchedule({
      principal,
      interestRatePerMonth: interestRate,
      durationMonths,
      startDate,
      interestType,
      repaymentFrequency: frequency,
      skipWeekends,
      skipHolidays
    });
  }, [principal, interestRate, durationMonths, startDate, interestType, frequency, skipWeekends, skipHolidays]);

  // Comparative calculation for Reducing vs Simple to show savings insight
  const altType: InterestType = interestType === 'simple' ? 'reducing' : 'simple';
  const altResult = useMemo(() => {
    return generateLoanSchedule({
      principal,
      interestRatePerMonth: interestRate,
      durationMonths,
      startDate,
      interestType: altType,
      repaymentFrequency: frequency,
      skipWeekends,
      skipHolidays
    });
  }, [principal, interestRate, durationMonths, startDate, altType, frequency, skipWeekends, skipHolidays]);

  const interestDifference = Math.abs(
    calculationResult.totalInterestAmount - altResult.totalInterestAmount
  );

  const handleCreateLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrowerId) {
      alert('សូមជ្រើសរើសអ្នកខ្ចីជាមុនសិន!');
      return;
    }

    const borrower = borrowers.find((b) => b.id === selectedBorrowerId);
    if (!borrower) return;

    const newLoan: Loan = {
      id: generateId('LN'),
      borrowerId: borrower.id,
      borrowerName: borrower.name,
      borrowerPhone: borrower.phone,
      principalAmount: principal,
      interestRatePerMonth: interestRate,
      durationMonths,
      startDate,
      interestType,
      repaymentFrequency: frequency,
      monthlyPaymentAmount: calculationResult.monthlyPaymentAmount,
      totalInterestAmount: calculationResult.totalInterestAmount,
      totalRepaymentAmount: calculationResult.totalRepaymentAmount,
      collateralNotes: collateral.trim(),
      status: 'active',
      schedule: calculationResult.schedule,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onCreateLoan(newLoan);
    alert(`បង្កើតកម្ចីជោគជ័យសម្រាប់ "${borrower.name}"!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <span>ប្រព័ន្ធគណនាប្រាក់កម្ចី និងការប្រាក់ (Loan & Interest Engine)</span>
          </h2>
          <p className="text-xs text-slate-400">
            គណនាការប្រាក់ថេរ (Simple Interest) និងការប្រាក់ថយចុះ (Reducing Balance) ជាមួយតារាងបង់ប្រាក់
          </p>
        </div>

        {/* Selected Borrower Badge */}
        {borrowers.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedBorrowerId}
              onChange={(e) => setSelectedBorrowerId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none"
            >
              {borrowers.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                  {b.name} ({b.phone})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Parameters Form (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>បញ្ចូលទិន្នន័យកម្ចី (Loan Parameters)</span>
          </h3>

          <form onSubmit={handleCreateLoanSubmit} className="space-y-4">
            
            {/* Borrower Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                អ្នកខ្ចី (Select Borrower) <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={selectedBorrowerId}
                onChange={(e) => setSelectedBorrowerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
              >
                <option value="">-- ជ្រើសរើសអ្នកខ្ចី --</option>
                {borrowers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Repayment Frequency Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                វគ្គនៃការបង់ប្រាក់ (Payment Frequency) <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleFrequencyChange('monthly')}
                  className={`py-2 px-1 text-xs font-bold rounded-lg transition-all text-center ${
                    frequency === 'monthly'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ប្រចាំខែ
                  <span className="block text-[10px] font-normal opacity-80">(Monthly)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFrequencyChange('weekly')}
                  className={`py-2 px-1 text-xs font-bold rounded-lg transition-all text-center ${
                    frequency === 'weekly'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ប្រចាំអាទិត្យ
                  <span className="block text-[10px] font-normal opacity-80">(Weekly)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFrequencyChange('daily')}
                  className={`py-2 px-1 text-xs font-bold rounded-lg transition-all text-center ${
                    frequency === 'daily'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ប្រចាំថ្ងៃ
                  <span className="block text-[10px] font-normal opacity-80">(Daily)</span>
                </button>
              </div>

              {/* Workday & Holiday Options */}
              <div className="mt-2.5 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={skipWeekends}
                    onChange={(e) => setSkipWeekends(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs text-slate-200 font-medium">
                    ធ្វើការតែពីថ្ងៃ <strong className="text-emerald-400">ចន្ទ ដល់ សុក្រ</strong> (រំលងថ្ងៃសៅរ៍-អាទិត្យ)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={skipHolidays}
                    onChange={(e) => setSkipHolidays(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs text-slate-200 font-medium">
                    រំលងថ្ងៃបុណ្យជាតិខ្មែរ 🇰🇭 (Khmer Public Holidays)
                  </span>
                </label>
              </div>
            </div>

            {/* Interest Method Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ប្រភេទគណនាការប្រាក់ (Interest Formula)
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setInterestType('simple')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                    interestType === 'simple'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ការប្រាក់ថេរ
                  <span className="block text-[10px] font-normal opacity-80">(Flat / Simple)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInterestType('reducing')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                    interestType === 'reducing'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ការប្រាក់ថយចុះ
                  <span className="block text-[10px] font-normal opacity-80">(Declining Balance)</span>
                </button>
              </div>
            </div>

            {/* Principal ($P$) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  ប្រាក់ដើម ($P$) Principal Amount
                </label>
                <span className="text-xs font-bold text-emerald-400 font-sans">
                  {formatCurrency(principal)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="100"
                    max="20000"
                    step="50"
                    value={principal}
                    onChange={(e) => setPrincipalInput(e.target.value)}
                    className="w-full accent-emerald-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <div className="relative w-32 shrink-0">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={principalInput}
                      onChange={(e) => setPrincipalInput(e.target.value)}
                      onBlur={() => {
                        if (!principalInput || parseFloat(principalInput) < 0) {
                          setPrincipalInput('100');
                        }
                      }}
                      className="w-full pl-7 pr-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-sans font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>$100</span>
                  <span>$5,000</span>
                  <span>$10,000</span>
                  <span>$20,000</span>
                </div>
              </div>
            </div>

            {/* Interest Rate / Period (r%) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {frequency === 'daily'
                    ? 'អត្រាការប្រាក់/ថ្ងៃ (%) Daily Interest Rate'
                    : frequency === 'weekly'
                    ? 'អត្រាការប្រាក់/សប្ដាហ៍ (%) Weekly Interest Rate'
                    : 'អត្រាការប្រាក់/ខែ (%) Monthly Interest Rate'}
                </label>
                <span className="text-xs font-bold text-teal-400 font-sans">
                  {interestRate}% / {frequency === 'daily' ? 'ថ្ងៃ' : frequency === 'weekly' ? 'អាទិត្យ' : 'ខែ'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.1"
                  max="15"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRateInput(e.target.value)}
                  className="w-full accent-emerald-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={interestRateInput}
                  onChange={(e) => setInterestRateInput(e.target.value)}
                  onBlur={() => {
                    if (!interestRateInput || parseFloat(interestRateInput) < 0) {
                      setInterestRateInput('1.0');
                    }
                  }}
                  className="w-20 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-sans font-bold text-center text-slate-100 focus:outline-none focus:border-emerald-500 shrink-0"
                />
              </div>
            </div>

            {/* Duration (Periods) */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {frequency === 'daily'
                      ? 'ចំនួនថ្ងៃ (Duration in Days)'
                      : frequency === 'weekly'
                      ? 'ចំនួនសប្ដាហ៍ (Duration in Weeks)'
                      : 'ចំនួនខែ (Duration in Months)'}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      min="1"
                      value={durationInput}
                      onChange={(e) => setDurationInput(e.target.value)}
                      onBlur={() => {
                        if (!durationInput || parseInt(durationInput, 10) < 1) {
                          setDurationInput('1');
                        }
                      }}
                      placeholder="បញ្ចូលចំនួន..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-sans font-semibold text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ថ្ងៃចាប់ផ្តើម (Start Date)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Duration Range Slider (អូសកំណត់) */}
              <div className="pt-1">
                <input
                  type="range"
                  min="1"
                  max={frequency === 'daily' ? 365 : frequency === 'weekly' ? 52 : 36}
                  step="1"
                  value={durationMonths}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="w-full accent-emerald-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>1</span>
                  <span>{frequency === 'daily' ? '180 ថ្ងៃ' : frequency === 'weekly' ? '26 អាទិត្យ' : '18 ខែ'}</span>
                  <span>{frequency === 'daily' ? '365 ថ្ងៃ' : frequency === 'weekly' ? '52 អាទិត្យ' : '36 ខែ'}</span>
                </div>
              </div>

              {/* Quick Preset Buttons for Duration */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-medium mr-1">ជ្រើសរើសរហ័ស:</span>
                {frequency === 'daily' ? (
                  ['15', '30', '60', '90', '100', '180', '365'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDurationInput(val)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-sans font-medium transition-all ${
                        durationInput === val
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {val} ថ្ងៃ
                    </button>
                  ))
                ) : frequency === 'weekly' ? (
                  ['4', '8', '12', '24', '36', '52'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDurationInput(val)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-sans font-medium transition-all ${
                        durationInput === val
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {val} អាទិត្យ
                    </button>
                  ))
                ) : (
                  ['3', '6', '12', '18', '24', '36'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDurationInput(val)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-sans font-medium transition-all ${
                        durationInput === val
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {val} ខែ
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ទ្រព្យបញ្ចាំ / សម្គាល់ (Collateral / Guarantee)
              </label>
              <input
                type="text"
                value={collateral}
                onChange={(e) => setCollateral(e.target.value)}
                placeholder="ឧ. ប្លង់ដី, ប័ណ្ណសំគាល់យានយន្ត, សំបុត្រអាពាហ៍ពិពាហ៍..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <PlusCircle className="w-4 h-4" />
              <span>រក្សាទុក និងបង្កើតកម្ចីនេះ</span>
            </button>

          </form>

        </div>

        {/* Calculation Output & Live Schedule Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Output Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                ការប្រាក់សរុប (Total Interest)
              </span>
              <span className="text-xl font-bold text-teal-400 font-sans">
                {formatCurrency(calculationResult.totalInterestAmount)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                ប្រាក់ត្រូវបង់សរុប (Total Repayment)
              </span>
              <span className="text-xl font-bold text-emerald-400 font-sans">
                {formatCurrency(calculationResult.totalRepaymentAmount)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                បង់មធ្យម/វគ្គ (Avg Payment/Session)
              </span>
              <span className="text-xl font-bold text-amber-400 font-sans">
                {formatCurrency(calculationResult.monthlyPaymentAmount)}
              </span>
            </div>
          </div>

          {/* Formula Comparison / Insight Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-slate-100">
                ការប្រៀបធៀប៖ {interestType === 'simple' ? 'ការប្រាក់ថេរ' : 'ការប្រាក់ថយចុះ'}
              </span>
              <p className="text-slate-400 mt-0.5">
                {interestType === 'reducing' ? (
                  <>
                    ការប្រាក់ថយចុះជួយសន្សំសំចៃការប្រាក់បាន{' '}
                    <span className="font-bold text-emerald-400 font-sans">
                      {formatCurrency(interestDifference)}
                    </span>{' '}
                    ប្រៀបធៀបទៅនឹងការប្រាក់ថេរ!
                  </>
                ) : (
                  <>
                    ប្រៀបធៀបទៅនឹងការប្រាក់ថយចុះ ការប្រាក់ថេរមានចំនួនថេររៀងរាល់ខែ ({formatCurrency(principal * (interestRate/100))}/ខែ)។
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Live Repayment Schedule Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-200">
                តារាងបង់ប្រាក់លម្អិត ({toKhmerNumeral(calculationResult.schedule.length)} វគ្គ)
              </h4>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                {interestType === 'simple' ? 'ការប្រាក់ថេរ' : 'ការប្រាក់ថយចុះ'}
              </span>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2.5">លើកទី</th>
                    <th className="p-2.5">ថ្ងៃត្រូវបង់</th>
                    <th className="p-2.5 text-right">ប្រាក់ដើម ($)</th>
                    <th className="p-2.5 text-right">ការប្រាក់ ($)</th>
                    <th className="p-2.5 text-right">សរុបត្រូវបង់ ($)</th>
                    <th className="p-2.5 text-right">ប្រាក់ដើមនៅសល់</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {calculationResult.schedule.map((item) => (
                    <tr key={item.installmentNumber} className="hover:bg-slate-800/40 transition-all">
                      <td className="p-2.5 font-bold text-slate-400 font-sans">
                        #{item.installmentNumber}
                      </td>
                      <td className="p-2.5 text-slate-200 text-[11px]">
                        <div className="font-medium text-slate-100">
                          {formatDateKhmer(item.dueDate, true)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.dueDate}
                          {item.notes && (
                            <span className="ml-1.5 text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded text-[9px]">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 text-right text-slate-300">
                        {formatCurrency(item.principalAmount)}
                      </td>
                      <td className="p-2.5 text-right text-teal-400 font-semibold">
                        {formatCurrency(item.interestAmount)}
                      </td>
                      <td className="p-2.5 text-right text-emerald-400 font-bold">
                        {formatCurrency(item.totalInstallmentAmount)}
                      </td>
                      <td className="p-2.5 text-right text-slate-400 font-mono">
                        {formatCurrency(item.remainingBalance)}
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

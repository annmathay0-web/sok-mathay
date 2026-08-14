import { Loan, ScheduleInstallment, InterestType, RepaymentFrequency, PaymentStatus } from '../types';
import { getKhmerDayName, getKhmerHoliday, isWorkDay, isWeekend, parseLocalDate } from './holidays';

export { getKhmerDayName, getKhmerHoliday, isWorkDay, isWeekend, parseLocalDate };

/**
 * Format numbers as USD currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number with Khmer numerals
 */
export const toKhmerNumeral = (num: number | string): string => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).replace(/\d/g, (digit) => khmerDigits[parseInt(digit, 10)]);
};

/**
 * Format date into readable Khmer string (e.g. ថ្ងៃចន្ទ ទី១០ មករា ២០២៦)
 */
export const formatDateKhmer = (dateString: string, includeDayName: boolean = true): string => {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);

  const dayName = includeDayName ? `${getKhmerDayName(dateString)} ` : '';
  const day = date.getDate();
  const monthsKhmer = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const month = monthsKhmer[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}ទី${toKhmerNumeral(day)} ${month} ${toKhmerNumeral(year)}`;
};

/**
 * Helper to get next working day (skipping weekends & optionally holidays)
 */
export const getNextWorkingDate = (dateStr: string, skipWeekends: boolean = true, skipHolidays: boolean = true): string => {
  let d = parseLocalDate(dateStr);

  let yyyy = d.getFullYear();
  let mm = String(d.getMonth() + 1).padStart(2, '0');
  let dd = String(d.getDate()).padStart(2, '0');
  let currentStr = `${yyyy}-${mm}-${dd}`;

  // Advance day by day if current day is weekend or holiday
  while (true) {
    const isWk = skipWeekends && isWeekend(currentStr);
    const isHol = skipHolidays && getKhmerHoliday(currentStr) !== null;

    if (!isWk && !isHol) {
      break;
    }
    // Add 1 day
    d.setDate(d.getDate() + 1);
    yyyy = d.getFullYear();
    mm = String(d.getMonth() + 1).padStart(2, '0');
    dd = String(d.getDate()).padStart(2, '0');
    currentStr = `${yyyy}-${mm}-${dd}`;
  }

  return currentStr;
};

/**
 * Helper to calculate sequential due dates
 */
export const calculateSequentialDueDates = (
  startDateStr: string,
  count: number,
  frequency: RepaymentFrequency,
  skipWeekends: boolean = true,
  skipHolidays: boolean = true
): string[] => {
  const dates: string[] = [];
  let currentDate = parseLocalDate(startDateStr);

  // Helper to format Date to YYYY-MM-DD
  const toStr = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  let currStr = toStr(currentDate);

  for (let i = 1; i <= count; i++) {
    if (frequency === 'daily') {
      // Step +1 day at a time, moving past weekends/holidays
      currentDate.setDate(currentDate.getDate() + 1);
      currStr = getNextWorkingDate(toStr(currentDate), skipWeekends, skipHolidays);
      currentDate = parseLocalDate(currStr);
    } else if (frequency === 'weekly') {
      // Step +1 week (7 days)
      currentDate.setDate(currentDate.getDate() + 7);
      currStr = getNextWorkingDate(toStr(currentDate), skipWeekends, skipHolidays);
      currentDate = parseLocalDate(currStr);
    } else {
      // Monthly step
      currentDate.setMonth(currentDate.getMonth() + 1);
      currStr = getNextWorkingDate(toStr(currentDate), skipWeekends, skipHolidays);
      currentDate = parseLocalDate(currStr);
    }

    dates.push(currStr);
  }

  return dates;
};

/**
 * Calculate loan repayment schedule based on parameters
 */
export const generateLoanSchedule = ({
  principal,
  interestRatePerMonth,
  durationMonths,
  startDate,
  interestType,
  repaymentFrequency = 'monthly',
  skipWeekends = true,
  skipHolidays = true,
  existingSchedule = []
}: {
  principal: number;
  interestRatePerMonth: number;
  durationMonths: number;
  startDate: string;
  interestType: InterestType;
  repaymentFrequency?: RepaymentFrequency;
  skipWeekends?: boolean;
  skipHolidays?: boolean;
  existingSchedule?: ScheduleInstallment[];
}): {
  schedule: ScheduleInstallment[];
  totalInterestAmount: number;
  totalRepaymentAmount: number;
  monthlyPaymentAmount: number;
} => {
  const schedule: ScheduleInstallment[] = [];
  const P = Math.max(0, principal);
  let r = Math.max(0, interestRatePerMonth) / 100; // decimal rate
  if (repaymentFrequency === 'daily') {
    r = r / 30; // daily rate (assuming 30 days per month)
  } else if (repaymentFrequency === 'weekly') {
    r = r / 4; // weekly rate (assuming 4 weeks per month)
  }
  const N = Math.max(1, durationMonths);

  let totalInterest = 0;
  const principalPerPeriod = P / N;

  let remaining = P;

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate all due dates considering working days (Mon-Fri) & holidays
  const dueDates = calculateSequentialDueDates(startDate, N, repaymentFrequency, skipWeekends, skipHolidays);

  for (let i = 1; i <= N; i++) {
    const dueDate = dueDates[i - 1];

    let interestPeriod = 0;
    let principalPeriod = principalPerPeriod;

    if (interestType === 'simple') {
      // Simple / Flat interest: interest is always based on initial principal
      interestPeriod = P * r;
    } else {
      // Reducing balance interest: interest is based on remaining principal
      interestPeriod = remaining * r;
    }

    const totalPeriodAmount = principalPeriod + interestPeriod;
    remaining = Math.max(0, remaining - principalPeriod);

    totalInterest += interestPeriod;

    // Check if we have existing status preserved
    const prev = existingSchedule.find(s => s.installmentNumber === i);
    let status: PaymentStatus = prev?.status || 'pending';
    if (status === 'pending' && dueDate < todayStr) {
      status = 'overdue';
    }

    // Check for Khmer Holiday
    const holidayInfo = getKhmerHoliday(dueDate);

    schedule.push({
      installmentNumber: i,
      dueDate,
      principalAmount: Math.round(principalPeriod * 100) / 100,
      interestAmount: Math.round(interestPeriod * 100) / 100,
      totalInstallmentAmount: Math.round(totalPeriodAmount * 100) / 100,
      remainingBalance: Math.round(remaining * 100) / 100,
      status,
      paidAmount: prev?.paidAmount || (status === 'paid' ? Math.round(totalPeriodAmount * 100) / 100 : 0),
      paidDate: prev?.paidDate,
      paymentMethod: prev?.paymentMethod,
      notes: prev?.notes || (holidayInfo ? `ថ្ងៃបុណ្យ: ${holidayInfo.kh}` : '')
    });
  }

  const totalRepayment = P + totalInterest;
  const avgMonthlyPayment = schedule.length > 0 ? schedule[0].totalInstallmentAmount : 0;

  return {
    schedule,
    totalInterestAmount: Math.round(totalInterest * 100) / 100,
    totalRepaymentAmount: Math.round(totalRepayment * 100) / 100,
    monthlyPaymentAmount: Math.round(avgMonthlyPayment * 100) / 100
  };
};

/**
 * Generate a unique random receipt or loan ID
 */
export const generateId = (prefix: string = 'REC'): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${timestamp}${random}`;
};


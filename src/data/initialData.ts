import { Borrower, Loan, PaymentRecord } from '../types';
import { generateLoanSchedule } from '../utils/calculator';

export const INITIAL_BORROWERS: Borrower[] = [
  {
    id: 'BRW-1001',
    name: 'សុខ ចាន់ថន',
    gender: 'ប្រុស',
    dob: '1988-04-12',
    phone: '012 889 900',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    address: 'ផ្ទះលេខ ៤៥, ផ្លូវ ២៧១, សង្កាត់បឹងសាឡាង, ខណ្ឌទួលគោក, រាជធានីភ្នំពេញ',
    nationalId: '010892341',
    notes: 'អ្នករកស៊ីលក់ដូរនៅផ្សារដើមគ',
    createdAt: '2026-01-10'
  },
  {
    id: 'BRW-1002',
    name: 'គឹម សេរីវឌ្ឍន៍',
    gender: 'ស្រី',
    dob: '1993-09-25',
    phone: '098 554 332',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    address: 'ផ្ទះលេខ ១២A, ផ្លូវ ៦០៨, សង្កាត់បឹងកក់២, ខណ្ឌទួលគោក, រាជធានីភ្នំពេញ',
    nationalId: '090123887',
    notes: 'ម្ចាស់ហាងកាហ្វេ',
    createdAt: '2026-02-01'
  },
  {
    id: 'BRW-1003',
    name: 'ចាន់ សុភ័ក្ត្រ',
    gender: 'ប្រុស',
    dob: '1991-11-05',
    phone: '015 776 211',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    address: 'ភូមិព្រែកតានប់, សង្កាត់ច្បារអំពៅ១, ខណ្ឌច្បារអំពៅ, រាជធានីភ្នំពេញ',
    nationalId: '018992100',
    notes: 'បុគ្គលិកក្រុមហ៊ុនឯកជន',
    createdAt: '2026-03-15'
  },
  {
    id: 'BRW-1004',
    name: 'លី ស្រីណុច',
    gender: 'ស្រី',
    dob: '1996-02-18',
    phone: '088 998 776',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    address: 'ផ្ទះលេខ ៨៨, ផ្លូវជាតិលេខ ២, សង្កាត់ចាក់អង្រែលើ, ខណ្ឌមានជ័យ, ភ្នំពេញ',
    nationalId: '095441230',
    notes: 'អ្នកបើកបរ និងអាជីវករតូចតាច',
    createdAt: '2026-04-02'
  }
];

// Helper to create initial loans with pre-set payment status
export const getInitialLoans = (): Loan[] => {
  // Loan 1: Simple Interest - $5,000 at 2.5%/month for 12 months starting 2026-05-01
  const loan1ScheduleCalc = generateLoanSchedule({
    principal: 5000,
    interestRatePerMonth: 2.5,
    durationMonths: 12,
    startDate: '2026-05-01',
    interestType: 'simple',
    repaymentFrequency: 'monthly'
  });

  // Mark installments 1, 2, 3 as Paid
  const loan1Schedule = loan1ScheduleCalc.schedule.map((s, idx) => {
    if (idx === 0) {
      return { ...s, status: 'paid' as const, paidAmount: s.totalInstallmentAmount, paidDate: '2026-06-01', paymentMethod: 'aba' as const };
    }
    if (idx === 1) {
      return { ...s, status: 'paid' as const, paidAmount: s.totalInstallmentAmount, paidDate: '2026-07-02', paymentMethod: 'cash' as const };
    }
    if (idx === 2) {
      return { ...s, status: 'paid' as const, paidAmount: s.totalInstallmentAmount, paidDate: '2026-08-01', paymentMethod: 'aba' as const };
    }
    return s;
  });

  // Loan 2: Reducing Balance - $3,000 at 2.0%/month for 6 months starting 2026-06-15
  const loan2ScheduleCalc = generateLoanSchedule({
    principal: 3000,
    interestRatePerMonth: 2.0,
    durationMonths: 6,
    startDate: '2026-06-15',
    interestType: 'reducing',
    repaymentFrequency: 'monthly'
  });

  // Mark installment 1 as paid, installment 2 as overdue
  const loan2Schedule = loan2ScheduleCalc.schedule.map((s, idx) => {
    if (idx === 0) {
      return { ...s, status: 'paid' as const, paidAmount: s.totalInstallmentAmount, paidDate: '2026-07-15', paymentMethod: 'aba' as const };
    }
    if (idx === 1) {
      return { ...s, status: 'overdue' as const, notes: 'សន្យាបង់នៅចុងសប្ដាហ៍' };
    }
    return s;
  });

  // Loan 3: Simple Interest - $10,000 at 1.8%/month for 24 months
  const loan3ScheduleCalc = generateLoanSchedule({
    principal: 10000,
    interestRatePerMonth: 1.8,
    durationMonths: 24,
    startDate: '2026-07-01',
    interestType: 'simple',
    repaymentFrequency: 'monthly'
  });

  const loan3Schedule = loan3ScheduleCalc.schedule.map((s, idx) => {
    if (idx === 0) {
      return { ...s, status: 'paid' as const, paidAmount: s.totalInstallmentAmount, paidDate: '2026-08-01', paymentMethod: 'wing' as const };
    }
    return s;
  });

  return [
    {
      id: 'LN-2026001',
      borrowerId: 'BRW-1001',
      borrowerName: 'សុខ ចាន់ថន',
      borrowerPhone: '012 889 900',
      principalAmount: 5000,
      interestRatePerMonth: 2.5,
      durationMonths: 12,
      startDate: '2026-05-01',
      interestType: 'simple',
      repaymentFrequency: 'monthly',
      monthlyPaymentAmount: loan1ScheduleCalc.monthlyPaymentAmount,
      totalInterestAmount: loan1ScheduleCalc.totalInterestAmount,
      totalRepaymentAmount: loan1ScheduleCalc.totalRepaymentAmount,
      collateralNotes: 'ប្លង់ដីឡូតិ៍ និងប័ណ្ណសំគាល់យានយន្ត',
      status: 'active',
      schedule: loan1Schedule,
      createdAt: '2026-05-01'
    },
    {
      id: 'LN-2026002',
      borrowerId: 'BRW-1002',
      borrowerName: 'គឹម សេរីវឌ្ឍន៍',
      borrowerPhone: '098 554 332',
      principalAmount: 3000,
      interestRatePerMonth: 2.0,
      durationMonths: 6,
      startDate: '2026-06-15',
      interestType: 'reducing',
      repaymentFrequency: 'monthly',
      monthlyPaymentAmount: loan2ScheduleCalc.monthlyPaymentAmount,
      totalInterestAmount: loan2ScheduleCalc.totalInterestAmount,
      totalRepaymentAmount: loan2ScheduleCalc.totalRepaymentAmount,
      collateralNotes: 'កិច្ចសន្យាយល់ព្រម និងសំបុត្រអាពាហ៍ពិពាហ៍',
      status: 'active',
      schedule: loan2Schedule,
      createdAt: '2026-06-15'
    },
    {
      id: 'LN-2026003',
      borrowerId: 'BRW-1003',
      borrowerName: 'ចាន់ សុភ័ក្ត្រ',
      borrowerPhone: '015 776 211',
      principalAmount: 10000,
      interestRatePerMonth: 1.8,
      durationMonths: 24,
      startDate: '2026-07-01',
      interestType: 'simple',
      repaymentFrequency: 'monthly',
      monthlyPaymentAmount: loan3ScheduleCalc.monthlyPaymentAmount,
      totalInterestAmount: loan3ScheduleCalc.totalInterestAmount,
      totalRepaymentAmount: loan3ScheduleCalc.totalRepaymentAmount,
      collateralNotes: 'ប័ណ្ណកម្ចីទិញរថយន្ត Toyota Prius',
      status: 'active',
      schedule: loan3Schedule,
      createdAt: '2026-07-01'
    }
  ];
};

export const INITIAL_PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 'REC-00101',
    loanId: 'LN-2026001',
    borrowerId: 'BRW-1001',
    borrowerName: 'សុខ ចាន់ថន',
    installmentNumber: 1,
    principalPaid: 416.67,
    interestPaid: 125.00,
    amountPaid: 541.67,
    paymentDate: '2026-06-01',
    paymentMethod: 'aba',
    receiptNumber: 'REC-20260601-01',
    receivedBy: 'គណនេយ្យករ',
    notes: 'បង់តាម ABA Mobile'
  },
  {
    id: 'REC-00102',
    loanId: 'LN-2026001',
    borrowerId: 'BRW-1001',
    borrowerName: 'សុខ ចាន់ថន',
    installmentNumber: 2,
    principalPaid: 416.67,
    interestPaid: 125.00,
    amountPaid: 541.67,
    paymentDate: '2026-07-02',
    paymentMethod: 'cash',
    receiptNumber: 'REC-20260702-02',
    receivedBy: 'គណនេយ្យករ',
    notes: 'បង់ប្រាក់ស្រស់'
  },
  {
    id: 'REC-00103',
    loanId: 'LN-2026001',
    borrowerId: 'BRW-1001',
    borrowerName: 'សុខ ចាន់ថន',
    installmentNumber: 3,
    principalPaid: 416.67,
    interestPaid: 125.00,
    amountPaid: 541.67,
    paymentDate: '2026-08-01',
    paymentMethod: 'aba',
    receiptNumber: 'REC-20260801-03',
    receivedBy: 'គណនេយ្យករ',
    notes: 'បង់តាម ABA'
  },
  {
    id: 'REC-00201',
    loanId: 'LN-2026002',
    borrowerId: 'BRW-1002',
    borrowerName: 'គឹម សេរីវឌ្ឍន៍',
    installmentNumber: 1,
    principalPaid: 500.00,
    interestPaid: 60.00,
    amountPaid: 560.00,
    paymentDate: '2026-07-15',
    paymentMethod: 'aba',
    receiptNumber: 'REC-20260715-04',
    receivedBy: 'គណនេយ្យករ',
    notes: 'បង់ការប្រាក់ថយចុះលើកទី១'
  }
];

export type Gender = 'ប្រុស' | 'ស្រី';

export type InterestType = 'simple' | 'reducing'; // 'simple' = ការប្រាក់ថេរ, 'reducing' = ការប្រាក់ថយចុះ

export type RepaymentFrequency = 'monthly' | 'weekly' | 'daily';

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial';

export interface Borrower {
  id: string;
  name: string;
  gender: Gender;
  dob: string;
  phone: string;
  photoUrl: string;
  address: string;
  nationalId: string;
  notes?: string;
  createdAt: string;
}

export interface ScheduleInstallment {
  installmentNumber: number;
  dueDate: string; // YYYY-MM-DD
  principalAmount: number; // $
  interestAmount: number; // $
  totalInstallmentAmount: number; // $
  remainingBalance: number; // $
  status: PaymentStatus;
  paidAmount: number;
  paidDate?: string;
  paymentMethod?: 'cash' | 'aba' | 'wing' | 'other';
  notes?: string;
}

export interface Loan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  borrowerPhone: string;
  principalAmount: number; // $P
  interestRatePerMonth: number; // r% per month
  durationMonths: number;
  startDate: string; // YYYY-MM-DD
  interestType: InterestType;
  repaymentFrequency: RepaymentFrequency;
  monthlyPaymentAmount: number; // Initial or fixed monthly payment
  totalInterestAmount: number;
  totalRepaymentAmount: number;
  collateralNotes?: string;
  status: 'active' | 'completed' | 'overdue';
  schedule: ScheduleInstallment[];
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  installmentNumber: number;
  principalPaid: number;
  interestPaid: number;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'aba' | 'wing' | 'other';
  receiptNumber: string;
  receivedBy: string;
  notes?: string;
}

export interface DashboardMetrics {
  totalPrincipal: number;
  expectedMonthlyInterest: number;
  totalBorrowersCount: number;
  activeLoansCount: number;
  overdueInstallmentsCount: number;
  totalCollectedThisMonth: number;
}

import * as XLSX from 'xlsx';
import { Borrower, Loan, ScheduleInstallment } from '../types';
import { formatCurrency, formatDateKhmer } from './calculator';

/**
 * Export Borrower list to Excel (.xlsx)
 */
export const exportBorrowersToExcel = (borrowers: Borrower[]) => {
  const data = borrowers.map((b, idx) => ({
    'ល.រ (No)': idx + 1,
    'កូដសម្គាល់ (ID)': b.id,
    'ឈ្មោះអ្នកខ្ចី (Name)': b.name,
    'ភេទ (Gender)': b.gender,
    'ថ្ងៃខែឆ្នាំកំណើត (DOB)': b.dob,
    'លេខទូរស័ព្ទ (Phone)': b.phone,
    'លេខអត្តសញ្ញាណប័ណ្ណ (National ID)': b.nationalId,
    'អាសយដ្ឋាន (Address)': b.address,
    'កំណត់ចំណាំ (Notes)': b.notes || '',
    'កាលបរិច្ឆេទបង្កើត (Created)': b.createdAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // No
    { wch: 15 }, // ID
    { wch: 22 }, // Name
    { wch: 10 }, // Gender
    { wch: 14 }, // DOB
    { wch: 16 }, // Phone
    { wch: 20 }, // National ID
    { wch: 30 }, // Address
    { wch: 20 }, // Notes
    { wch: 14 }, // Created
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'បញ្ជីឈ្មោះអ្នកខ្ចី');
  XLSX.writeFile(workbook, `បញ្ជីឈ្មោះអ្នកខ្ចី_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export Loans Report & Full Schedule to Excel
 */
export const exportLoansReportToExcel = (loans: Loan[]) => {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = loans.map((loan, idx) => ({
    'ល.រ': idx + 1,
    'លេខកូដកម្ចី': loan.id,
    'ឈ្មោះអ្នកខ្ចី': loan.borrowerName,
    'លេខទូរស័ព្ទ': loan.borrowerPhone,
    'ប្រាក់ដើម ($)': loan.principalAmount,
    'អត្រាការប្រាក់/ខែ (%)': `${loan.interestRatePerMonth}%`,
    'ប្រភេទការប្រាក់': loan.interestType === 'simple' ? 'ការប្រាក់ថេរ' : 'ការប្រាក់ថយចុះ',
    'រយៈពេល (ខែ)': loan.durationMonths,
    'ថ្ងៃចាប់ផ្តើម': loan.startDate,
    'ការប្រាក់សរុប ($)': loan.totalInterestAmount,
    'ប្រាក់ត្រូវបង់សរុប ($)': loan.totalRepaymentAmount,
    'ស្ថានភាព': loan.status === 'active' ? 'សកម្ម' : loan.status === 'completed' ? 'បង់រួចរាល់' : 'ហួសកំណត់',
  }));

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 22 }, { wch: 16 },
    { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 12 },
    { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'របាយការណ៍កម្ចីសរុប');

  // Individual schedules or combined schedule sheet
  const allScheduleRows: any[] = [];
  loans.forEach((loan) => {
    loan.schedule.forEach((sch) => {
      allScheduleRows.push({
        'លេខកូដកម្ចី': loan.id,
        'ឈ្មោះអ្នកខ្ចី': loan.borrowerName,
        'លើកទី': sch.installmentNumber,
        'ថ្ងៃត្រូវបង់': sch.dueDate,
        'ប្រាក់ដើមត្រូវបង់ ($)': sch.principalAmount,
        'ការប្រាក់ ($)': sch.interestAmount,
        'សរុបត្រូវបង់ ($)': sch.totalInstallmentAmount,
        'ប្រាក់ដើមនៅសល់ ($)': sch.remainingBalance,
        'ស្ថានភាព': sch.status === 'paid' ? 'បង់រួច' : sch.status === 'overdue' ? 'ហួសកំណត់' : 'មិនទាន់បង់',
        'ចំនួនប្រាក់បានបង់ ($)': sch.paidAmount,
        'ថ្ងៃបានបង់': sch.paidDate || '-',
      });
    });
  });

  const scheduleSheet = XLSX.utils.json_to_sheet(allScheduleRows);
  XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'តារាងបង់ប្រាក់លម្អិត');

  XLSX.writeFile(workbook, `របាយការណ៍កម្ចីសរុប_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export a single Loan's Repayment Schedule to Excel
 */
export const exportSingleLoanScheduleToExcel = (loan: Loan) => {
  const workbook = XLSX.utils.book_new();

  const scheduleData = loan.schedule.map((sch) => ({
    'លើកទី': sch.installmentNumber,
    'ថ្ងៃត្រូវបង់': sch.dueDate,
    'ប្រាក់ដើមត្រូវបង់ ($)': sch.principalAmount,
    'ការប្រាក់ ($)': sch.interestAmount,
    'សរុបត្រូវបង់ ($)': sch.totalInstallmentAmount,
    'ប្រាក់ដើមនៅសល់ ($)': sch.remainingBalance,
    'ស្ថានភាព': sch.status === 'paid' ? 'បង់រួច' : sch.status === 'overdue' ? 'ហួសកំណត់' : 'មិនទាន់បង់',
    'ចំណាំ/កត់ត្រា': sch.notes || '',
    'ថ្ងៃបានបង់': sch.paidDate || '-',
  }));

  const sheet = XLSX.utils.json_to_sheet(scheduleData);
  sheet['!cols'] = [
    { wch: 8 }, { wch: 14 }, { wch: 18 }, { wch: 14 },
    { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 25 }, { wch: 14 }
  ];

  XLSX.utils.book_append_sheet(workbook, sheet, `កាលវិភាគ_${loan.id}`);
  XLSX.writeFile(workbook, `កាលវិភាគបង់ប្រាក់_${loan.borrowerName}_${loan.id}.xlsx`);
};

/**
 * Download sample Excel Template for Import
 */
export const downloadExcelTemplate = () => {
  const templateData = [
    {
      'ឈ្មោះអ្នកខ្ចី': 'សុខ ចាន់ថន',
      'ភេទ': 'ប្រុស',
      'ថ្ងៃខែឆ្នាំកំណើត': '1990-05-15',
      'លេខទូរស័ព្ទ': '012 345 678',
      'អត្តសញ្ញាណប័ណ្ណ': '010203040',
      'អាសយដ្ឋាន': 'ផ្ទះលេខ ១២, ផ្លូវ ២៧១, សង្កាត់បឹងសាឡាង, ខណ្ឌទួលគោក, ភ្នំពេញ',
      'កំណត់ចំណាំ': 'អ្នកខ្ចីគំរូ',
    },
    {
      'ឈ្មោះអ្នកខ្ចី': 'គឹម សេរីវឌ្ឍន៍',
      'ភេទ': 'ស្រី',
      'ថ្ងៃខែឆ្នាំកំណើត': '1995-10-20',
      'លេខទូរស័ព្ទ': '098 765 432',
      'អត្តសញ្ញាណប័ណ្ណ': '090807060',
      'អាសយដ្ឋាន': 'ភូមិ១, សង្កាត់ស្រះចក, ខណ្ឌដូនពេញ, ភ្នំពេញ',
      'កំណត់ចំណាំ': 'អ្នកខ្ចីគំរូ',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  worksheet['!cols'] = [
    { wch: 22 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 20 }, { wch: 45 }, { wch: 20 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ទម្រង់នាំចូលអ្នកខ្ចី');
  XLSX.writeFile(workbook, 'ទម្រង់គំរូនាំចូលអ្នកខ្ចី_Excel.xlsx');
};

/**
 * Import Borrowers from Excel file
 */
export const importBorrowersFromExcel = (file: File): Promise<Borrower[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        const newBorrowers: Borrower[] = rows.map((row, idx) => {
          // Map headers flexibly (Khmer or English)
          const name = row['ឈ្មោះអ្នកខ្ចី'] || row['ឈ្មោះ'] || row['Name'] || row['borrowerName'] || `អ្នកខ្ចី ${idx + 1}`;
          const genderRaw = row['ភេទ'] || row['Gender'] || 'ប្រុស';
          const gender = genderRaw.toString().toLowerCase().includes('ស្រី') || genderRaw.toString().toLowerCase().includes('female') ? 'ស្រី' : 'ប្រុស';
          const dob = row['ថ្ងៃខែឆ្នាំកំណើត'] || row['DOB'] || '1990-01-01';
          const phone = row['លេខទូរស័ព្ទ'] || row['ទូរស័ព្ទ'] || row['Phone'] || '012 000 000';
          const nationalId = row['អត្តសញ្ញាណប័ណ្ណ'] || row['អត្តសញ្ញាណប័ណ្ណ'] || row['National ID'] || row['ID'] || `ID-${Math.floor(100000 + Math.random() * 900000)}`;
          const address = row['អាសយដ្ឋាន'] || row['Address'] || 'រាជធានីភ្នំពេញ';
          const notes = row['កំណត់ចំណាំ'] || row['Notes'] || 'នាំចូលពី Excel';

          return {
            id: `BRW-${Date.now().toString().slice(-4)}${idx}`,
            name: String(name).trim(),
            gender,
            dob: String(dob).trim(),
            phone: String(phone).trim(),
            photoUrl: gender === 'ស្រី' 
              ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            address: String(address).trim(),
            nationalId: String(nationalId).trim(),
            notes: String(notes).trim(),
            createdAt: new Date().toISOString().split('T')[0],
          };
        });

        resolve(newBorrowers);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

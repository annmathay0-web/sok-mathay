/**
 * Cambodian Public Holidays (ថ្ងៃបុណ្យជាតិកម្ពុជា)
 */

export interface Holiday {
  date: string; // YYYY-MM-DD or MM-DD for recurring
  nameKhmer: string;
  nameEnglish: string;
  isRecurring?: boolean;
}

// Fixed solar holidays (recurring every year on same month-day)
const FIXED_HOLIDAYS: Record<string, { kh: string; en: string }> = {
  '01-01': { kh: 'ថ្ងៃបុណ្យចូលឆ្នាំសកល', en: "International New Year's Day" },
  '01-07': { kh: 'ថ្ងៃជ័យជម្នះលើរបបប្រល័យពូជសាសន៍', en: 'Victory over Genocide Day' },
  '03-08': { kh: 'ថ្ងៃបុណ្យសិទ្ធិនារីអន្តរជាតិ', en: "International Women's Day" },
  '04-13': { kh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី១)', en: 'Khmer New Year (Day 1)' },
  '04-14': { kh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី២)', en: 'Khmer New Year (Day 2)' },
  '04-15': { kh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី៣)', en: 'Khmer New Year (Day 3)' },
  '04-16': { kh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី៤)', en: 'Khmer New Year (Day 4)' },
  '05-01': { kh: 'ថ្ងៃពលកម្មអន្តរជាតិ', en: 'International Labour Day' },
  '05-14': { kh: 'ព្រះរាជពិធីបុណ្យចំរើនព្រះជន្ម ព្រះករុណា ព្រះបាទសម្តេច ព្រះបរមនាថ នរោត្តម សីហមុនី', en: "King Sihamoni's Birthday" },
  '06-18': { kh: 'ព្រះរាជពិធីបុណ្យចំរើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនីនាថ សីហនុ', en: "Queen Mother's Birthday" },
  '09-24': { kh: 'ថ្ងៃប្រកាសរដ្ឋធម្មនុញ្ញ', en: 'Constitutional Day' },
  '10-15': { kh: 'ថ្ងៃរំលឹកគុណ ព្រះករុណា ព្រះបាទសម្តេចព្រះ នរោត្តម សីហនុ ព្រះបរមកោដ្ឋ', en: "King Father's Commemoration Day" },
  '11-09': { kh: 'ថ្ងៃបុណ្យឯករាជ្យជាតិ', en: 'National Independence Day' },
};

// Lunar / Movable holidays for 2025, 2026, 2027
const MOVABLE_HOLIDAYS: Record<string, { kh: string; en: string }> = {
  // 2025
  '2025-05-11': { kh: 'ពិធីបុណ្យវិសាខបូជា', en: 'Visak Bochea Day' },
  '2025-05-15': { kh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល', en: 'Royal Ploughing Ceremony' },
  '2025-09-21': { kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)', en: 'Pchum Ben Festival (Day 1)' },
  '2025-09-22': { kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី២)', en: 'Pchum Ben Festival (Day 2)' },
  '2025-09-23': { kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)', en: 'Pchum Ben Festival (Day 3)' },
  '2025-11-04': { kh: 'ពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី១)', en: 'Water Festival (Day 1)' },
  '2025-11-05': { kh: 'ពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី២)', en: 'Water Festival (Day 2)' },
  '2025-11-06': { kh: 'ពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី៣)', en: 'Water Festival (Day 3)' },

  // 2026
  '2026-05-01': { kh: 'ពិធីបុណ្យវិសាខបូជា', en: 'Visak Bochea Day' },
  '2026-05-05': { kh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល', en: 'Royal Ploughing Ceremony' },
  '2026-10-10': { kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)', en: 'Pchum Ben Festival (Day 1)' },
  '2026-10-11': { kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី២)', en: 'Pchum Ben Festival (Day 2)' },
  '2026-10-12': { kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)', en: 'Pchum Ben Festival (Day 3)' },
  '2026-11-23': { kh: 'ពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី១)', en: 'Water Festival (Day 1)' },
  '2026-11-24': { kh: 'ពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី២)', en: 'Water Festival (Day 2)' },
  '2026-11-25': { kh: 'ពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី៣)', en: 'Water Festival (Day 3)' },

  // 2027
  '2027-04-20': { kh: 'ពិធីបុណ្យវិសាខបូជា', en: 'Visak Bochea Day' },
  '2027-04-24': { kh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល', en: 'Royal Ploughing Ceremony' },
  '2027-09-29': { kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)', en: 'Pchum Ben Festival (Day 1)' },
  '2027-09-30': { kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី២)', en: 'Pchum Ben Festival (Day 2)' },
  '2027-10-01': { kh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)', en: 'Pchum Ben Festival (Day 3)' },
  '2027-11-12': { kh: 'ពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី១)', en: 'Water Festival (Day 1)' },
  '2027-11-13': { kh: 'ពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី២)', en: 'Water Festival (Day 2)' },
  '2027-11-14': { kh: 'ពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ (ថ្ងៃទី៣)', en: 'Water Festival (Day 3)' },
};

/**
 * Parse YYYY-MM-DD string into a local Date object safely without UTC timezone shifts
 */
export const parseLocalDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  const parts = dateString.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? new Date() : d;
};

/**
 * Check if a given date string (YYYY-MM-DD) is a Cambodian public holiday
 */
export const getKhmerHoliday = (dateString: string): { kh: string; en: string } | null => {
  if (!dateString) return null;
  
  // Check exact movable holiday
  if (MOVABLE_HOLIDAYS[dateString]) {
    return MOVABLE_HOLIDAYS[dateString];
  }

  // Check recurring MM-DD
  const mmdd = dateString.slice(5); // e.g. "04-14"
  if (FIXED_HOLIDAYS[mmdd]) {
    return FIXED_HOLIDAYS[mmdd];
  }

  return null;
};

/**
 * Check if date string is weekend (Saturday = 6, Sunday = 0)
 */
export const isWeekend = (dateString: string): boolean => {
  if (!dateString) return false;
  const d = parseLocalDate(dateString);
  const day = d.getDay();
  return day === 0 || day === 6;
};

/**
 * Check if date is a working day (Mon-Fri and not a national holiday)
 */
export const isWorkDay = (dateString: string, skipHolidays: boolean = true): boolean => {
  if (isWeekend(dateString)) return false;
  if (skipHolidays && getKhmerHoliday(dateString)) return false;
  return true;
};

/**
 * Get Khmer day of the week string
 */
export const getKhmerDayName = (dateString: string): string => {
  if (!dateString) return '';
  const d = parseLocalDate(dateString);
  const daysKhmer = [
    'ថ្ងៃអាទិត្យ', // Sunday (0)
    'ថ្ងៃចន្ទ',    // Monday (1)
    'ថ្ងៃអង្គារ',  // Tuesday (2)
    'ថ្ងៃពុធ',    // Wednesday (3)
    'ថ្ងៃព្រហស្បតិ៍',// Thursday (4)
    'ថ្ងៃសុក្រ',   // Friday (5)
    'ថ្ងៃសៅរ៍'    // Saturday (6)
  ];
  return daysKhmer[d.getDay()];
};

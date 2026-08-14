// Search helper that normalizes Khmer and Arabic numerals for matching
export function matchesSearchTerm(targetString: string | undefined | null, query: string): boolean {
  if (!targetString) return false;
  if (!query || query.trim() === '') return true;

  const q = query.toLowerCase().trim();
  const target = targetString.toLowerCase();

  if (target.includes(q)) return true;

  // Khmer to Arabic numeral map
  const khmerToArabic = (str: string) => {
    return str
      .replace(/០/g, '0')
      .replace(/១/g, '1')
      .replace(/២/g, '2')
      .replace(/៣/g, '3')
      .replace(/៤/g, '4')
      .replace(/៥/g, '5')
      .replace(/៦/g, '6')
      .replace(/៧/g, '7')
      .replace(/៨/g, '8')
      .replace(/៩/g, '9');
  };

  // Arabic to Khmer numeral map
  const arabicToKhmer = (str: string) => {
    return str
      .replace(/0/g, '០')
      .replace(/1/g, '១')
      .replace(/2/g, '២')
      .replace(/3/g, '៣')
      .replace(/4/g, '៤')
      .replace(/5/g, '៥')
      .replace(/6/g, '៦')
      .replace(/7/g, '៧')
      .replace(/8/g, '៨')
      .replace(/9/g, '៩');
  };

  const normalizedQueryArabic = khmerToArabic(q);
  const normalizedTargetArabic = khmerToArabic(target);

  if (normalizedTargetArabic.includes(normalizedQueryArabic)) return true;

  const normalizedQueryKhmer = arabicToKhmer(q);
  if (target.includes(normalizedQueryKhmer)) return true;

  return false;
}

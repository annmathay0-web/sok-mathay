import React from 'react';
import { Landmark, FileSpreadsheet, PlusCircle, Search, Bell, Sun, Moon, Globe } from 'lucide-react';
import { formatDateKhmer } from '../utils/calculator';
import { Language, Theme, translations } from '../utils/translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenAddBorrower: () => void;
  onOpenAddLoan: () => void;
  overdueCount: number;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  onOpenAddBorrower,
  onOpenAddLoan,
  overdueCount,
  lang,
  setLang,
  theme,
  setTheme,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-2 sm:px-4 lg:px-8 py-2 sm:py-3 transition-all no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo and App Title */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-slate-950 font-bold shrink-0">
              <Landmark className="w-4 h-4 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-bold text-slate-100 leading-snug flex items-center gap-1.5 flex-wrap">
                <span>{t.appTitle}</span>
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {t.version}
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-snug">
                {t.appSubtitle} • {lang === 'km' ? formatDateKhmer(todayStr) : todayStr}
              </p>
            </div>
          </div>

          {/* Mobile Overdue Badge */}
          {overdueCount > 0 && (
            <button
              onClick={() => setActiveTab('tracker')}
              className="md:hidden flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-semibold border border-rose-500/20 animate-pulse shrink-0"
            >
              <Bell className="w-3 h-3" />
              <span>{overdueCount} {t.overdueCountSuffix}</span>
            </button>
          )}
        </div>

        {/* Search Bar & Actions Container on Mobile */}
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-between">
          
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1 sm:py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-200"
              >
                {t.clear}
              </button>
            )}
          </div>

          {/* Right Controls: Theme Toggle, Language Switcher & Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Language Selector */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-[10px] sm:text-xs">
              <button
                onClick={() => setLang('km')}
                className={`px-1.5 py-0.5 rounded transition-all font-medium ${
                  lang === 'km'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="ភាសាខ្មែរ"
              >
                🇰🇭 <span className="hidden sm:inline">ខ្មែរ</span>
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-1.5 py-0.5 rounded transition-all font-medium ${
                  lang === 'en'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Theme Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-all"
              title={theme === 'dark' ? t.themeLight : t.themeDark}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
              )}
            </button>

            {/* Add Borrower */}
            <button
              onClick={onOpenAddBorrower}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700 transition-all shrink-0"
              title={t.addBorrower}
            >
              <PlusCircle className="w-3.5 h-3.5 text-teal-400 sm:hidden" />
              <span className="hidden sm:inline">{t.addBorrower}</span>
            </button>

            {/* Create Loan */}
            <button
              onClick={onOpenAddLoan}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">{t.createLoan}</span>
            </button>

          </div>

        </div>

      </div>
    </header>
  );
};


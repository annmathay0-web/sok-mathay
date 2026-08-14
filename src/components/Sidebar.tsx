import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calculator,
  FileText,
  CheckSquare,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  overdueCount: number;
  totalBorrowers: number;
  activeLoansCount: number;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  overdueCount,
  totalBorrowers,
  activeLoansCount,
  lang,
}) => {
  const t = translations[lang];

  const navItems = [
    {
      id: 'dashboard',
      label: t.dashboard,
      subtitle: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'borrowers',
      label: t.borrowers,
      subtitle: 'Borrowers',
      icon: Users,
      badge: totalBorrowers
    },
    {
      id: 'calculator',
      label: t.calculator,
      subtitle: 'Loan Engine',
      icon: Calculator,
      badge: null
    },
    {
      id: 'loans',
      label: t.loans,
      subtitle: 'All Loans',
      icon: FileText,
      badge: activeLoansCount
    },
    {
      id: 'tracker',
      label: t.tracker,
      subtitle: 'Payment Tracker',
      icon: CheckSquare,
      badge: overdueCount > 0 ? `${overdueCount} ${t.overdueCountSuffix}` : null,
      badgeColor: overdueCount > 0 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : undefined
    },
    {
      id: 'reports',
      label: t.reports,
      subtitle: 'Excel Reports',
      icon: FileSpreadsheet,
      badge: null
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900/50 border-b lg:border-b-0 lg:border-r border-slate-800/80 p-1.5 sm:p-3 lg:p-4 shrink-0 no-print">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl text-left text-xs lg:text-sm font-medium transition-all shrink-0 lg:w-full ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/5 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <div className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg shrink-0 ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'}`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <div className="leading-snug text-xs sm:text-xs lg:text-sm">{item.label}</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 hidden lg:block font-sans leading-snug">{item.subtitle}</div>
                </div>
              </div>

              {item.badge !== null && (
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Status Box */}
      <div className="hidden lg:block mt-8 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>{lang === 'km' ? 'ស្ថានភាពការប្រាក់ប្រចាំខែ' : 'Monthly Interest Engine'}</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {t.calcSubtitle}
        </p>
      </div>
    </aside>
  );
};


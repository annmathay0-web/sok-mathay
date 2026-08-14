import React from 'react';
import { DollarSign, TrendingUp, Users, AlertCircle, Wallet } from 'lucide-react';
import { formatCurrency, toKhmerNumeral } from '../utils/calculator';
import { DashboardMetrics } from '../types';
import { Language, translations } from '../utils/translations';

interface SummaryCardsProps {
  metrics: DashboardMetrics;
  onFilterClick?: (filterType: string) => void;
  lang?: Language;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics, onFilterClick, lang = 'km' }) => {
  const t = translations[lang];

  const cards = [
    {
      title: t.totalPrincipal,
      englishTitle: 'Total Principal ($P)',
      value: formatCurrency(metrics.totalPrincipal),
      subtitle: lang === 'km' 
        ? `${toKhmerNumeral(metrics.activeLoansCount)} កម្ចីកំពុងសកម្ម`
        : `${metrics.activeLoansCount} active loans`,
      icon: DollarSign,
      color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      action: () => onFilterClick?.('loans')
    },
    {
      title: t.expectedMonthlyInterest,
      englishTitle: 'Expected Monthly Interest',
      value: formatCurrency(metrics.expectedMonthlyInterest),
      subtitle: t.expectedMonthlyInterestSub,
      icon: TrendingUp,
      color: 'from-teal-500/20 to-teal-600/5 text-teal-400 border-teal-500/30',
      iconBg: 'bg-teal-500/20 text-teal-400',
      action: () => onFilterClick?.('calculator')
    },
    {
      title: t.totalBorrowers,
      englishTitle: 'Total Borrowers',
      value: lang === 'km' 
        ? `${toKhmerNumeral(metrics.totalBorrowersCount)} នាក់`
        : `${metrics.totalBorrowersCount} borrowers`,
      subtitle: t.totalBorrowersSub,
      icon: Users,
      color: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/30',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      action: () => onFilterClick?.('borrowers')
    },
    {
      title: t.totalCollected,
      englishTitle: 'Total Collected',
      value: formatCurrency(metrics.totalCollectedThisMonth),
      subtitle: t.totalCollectedSub,
      icon: Wallet,
      color: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/30',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      action: () => onFilterClick?.('tracker')
    },
    {
      title: t.overduePayments,
      englishTitle: 'Overdue Payments',
      value: lang === 'km'
        ? `${toKhmerNumeral(metrics.overdueInstallmentsCount)} វគ្គ`
        : `${metrics.overdueInstallmentsCount} sessions`,
      subtitle: metrics.overdueInstallmentsCount > 0 
        ? t.overduePaymentsSubYes 
        : t.overduePaymentsSubNo,
      icon: AlertCircle,
      color: metrics.overdueInstallmentsCount > 0
        ? 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/40 animate-pulse'
        : 'from-slate-500/15 to-slate-600/5 text-slate-400 border-slate-500/20',
      iconBg: metrics.overdueInstallmentsCount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400',
      action: () => onFilterClick?.('tracker')
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={card.action}
            className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br border backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${card.color}`}
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-300 leading-snug break-words">
                {card.title}
              </span>
              <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 ${card.iconBg}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="text-base sm:text-xl lg:text-2xl font-bold text-slate-100 font-sans py-0.5">
              {card.value}
            </div>

            <div className="mt-1 text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between leading-snug">
              <span className="break-words line-clamp-2">{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};


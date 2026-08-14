import React, { useState } from 'react';
import { Borrower, Loan } from '../types';
import { User, Phone, MapPin, CreditCard, Calendar, Plus, Edit, Trash2, Search, FileText, ChevronRight } from 'lucide-react';
import { formatDateKhmer, toKhmerNumeral } from '../utils/calculator';
import { matchesSearchTerm } from '../utils/search';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { Language, translations } from '../utils/translations';

interface BorrowerListProps {
  borrowers: Borrower[];
  loans: Loan[];
  onAddBorrower: () => void;
  onEditBorrower: (b: Borrower) => void;
  onDeleteBorrower: (id: string) => void;
  onCreateLoanForBorrower: (b: Borrower) => void;
  onViewBorrowerDetail?: (b: Borrower) => void;
  searchTerm: string;
  lang?: Language;
}

export const BorrowerList: React.FC<BorrowerListProps> = ({
  borrowers,
  loans,
  onAddBorrower,
  onEditBorrower,
  onDeleteBorrower,
  onCreateLoanForBorrower,
  onViewBorrowerDetail,
  searchTerm,
  lang = 'km',
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [borrowerToDelete, setBorrowerToDelete] = useState<Borrower | null>(null);

  const t = translations[lang];
  const query = (searchTerm || localSearch).trim();

  const filteredBorrowers = borrowers.filter((b) => {
    const matchesQuery =
      matchesSearchTerm(b.id, query) ||
      matchesSearchTerm(b.name, query) ||
      matchesSearchTerm(b.phone, query) ||
      matchesSearchTerm(b.nationalId, query) ||
      matchesSearchTerm(b.address, query) ||
      matchesSearchTerm(b.notes, query);

    const matchesGender =
      selectedGender === 'all' ||
      b.gender === selectedGender ||
      (selectedGender === 'ប្រុស' && (b.gender === 'ប្រុស' || b.gender === 'Male')) ||
      (selectedGender === 'ស្រី' && (b.gender === 'ស្រី' || b.gender === 'Female'));

    return matchesQuery && matchesGender;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Bar / Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span>{t.borrowerManagementTitle}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'km' 
              ? `បញ្ជីអ្នកខ្ចីសរុប ${toKhmerNumeral(borrowers.length)} នាក់ (បង្ហាញ ${toKhmerNumeral(filteredBorrowers.length)})`
              : `Total borrowers: ${borrowers.length} (Showing ${filteredBorrowers.length})`}
          </p>
        </div>

        {/* Filters, Search & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Quick Search Input inside tab */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Gender Filter */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setSelectedGender('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedGender === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setSelectedGender('ប្រុស')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedGender === 'ប្រុស' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.male}
            </button>
            <button
              onClick={() => setSelectedGender('ស្រី')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedGender === 'ស្រី' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.female}
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={onAddBorrower}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addBorrowerNew}</span>
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {filteredBorrowers.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">{t.noBorrowersYet}</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">{t.noBorrowersSub}</p>
          <button
            onClick={onAddBorrower}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
          >
            {t.addFirstBorrower}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBorrowers.map((borrower) => {
            const borrowerLoans = loans.filter((l) => l.borrowerId === borrower.id);
            const activeLoans = borrowerLoans.filter((l) => l.status === 'active');

            return (
              <div
                key={borrower.id}
                className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-lg flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header & Avatar */}
                  <div className="flex items-start gap-3.5 mb-4 pb-3 border-b border-slate-800/80">
                    <img
                      src={borrower.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={borrower.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-md bg-slate-950"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {borrower.id}
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                          {borrower.gender}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 truncate mt-1">
                        {borrower.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-sans">
                        <Phone className="w-3.5 h-3.5 text-teal-400" />
                        <span>{borrower.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="text-slate-400">{t.nationalIdLabel}:</span>
                      <span className="font-mono text-slate-200">{borrower.nationalId || 'N/A'}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="text-slate-400">{t.dobLabel}:</span>
                      <span>{lang === 'km' ? formatDateKhmer(borrower.dob) : borrower.dob}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="text-slate-400">{t.addressLabel}:</span>
                      <span className="line-clamp-2 text-slate-300">{borrower.address}</span>
                    </div>

                    {borrower.notes && (
                      <div className="mt-2 p-2 rounded-xl bg-slate-950 text-[11px] text-slate-400 border border-slate-800/60">
                        <span className="font-semibold text-slate-300">{t.notesLabel}:</span> {borrower.notes}
                      </div>
                    )}
                  </div>

                  {/* Schedule & A4 Document Quick Trigger Button */}
                  <button
                    type="button"
                    onClick={() => onViewBorrowerDetail?.(borrower)}
                    className="w-full mt-3.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-between gap-2 transition-all group/btn shadow-inner"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>មើលថ្ងៃបង់លុយ, គ្រីស & A4</span>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Footer Status & Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[11px]">
                    <span className="text-slate-500">{t.activeLoanCount}: </span>
                    <span className="font-bold text-emerald-400">
                      {lang === 'km' ? toKhmerNumeral(activeLoans.length) : activeLoans.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onCreateLoanForBorrower(borrower)}
                      className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all text-xs font-semibold flex items-center gap-1"
                      title={t.createLoan}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t.createLoan}</span>
                    </button>

                    <button
                      onClick={() => onEditBorrower(borrower)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                      title={t.edit}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setBorrowerToDelete(borrower)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmDeleteModal
        isOpen={!!borrowerToDelete}
        onClose={() => setBorrowerToDelete(null)}
        onConfirm={() => {
          if (borrowerToDelete) {
            onDeleteBorrower(borrowerToDelete.id);
            setBorrowerToDelete(null);
          }
        }}
        title={lang === 'km' ? 'លុបទិន្នន័យអ្នកខ្ចី' : 'Delete Borrower'}
        itemName={borrowerToDelete?.name}
        description={
          lang === 'km'
            ? `តើអ្នកពិតជាចង់លុបទិន្នន័យអ្នកខ្ចី "${borrowerToDelete?.name}" និងរាល់ព័ត៌មានកម្ចីពាក់ព័ន្ធទាំងអស់មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានឡើយ។`
            : `Are you sure you want to delete borrower "${borrowerToDelete?.name}" and all associated loans? This action cannot be undone.`
        }
        lang={lang}
      />

    </div>
  );
};

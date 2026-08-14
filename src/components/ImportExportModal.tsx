import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, Download, Check, AlertCircle, FileCheck } from 'lucide-react';
import { Borrower, Loan } from '../types';
import {
  importBorrowersFromExcel,
  exportBorrowersToExcel,
  exportLoansReportToExcel,
  downloadExcelTemplate
} from '../utils/excel';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrowers: Borrower[];
  loans: Loan[];
  onImportBorrowers: (newBorrowers: Borrower[]) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  borrowers,
  loans,
  onImportBorrowers,
}) => {
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setErrorMsg(null);
    setImportedCount(null);

    try {
      const parsedBorrowers = await importBorrowersFromExcel(file);
      if (parsedBorrowers.length === 0) {
        setErrorMsg('ពុំមានទិន្នន័យអ្នកខ្ចីត្រឹមត្រូវក្នុងឯកសារ Excel នេះទេ');
      } else {
        onImportBorrowers(parsedBorrowers);
        setImportedCount(parsedBorrowers.length);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('មានបញ្ហាក្នុងការអានឯកសារ Excel! សូមប្រើប្រាស់ទម្រង់គំរូដែលបានផ្តល់ជូន។');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                នាំចូល និងទាញយក Excel (Excel Import & Export)
              </h3>
              <p className="text-xs text-slate-400">
                គ្រប់គ្រងទិន្នន័យតាមរយៈឯកសារ Microsoft Excel (.xlsx)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Section 1: Excel Import */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>១. នាំចូលបញ្ជីអ្នកខ្ចីពី Excel (Import Excel)</span>
              </span>

              <button
                type="button"
                onClick={downloadExcelTemplate}
                className="text-[11px] text-teal-400 hover:underline flex items-center gap-1 font-sans"
              >
                <Download className="w-3 h-3" />
                <span>ទាញយកទម្រង់គំរូ (.xlsx)</span>
              </button>
            </h4>

            {/* Drag Drop / File Input Box */}
            <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-950/60 transition-all relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-semibold text-slate-200">
                ចុចទីនេះ ឬទម្លាក់ឯកសារ Excel (.xlsx, .xls)
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                ប្រព័ន្ធគាំទ្រឈ្មោះអ្នកខ្ចី, ភេទ, លេខទូរស័ព្ទ, និងអត្តសញ្ញាណប័ណ្ណដោយស្វ័យប្រវត្តិ
              </p>
            </div>

            {/* Notification Alerts */}
            {importing && (
              <p className="text-xs text-amber-400 animate-pulse text-center">
                កំពុងដំណើរការអានឯកសារ Excel...
              </p>
            )}

            {importedCount !== null && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>
                  នាំចូលទិន្នន័យជោគជ័យចំនួន <strong>{importedCount}</strong> នាក់!
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* Section 2: Excel Export Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>២. ទាញយករបាយការណ៍ជា Excel (Export Excel)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => exportBorrowersToExcel(borrowers)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 block">
                    ទាញយកបញ្ជីអ្នកខ្ចី
                  </span>
                  <span className="text-[10px] text-slate-500">
                    សរុប {borrowers.length} នាក់
                  </span>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
              </button>

              <button
                onClick={() => exportLoansReportToExcel(loans)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 block">
                    ទាញយករបាយការណ៍កម្ចី
                  </span>
                  <span className="text-[10px] text-slate-500">
                    សរុប {loans.length} កម្ចី
                  </span>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

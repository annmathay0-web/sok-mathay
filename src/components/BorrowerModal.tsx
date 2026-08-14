import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, MapPin, CreditCard, Calendar, Image as ImageIcon, Check, Upload, Trash2, Link, Sparkles, Camera, Edit3, ListFilter, DollarSign, Clock, Banknote, Percent, ShieldCheck } from 'lucide-react';
import { Borrower, Gender, Loan, InterestType, RepaymentFrequency } from '../types';
import { CAMBODIA_PROVINCES } from '../data/cambodiaLocations';
import { generateLoanSchedule } from '../utils/calculator';

interface BorrowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (borrower: Borrower, initialLoan?: Loan | null) => void;
  editingBorrower: Borrower | null;
}

const PRESET_MALE_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
];

const PRESET_FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
];

export const BorrowerModal: React.FC<BorrowerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBorrower,
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('ប្រុស');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [address, setAddress] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [notes, setNotes] = useState('');

  // Location selectors state
  const [selectedProvinceId, setSelectedProvinceId] = useState('phnom_penh');
  const [selectedDistrictId, setSelectedDistrictId] = useState('chamkarmon');
  const [selectedCommune, setSelectedCommune] = useState('សង្កាត់ទន្លេបាសាក់');
  const [villageDetail, setVillageDetail] = useState('');
  const [isManualAddress, setIsManualAddress] = useState(false);

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Loan Setup state (when creating a new borrower)
  const [createLoan, setCreateLoan] = useState<boolean>(true);
  const [principalInput, setPrincipalInput] = useState<string>('1000');
  const [loanStartDate, setLoanStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [durationInput, setDurationInput] = useState<string>('12');
  const [repaymentFrequency, setRepaymentFrequency] = useState<RepaymentFrequency>('monthly');
  const [interestRateInput, setInterestRateInput] = useState<string>('2.0');
  const [interestType, setInterestType] = useState<InterestType>('simple');
  const [collateral, setCollateral] = useState<string>('');

  // Active province and district objects
  const activeProvince = CAMBODIA_PROVINCES.find((p) => p.id === selectedProvinceId) || CAMBODIA_PROVINCES[0];
  const activeDistrict = activeProvince.districts.find((d) => d.id === selectedDistrictId) || activeProvince.districts[0];
  const activeCommunes = activeDistrict?.communes || [];

  useEffect(() => {
    if (editingBorrower) {
      setName(editingBorrower.name);
      setGender(editingBorrower.gender);
      setDob(editingBorrower.dob);
      setPhone(editingBorrower.phone);
      setPhotoUrl(editingBorrower.photoUrl);
      setAddress(editingBorrower.address);
      setNationalId(editingBorrower.nationalId);
      setNotes(editingBorrower.notes || '');
      setShowUrlInput(false);
      setIsManualAddress(true); // default to freeform text if editing existing address
      setCreateLoan(false);
    } else {
      setName('');
      setGender('ប្រុស');
      setDob('1992-05-10');
      setPhone('');
      setPhotoUrl('');
      setAddress('');
      setNationalId('');
      setNotes('');
      setShowUrlInput(false);

      // Reset initial loan fields
      setCreateLoan(true);
      setPrincipalInput('1000');
      setLoanStartDate(new Date().toISOString().split('T')[0]);
      setDurationInput('12');
      setRepaymentFrequency('monthly');
      setInterestRateInput('2.0');
      setInterestType('simple');
      setCollateral('');

      // Default location to Phnom Penh -> Chamkarmon
      setSelectedProvinceId('phnom_penh');
      setSelectedDistrictId('chamkarmon');
      setSelectedCommune('សង្កាត់ទន្លេបាសាក់');
      setVillageDetail('');
      setIsManualAddress(false);
    }
  }, [editingBorrower, isOpen]);

  // Update address string whenever location selects change in dropdown mode
  useEffect(() => {
    if (!isManualAddress) {
      const parts = [
        villageDetail.trim(),
        selectedCommune,
        activeDistrict?.nameKm,
        activeProvince?.nameKm
      ].filter(Boolean);
      setAddress(parts.join(', '));
    }
  }, [selectedProvinceId, selectedDistrictId, selectedCommune, villageDetail, isManualAddress, activeDistrict, activeProvince]);

  const handleProvinceChange = (provId: string) => {
    setSelectedProvinceId(provId);
    const prov = CAMBODIA_PROVINCES.find((p) => p.id === provId) || CAMBODIA_PROVINCES[0];
    const dist = prov.districts[0];
    if (dist) {
      setSelectedDistrictId(dist.id);
      setSelectedCommune(dist.communes?.[0] || '');
    }
  };

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    const dist = activeProvince.districts.find((d) => d.id === distId);
    if (dist && dist.communes?.[0]) {
      setSelectedCommune(dist.communes[0]);
    } else {
      setSelectedCommune('');
    }
  };

  if (!isOpen) return null;

  const currentPresets = gender === 'ស្រី' ? PRESET_FEMALE_AVATARS : PRESET_MALE_AVATARS;
  const defaultPhoto = currentPresets[0];

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសរូបភាពឡើងវិញ! (Please select a valid image file)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      // Compress photo via canvas to optimize local storage size
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320; // 320px max dimension is optimal for profile avatar
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          setPhotoUrl(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('សូមបញ្ចូលឈ្មោះ និងលេខទូរស័ព្ទអ្នកខ្ចី!');
      return;
    }

    const borrowerData: Borrower = {
      id: editingBorrower ? editingBorrower.id : `BRW-${Date.now().toString().slice(-5)}`,
      name: name.trim(),
      gender,
      dob: dob || '1990-01-01',
      phone: phone.trim(),
      photoUrl: photoUrl.trim() || defaultPhoto,
      address: address.trim() || 'រាជធានីភ្នំពេញ',
      nationalId: nationalId.trim() || `ID-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: notes.trim(),
      createdAt: editingBorrower ? editingBorrower.createdAt : new Date().toISOString().split('T')[0],
    };

    let initialLoan: Loan | null = null;
    if (!editingBorrower && createLoan) {
      const principal = Math.max(0, parseFloat(principalInput) || 0);
      const interestRate = Math.max(0, parseFloat(interestRateInput) || 0);
      const duration = Math.max(1, parseInt(durationInput, 10) || 1);

      if (principal > 0) {
        const calc = generateLoanSchedule({
          principal,
          interestRatePerMonth: interestRate,
          durationMonths: duration,
          startDate: loanStartDate || new Date().toISOString().split('T')[0],
          interestType,
          repaymentFrequency,
          skipWeekends: true,
          skipHolidays: true,
        });

        initialLoan = {
          id: `LN-${Date.now().toString().slice(-6)}`,
          borrowerId: borrowerData.id,
          borrowerName: borrowerData.name,
          borrowerPhone: borrowerData.phone,
          principalAmount: principal,
          interestRatePerMonth: interestRate,
          durationMonths: duration,
          startDate: loanStartDate || new Date().toISOString().split('T')[0],
          interestType,
          repaymentFrequency,
          monthlyPaymentAmount: calc.monthlyPaymentAmount,
          totalInterestAmount: calc.totalInterestAmount,
          totalRepaymentAmount: calc.totalRepaymentAmount,
          collateralNotes: collateral.trim(),
          status: 'active',
          schedule: calc.schedule,
          createdAt: new Date().toISOString().split('T')[0],
        };
      }
    }

    onSave(borrowerData, initialLoan);
    onClose();
  };

  const activePhoto = photoUrl.trim() || defaultPhoto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingBorrower ? 'កែប្រែព័ត៌មានអ្នកខ្ចី' : 'បន្ថែមអ្នកខ្ចីថ្មី'}
              </h3>
              <p className="text-xs text-slate-400">
                បញ្ចូលទិន្នន័យផ្ទាល់ខ្លួន និងទំនាក់ទំនងរបស់អ្នកខ្ចី
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Photo Upload & Preview Section */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>រូបថតអ្នកខ្ចី (Borrower Photo / Avatar)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
              >
                <Link className="w-3 h-3" />
                <span>{showUrlInput ? 'លាក់តំណភ្ជាប់' : 'ប្រើ Link URL'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview Avatar */}
              <div className="relative group shrink-0">
                <img
                  src={activePhoto}
                  alt="Borrower Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-lg bg-slate-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultPhoto;
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-slate-200 text-[10px] font-bold"
                >
                  <Camera className="w-4 h-4 mb-0.5 text-emerald-400" />
                  <span>ប្ដូររូប</span>
                </button>
              </div>

              {/* Upload Controls & Presets */}
              <div className="flex-1 w-full space-y-2.5">
                {/* Drag and Drop Zone / Buttons */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`p-3 rounded-xl border-2 border-dashed transition-all flex items-center justify-between gap-3 ${
                    isDragging
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        ទម្លាក់រូបថត ឬ ជ្រើសរើសពីម៉ាស៊ីន
                      </p>
                      <p className="text-[10px] text-slate-400">
                        គាំទ្រ PNG, JPG, WEBP (បង្រួមស្វ័យប្រវត្តិ)
                      </p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shrink-0 transition-all shadow-md shadow-emerald-500/20"
                  >
                    ជ្រើសរើសរូប
                  </button>
                </div>

                {/* Quick Presets & Clear */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      រូបគំរូ៖
                    </span>
                    <div className="flex items-center gap-1.5">
                      {currentPresets.map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoUrl(presetUrl)}
                          className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all ${
                            photoUrl === presetUrl
                              ? 'border-emerald-400 scale-110 shadow-md'
                              : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={presetUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>លុបរូប</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* URL Input field if toggled */}
            {showUrlInput && (
              <div className="pt-2 border-t border-slate-800/80 animate-fadeIn">
                <label className="block text-[11px] text-slate-400 mb-1">
                  បញ្ចូល Web URL នៃរូបភាព
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ឈ្មោះអ្នកខ្ចី (Borrower Name) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ឧ. សុខ ចាន់ថន"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>

            {/* Gender Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ភេទ (Gender)
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setGender('ប្រុស')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    gender === 'ប្រុស' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ប្រុស (Male)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('ស្រី')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    gender === 'ស្រី' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ស្រី (Female)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                លេខទូរស័ព្ទ (Phone Number) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ឧ. 012 345 678"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ថ្ងៃខែឆ្នាំកំណើត (Date of Birth)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>
          </div>

          {/* National ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              លេខអត្តសញ្ញាណប័ណ្ណ (National ID)
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="ឧ. 010892341"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          {/* Current Address (អាសយដ្ឋានបច្ចុប្បន្ន) - Structured Selectors */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>អាសយដ្ឋានបច្ចុប្បន្ន (Current Address)</span>
              </label>

              <button
                type="button"
                onClick={() => setIsManualAddress(!isManualAddress)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline transition-all"
              >
                {isManualAddress ? (
                  <>
                    <ListFilter className="w-3 h-3" />
                    <span>ជ្រើសរើសតាម ខេត្ត/ស្រុក/ឃុំ</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3 h-3" />
                    <span>វាយបញ្ចូលសេរី (Manual)</span>
                  </>
                )}
              </button>
            </div>

            {!isManualAddress ? (
              <div className="space-y-3 animate-fadeIn">
                {/* Grid for Province, District, Commune */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Province Select */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      ខេត្ត / រាជធានី
                    </label>
                    <select
                      value={selectedProvinceId}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
                    >
                      {CAMBODIA_PROVINCES.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.nameKm}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Select */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      ក្រុង / ស្រុក / ខណ្ឌ
                    </label>
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
                    >
                      {activeProvince.districts.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.nameKm}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Commune Select */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      ឃុំ / សង្កាត់
                    </label>
                    {activeCommunes.length > 0 ? (
                      <select
                        value={selectedCommune}
                        onChange={(e) => setSelectedCommune(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
                      >
                        {activeCommunes.map((comm, idx) => (
                          <option key={idx} value={comm}>
                            {comm}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={selectedCommune}
                        onChange={(e) => setSelectedCommune(e.target.value)}
                        placeholder="បញ្ចូលឃុំ/សង្កាត់"
                        className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
                      />
                    )}
                  </div>
                </div>

                {/* Village / Street / House Detail */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    ភូមិ / ផ្ទះលេខ / ផ្លូវ (Village, House, Street detail)
                  </label>
                  <input
                    type="text"
                    value={villageDetail}
                    onChange={(e) => setVillageDetail(e.target.value)}
                    placeholder="ឧ. ភូមិ១, ផ្ទះលេខ ១២, ផ្លូវ ២៧១"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                {/* Combined Address Preview */}
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block mb-0.5">អាសយដ្ឋានសរុប (Combined Full Address):</span>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs font-medium text-emerald-400 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{address || 'សូមជ្រើសរើសព័ត៌មានខាងលើ'}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Manual Address Area */
              <div className="relative animate-fadeIn">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ផ្ទះលេខ, ផ្លូវ, ភូមិ, ឃុំ/សង្កាត់, ស្រុក/ខណ្ឌ, រាជធានី/ខេត្ត..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            )}
          </div>

          {/* Initial Loan Setup Section (When creating new borrower) */}
          {!editingBorrower && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-3.5 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">
                      ព័ត៌មានកម្ចីដំបូង (Initial Loan Details)
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      កំណត់ចំនួនប្រាក់ខ្ចី កាលបរិច្ឆេទខ្ចី និងលក្ខខណ្ឌបង់ប្រាក់
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={createLoan}
                    onChange={(e) => setCreateLoan(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-emerald-400">បង្កើតកម្ចី</span>
                </label>
              </div>

              {createLoan && (
                <div className="space-y-3.5 animate-fadeIn">
                  {/* Loan Amount & Start Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Loan Amount (លុយខ្ចី) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-200">
                          ចំនួនលុយខ្ចី ($) (Loan Amount) <span className="text-rose-400">*</span>
                        </label>
                        <span className="text-xs font-bold text-emerald-400">
                          ${parseFloat(principalInput) || 0}
                        </span>
                      </div>
                      <div className="relative mb-1.5">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                        <input
                          type="number"
                          min="1"
                          step="any"
                          required={createLoan}
                          value={principalInput}
                          onChange={(e) => setPrincipalInput(e.target.value)}
                          placeholder="ឧ. 1000"
                          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="10000"
                        step="50"
                        value={parseFloat(principalInput) || 0}
                        onChange={(e) => setPrincipalInput(e.target.value)}
                        className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Loan Date / ពេលខ្ចី */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        ពេលខ្ចី / កាលបរិច្ឆេទ (Loan Date) <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                        <input
                          type="date"
                          required={createLoan}
                          value={loanStartDate}
                          onChange={(e) => setLoanStartDate(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Frequency & Interest Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Payment Frequency */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        ប្រភេទបង់ប្រាក់ (Payment Frequency)
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setRepaymentFrequency('monthly');
                            if (durationInput === '30' || durationInput === '15') setDurationInput('12');
                          }}
                          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                            repaymentFrequency === 'monthly'
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ប្រចាំខែ
                        </button>
                        <button
                          type="button"
                          onClick={() => setRepaymentFrequency('weekly')}
                          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                            repaymentFrequency === 'weekly'
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ប្រចាំអាទិត្យ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRepaymentFrequency('daily');
                            if (durationInput === '12' || durationInput === '6') setDurationInput('30');
                          }}
                          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                            repaymentFrequency === 'daily'
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ប្រចាំថ្ងៃ
                        </button>
                      </div>
                    </div>

                    {/* Interest Rate */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-300">
                          អត្រាការប្រាក់ (%/{repaymentFrequency === 'daily' ? 'ថ្ងៃ' : repaymentFrequency === 'weekly' ? 'អាទិត្យ' : 'ខែ'})
                        </label>
                        <span className="text-xs font-bold text-teal-400">
                          {parseFloat(interestRateInput) || 0}% / {repaymentFrequency === 'daily' ? 'ថ្ងៃ' : repaymentFrequency === 'weekly' ? 'អាទិត្យ' : 'ខែ'}
                        </span>
                      </div>
                      <div className="relative mb-1.5">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={interestRateInput}
                          onChange={(e) => setInterestRateInput(e.target.value)}
                          placeholder="2.0"
                          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="15"
                        step="0.1"
                        value={parseFloat(interestRateInput) || 0}
                        onChange={(e) => setInterestRateInput(e.target.value)}
                        className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Duration & Interest Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Duration */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-300">
                          {repaymentFrequency === 'daily'
                            ? 'រយៈពេល (ចំនួនថ្ងៃ)'
                            : repaymentFrequency === 'weekly'
                            ? 'រយៈពេល (ចំនួនសប្ដាហ៍)'
                            : 'រយៈពេល (ចំនួនខែ)'}
                        </label>
                        <span className="text-xs font-bold text-emerald-400">
                          {parseInt(durationInput, 10) || 1} {repaymentFrequency === 'daily' ? 'ថ្ងៃ' : repaymentFrequency === 'weekly' ? 'អាទិត្យ' : 'ខែ'}
                        </span>
                      </div>
                      <div className="relative mb-1.5">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="number"
                          min="1"
                          value={durationInput}
                          onChange={(e) => setDurationInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <input
                        type="range"
                        min="1"
                        max={repaymentFrequency === 'daily' ? 365 : repaymentFrequency === 'weekly' ? 52 : 36}
                        step="1"
                        value={parseInt(durationInput, 10) || 1}
                        onChange={(e) => setDurationInput(e.target.value)}
                        className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Interest Type */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        ប្រភេទការប្រាក់ (Interest Type)
                      </label>
                      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setInterestType('simple')}
                          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                            interestType === 'simple'
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ការប្រាក់ថេរ
                        </button>
                        <button
                          type="button"
                          onClick={() => setInterestType('reducing')}
                          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                            interestType === 'reducing'
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ការប្រាក់ថយចុះ
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Collateral Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ទ្រព្យបញ្ចាំ / សម្គាល់កម្ចី (Collateral Notes)
                    </label>
                    <input
                      type="text"
                      value={collateral}
                      onChange={(e) => setCollateral(e.target.value)}
                      placeholder="ឧ. ប្លង់ដី, កាតគ្រីម៉ូតូ, លិខិតឆ្លងដែន..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              កំណត់ចំណាំបន្ថែម (Notes)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ឧ. មុខរបរ, កន្លែងធ្វើការ, ឬអ្នកធានា..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              <span>{editingBorrower ? 'រក្សាទុកការកែប្រែ' : 'បន្ថែមអ្នកខ្ចី'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};


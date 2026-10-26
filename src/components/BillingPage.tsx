import React, { useState } from 'react';
import { Bill, BillCategory, BillLineItem, Patient, Visit, UserRole } from '../types/hms';
import { formatPKR, formatPKRShort } from '../utils/formatters';
import { PrintInvoiceModal } from './PrintInvoiceModal';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  Search,
  ArrowRight,
  ShieldAlert,
  Save
} from 'lucide-react';

const CATEGORIES: BillCategory[] = [
  'Doctor Fee',
  'Operation Fee',
  'Anesthesia',
  'Room',
  'Medical Treatment',
  'Medicines',
  'OT Equipment',
  'Lab',
  'Other',
];

const PRESET_PROCEDURES: { category: BillCategory; desc: string; defaultPrice: number }[] = [
  { category: 'Doctor Fee', desc: 'Chief Consultant Surgeon Fee (Dr. Tariq Mahmood)', defaultPrice: 35000 },
  { category: 'Doctor Fee', desc: 'Specialist Consultation OPD / IPD Round', defaultPrice: 4000 },
  { category: 'Operation Fee', desc: 'Laparoscopic Cholecystectomy (Major OT charges)', defaultPrice: 45000 },
  { category: 'Operation Fee', desc: 'Lower Segment Caesarean Section (LSCS) Package', defaultPrice: 40000 },
  { category: 'Operation Fee', desc: 'Inguinal Hernia Repair with Prolene Mesh', defaultPrice: 32000 },
  { category: 'Anesthesia', desc: 'General Anesthesia with Sevoflurane & Gas Monitoring', defaultPrice: 18000 },
  { category: 'Anesthesia', desc: 'Spinal Anesthesia & Post-op Recovery Monitoring', defaultPrice: 15000 },
  { category: 'Room', desc: 'Private Deluxe Room (per day charge)', defaultPrice: 8000 },
  { category: 'Room', desc: 'General Ward Bed (per day charge)', defaultPrice: 3000 },
  { category: 'Room', desc: 'NICU Incubator Care (24-hour monitored)', defaultPrice: 12000 },
  { category: 'Medical Treatment', desc: 'Nursing Care & Critical Vitals Monitoring (Daily)', defaultPrice: 4500 },
  { category: 'Medical Treatment', desc: 'ER Trauma Resuscitation, Wound Debridement & Sutures', defaultPrice: 12000 },
  { category: 'Medicines', desc: 'IV Antibiotics (Ceftriaxone 1g + Paracetamol IV)', defaultPrice: 6500 },
  { category: 'Medicines', desc: 'Post-operative Recovery Drugs & Analgesics Pack', defaultPrice: 4500 },
  { category: 'OT Equipment', desc: 'Disposable Laparoscopic Trocar & Clip Cartridge Pack', defaultPrice: 12500 },
  { category: 'OT Equipment', desc: 'Sterile Delivery Kit, Cord Clamps & Sutures', defaultPrice: 7500 },
  { category: 'Lab', desc: 'Pre-Op Surgical Profile (CBC, LFT, RFT, PT/INR, Viral)', defaultPrice: 8500 },
  { category: 'Lab', desc: 'Urgent Non-Contrast CT Brain & Cervical Spine', defaultPrice: 22000 },
  { category: 'Other', desc: 'Hospital Administrative & Sanitation Surcharge', defaultPrice: 2000 },
];

interface BillingPageProps {
  bills: Bill[];
  patients: Patient[];
  activeBillId?: string;
  onUpdateBill: (bill: Bill) => void;
  onCreateNewBill: (newBill: Bill) => void;
  currentRole: UserRole;
  onSelectPatientFolder?: (patientId: string) => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({
  bills,
  patients,
  activeBillId,
  onUpdateBill,
  onCreateNewBill,
  currentRole,
  onSelectPatientFolder,
}) => {
  // Active Bill Selection
  const [selectedBillId, setSelectedBillId] = useState<string>(
    activeBillId || (bills.length > 0 ? bills[0].id : '')
  );

  // Print invoice modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // New Item Draft state
  const [newCategory, setNewCategory] = useState<BillCategory>('Doctor Fee');
  const [newDescription, setNewDescription] = useState('');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newUnitPrice, setNewUnitPrice] = useState<number>(5000);

  // Discount & Advance editable states for active bill
  const currentBill = bills.find((b) => b.id === selectedBillId) || bills[0];
  const linkedPatient = patients.find((p) => p.id === currentBill?.patientId);
  const linkedVisit = linkedPatient?.visits.find((v) => v.visitCode === currentBill?.visitCode);

  const isLocked = currentBill?.status === 'Finalized';

  // Quick preset selection
  const handleApplyPreset = (preset: typeof PRESET_PROCEDURES[0]) => {
    if (isLocked) return;
    setNewCategory(preset.category);
    setNewDescription(preset.desc);
    setNewUnitPrice(preset.defaultPrice);
  };

  // Add line item
  const handleAddLineItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBill || isLocked) return;
    if (!newDescription.trim() || newQuantity <= 0 || newUnitPrice < 0) return;

    const newItem: BillLineItem = {
      id: `item-${Date.now()}`,
      category: newCategory,
      description: newDescription.trim(),
      quantity: Number(newQuantity),
      unitPrice: Number(newUnitPrice),
      amount: Number(newQuantity) * Number(newUnitPrice),
    };

    const updatedItems = [...currentBill.items, newItem];
    recalculateAndUpdateBill(updatedItems, currentBill.discount, currentBill.advanceReceived, currentBill.status);

    // Reset inputs
    setNewDescription('');
    setNewQuantity(1);
    setNewUnitPrice(5000);
  };

  // Delete line item
  const handleDeleteItem = (itemId: string) => {
    if (!currentBill || isLocked) return;
    const updatedItems = currentBill.items.filter((item) => item.id !== itemId);
    recalculateAndUpdateBill(updatedItems, currentBill.discount, currentBill.advanceReceived, currentBill.status);
  };

  // Change existing item quantity or price
  const handleItemFieldChange = (itemId: string, field: 'quantity' | 'unitPrice' | 'description', value: any) => {
    if (!currentBill || isLocked) return;

    const updatedItems = currentBill.items.map((item) => {
      if (item.id === itemId) {
        const qty = field === 'quantity' ? Math.max(1, Number(value) || 1) : item.quantity;
        const price = field === 'unitPrice' ? Math.max(0, Number(value) || 0) : item.unitPrice;
        const desc = field === 'description' ? String(value) : item.description;
        return {
          ...item,
          quantity: qty,
          unitPrice: price,
          description: desc,
          amount: qty * price,
        };
      }
      return item;
    });

    recalculateAndUpdateBill(updatedItems, currentBill.discount, currentBill.advanceReceived, currentBill.status);
  };

  // Discount / Advance adjustments
  const handleDiscountChange = (newDiscount: number) => {
    if (!currentBill || isLocked) return;
    recalculateAndUpdateBill(currentBill.items, Math.max(0, newDiscount), currentBill.advanceReceived, currentBill.status);
  };

  const handleAdvanceChange = (newAdvance: number) => {
    if (!currentBill || isLocked) return;
    recalculateAndUpdateBill(currentBill.items, currentBill.discount, Math.max(0, newAdvance), currentBill.status);
  };

  // Toggle Draft / Finalize / Reopen
  const handleToggleFinalize = () => {
    if (!currentBill) return;

    if (currentBill.status === 'Draft') {
      // Finalize
      const updated: Bill = {
        ...currentBill,
        status: 'Finalized',
        finalizedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        finalizedBy: 'Dr. Arshad Khan (Admin)',
      };
      onUpdateBill(updated);
    } else {
      // Admin Reopen action
      const updated: Bill = {
        ...currentBill,
        status: 'Draft',
        notes: (currentBill.notes ? currentBill.notes + ' ' : '') + `[Reopened for admin adjustment at ${new Date().toLocaleTimeString()}]`,
      };
      onUpdateBill(updated);
    }
  };

  // Recalculator helper
  const recalculateAndUpdateBill = (
    items: BillLineItem[],
    discount: number,
    advance: number,
    status: 'Draft' | 'Finalized'
  ) => {
    const subtotal = items.reduce((acc, it) => acc + it.amount, 0);
    const validDiscount = Math.min(discount, subtotal);
    const total = Math.max(0, subtotal - validDiscount);
    const balance = Math.max(0, total - advance);

    const updated: Bill = {
      ...currentBill,
      items,
      subtotal,
      discount: validDiscount,
      total,
      advanceReceived: advance,
      balance,
      status,
    };

    onUpdateBill(updated);
  };

  // Create new bill handler for existing patients
  const handleStartNewBill = () => {
    const targetPatient = patients[0];
    const targetVisit = targetPatient.visits[0];
    const newBillId = `INV-2026-${String(bills.length + 90).padStart(4, '0')}`;

    const newBill: Bill = {
      id: newBillId,
      patientId: targetPatient.id,
      visitCode: targetVisit.visitCode,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Draft',
      items: [
        {
          id: `item-${Date.now()}`,
          category: 'Doctor Fee',
          description: 'Specialist Consultant Initial Evaluation & Management',
          quantity: 1,
          unitPrice: 4000,
          amount: 4000,
        },
      ],
      subtotal: 4000,
      discount: 0,
      total: 4000,
      advanceReceived: 2000,
      balance: 2000,
      paymentMethod: 'Cash',
      notes: 'New manual billing entry initialized by administrator.',
    };

    onCreateNewBill(newBill);
    setSelectedBillId(newBill.id);
  };

  if (!currentBill) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <Receipt className="w-12 h-12 text-teal-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">No Bills Found</h3>
        <p className="text-xs text-slate-500 mb-4">Initialize the sample bills or create a new invoice.</p>
        <button
          onClick={handleStartNewBill}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold"
        >
          Create First Bill
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Invoice Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              PAGE 2
            </span>
            <h1 className="text-xl font-bold text-slate-900">Hospital Billing & Itemized Manual Entry</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Linked to patient folders. All currency calculations in Pakistani Rupees (PKR / Rs.). Draft bills can be edited; finalized bills lock with admin reopen.
          </p>
        </div>

        {/* Bill Switcher & New Bill button */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {bills.map((b) => {
            const isSel = b.id === selectedBillId;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBillId(b.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 border cursor-pointer ${
                  isSel
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span className="font-mono">{b.id}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-bold ${
                  b.status === 'Finalized'
                    ? isSel ? 'bg-teal-700 text-teal-100' : 'bg-emerald-100 text-emerald-800'
                    : isSel ? 'bg-teal-700 text-teal-100' : 'bg-amber-100 text-amber-800'
                }`}>
                  {b.status}
                </span>
              </button>
            );
          })}

          <button
            onClick={handleStartNewBill}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Bill</span>
          </button>
        </div>
      </div>

      {/* Patient & Visit Context Header Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-base font-extrabold text-teal-300">{currentBill.id}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-200 text-sm font-bold">
                Patient: {linkedPatient ? linkedPatient.name : currentBill.patientId}
              </span>
              <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-teal-400 border border-slate-700 font-bold">
                {currentBill.patientId}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
              <span>Visit Code: <strong className="text-slate-200 font-mono">{currentBill.visitCode}</strong></span>
              <span>•</span>
              <span>Type: <strong className="text-slate-200">{linkedVisit?.visitType || 'Clinical'}</strong></span>
              <span>•</span>
              <span>Consultant: <strong className="text-slate-200">{linkedVisit?.assignedDoctor || 'General'}</strong></span>
              <span>•</span>
              <span>Date: {currentBill.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Lock Status & Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Printable Invoice View</span>
          </button>

          {isLocked ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>FINALIZED (LOCKED)</span>
              </div>
              <button
                type="button"
                onClick={handleToggleFinalize}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
                title="Unlock bill for adjustments"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Reopen Bill</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleToggleFinalize}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Finalize Bill (Lock)</span>
            </button>
          )}
        </div>
      </div>

      {/* Lock Notice Banner if Finalized */}
      {isLocked && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Bill is Finalized and Locked for modifications.</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                All itemized figures, discounts, and payments are protected. Click <strong>&quot;Reopen Bill&quot;</strong> above if you need to add or modify line items.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleFinalize}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer shrink-0"
          >
            Reopen Bill
          </button>
        </div>
      )}

      {/* Itemized Line Items Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-teal-600" />
              <span>Itemized Charge Items ({currentBill.items.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Categorized charges for Doctor Fee, Operation, Anesthesia, Room, Treatment, Meds, OT, Lab, Other
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
            Total Items Subtotal: {formatPKR(currentBill.subtotal)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-44">Category</th>
                <th className="py-3 px-4">Description / Service</th>
                <th className="py-3 px-4 w-24 text-center">Qty</th>
                <th className="py-3 px-4 w-32 text-right">Unit Price (PKR)</th>
                <th className="py-3 px-4 w-36 text-right">Amount (PKR)</th>
                {!isLocked && <th className="py-3 px-4 w-16 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentBill.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-center text-slate-400 font-mono">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {isLocked ? (
                      <span className="font-semibold text-slate-800">{item.description}</span>
                    ) : (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemFieldChange(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-teal-400 rounded text-xs font-semibold text-slate-800"
                      />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isLocked ? (
                      <span className="font-mono font-bold text-slate-800">{item.quantity}</span>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemFieldChange(item.id, 'quantity', e.target.value)}
                        className="w-16 px-2 py-1 text-center bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-800 focus:ring-1 focus:ring-teal-500"
                      />
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isLocked ? (
                      <span className="font-mono text-slate-700">{formatPKRShort(item.unitPrice)}</span>
                    ) : (
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemFieldChange(item.id, 'unitPrice', e.target.value)}
                        className="w-28 px-2 py-1 text-right bg-white border border-slate-300 rounded text-xs font-mono text-slate-800 focus:ring-1 focus:ring-teal-500"
                      />
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                    {formatPKRShort(item.amount)}
                  </td>
                  {!isLocked && (
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Line Item Manual Entry Form (Active when Draft) */}
        {!isLocked && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Add Line Item (Manual Entry)</span>
            </span>

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-[10px] text-slate-400 font-semibold">Quick Presets:</span>
              {PRESET_PROCEDURES.slice(0, 6).map((preset) => (
                <button
                  key={preset.desc}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-[10px] bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                >
                  +{preset.category.split(' ')[0]}: {formatPKRShort(preset.defaultPrice)}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddLineItem} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as BillCategory)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description / Procedure</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laparoscopic setup, Surgeon fee, Blood test..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono text-center"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit Price (PKR)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={newUnitPrice}
                  onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono text-right"
                />
              </div>

              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer shadow-xs"
                  title="Add Item"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Financial Calculations Summary Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Notes & Payment details */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Bill Details & Clinical Accounting Notes</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">Payment Method: {currentBill.paymentMethod || 'Cash'}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Hospital Billing Notes
            </label>
            {isLocked ? (
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {currentBill.notes || 'No special notes recorded.'}
              </p>
            ) : (
              <textarea
                rows={3}
                value={currentBill.notes || ''}
                onChange={(e) => {
                  onUpdateBill({
                    ...currentBill,
                    notes: e.target.value,
                  });
                }}
                placeholder="Enter admission details, surgery package remarks, insurance coverage or concessions..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-200 text-xs text-teal-950">
              <span className="font-bold block mb-1">Linked Patient Folder:</span>
              <p className="text-[11px] text-teal-800">
                {linkedPatient?.name} ({linkedPatient?.id}) • {linkedPatient?.visits.length} Recorded Visits
              </p>
              {onSelectPatientFolder && (
                <button
                  type="button"
                  onClick={() => onSelectPatientFolder(currentBill.patientId)}
                  className="mt-2 text-[11px] font-bold text-teal-700 hover:text-teal-900 underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Open Full Patient Folder & History</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-800 block mb-1">Finalization Seal:</span>
              <p className="text-[11px] text-slate-500">
                {currentBill.status === 'Finalized'
                  ? `Locked by ${currentBill.finalizedBy || 'Admin'} on ${currentBill.finalizedAt}`
                  : 'Currently in Draft mode. Finalize once all doctor fees and lab tests are confirmed.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Calculations Card (Subtotal, Discount, Net, Advance, Balance) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block pb-2 border-b border-slate-100">
            Auto-Calculated Financial Summary (PKR)
          </span>

          <div className="space-y-3 text-xs">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Gross Subtotal:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {formatPKR(currentBill.subtotal)}
              </span>
            </div>

            {/* Discount */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-600 font-medium">Discount (PKR):</span>
              {isLocked ? (
                <span className="font-mono font-bold text-rose-600">
                  - {formatPKR(currentBill.discount)}
                </span>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 font-mono">- Rs.</span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    max={currentBill.subtotal}
                    value={currentBill.discount}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    className="w-24 px-2 py-1 text-right bg-slate-50 border border-slate-300 rounded font-mono font-bold text-xs text-rose-600"
                  />
                </div>
              )}
            </div>

            {/* Net Total */}
            <div className="flex justify-between items-center py-2 border-y border-slate-200 text-sm font-black">
              <span className="text-slate-900">Net Payable Total:</span>
              <span className="font-mono text-teal-700 text-base">
                {formatPKR(currentBill.total)}
              </span>
            </div>

            {/* Advance / Payments Received */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-600 font-medium">Advance / Received:</span>
              {isLocked ? (
                <span className="font-mono font-bold text-emerald-700">
                  {formatPKR(currentBill.advanceReceived)}
                </span>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 font-mono">Rs.</span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={currentBill.advanceReceived}
                    onChange={(e) => handleAdvanceChange(Number(e.target.value))}
                    className="w-28 px-2 py-1 text-right bg-slate-50 border border-slate-300 rounded font-mono font-bold text-xs text-emerald-700"
                  />
                </div>
              )}
            </div>

            {/* Outstanding Balance */}
            <div className={`p-4 rounded-xl border mt-3 ${
              currentBill.balance === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs uppercase tracking-wide">
                  {currentBill.balance === 0 ? 'Full Paid Balance:' : 'Outstanding Balance:'}
                </span>
                <span className="font-mono font-extrabold text-lg">
                  {formatPKR(currentBill.balance)}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                {currentBill.balance === 0
                  ? 'All accounts settled. Ready for final discharge voucher.'
                  : `Remaining balance of ${formatPKR(currentBill.balance)} pending at discharge counter.`}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span>Print Official Invoice</span>
            </button>

            {isLocked ? (
              <button
                type="button"
                onClick={handleToggleFinalize}
                className="w-full py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer border border-amber-300"
              >
                <Unlock className="w-4 h-4" />
                <span>Reopen Bill to Edit</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleFinalize}
                className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finalize & Lock Bill</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {isPrintModalOpen && linkedPatient && (
        <PrintInvoiceModal
          bill={currentBill}
          patient={linkedPatient}
          visit={linkedVisit}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Patient, Visit, Bill, UserRole } from '../types/hms';
import { formatPKR, formatPKRShort } from '../utils/formatters';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Stethoscope, 
  PlusCircle, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Printer, 
  FileText, 
  Activity, 
  ArrowLeft,
  X,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PatientFolderViewProps {
  patient: Patient;
  linkedBills: Bill[];
  targetVisitCode?: string;
  onClose: () => void;
  onOpenBill: (billId: string) => void;
  onCreateBillForVisit: (patientId: string, visitCode: string) => void;
  onAddNewVisit: (patientId: string) => void;
  currentRole: UserRole;
  onPrintInvoiceModal?: (bill: Bill) => void;
}

export const PatientFolderView: React.FC<PatientFolderViewProps> = ({
  patient,
  linkedBills,
  targetVisitCode,
  onClose,
  onOpenBill,
  onCreateBillForVisit,
  onAddNewVisit,
  currentRole,
  onPrintInvoiceModal,
}) => {
  const [selectedVisitCode, setSelectedVisitCode] = useState<string>(
    targetVisitCode || (patient.visits.length > 0 ? patient.visits[patient.visits.length - 1].visitCode : '')
  );

  const selectedVisit = patient.visits.find((v) => v.visitCode === selectedVisitCode) || patient.visits[patient.visits.length - 1];

  const totalBilled = linkedBills.reduce((acc, b) => acc + b.total, 0);
  const totalPaid = linkedBills.reduce((acc, b) => acc + b.advanceReceived, 0);
  const totalBalance = linkedBills.reduce((acc, b) => acc + b.balance, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-sm font-extrabold bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-md">
                {patient.id}
              </span>
              <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
              <span className="text-xs text-slate-500 font-medium">
                ({patient.age} yrs • {patient.sex})
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {patient.visits.length} {patient.visits.length === 1 ? 'Visit Record' : 'Visit Records'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered on: {patient.registeredDate} • Permanent Electronic Medical Record (EMR)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onAddNewVisit(patient.id)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Next Visit</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Folder</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Target Visit Jump Alert if accessed via specific visit code */}
      {targetVisitCode && (
        <div className="bg-teal-50 border border-teal-300 rounded-xl p-3.5 flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-600 animate-bounce" />
            <span className="font-semibold">Direct Visit Jump:</span>
            <span>You jumped directly to visit code</span>
            <span className="font-mono font-bold bg-teal-200 px-2 py-0.5 rounded text-teal-900">
              {targetVisitCode}
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">Selected and expanded below</span>
        </div>
      )}

      {/* Grid: Left Column Demographics & Financial Summary / Right Column Visits & Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Demographics & Billing Account */}
        <div className="space-y-6">
          {/* Demographics Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Patient Demographics</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">PKR-MRN</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Age & Sex</span>
                  <span className="font-semibold text-slate-800">{patient.age} Years • {patient.sex}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Blood Group</span>
                  <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block">
                    {patient.bloodGroup || 'O+'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Phone Contact</span>
                <span className="font-medium text-slate-800 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.phone}</span>
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">CNIC / National Identity</span>
                <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {patient.cnic || '35201-XXXXXXX-X'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Residential Address</span>
                <span className="font-medium text-slate-700 flex items-start space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{patient.address}, {patient.city}</span>
                </span>
              </div>
            </div>

            {/* Permanent Barcode stamp */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <div className="font-mono text-xl tracking-[0.25em] text-slate-700 select-all">
                || | |||| || ||| ||
              </div>
              <span className="font-mono text-[10px] text-slate-400">*{patient.id}*</span>
            </div>
          </div>

          {/* Linked Billing Summary Card (Admin Only) */}
          {currentRole === 'admin' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Receipt className="w-3.5 h-3.5 text-teal-600" />
                  <span>Billing Account (PKR)</span>
                </span>
                <span className="text-xs font-semibold text-teal-700">
                  {linkedBills.length} {linkedBills.length === 1 ? 'Invoice' : 'Invoices'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-medium block">Total Billed</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">
                    {formatPKRShort(totalBilled)}
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-medium block">Received</span>
                  <span className="text-xs font-bold text-emerald-800 block mt-0.5">
                    {formatPKRShort(totalPaid)}
                  </span>
                </div>
                <div className={`p-2.5 rounded-lg border ${totalBalance > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] font-medium block ${totalBalance > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                    Balance Due
                  </span>
                  <span className={`text-xs font-bold block mt-0.5 ${totalBalance > 0 ? 'text-amber-800' : 'text-slate-700'}`}>
                    {formatPKRShort(totalBalance)}
                  </span>
                </div>
              </div>

              {/* Linked Invoices Quick List */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Invoices for this Patient
                </span>
                {linkedBills.length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                    No bills generated yet for this patient.
                  </div>
                ) : (
                  linkedBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="p-3 rounded-lg border border-slate-200 hover:border-teal-300 bg-slate-50/50 hover:bg-white transition-all text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900">{bill.id}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              bill.status === 'Finalized'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {bill.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          Visit: <span className="font-mono font-semibold text-teal-700">{bill.visitCode}</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">{formatPKR(bill.total)}</span>
                        <div className="flex items-center space-x-1 mt-1 justify-end">
                          <button
                            type="button"
                            onClick={() => onOpenBill(bill.id)}
                            className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Edit / View
                          </button>
                          {onPrintInvoiceModal && (
                            <button
                              type="button"
                              onClick={() => onPrintInvoiceModal(bill)}
                              className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] transition-colors cursor-pointer"
                              title="Print Invoice"
                            >
                              <Printer className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: All Visits with Dates & Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>All Visits & Clinical Timeline</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Click any visit to expand full details, vitals, and link billing
                </p>
              </div>

              <span className="text-xs text-slate-400">
                Sorted by latest visit
              </span>
            </div>

            {/* Visit selector chips */}
            <div className="flex items-center gap-2 py-3 overflow-x-auto border-b border-slate-100">
              {patient.visits.map((v) => {
                const isSelected = v.visitCode === selectedVisitCode;
                const isTarget = v.visitCode === targetVisitCode;
                return (
                  <button
                    key={v.visitCode}
                    type="button"
                    onClick={() => setSelectedVisitCode(v.visitCode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-2 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : isTarget
                        ? 'bg-teal-100 text-teal-900 border border-teal-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{v.visitCode}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                      isSelected ? 'bg-teal-700 text-teal-100' : 'bg-white text-slate-600'
                    }`}>
                      {v.visitType}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Visit Full Expanded Card */}
            {selectedVisit && (
              <div className="mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-base font-extrabold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-md border border-teal-200">
                      {selectedVisit.visitCode}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">
                          Visit #{selectedVisit.visitNumber} • {selectedVisit.visitType}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {selectedVisit.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Date: {selectedVisit.date} at {selectedVisit.time}
                      </span>
                    </div>
                  </div>

                  {currentRole === 'admin' && (
                    <div className="flex items-center space-x-2">
                      {linkedBills.some((b) => b.visitCode === selectedVisit.visitCode) ? (
                        <button
                          type="button"
                          onClick={() => {
                            const b = linkedBills.find((bill) => bill.visitCode === selectedVisit.visitCode);
                            if (b) onOpenBill(b.id);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-teal-400" />
                          <span>View Linked Bill</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onCreateBillForVisit(patient.id, selectedVisit.visitCode)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>+ Create Bill for this Visit</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Consultant & Room */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Assigned Consultant</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {selectedVisit.assignedDoctor}
                    </span>
                    <span className="text-[11px] text-teal-700 font-medium">
                      Department: {selectedVisit.department}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Room / Ward Allocation</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {selectedVisit.roomNo || 'Outpatient Consultation Area'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Admission Type: {selectedVisit.visitType}
                    </span>
                  </div>
                </div>

                {/* Complaint & Clinical Notes */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Chief Complaint & Presentation
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {selectedVisit.complaint}
                  </p>
                  {selectedVisit.clinicalNotes && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 font-semibold block mb-1">Clinical Evaluation & Notes:</span>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 italic">
                        {selectedVisit.clinicalNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Vitals Grid if available */}
                {selectedVisit.vitals && (
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Recorded Vitals
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedVisit.vitals.bp || '120/80'}</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Pulse</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedVisit.vitals.pulse} bpm</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Temperature</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedVisit.vitals.temp}</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Weight</span>
                        <span className="font-bold text-slate-800 font-mono">{selectedVisit.vitals.weight || '65 kg'}</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">SpO2 Oxygen</span>
                        <span className="font-bold text-emerald-700 font-mono">{selectedVisit.vitals.spo2}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline of other visits */}
            <div className="mt-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                All Recorded Visits Summary ({patient.visits.length})
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {patient.visits.map((v) => (
                  <div
                    key={v.visitCode}
                    onClick={() => setSelectedVisitCode(v.visitCode)}
                    className={`p-3 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      v.visitCode === selectedVisitCode ? 'bg-teal-50/60 font-semibold' : 'hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-teal-800 bg-slate-100 px-2 py-0.5 rounded">
                        {v.visitCode}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{v.visitType}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">{v.assignedDoctor}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 truncate max-w-sm block">
                          {v.complaint}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">{v.date}</span>
                      <span className="text-[10px] font-semibold text-teal-700">{v.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

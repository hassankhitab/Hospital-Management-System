import React from 'react';
import { Bill, Patient, Visit } from '../types/hms';
import { formatPKR, formatPKRShort } from '../utils/formatters';
import { Printer, Download, X, HeartPulse, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PrintInvoiceModalProps {
  bill: Bill;
  patient: Patient;
  visit?: Visit;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  bill,
  patient,
  visit,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-300 my-8 overflow-hidden print:m-0 print:border-none print:shadow-none print:rounded-none">
        {/* Modal Action Bar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-semibold">Official Hospital Invoice Preview (PKR)</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 text-slate-800 space-y-6 bg-white" id="printable-invoice">
          {/* Hospital Letterhead Header */}
          <div className="border-b-2 border-teal-700 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-md">
                <HeartPulse className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  MEDPULSE CARE HOSPITAL
                </h1>
                <p className="text-xs font-semibold text-teal-800 tracking-wide uppercase">
                  Tertiary Healthcare & Research Institute • Shifa Complex
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Plot 12-B, Hospital Boulevard, Sector H-8/4, Islamabad, Pakistan
                </p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                  <span>Tel: +92 (51) 844-0000</span>
                  <span>•</span>
                  <span>UAN: 111-MED-HMS</span>
                  <span>•</span>
                  <span className="font-mono font-semibold text-slate-700">NTN: 4892011-8</span>
                </div>
              </div>
            </div>

            <div className="text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-md mb-2">
                HOSPITAL TAX INVOICE
              </span>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-slate-400">Invoice No: </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{bill.id}</span>
                </div>
                <div>
                  <span className="text-slate-400">Date & Time: </span>
                  <span className="font-medium text-slate-800">{bill.createdAt}</span>
                </div>
                <div>
                  <span className="text-slate-400">Bill Status: </span>
                  <span className={`font-bold uppercase text-[11px] px-2 py-0.5 rounded ${
                    bill.status === 'Finalized' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {bill.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient & Visit Demographics Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{patient.name}</span>
              <span className="text-[11px] text-slate-500">{patient.age} Yrs / {patient.sex}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">MRN (Patient ID)</span>
              <span className="font-mono font-bold text-teal-800 text-sm mt-0.5 block">{patient.id}</span>
              <span className="text-[11px] text-slate-500">Phone: {patient.phone}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Visit Code</span>
              <span className="font-mono font-bold text-teal-800 text-sm mt-0.5 block">{bill.visitCode}</span>
              <span className="text-[11px] text-slate-500">Type: {visit?.visitType || 'Clinical Visit'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Attending Consultant</span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                {visit?.assignedDoctor || 'Dr. Tariq Mahmood'}
              </span>
              <span className="text-[11px] text-slate-500">{visit?.roomNo || 'Private Deluxe 204'}</span>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-36">Category</th>
                  <th className="py-3 px-4">Description / Procedure</th>
                  <th className="py-3 px-4 w-16 text-center">Qty</th>
                  <th className="py-3 px-4 w-28 text-right">Unit Price</th>
                  <th className="py-3 px-4 w-32 text-right">Total (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                      {formatPKRShort(item.unitPrice)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatPKRShort(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Billing Notes & Terms
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {bill.notes || 'This invoice covers all room, surgery, anesthesia, nursing care, and hospital consumables during the indicated stay.'}
              </p>
              <div className="pt-2 text-[10px] text-slate-400 space-y-0.5">
                <p>• All fees are billed in Pakistani Rupees (PKR).</p>
                <p>• Valid with official hospital stamp and authorized signature.</p>
                <p>• Refund/dispute requests must be filed within 7 working days.</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Gross Subtotal:</span>
                <span className="font-mono font-semibold text-slate-800">{formatPKR(bill.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Hospital Discount:</span>
                <span className="font-mono font-semibold text-rose-600">- {formatPKR(bill.discount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b-2 border-slate-900 text-sm font-bold">
                <span className="text-slate-900">Net Amount Payable:</span>
                <span className="font-mono text-teal-800">{formatPKR(bill.total)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-800">
                <span className="font-semibold">Advance / Paid Received:</span>
                <span className="font-mono font-bold">{formatPKR(bill.advanceReceived)}</span>
              </div>
              <div className={`flex justify-between py-2 px-3 rounded-lg font-bold text-sm ${
                bill.balance === 0 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                <span>{bill.balance === 0 ? 'Balance (Fully Paid):' : 'Outstanding Balance Due:'}</span>
                <span className="font-mono">{formatPKR(bill.balance)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="h-12 border-b border-dashed border-slate-300 mx-6" />
              <span className="font-semibold text-slate-700 block mt-2">Patient / Attendant</span>
              <span className="text-[10px] text-slate-400">Signature</span>
            </div>

            <div>
              <div className="h-12 flex items-center justify-center">
                <div className="border border-teal-600 rounded-full px-3 py-1 text-[10px] font-bold text-teal-800 uppercase tracking-wider rotate-[-5deg] bg-teal-50">
                  SHIFA HMS VERIFIED
                </div>
              </div>
              <span className="font-semibold text-slate-700 block mt-2">Cashier / Billing Desk</span>
              <span className="text-[10px] text-slate-400">Paid Receipt Stamp</span>
            </div>

            <div>
              <div className="h-12 border-b border-dashed border-slate-300 mx-6 flex items-end justify-center pb-1">
                <span className="font-mono text-[11px] text-slate-600 italic">Dr. Arshad Khan (MS)</span>
              </div>
              <span className="font-semibold text-slate-700 block mt-2">Medical Superintendent</span>
              <span className="text-[10px] text-slate-400">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

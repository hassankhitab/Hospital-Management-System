import React, { useState } from 'react';
import { PharmacyItem, PharmacyPrescription, UserRole, Patient } from '../types/hms';
import { INITIAL_PHARMACY_ITEMS, INITIAL_PRESCRIPTIONS } from '../data/mockData';
import { formatPKR, formatPKRShort } from '../utils/formatters';
import { 
  Pill, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PackageCheck, 
  Calendar, 
  ShieldCheck,
  Check,
  Building,
  RefreshCw
} from 'lucide-react';

interface PharmacyPageProps {
  currentRole: UserRole;
  patients: Patient[];
  onOpenPatientFolder?: (patientId: string) => void;
}

export const PharmacyPage: React.FC<PharmacyPageProps> = ({
  currentRole,
  patients,
  onOpenPatientFolder,
}) => {
  const [prescriptions, setPrescriptions] = useState<PharmacyPrescription[]>(INITIAL_PRESCRIPTIONS);
  const [inventory, setInventory] = useState<PharmacyItem[]>(INITIAL_PHARMACY_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'queue' | 'inventory'>('queue');

  // Dispense prescription
  const handleDispense = (prescriptionId: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id === prescriptionId) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...rx,
            status: 'Dispensed',
            dispensedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          };
        }
        return rx;
      })
    );
  };

  // Filtered Inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Antibiotic', 'Analgesic', 'IV Fluid', 'Cardiac', 'Anesthetic', 'Gastro'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              CENTRAL DISPENSARY
            </span>
            <h1 className="text-xl font-bold text-slate-900">Hospital Central Pharmacy & Dispensing</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Clinical prescription fulfillment linked to visit codes, medicine inventory stock, and pricing in PKR.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'queue' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Prescription Queue ({prescriptions.filter(p => p.status === 'Pending').length} Pending)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Medicine Inventory ({inventory.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        /* Prescription Dispensing Queue */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Prescriptions from OPD / IPD Doctors
            </h3>
            <span className="text-xs text-slate-400">
              Dispensed items automatically generate medicine charges in patient billing
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {prescriptions.map((rx) => {
              const isPending = rx.status === 'Pending';
              const rxTotal = rx.medicines.reduce((acc, m) => acc + m.qty * m.unitPricePKR, 0);

              return (
                <div
                  key={rx.id}
                  className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                    isPending ? 'border-amber-300 ring-1 ring-amber-300/30' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm font-extrabold bg-slate-100 px-2.5 py-1 rounded text-slate-800 border border-slate-200">
                        {rx.id}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{rx.patientName}</span>
                          <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {rx.patientId}
                          </span>
                          <span className="font-mono text-xs text-slate-500">
                            Visit: {rx.visitCode}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Prescribed by <strong>{rx.doctorName}</strong> on {rx.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          isPending
                            ? 'bg-amber-100 text-amber-900 border border-amber-200 animate-pulse'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {isPending ? 'Awaiting Dispensing' : 'Dispensed & Verified'}
                      </span>

                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => handleDispense(rx.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                        >
                          <PackageCheck className="w-4 h-4" />
                          <span>Dispense Medicines</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          Dispensed: {rx.dispensedAt}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Itemized Medicine list */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="py-2 px-3">Medicine & Strength</th>
                          <th className="py-2 px-3">Dosage & Frequency</th>
                          <th className="py-2 px-3 w-16 text-center">Qty</th>
                          <th className="py-2 px-3 w-28 text-right">Unit Price</th>
                          <th className="py-2 px-3 w-32 text-right">Total (PKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rx.medicines.map((med, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {med.name}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-medium">
                              {med.dosage}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                              {med.qty}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                              {formatPKRShort(med.unitPricePKR)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {formatPKRShort(med.qty * med.unitPricePKR)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Pharmacist: Zahid Qureshi, RPh</span>
                    <div className="font-mono text-sm font-bold text-slate-900">
                      Total Rx Value: <span className="text-teal-700">{formatPKR(rxTotal)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Medicine Inventory Tab */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by brand name, generic formula, or batch #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Medicine Brand</th>
                  <th className="py-3 px-4">Generic Formula</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Packaging</th>
                  <th className="py-3 px-4 text-center">In Stock</th>
                  <th className="py-3 px-4 text-right">Unit Price (PKR)</th>
                  <th className="py-3 px-4">Batch & Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.medicineName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 italic">
                      {item.genericName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {item.unit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                        item.stock < 100 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.stock} Units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatPKRShort(item.unitPricePKR)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {item.batchNumber} • Exp {item.expiryDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

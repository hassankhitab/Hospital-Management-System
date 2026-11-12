import React from 'react';
import { Patient, Bill, NurseryBaby, PharmacyPrescription } from '../types/hms';
import { formatPKRShort } from '../utils/formatters';
import { Users, Receipt, Baby, Pill, ArrowRight } from 'lucide-react';

interface AdminOverviewProps {
  patients: Patient[];
  bills: Bill[];
  babies: NurseryBaby[];
  prescriptions: PharmacyPrescription[];
  onOpenFolder: (patientId: string, visitCode?: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  patients,
  bills,
  babies,
  prescriptions,
  onOpenFolder,
  onNavigateToTab,
}) => {
  const totalVisits = patients.reduce((acc, p) => acc + p.visits.length, 0);
  const totalBilledPKR = bills.reduce((acc, b) => acc + b.total, 0);
  const totalReceivedPKR = bills.reduce((acc, b) => acc + b.advanceReceived, 0);
  const totalPendingPKR = bills.reduce((acc, b) => acc + b.balance, 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Oghi Medical & Surgical Complex</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin: <strong className="text-slate-700">Amir Ashraf</strong> • Overview of patients, billing (PKR), nursery, and pharmacy
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateToTab('registration')}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-xs font-semibold cursor-pointer"
          >
            + Register Patient
          </button>
          <button
            onClick={() => onNavigateToTab('billing')}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold cursor-pointer"
          >
            Billing (Page 2)
          </button>
        </div>
      </div>

      {/* 4 Stat Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase text-slate-500">Patients</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{patients.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{totalVisits} total visits</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase text-slate-500">Total Billed</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatPKRShort(totalBilledPKR)}</div>
          <p className="text-[11px] text-teal-700 mt-0.5">Paid: {formatPKRShort(totalReceivedPKR)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase text-slate-500">Nursery (NICU)</span>
            <Baby className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{babies.length} Cribs</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{babies.filter(b => b.phototherapy).length} phototherapy</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase text-slate-500">Pharmacy Queue</span>
            <Pill className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {prescriptions.filter(p => p.status === 'Pending').length} Pending
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{prescriptions.length} total prescriptions</p>
        </div>
      </div>

      {/* Patient Directory Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Patients ({patients.length})
          </h2>
          <button
            onClick={() => onNavigateToTab('directory')}
            className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <span>All Folders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 w-28">Patient ID</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Age / Sex</th>
                <th className="py-2.5 px-4">City</th>
                <th className="py-2.5 px-4 text-center">Visits</th>
                <th className="py-2.5 px-4">Latest Doctor</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => {
                const latest = p.visits[p.visits.length - 1];
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-semibold text-teal-700">
                      {p.id}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {p.age}y / {p.sex}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {p.city}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">
                      {p.visits.length}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 truncate max-w-xs">
                      {latest ? latest.assignedDoctor : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onOpenFolder(p.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded cursor-pointer"
                      >
                        Open Folder
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

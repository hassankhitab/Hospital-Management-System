import React from 'react';
import { Patient, Bill, NurseryBaby, PharmacyPrescription } from '../types/hms';
import { formatPKR, formatPKRShort } from '../utils/formatters';
import { 
  Users, 
  Receipt, 
  Baby, 
  Pill, 
  Activity, 
  Search, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  ShieldCheck,
  Building2
} from 'lucide-react';

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
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-teal-800/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Executive Admin Dashboard</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Hospital Information & Operations Management
            </h1>
            <p className="text-slate-300 text-xs leading-relaxed">
              Real-time demo environment with 8 pre-seeded patients, sequential visit numbering, multi-category PKR billing, NICU incubator monitoring, and clinical pharmacy dispensing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('registration')}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <span>+ Register Patient (Page 1)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateToTab('billing')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Billing Portal (Page 2)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Quick Search Client Demonstration Notice */}
      <div className="bg-teal-50 border-2 border-teal-300/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-teal-950">
                  Admin Quick Search Verification Guide
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200 text-teal-900">
                  Top Header Always Active
                </span>
              </div>
              <p className="text-xs text-teal-900/80 mt-1">
                Test the exact prompt search specifications using the search bar at the very top:
              </p>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenFolder('P-000012')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 text-xs font-mono font-bold transition-all shadow-2xs cursor-pointer flex items-center space-x-1"
            >
              <span>Type &quot;12&quot;</span>
              <span className="text-[10px] font-sans font-normal text-slate-500">→ Ayesha Folder</span>
            </button>

            <button
              onClick={() => onOpenFolder('P-000012', 'P-000012-V03')}
              className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-mono font-bold transition-all shadow-2xs cursor-pointer flex items-center space-x-1"
            >
              <span>&quot;P-000012-V03&quot;</span>
              <span className="text-[10px] font-sans font-normal text-teal-200">→ Direct Visit Jump</span>
            </button>

            <button
              onClick={() => onOpenFolder('P-000007', 'P-000007-V01')}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 text-xs font-mono font-bold transition-all shadow-2xs cursor-pointer flex items-center space-x-1"
            >
              <span>&quot;P-000007-V01&quot;</span>
              <span className="text-[10px] font-sans font-normal text-slate-500">→ ER Trauma Bill</span>
            </button>
          </div>
        </div>
      </div>

      {/* High Level Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Patients</span>
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{patients.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalVisits} Lifetime recorded visits
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Billed (PKR)</span>
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{formatPKRShort(totalBilledPKR)}</div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Received: {formatPKRShort(totalReceivedPKR)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">NICU Occupancy</span>
            <Baby className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{babies.length} Cribs</div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            {babies.filter(b => b.phototherapy).length} under phototherapy
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rx Dispensing</span>
            <Pill className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{prescriptions.length} Prescriptions</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {prescriptions.filter(p => p.status === 'Pending').length} Pending in queue
          </span>
        </div>
      </div>

      {/* Pre-filled Sample Patients Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Pre-Filled Sample Patients ({patients.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Click any patient to open their medical folder with demographics, visits timeline, and linked bills
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('directory')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1 cursor-pointer"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-28">Patient ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Age / Sex</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4 text-center">Visits</th>
                <th className="py-3 px-4">Latest Complaint & Doctor</th>
                <th className="py-3 px-4 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => {
                const latest = p.visits[p.visits.length - 1];
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-extrabold text-teal-800 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                        {p.id}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.age}y / {p.sex}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.city}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                        {p.visits.length}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 truncate max-w-xs font-medium">
                        {latest ? latest.complaint : 'N/A'}
                      </div>
                      <div className="text-[11px] text-teal-700">
                        {latest ? `${latest.assignedDoctor} (${latest.visitType})` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onOpenFolder(p.id)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-bold transition-all shadow-2xs cursor-pointer"
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

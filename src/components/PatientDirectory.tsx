import React, { useState } from 'react';
import { Patient, Bill, UserRole } from '../types/hms';
import { formatPKRShort } from '../utils/formatters';
import { 
  Users, 
  Search, 
  FolderOpen, 
  PlusCircle, 
  Receipt, 
  Calendar, 
  Phone, 
  MapPin,
  ChevronRight,
  Filter
} from 'lucide-react';

interface PatientDirectoryProps {
  patients: Patient[];
  bills: Bill[];
  onOpenFolder: (patientId: string, visitCode?: string) => void;
  onAddNewVisit: (patientId: string) => void;
  onOpenBillForPatient?: (patientId: string) => void;
  currentRole: UserRole;
}

export const PatientDirectory: React.FC<PatientDirectoryProps> = ({
  patients,
  bills,
  onOpenFolder,
  onAddNewVisit,
  onOpenBillForPatient,
  currentRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  const cities = ['All', 'Lahore', 'Islamabad', 'Rawalpindi', 'Karachi', 'Multan', 'Peshawar'];

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      p.visits.some((v) => v.visitCode.toLowerCase().includes(term) || v.assignedDoctor.toLowerCase().includes(term));
    const matchesCity = selectedCity === 'All' || p.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              CLINICAL DIRECTORY
            </span>
            <h1 className="text-xl font-bold text-slate-900">Hospital Patient Directory & Medical Folders</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete registry of all registered patients, lifetime visits history, and linked financial accounts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Total Patients: <strong className="text-slate-900">{patients.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID (e.g. 12 or P-000012), visit code, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>City:</span>
          </span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCity === city
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-28">Patient ID</th>
                <th className="py-3 px-4">Patient Name & Demographics</th>
                <th className="py-3 px-4">Contact & City</th>
                <th className="py-3 px-4 text-center">Lifetime Visits</th>
                <th className="py-3 px-4">Latest Visit & Consultant</th>
                <th className="py-3 px-4 text-right">Linked Billing</th>
                <th className="py-3 px-4 text-center w-36">Folder Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => {
                const latestVisit = patient.visits[patient.visits.length - 1];
                const patientBills = bills.filter((b) => b.patientId === patient.id);
                const hasPendingBill = patientBills.some((b) => b.balance > 0);

                return (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-extrabold text-teal-800 bg-teal-50 px-2 py-1 rounded border border-teal-200 text-xs">
                        {patient.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{patient.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {patient.age} yrs • {patient.sex} • Blood: <span className="text-rose-600 font-semibold">{patient.bloodGroup || 'O+'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{patient.phone}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{patient.city}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {patient.visits.length} {patient.visits.length === 1 ? 'Visit' : 'Visits'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {latestVisit ? (
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-teal-700 font-bold">{latestVisit.visitCode}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {latestVisit.visitType}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate max-w-xs mt-0.5">
                            {latestVisit.assignedDoctor}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {patientBills.length > 0 ? (
                        <div>
                          <span className="font-bold text-slate-900 block font-mono">
                            {formatPKRShort(patientBills.reduce((acc, b) => acc + b.total, 0))}
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            hasPendingBill ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {hasPendingBill ? 'Balance Due' : 'Paid / Settled'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No Invoices</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenFolder(patient.id)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer shadow-xs"
                          title="Open Patient Folder"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Folder</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddNewVisit(patient.id)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                          title="Add Next Visit"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

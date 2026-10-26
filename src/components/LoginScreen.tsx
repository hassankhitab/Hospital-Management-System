import React from 'react';
import { UserRole, UserSession } from '../types/hms';
import { DEMO_USERS } from '../data/mockData';
import { 
  ShieldCheck, 
  Stethoscope, 
  Baby, 
  Pill, 
  ArrowRight, 
  CheckCircle2,
  Building2,
  HeartPulse
} from 'lucide-react';

interface LoginScreenProps {
  onSelectRole: (user: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSelectRole }) => {
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-8 h-8 text-teal-600" />;
      case 'doctor':
        return <Stethoscope className="w-8 h-8 text-blue-600" />;
      case 'nursery':
        return <Baby className="w-8 h-8 text-rose-600" />;
      case 'pharmacist':
        return <Pill className="w-8 h-8 text-emerald-600" />;
    }
  };

  const getRoleAccess = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          scope: 'Full Access (All Modules)',
          items: ['Patient Registration & Folders', 'Admin Quick Search', 'Hospital Itemized Billing (PKR)', 'Nursery & NICU Care', 'Central Pharmacy'],
          badge: 'Administrator Role',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
          btnBg: 'bg-teal-600 hover:bg-teal-700',
        };
      case 'doctor':
        return {
          scope: 'Patient Registration Only',
          items: ['OPD & IPD Registration', 'Generate Patient IDs & Visits', 'Clinical Complaints & History'],
          badge: 'Medical Consultant Role',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          btnBg: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'nursery':
        return {
          scope: 'Nursery Care Unit Only',
          items: ['NICU Incubators & Cribs', 'Phototherapy Tracking', 'Feeding Schedules & Vitals', 'Maternal Patient Linking'],
          badge: 'NICU Nursing Role',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
          btnBg: 'bg-rose-600 hover:bg-rose-700',
        };
      case 'pharmacist':
        return {
          scope: 'Central Pharmacy Only',
          items: ['Dispense Prescription Queue', 'Medicine Stock & Inventory (PKR)', 'Batch & Expiry Auditing'],
          badge: 'Clinical Pharmacy Role',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700',
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background glowing medical grid accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/30 via-slate-900/80 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl text-white tracking-tight">MedPulse Care</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  HMS PROTOYPE
                </span>
              </div>
              <p className="text-xs text-slate-400">Hospital Information & Clinical Management System (Pakistan Edition)</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>Shifa Complex • Main Campus</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-emerald-400 font-medium">Currency: PKR (₨)</span>
          </div>
        </div>
      </header>

      {/* Role Picker Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-medium mb-3">
            <span>Demo Client Showcase</span>
            <span>•</span>
            <span>No Passwords Required</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Select Your Role to Access Portal
          </h1>
          <p className="mt-2 text-slate-300 text-sm">
            Experience role-based access control. Each role only unlocks its authorized modules according to clinical compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEMO_USERS.map((user) => {
            const access = getRoleAccess(user.role);
            return (
              <div
                key={user.id}
                onClick={() => onSelectRole(user)}
                className="group relative bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/60 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      {getRoleIcon(user.role)}
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${access.badgeColor}`}>
                      {access.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                    {user.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{user.title}</p>
                  <p className="text-[11px] text-teal-400/90 mt-1 font-mono uppercase tracking-wider">
                    {user.department}
                  </p>

                  <div className="my-5 border-t border-slate-700/60 pt-4">
                    <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Permissions</span>
                      <span className="text-[10px] text-teal-400 lowercase">{access.scope}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {access.items.map((item, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mt-4 w-full py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md group-hover:shadow-lg ${access.btnBg}`}
                >
                  <span>Launch as {user.role === 'admin' ? 'Admin' : user.role === 'doctor' ? 'Doctor' : user.role === 'nursery' ? 'Nursery' : 'Pharmacist'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Highlights for Client */}
        <div className="mt-12 bg-slate-800/40 border border-slate-800 rounded-xl p-4 max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span className="text-slate-300 font-medium">8 Sample Patients Pre-loaded</span>
            <span>(incl. P-000012 with 3 visits)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-300 font-medium">PKR Currency & Tax Billing</span>
            <span>(Draft & Finalized Bills with Print View)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-300 font-medium">Instant Jump:</span>
            <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-teal-300 border border-slate-700">P-000012-V03</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur px-6 py-4 text-center text-xs text-slate-500">
        <p>MedPulse Hospital Management System • Demo Prototype for Client Evaluation • Built with React & Tailwind CSS</p>
      </footer>
    </div>
  );
};

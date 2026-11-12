import React from 'react';
import { UserRole, UserSession } from '../types/hms';
import { DEMO_USERS } from '../data/mockData';
import { ShieldCheck, Stethoscope, Baby, Pill, ArrowRight, Building2 } from 'lucide-react';

interface LoginScreenProps {
  onSelectRole: (user: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSelectRole }) => {
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-5 h-5 text-teal-700" />;
      case 'doctor':
        return <Stethoscope className="w-5 h-5 text-teal-700" />;
      case 'nursery':
        return <Baby className="w-5 h-5 text-teal-700" />;
      case 'pharmacist':
        return <Pill className="w-5 h-5 text-teal-700" />;
    }
  };

  const getRoleScope = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Full access: All pages & billing';
      case 'doctor':
        return 'Patient Registration only';
      case 'nursery':
        return 'Nursery page only';
      case 'pharmacist':
        return 'Pharmacy page only';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* Simple Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
              OMSC
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Oghi Medical & Surgical Complex</h1>
              <p className="text-xs text-slate-500">Admin: Amir Ashraf • Currency: PKR (₨)</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Oghi Complex</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10 w-full flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Select Role to Sign In</h2>
          <p className="text-sm text-slate-600 mt-1">
            Pick a demo user account below to preview role-based access. No password required.
          </p>
        </div>

        {/* Simple 4-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_USERS.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectRole(user)}
              className="bg-white border border-slate-200 hover:border-teal-600 rounded-lg p-5 cursor-pointer transition-all hover:shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center mb-3">
                  {getRoleIcon(user.role)}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 capitalize">
                  {user.role}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{user.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{user.title}</p>
                
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Access:</span>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">{getRoleScope(user.role)}</p>
                </div>
              </div>

              <button
                type="button"
                className="mt-5 w-full py-2 px-3 rounded-md bg-slate-900 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Demo Helper note */}
        <div className="mt-8 bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-between">
          <span>8 Sample Patients Pre-filled with Visits & 3 Bills</span>
          <span className="text-slate-400 font-mono text-[11px]">Direct Visit Jump: P-000012-V03</span>
        </div>
      </main>

      {/* Simple Footer with Developer Credit */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3.5 text-center text-xs text-slate-500">
        <div>Oghi Medical & Surgical Complex • Admin: Amir Ashraf • Currency: PKR (₨)</div>
        <div className="mt-1 text-[11px] text-slate-400">
          Project Developed by <span className="font-semibold text-slate-700">Hassan Khitab</span>
        </div>
      </footer>
    </div>
  );
};

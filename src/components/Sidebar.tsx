import React from 'react';
import { UserRole } from '../types/hms';
import { 
  HeartPulse, 
  UserPlus, 
  Receipt, 
  Baby, 
  Pill, 
  Users, 
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  Building,
  CheckCircle
} from 'lucide-react';

export type ActiveTab = 'overview' | 'registration' | 'billing' | 'nursery' | 'pharmacy' | 'directory';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
  patientCount: number;
  billCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  onLogout,
  patientCount,
  billCount,
}) => {
  // Define menu items for each role
  const getNavItems = () => {
    switch (currentRole) {
      case 'admin':
        return [
          {
            id: 'overview' as ActiveTab,
            label: 'Admin Overview',
            icon: LayoutDashboard,
            badge: null,
            description: 'Metrics, quick stats & recent logs',
          },
          {
            id: 'registration' as ActiveTab,
            label: 'Patient Registration',
            icon: UserPlus,
            badge: 'PAGE 1',
            description: 'OPD / IPD / ER & Visit Codes',
          },
          {
            id: 'directory' as ActiveTab,
            label: 'Patient Folders',
            icon: Users,
            badge: `${patientCount}`,
            description: 'All 8 Patients, history & bills',
          },
          {
            id: 'billing' as ActiveTab,
            label: 'Hospital Billing (PKR)',
            icon: Receipt,
            badge: 'PAGE 2',
            description: 'Itemized manual entry & invoices',
          },
          {
            id: 'nursery' as ActiveTab,
            label: 'Nursery (NICU)',
            icon: Baby,
            badge: '3 Cribs',
            description: 'Infant care, phototherapy & vitals',
          },
          {
            id: 'pharmacy' as ActiveTab,
            label: 'Central Pharmacy',
            icon: Pill,
            badge: 'Rx Queue',
            description: 'Dispensing & medicine stock in PKR',
          },
        ];
      case 'doctor':
        return [
          {
            id: 'registration' as ActiveTab,
            label: 'Patient Registration',
            icon: UserPlus,
            badge: 'Active Portal',
            description: 'Register patient & create visits',
          },
        ];
      case 'nursery':
        return [
          {
            id: 'nursery' as ActiveTab,
            label: 'Nursery Care (NICU)',
            icon: Baby,
            badge: 'NICU Floor',
            description: 'Incubators, phototherapy, feeds',
          },
        ];
      case 'pharmacist':
        return [
          {
            id: 'pharmacy' as ActiveTab,
            label: 'Central Pharmacy',
            icon: Pill,
            badge: 'Dispensary',
            description: 'Fulfill prescriptions & stock',
          },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 select-none border-r border-slate-800">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white text-base tracking-tight">MedPulse HMS</span>
            </div>
            <span className="text-[10px] text-teal-400 font-mono font-medium uppercase tracking-wider">
              {currentRole === 'admin' ? 'Super Admin Mode' : `${currentRole} View`}
            </span>
          </div>
        </div>

        {/* Role restriction banner if not admin */}
        {currentRole !== 'admin' && (
          <div className="mx-3 mt-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center space-x-1.5 text-teal-400 font-semibold mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="capitalize">{currentRole} Access Enforced</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {currentRole === 'doctor' && 'Authorized for Patient Registration and visit generation only.'}
              {currentRole === 'nursery' && 'Authorized for Nursery / NICU Care Unit monitoring only.'}
              {currentRole === 'pharmacist' && 'Authorized for Pharmacy Dispensing & Inventory only.'}
            </p>
          </div>
        )}

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {currentRole === 'admin' ? 'Hospital Modules' : 'Authorized Module'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-md shadow-teal-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                    }`}
                  />
                  <div className="truncate">
                    <p className="text-xs leading-tight font-medium">{item.label}</p>
                    <p className={`text-[10px] truncate ${isActive ? 'text-teal-100' : 'text-slate-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive
                        ? 'bg-teal-700/80 text-teal-100 border border-teal-500/40'
                        : 'bg-slate-800 text-teal-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Info & Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="bg-slate-800/40 rounded-lg p-2.5 text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between items-center">
            <span>Currency:</span>
            <span className="font-bold text-slate-200">PKR (₨)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Facility:</span>
            <span className="text-slate-300">Shifa Complex</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Server:</span>
            <span className="text-emerald-400 font-medium">Local React State</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2 px-3 rounded-lg border border-slate-700 hover:border-rose-500/60 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit / Role Picker</span>
        </button>
      </div>
    </aside>
  );
};

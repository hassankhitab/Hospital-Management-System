import React from 'react';
import { UserRole } from '../types/hms';
import { 
  LayoutDashboard, 
  UserPlus, 
  Receipt, 
  Baby, 
  Pill, 
  Users, 
  LogOut 
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
  const getNavItems = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { id: 'overview' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
          { id: 'registration' as ActiveTab, label: 'Patient Registration', icon: UserPlus, badge: 'Page 1' },
          { id: 'directory' as ActiveTab, label: 'Patient Folders', icon: Users, badge: `${patientCount}` },
          { id: 'billing' as ActiveTab, label: 'Billing (PKR)', icon: Receipt, badge: 'Page 2' },
          { id: 'nursery' as ActiveTab, label: 'Nursery (NICU)', icon: Baby },
          { id: 'pharmacy' as ActiveTab, label: 'Pharmacy', icon: Pill },
        ];
      case 'doctor':
        return [
          { id: 'registration' as ActiveTab, label: 'Patient Registration', icon: UserPlus },
        ];
      case 'nursery':
        return [
          { id: 'nursery' as ActiveTab, label: 'Nursery Care (NICU)', icon: Baby },
        ];
      case 'pharmacist':
        return [
          { id: 'pharmacy' as ActiveTab, label: 'Pharmacy', icon: Pill },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Simple Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
            OMSC
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-900 leading-snug truncate" title="Oghi Medical & Surgical Complex">
              Oghi Medical & Surgical Complex
            </h2>
            <p className="text-[11px] text-slate-500 capitalize">{currentRole} portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between text-xs font-medium cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Switch user & Developer credit */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <div className="text-[11px] text-slate-500 px-1 leading-snug">
          <div>Currency: <strong className="text-slate-700">PKR (₨)</strong></div>
          <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
            Project Developed by <span className="font-semibold text-slate-600">Hassan Khitab</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full py-1.5 px-3 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit to Role Picker</span>
        </button>
      </div>
    </aside>
  );
};

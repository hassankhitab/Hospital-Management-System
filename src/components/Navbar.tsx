import React, { useState, useRef, useEffect } from 'react';
import { UserSession, Patient } from '../types/hms';
import { parseSearchQuery } from '../utils/formatters';
import { 
  Search, 
  History, 
  UserCircle2, 
  LogOut, 
  Sparkles, 
  ChevronRight,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserSession;
  patients: Patient[];
  recentPatients: Patient[];
  onOpenPatientFolder: (patientId: string, targetVisitCode?: string) => void;
  onSwitchRole: (user: UserSession) => void;
  onLogout: () => void;
  availableUsers: UserSession[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  patients,
  recentPatients,
  onOpenPatientFolder,
  onSwitchRole,
  onLogout,
  availableUsers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live search suggestions
  const parsed = parseSearchQuery(searchQuery);
  const queryTrimmed = searchQuery.trim().toLowerCase();

  const matchingPatients = queryTrimmed
    ? patients.filter((p) => {
        const idMatches = p.id.toLowerCase().includes(queryTrimmed) || p.id.replace('p-', '').replace(/^0+/, '').includes(queryTrimmed);
        const nameMatches = p.name.toLowerCase().includes(queryTrimmed);
        const phoneMatches = p.phone.replace(/\D/g, '').includes(queryTrimmed.replace(/\D/g, ''));
        const visitMatches = p.visits.some((v) => v.visitCode.toLowerCase().includes(queryTrimmed));
        return idMatches || nameMatches || phoneMatches || visitMatches;
      })
    : [];

  // Look for specific visit matches if query matches visit pattern
  const specificVisitMatches = queryTrimmed
    ? patients.flatMap((p) =>
        p.visits
          .filter((v) => v.visitCode.toLowerCase().includes(queryTrimmed) || (parsed.visitCodeQuery && v.visitCode === parsed.visitCodeQuery))
          .map((v) => ({ patient: p, visit: v }))
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const parsedInfo = parseSearchQuery(searchQuery);

    if (parsedInfo.isSpecificVisit && parsedInfo.visitCodeQuery) {
      // Find patient with this visit
      const targetPatient = patients.find((p) =>
        p.visits.some((v) => v.visitCode.toUpperCase() === parsedInfo.visitCodeQuery?.toUpperCase())
      );
      if (targetPatient) {
        onOpenPatientFolder(targetPatient.id, parsedInfo.visitCodeQuery);
        setSearchQuery('');
        setIsSearchFocused(false);
        return;
      }
    }

    // Try finding by normalized patient ID (e.g. "12" -> "P-000012")
    const foundById = patients.find(
      (p) => p.id.toUpperCase() === parsedInfo.patientIdQuery.toUpperCase()
    );
    if (foundById) {
      onOpenPatientFolder(foundById.id);
      setSearchQuery('');
      setIsSearchFocused(false);
      return;
    }

    // Fallback: match by first matching result
    if (matchingPatients.length > 0) {
      onOpenPatientFolder(matchingPatients[0].id);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Quick search for Admin, or Greeting for other roles */}
        <div className="flex-1 max-w-3xl">
          {currentUser.role === 'admin' ? (
            <div className="relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-teal-600">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder='Quick Search: Type "12", "P-000012", or "P-000012-V03" for direct jump...'
                  className="w-full pl-10 pr-24 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 focus:bg-white transition-all shadow-xs"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-2.5 py-1 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors shadow-xs flex items-center space-x-1"
                >
                  <span>Find</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </form>

              {/* Autocomplete dropdown */}
              {isSearchFocused && (searchQuery.trim().length > 0 || recentPatients.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {/* Direct visit jump suggestions */}
                  {specificVisitMatches.length > 0 && (
                    <div className="p-2 bg-teal-50/50">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800 px-2.5 py-1 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>Direct Visit Match (Jump directly to visit)</span>
                      </div>
                      {specificVisitMatches.slice(0, 3).map(({ patient, visit }) => (
                        <div
                          key={visit.visitCode}
                          onClick={() => {
                            onOpenPatientFolder(patient.id, visit.visitCode);
                            setSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                          className="px-3 py-2 rounded-lg hover:bg-teal-100/70 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-teal-800 bg-white px-1.5 py-0.5 rounded border border-teal-200">
                                {visit.visitCode}
                              </span>
                              <span className="font-semibold text-slate-800">{patient.name}</span>
                              <span className="text-[11px] px-1.5 py-0.2 rounded bg-teal-200/60 text-teal-900 font-medium">
                                {visit.visitType}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-md">
                              {visit.complaint} • {visit.assignedDoctor}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-teal-600" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Patients suggestions */}
                  {matchingPatients.length > 0 ? (
                    <div className="p-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                        Matching Patients ({matchingPatients.length})
                      </div>
                      {matchingPatients.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onOpenPatientFolder(p.id);
                            setSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                          className="px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                              {p.id}
                            </span>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-900">{p.name}</span>
                                <span className="text-slate-500">
                                  ({p.age}y / {p.sex})
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">{p.phone} • {p.city}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-full">
                              {p.visits.length} {p.visits.length === 1 ? 'Visit' : 'Visits'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.trim().length > 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No matching patient found for &quot;{searchQuery}&quot;. Try typing &quot;12&quot; or &quot;P-000012&quot;.
                    </div>
                  ) : null}

                  {/* Recently opened patients preview inside dropdown */}
                  {recentPatients.length > 0 && (
                    <div className="p-2 bg-slate-50/70">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2.5 py-1 flex items-center space-x-1.5">
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>Recently Opened Patients</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 px-1">
                        {recentPatients.slice(0, 4).map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              onOpenPatientFolder(p.id);
                              setSearchQuery('');
                              setIsSearchFocused(false);
                            }}
                            className="p-1.5 rounded-md hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer text-xs transition-all flex items-center justify-between"
                          >
                            <div className="truncate">
                              <span className="font-semibold text-slate-800">{p.name}</span>
                              <span className="text-[11px] text-teal-700 font-mono ml-1.5">{p.id}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">V{p.visits.length}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{currentUser.department}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                {currentUser.role === 'doctor'
                  ? 'Doctor Portal: OPD / IPD Patient Registration & Clinical Queue'
                  : currentUser.role === 'nursery'
                  ? 'Nursery Care Unit: NICU Incubators & Infant Vitals'
                  : 'Central Dispensary: Prescription Queue & Medicine Stock'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Role Switcher & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Role Switcher Dropdown */}
          <div className="relative" ref={roleMenuRef}>
            <button
              type="button"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-400 bg-white hover:bg-slate-50 transition-colors shadow-xs text-xs font-medium text-slate-700"
            >
              <div className={`w-2 h-2 rounded-full ${currentUser.role === 'admin' ? 'bg-teal-500' : currentUser.role === 'doctor' ? 'bg-blue-500' : currentUser.role === 'nursery' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className="font-semibold">Switch Role:</span>
              <span className="capitalize text-slate-900 font-bold">{currentUser.role}</span>
              <Layers className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50">
                <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Different Roles
                </div>
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSwitchRole(user);
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                      user.role === currentUser.role ? 'bg-teal-50/60 font-semibold text-teal-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center space-x-1.5">
                        <span className="capitalize">{user.role}:</span>
                        <span>{user.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{user.department}</p>
                    </div>
                    {user.role === currentUser.role && (
                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium flex items-center space-x-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Back to Role Selection Screen</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar badge */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
            <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{currentUser.title.split('(')[0]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Quick Search: "Recently opened patients" quick switch bar */}
      {currentUser.role === 'admin' && (
        <div className="bg-slate-50/80 px-6 py-1.5 border-t border-slate-200/80 flex items-center text-xs gap-3 overflow-x-auto">
          <div className="flex items-center space-x-1 text-slate-500 text-[11px] font-semibold uppercase tracking-wider shrink-0">
            <History className="w-3.5 h-3.5 text-teal-600" />
            <span>Recently Opened:</span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
            {recentPatients.length > 0 ? (
              recentPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onOpenPatientFolder(p.id)}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 text-xs transition-all shadow-2xs shrink-0 cursor-pointer"
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="font-mono text-[10px] text-teal-700 font-bold bg-teal-50/80 px-1 rounded">
                    {p.id}
                  </span>
                  <span className="text-[10px] text-slate-400">({p.visits.length}v)</span>
                </button>
              ))
            ) : (
              <span className="text-slate-400 text-xs italic">
                Tip: Search &quot;12&quot; or &quot;P-000012&quot; above to open Ayesha Noor&apos;s folder.
              </span>
            )}

            {/* Quick Demo Shortcuts for quick test */}
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 shrink-0">
              <span className="text-[10px] text-slate-400 font-medium">Try:</span>
              <button
                onClick={() => onOpenPatientFolder('P-000012', 'P-000012-V03')}
                className="px-2 py-0.5 rounded bg-teal-100/70 hover:bg-teal-200 text-teal-800 text-[11px] font-mono font-semibold transition-colors"
                title="Jump directly to Laparoscopic Surgery Visit 03"
              >
                P-000012-V03
              </button>
              <button
                onClick={() => onOpenPatientFolder('P-000007', 'P-000007-V01')}
                className="px-2 py-0.5 rounded bg-blue-100/70 hover:bg-blue-200 text-blue-800 text-[11px] font-mono font-semibold transition-colors"
                title="Jump directly to Emergency Trauma Visit 01"
              >
                P-000007-V01
              </button>
              <button
                onClick={() => onOpenPatientFolder('P-000004')}
                className="px-2 py-0.5 rounded bg-rose-100/70 hover:bg-rose-200 text-rose-800 text-[11px] font-mono font-semibold transition-colors"
                title="Open Fatima Bibi (Maternity/Nursery baby mother)"
              >
                P-000004
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

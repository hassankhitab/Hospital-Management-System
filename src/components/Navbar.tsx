import React, { useState, useRef, useEffect } from 'react';
import { UserSession, Patient } from '../types/hms';
import { parseSearchQuery } from '../utils/formatters';
import { Search, ChevronRight, LogOut, ChevronDown } from 'lucide-react';

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

    const foundById = patients.find(
      (p) => p.id.toUpperCase() === parsedInfo.patientIdQuery.toUpperCase()
    );
    if (foundById) {
      onOpenPatientFolder(foundById.id);
      setSearchQuery('');
      setIsSearchFocused(false);
      return;
    }

    if (matchingPatients.length > 0) {
      onOpenPatientFolder(matchingPatients[0].id);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Quick search for Admin */}
        <div className="flex-1 max-w-xl">
          {currentUser.role === 'admin' ? (
            <div className="relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder='Quick search by "12", "P-000012", or "P-000012-V03"...'
                  className="w-full pl-9 pr-16 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-2.5 py-1 text-[11px] font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded cursor-pointer"
                >
                  Find
                </button>
              </form>

              {/* Suggestions */}
              {isSearchFocused && (searchQuery.trim().length > 0 || recentPatients.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {specificVisitMatches.length > 0 && (
                    <div className="p-2 bg-teal-50/50">
                      <div className="text-[10px] font-semibold uppercase text-teal-800 px-2 py-0.5">
                        Direct Visit Match
                      </div>
                      {specificVisitMatches.slice(0, 3).map(({ patient, visit }) => (
                        <div
                          key={visit.visitCode}
                          onClick={() => {
                            onOpenPatientFolder(patient.id, visit.visitCode);
                            setSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                          className="px-2 py-1.5 rounded hover:bg-teal-100 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-teal-800 mr-2">{visit.visitCode}</span>
                            <span className="font-medium text-slate-800">{patient.name}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-teal-700" />
                        </div>
                      ))}
                    </div>
                  )}

                  {matchingPatients.length > 0 ? (
                    <div className="p-2">
                      <div className="text-[10px] font-semibold uppercase text-slate-400 px-2 py-0.5">
                        Patients ({matchingPatients.length})
                      </div>
                      {matchingPatients.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onOpenPatientFolder(p.id);
                            setSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                          className="px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono font-semibold text-teal-700 mr-2">{p.id}</span>
                            <span className="font-medium text-slate-800">{p.name}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5">({p.age}y, {p.sex})</span>
                          </div>
                          <span className="text-[11px] text-slate-400">{p.visits.length}v</span>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.trim().length > 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500">
                      No results for &quot;{searchQuery}&quot;
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">{currentUser.name}</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span>{currentUser.department}</span>
            </div>
          )}
        </div>

        {/* Right: Role Switcher dropdown */}
        <div className="flex items-center space-x-3">
          <div className="relative" ref={roleMenuRef}>
            <button
              type="button"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer"
            >
              <span>Role:</span>
              <span className="capitalize font-semibold text-teal-800">{currentUser.role}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-md shadow-md py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Demo Role
                </div>
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSwitchRole(user);
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      user.role === currentUser.role ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span className="capitalize">{user.role}: {user.name.split(' ')[1] || user.name}</span>
                    {user.role === currentUser.role && <span className="w-1.5 h-1.5 rounded-full bg-teal-700" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Role Picker</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold text-slate-800">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{currentUser.role}</p>
          </div>
        </div>
      </div>

      {/* Admin Recently Opened strip */}
      {currentUser.role === 'admin' && (
        <div className="bg-slate-50 px-6 py-1.5 border-t border-slate-200 flex items-center text-xs gap-2 overflow-x-auto">
          <span className="text-[11px] font-medium text-slate-500 shrink-0">Recent:</span>
          {recentPatients.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenPatientFolder(p.id)}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:border-teal-600 text-xs transition-colors shrink-0 cursor-pointer"
            >
              <span>{p.name}</span>
              <span className="font-mono text-[10px] text-teal-700">({p.id})</span>
            </button>
          ))}
          <div className="flex items-center space-x-1 text-[11px] text-slate-400 pl-2 shrink-0">
            <span>Try:</span>
            <button
              onClick={() => onOpenPatientFolder('P-000012', 'P-000012-V03')}
              className="text-teal-700 hover:underline font-mono"
            >
              P-000012-V03
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

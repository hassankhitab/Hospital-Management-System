import React, { useState } from 'react';
import { NurseryBaby, UserRole, Patient } from '../types/hms';
import { INITIAL_NURSERY_BABIES } from '../data/mockData';
import { 
  Baby, 
  Heart, 
  Activity, 
  Sun, 
  Milk, 
  Thermometer, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface NurseryPageProps {
  currentRole: UserRole;
  patients: Patient[];
  onOpenMotherFolder?: (patientId: string) => void;
}

export const NurseryPage: React.FC<NurseryPageProps> = ({
  currentRole,
  patients,
  onOpenMotherFolder,
}) => {
  const [babies, setBabies] = useState<NurseryBaby[]>(INITIAL_NURSERY_BABIES);
  const [selectedBabyId, setSelectedBabyId] = useState<string>(babies[0].id);

  // New Vitals / Feed modal
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [newTemp, setNewTemp] = useState('36.8°C');
  const [newHeartRate, setNewHeartRate] = useState('140');
  const [newSpo2, setNewSpo2] = useState('98');
  const [newFeedNotes, setNewFeedNotes] = useState('');

  const activeBaby = babies.find((b) => b.id === selectedBabyId) || babies[0];

  const handleTogglePhototherapy = (babyId: string) => {
    setBabies((prev) =>
      prev.map((b) => (b.id === babyId ? { ...b, phototherapy: !b.phototherapy } : b))
    );
  };

  const handleUpdateVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBaby) return;

    setBabies((prev) =>
      prev.map((b) =>
        b.id === activeBaby.id
          ? {
              ...b,
              vitals: {
                temp: newTemp,
                heartRate: parseInt(newHeartRate, 10) || 140,
                spo2: parseInt(newSpo2, 10) || 98,
              },
              notes: newFeedNotes ? `${newFeedNotes} (Logged at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : b.notes,
            }
          : b
      )
    );
    setIsVitalsModalOpen(false);
    setNewFeedNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              NICU & NURSERY CARE
            </span>
            <h1 className="text-xl font-bold text-slate-900">Neonatal Intensive Care Unit (NICU)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active infant incubators, phototherapy tracking, feed schedules, and maternal patient linkage.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-rose-900 font-bold">
            <Baby className="w-4 h-4 text-rose-600" />
            <span>Active Admissions: {babies.length}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-900 font-bold">
            <Sun className="w-4 h-4 text-amber-600" />
            <span>Under Phototherapy: {babies.filter((b) => b.phototherapy).length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Incubators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {babies.map((baby) => {
          const isSelected = baby.id === selectedBabyId;
          return (
            <div
              key={baby.id}
              onClick={() => setSelectedBabyId(baby.id)}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-rose-400 ring-2 ring-rose-400/20 shadow-md'
                  : 'border-slate-200 hover:border-rose-300'
              }`}
            >
              {/* Incubator Label */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                    <Baby className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{baby.babyName}</h3>
                    <span className="text-[11px] font-mono text-slate-500">{baby.incubatorId}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    baby.status === 'Critical'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                      : baby.status === 'Stable'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {baby.status}
                </span>
              </div>

              {/* Mother Link */}
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs mb-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mother:</span>
                  <span className="font-semibold text-slate-800">{baby.motherName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mother Patient ID:</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-mono font-bold text-teal-700 bg-white px-1.5 py-0.2 rounded border border-teal-200">
                      {baby.motherPatientId}
                    </span>
                    {onOpenMotherFolder && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMotherFolder(baby.motherPatientId);
                        }}
                        className="text-teal-600 hover:text-teal-800 p-0.5 cursor-pointer"
                        title="View Mother's Folder"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Gestational Age:</span>
                  <span className="font-medium text-slate-700">{baby.gestationalWeeks} Weeks</span>
                </div>
              </div>

              {/* Vitals Summary */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs mb-3">
                <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">SpO2</span>
                  <span className="font-bold text-emerald-700 font-mono">{baby.vitals.spo2}%</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">HR</span>
                  <span className="font-bold text-slate-800 font-mono">{baby.vitals.heartRate}</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Temp</span>
                  <span className="font-bold text-slate-800 font-mono">{baby.vitals.temp}</span>
                </div>
              </div>

              {/* Phototherapy Status Switch */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <Sun className={`w-3.5 h-3.5 ${baby.phototherapy ? 'text-amber-500 animate-spin' : 'text-slate-400'}`} />
                  <span className="font-medium text-slate-700">
                    Phototherapy: <strong className={baby.phototherapy ? 'text-amber-700' : 'text-slate-400'}>{baby.phototherapy ? 'ACTIVE' : 'OFF'}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePhototherapy(baby.id);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    baby.phototherapy
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {baby.phototherapy ? 'Turn Off' : 'Activate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Baby Detailed Care Console */}
      {activeBaby && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <Baby className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-900">{activeBaby.babyName}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-mono text-slate-700 font-bold border border-slate-200">
                    Tag: {activeBaby.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Birth: {activeBaby.birthDateTime} • Gestation: {activeBaby.gestationalWeeks} Weeks • Birth Weight: {activeBaby.birthWeightKg} kg (Current: {activeBaby.currentWeightKg} kg)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsVitalsModalOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>+ Log Vitals & Feed</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Feeding Protocol */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] flex items-center space-x-1.5">
                <Milk className="w-3.5 h-3.5 text-rose-600" />
                <span>Nutrition & Feeding Schedule</span>
              </span>
              <div>
                <span className="text-slate-400 block text-[11px]">Feed Modality:</span>
                <span className="font-bold text-slate-800 text-sm">{activeBaby.feedType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Regimen:</span>
                <p className="font-medium text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                  {activeBaby.feedSchedule}
                </p>
              </div>
            </div>

            {/* Continuous Vitals */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                <span>Monitored Vitals</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Pulse Rate</span>
                  <span className="font-mono text-base font-bold text-slate-900">{activeBaby.vitals.heartRate} bpm</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Temperature</span>
                  <span className="font-mono text-base font-bold text-slate-900">{activeBaby.vitals.temp}</span>
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 block">Oxygen Saturation (SpO2)</span>
                <span className="font-mono text-lg font-extrabold text-emerald-700">{activeBaby.vitals.spo2}%</span>
              </div>
            </div>

            {/* Clinical Nursing Notes */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Head Nurse Clinical Notes</span>
              </span>
              <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed font-medium">
                {activeBaby.notes}
              </p>
              <div className="text-[10px] text-slate-400">
                Staff Incharge: Sister Amina Riaz (NICU Head Nurse)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Vitals Modal */}
      {isVitalsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Log Neonatal Vitals & Feeding
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Recording clinical vitals for {activeBaby.babyName} ({activeBaby.incubatorId})
            </p>

            <form onSubmit={handleUpdateVitals} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temp (°C)</label>
                  <input
                    type="text"
                    required
                    value={newTemp}
                    onChange={(e) => setNewTemp(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Heart Rate</label>
                  <input
                    type="number"
                    required
                    value={newHeartRate}
                    onChange={(e) => setNewHeartRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    required
                    value={newSpo2}
                    onChange={(e) => setNewSpo2(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shift Nursing Observation / Feed Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Tolerated 25ml EBM well without regurgitation, active cry, good moro reflex..."
                  value={newFeedNotes}
                  onChange={(e) => setNewFeedNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVitalsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Vitals Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

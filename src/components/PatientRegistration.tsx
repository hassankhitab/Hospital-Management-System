import React, { useState } from 'react';
import { Patient, Visit, VisitType, UserRole } from '../types/hms';
import { DOCTORS_LIST } from '../data/mockData';
import { generatePatientId, generateVisitCode } from '../utils/formatters';
import { 
  UserPlus, 
  CheckCircle2, 
  Printer, 
  FolderOpen, 
  Receipt, 
  Search, 
  RefreshCw, 
  Sparkles, 
  Stethoscope, 
  Clock, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface PatientRegistrationProps {
  patients: Patient[];
  onRegisterPatient: (patient: Patient, visit: Visit) => void;
  onOpenFolder: (patientId: string, visitCode?: string) => void;
  onOpenBillingForVisit?: (patientId: string, visitCode: string) => void;
  currentRole: UserRole;
  preSelectedPatientId?: string;
}

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  patients,
  onRegisterPatient,
  onOpenFolder,
  onOpenBillingForVisit,
  currentRole,
  preSelectedPatientId,
}) => {
  const [regMode, setRegMode] = useState<'new' | 'returning'>(
    preSelectedPatientId ? 'returning' : 'new'
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string>(preSelectedPatientId || '');
  const [patientSearch, setPatientSearch] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('+92 ');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [complaint, setComplaint] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState(DOCTORS_LIST[0].name);
  const [visitType, setVisitType] = useState<VisitType>('OPD');
  const [roomNo, setRoomNo] = useState('');
  
  // Vitals
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('76');
  const [temp, setTemp] = useState('98.6°F');
  const [weight, setWeight] = useState('65');
  const [spo2, setSpo2] = useState('99');

  // Success state modal
  const [successInfo, setSuccessInfo] = useState<{
    patient: Patient;
    visit: Visit;
    isNew: boolean;
  } | null>(null);

  // If returning patient selected, prefill demographics
  const handleSelectReturningPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setName(patient.name);
    setAge(String(patient.age));
    setSex(patient.sex);
    setPhone(patient.phone);
    setAddress(patient.address);
    setCity(patient.city);
  };

  const handleModeChange = (mode: 'new' | 'returning') => {
    setRegMode(mode);
    if (mode === 'new') {
      setSelectedPatientId('');
      setName('');
      setAge('');
      setSex('Male');
      setPhone('+92 ');
      setAddress('');
      setComplaint('');
    } else if (patients.length > 0 && !selectedPatientId) {
      handleSelectReturningPatient(patients[0]);
    }
  };

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age) {
      setFormError('Please enter patient name and age before proceeding.');
      return;
    }
    setFormError(null);

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let finalPatientId = '';
    let visitNumber = 1;
    let isNew = true;

    if (regMode === 'returning' && selectedPatientId) {
      const existing = patients.find((p) => p.id === selectedPatientId);
      if (existing) {
        finalPatientId = existing.id;
        visitNumber = existing.visits.length + 1;
        isNew = false;
      }
    }

    if (!finalPatientId) {
      // Find highest numerical sequence in existing patients
      const highestNum = patients.reduce((max, p) => {
        const match = p.id.match(/\d+/);
        const num = match ? parseInt(match[0], 10) : 0;
        return num > max ? num : max;
      }, 45); // minimum seed 45
      finalPatientId = generatePatientId(highestNum + 1);
      visitNumber = 1;
      isNew = true;
    }

    const generatedVisitCode = generateVisitCode(finalPatientId, visitNumber);
    const doctorObj = DOCTORS_LIST.find((d) => d.name === assignedDoctor);

    const newVisit: Visit = {
      visitCode: generatedVisitCode,
      patientId: finalPatientId,
      visitNumber,
      date: currentDate,
      time: currentTime,
      complaint: complaint.trim() || 'General consultation / Routine evaluation',
      assignedDoctor,
      department: doctorObj ? doctorObj.dept : 'General OPD',
      visitType,
      status: visitType === 'IPD' || visitType === 'Surgery' ? 'Admitted' : 'Registered',
      roomNo: roomNo.trim() || (visitType === 'IPD' ? 'General Ward Bed 08' : undefined),
      vitals: {
        bp: bp || '120/80',
        pulse: pulse ? parseInt(pulse, 10) : 76,
        temp: temp || '98.6°F',
        weight: weight ? `${weight} kg` : undefined,
        spo2: spo2 ? parseInt(spo2, 10) : 99,
      },
      clinicalNotes: `Registration recorded by ${currentRole.toUpperCase()} at ${currentTime}.`,
    };

    const targetPatient: Patient = {
      id: finalPatientId,
      name: name.trim(),
      age: parseInt(age, 10) || 30,
      sex,
      phone: phone.trim() || '+92 300 0000000',
      address: address.trim() || 'Main City Area',
      city: city.trim() || 'Lahore',
      registeredDate: isNew ? currentDate : (patients.find((p) => p.id === finalPatientId)?.registeredDate || currentDate),
      visits: isNew
        ? [newVisit]
        : [...(patients.find((p) => p.id === finalPatientId)?.visits || []), newVisit],
    };

    onRegisterPatient(targetPatient, newVisit);

    setSuccessInfo({
      patient: targetPatient,
      visit: newVisit,
      isNew,
    });
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.includes(patientSearch)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              PAGE 1
            </span>
            <h1 className="text-xl font-bold text-slate-900">Patient Registration & Visit Generation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create permanent Patient IDs (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800 font-bold font-mono">P-000012</code>) and sequential Visit Codes (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800 font-bold font-mono">P-000012-V03</code>).
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleModeChange('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              regMode === 'new'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + New Patient (Generate ID)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('returning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              regMode === 'returning'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Returning Patient (Next Visit)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            {/* Returning patient lookup sub-bar */}
            {regMode === 'returning' && (
              <div className="bg-teal-50/70 p-4 border-b border-teal-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Search className="w-3.5 h-3.5 text-teal-700" />
                    <span>Select Existing Patient Record</span>
                  </span>
                  <span className="text-xs text-teal-700">
                    Existing ID will be preserved; visit number increments.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Filter by name, ID (e.g. P-000012), or phone..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-teal-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => {
                        const p = patients.find((pat) => pat.id === e.target.value);
                        if (p) handleSelectReturningPatient(p);
                      }}
                      className="w-full px-3 py-2 bg-white border border-teal-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    >
                      {filteredPatients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.id} - {p.name} ({p.visits.length} prior visits) - {p.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedPatientId && (
                  <div className="text-xs text-teal-900 bg-teal-100/60 p-2.5 rounded-lg border border-teal-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold">Target Patient:</span>{' '}
                      <span className="font-mono font-bold text-teal-800">{selectedPatientId}</span>{' '}
                      - {name} ({age}y / {sex})
                    </div>
                    <span className="font-mono bg-white px-2 py-0.5 rounded text-teal-700 border border-teal-300 font-bold">
                      Next will generate: {generateVisitCode(selectedPatientId, (patients.find(p => p.id === selectedPatientId)?.visits.length || 0) + 1)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="p-6 space-y-5">
              {/* Patient Demographics */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                  <span>Demographics & Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayesha Noor / Tariq Khan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Age (Years) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="120"
                      placeholder="e.g. 32"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sex <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+92 300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City / District
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lahore / Islamabad / Rawalpindi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Residential Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="House / Flat #, Street / Sector, Area"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Visit Details */}
              <div className="border-t border-slate-200 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>Clinical Visit Details & Triage</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Visit Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={visitType}
                      onChange={(e) => setVisitType(e.target.value as VisitType)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="OPD">OPD (Outpatient Department)</option>
                      <option value="IPD">IPD (Inpatient Admission)</option>
                      <option value="Emergency">Emergency / Trauma Triage</option>
                      <option value="Surgery">Surgery / OT Admission</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Doctor <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={assignedDoctor}
                      onChange={(e) => setAssignedDoctor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    >
                      {DOCTORS_LIST.map((doc) => (
                        <option key={doc.name} value={doc.name}>
                          {doc.name} ({doc.dept})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Room / Bed Assignment (if applicable)
                    </label>
                    <input
                      type="text"
                      placeholder={visitType === 'OPD' ? 'OPD Room 04' : 'Private Deluxe 204 / Ward Bed 03'}
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chief Complaint / Clinical Presentation <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Severe right upper quadrant abdominal pain radiating to shoulder, postprandial dyspepsia, vomiting..."
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                    {/* Quick suggestion pills */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-[10px] text-slate-400 self-center">Quick presets:</span>
                      {[
                        'Severe abdominal colic & gallstone follow-up',
                        'High grade fever & dry cough',
                        'Antenatal 3rd trimester routine check',
                        'Road traffic accident trauma & laceration',
                        'Elective surgery admission',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setComplaint(preset)}
                          className="text-[10px] bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Baseline Vitals */}
              <div className="border-t border-slate-200 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Initial Baseline Vitals (Optional)</span>
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pulse (bpm)</label>
                    <input
                      type="number"
                      placeholder="76"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Temp</label>
                    <input
                      type="text"
                      placeholder="98.6°F"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="65"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      placeholder="99"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Error Banner */}
            {formError && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Automatically computes sequential Visit Number & Patient ID on save.
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-700/20 flex items-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {regMode === 'new' ? 'Save & Generate Patient ID' : 'Save & Generate Next Visit Code'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Information & Recent Queue */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white p-5 rounded-xl shadow-md border border-teal-800/60">
            <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>ID & Visit Code Logic</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with hospital clinical records policy:
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="bg-teal-950/60 p-2.5 rounded-lg border border-teal-700/50">
                <span className="font-semibold text-teal-200">New Patients:</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Assigned permanent ID: <code className="text-teal-300 font-mono font-bold">P-000046</code> and first visit <code className="text-teal-300 font-mono font-bold">P-000046-V01</code>.
                </p>
              </div>
              <div className="bg-teal-950/60 p-2.5 rounded-lg border border-teal-700/50">
                <span className="font-semibold text-teal-200">Returning Patients:</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Permanent ID stays unchanged (e.g. <code className="text-teal-300 font-mono font-bold">P-000012</code>) and visit increments (e.g. <code className="text-teal-300 font-mono font-bold">P-000012-V04</code>).
                </p>
              </div>
            </div>
          </div>

          {/* Quick List of Sample Patients for Instant Visit Test */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Existing Patient Records ({patients.length})</span>
              <span className="text-[10px] text-teal-600 font-mono">Quick Pick</span>
            </h4>
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {patients.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    handleModeChange('returning');
                    handleSelectReturningPatient(p);
                  }}
                  className="py-2 px-1 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors rounded"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-teal-700">{p.id}</span>
                      <span className="font-semibold text-slate-800">{p.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{p.visits.length} prior visits • {p.city}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    Next V{p.visits.length + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal / Banner */}
      {successInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {successInfo.isNew ? 'Patient Successfully Registered!' : 'New Visit Created for Existing Patient!'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registration record saved to clinical database.
                  </p>
                </div>
              </div>
            </div>

            {/* Generated Codes Highlight Box */}
            <div className="my-5 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white p-3 rounded-lg border border-teal-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Permanent Patient ID</span>
                  <div className="font-mono text-xl font-extrabold text-teal-900 mt-1">
                    {successInfo.patient.id}
                  </div>
                  <span className="text-[10px] text-slate-400">Fixed Medical Record Number</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-teal-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Generated Visit Code</span>
                  <div className="font-mono text-xl font-extrabold text-teal-900 mt-1">
                    {successInfo.visit.visitCode}
                  </div>
                  <span className="text-[10px] text-slate-400">Visit #{successInfo.visit.visitNumber} ({successInfo.visit.visitType})</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <div className="font-mono text-2xl tracking-[0.3em] font-bold text-slate-800 select-all">
                  ||| | |||| | ||||| || | |||
                </div>
                <div className="font-mono text-[10px] text-slate-500 mt-0.5 tracking-wider">
                  *{successInfo.visit.visitCode}*
                </div>
              </div>

              {/* Summary Details */}
              <div className="text-xs text-slate-700 space-y-1 pt-1 border-t border-teal-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold">{successInfo.patient.name} ({successInfo.patient.age}y / {successInfo.patient.sex})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultant:</span>
                  <span className="font-medium">{successInfo.visit.assignedDoctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Complaint:</span>
                  <span className="truncate max-w-xs">{successInfo.visit.complaint}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const pid = successInfo.patient.id;
                    const vcode = successInfo.visit.visitCode;
                    setSuccessInfo(null);
                    onOpenFolder(pid, vcode);
                  }}
                  className="py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Open Patient Folder</span>
                </button>

                {currentRole === 'admin' && onOpenBillingForVisit ? (
                  <button
                    type="button"
                    onClick={() => {
                      const pid = successInfo.patient.id;
                      const vcode = successInfo.visit.visitCode;
                      setSuccessInfo(null);
                      onOpenBillingForVisit(pid, vcode);
                    }}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Create Hospital Bill</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Token Slip</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSuccessInfo(null);
                  handleModeChange('new');
                }}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-medium text-center hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Register Another Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

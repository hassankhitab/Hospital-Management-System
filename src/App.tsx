import React, { useState } from 'react';
import { UserRole, UserSession, Patient, Visit, Bill, NurseryBaby, PharmacyPrescription } from './types/hms';
import { DEMO_USERS, INITIAL_PATIENTS, INITIAL_BILLS, INITIAL_NURSERY_BABIES, INITIAL_PRESCRIPTIONS } from './data/mockData';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { PatientRegistration } from './components/PatientRegistration';
import { PatientFolderView } from './components/PatientFolderView';
import { BillingPage } from './components/BillingPage';
import { NurseryPage } from './components/NurseryPage';
import { PharmacyPage } from './components/PharmacyPage';
import { PatientDirectory } from './components/PatientDirectory';
import { AdminOverview } from './components/AdminOverview';
import { PrintInvoiceModal } from './components/PrintInvoiceModal';

export default function App() {
  // Current user state (starts with role picker or default admin)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(DEMO_USERS[0]); // default to Admin for immediate showcase
  
  // Data store in React state (no Firebase or backend)
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [babies, setBabies] = useState<NurseryBaby[]>(INITIAL_NURSERY_BABIES);
  const [prescriptions, setPrescriptions] = useState<PharmacyPrescription[]>(INITIAL_PRESCRIPTIONS);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Recently opened patients for admin quick switch (pre-seed with Ayesha and Fatima)
  const [recentPatients, setRecentPatients] = useState<Patient[]>([
    INITIAL_PATIENTS.find((p) => p.id === 'P-000012')!,
    INITIAL_PATIENTS.find((p) => p.id === 'P-000004')!,
    INITIAL_PATIENTS.find((p) => p.id === 'P-000007')!,
  ].filter(Boolean));

  // Patient folder viewer state
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [targetVisitCode, setTargetVisitCode] = useState<string | undefined>(undefined);

  // Active bill ID in Billing page
  const [activeBillId, setActiveBillId] = useState<string | undefined>(bills[0]?.id);

  // Standalone print invoice modal
  const [printBill, setPrintBill] = useState<Bill | null>(null);

  // Pre-selected patient for registration
  const [preSelectedRegPatientId, setPreSelectedRegPatientId] = useState<string | undefined>(undefined);

  // Handle Role selection
  const handleSelectRole = (user: UserSession) => {
    setCurrentUser(user);
    setViewingPatientId(null);
    setTargetVisitCode(undefined);

    // Set appropriate initial tab based on role permissions
    switch (user.role) {
      case 'admin':
        setActiveTab('overview');
        break;
      case 'doctor':
        setActiveTab('registration');
        break;
      case 'nursery':
        setActiveTab('nursery');
        break;
      case 'pharmacist':
        setActiveTab('pharmacy');
        break;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Open Patient Folder (from Quick Search or table click)
  const handleOpenPatientFolder = (patientId: string, visitCode?: string) => {
    const foundPatient = patients.find((p) => p.id === patientId);
    if (foundPatient) {
      setViewingPatientId(patientId);
      setTargetVisitCode(visitCode);

      // Add to recently opened list (keep max 6, no duplicates at top)
      setRecentPatients((prev) => {
        const filtered = prev.filter((p) => p.id !== patientId);
        return [foundPatient, ...filtered].slice(0, 6);
      });
    }
  };

  // Close Patient Folder
  const handleClosePatientFolder = () => {
    setViewingPatientId(null);
    setTargetVisitCode(undefined);
  };

  // Register or Add Visit callback
  const handleRegisterPatient = (updatedPatient: Patient, newVisit: Visit) => {
    setPatients((prev) => {
      const exists = prev.some((p) => p.id === updatedPatient.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p));
      }
      return [updatedPatient, ...prev];
    });

    // Add to recents
    setRecentPatients((prev) => {
      const filtered = prev.filter((p) => p.id !== updatedPatient.id);
      return [updatedPatient, ...filtered].slice(0, 6);
    });
  };

  // Add new visit from folder
  const handleAddNewVisitFromFolder = (patientId: string) => {
    setPreSelectedRegPatientId(patientId);
    setViewingPatientId(null);
    setActiveTab('registration');
  };

  // Open billing page focused on a specific bill
  const handleOpenBill = (billId: string) => {
    setActiveBillId(billId);
    setViewingPatientId(null);
    setActiveTab('billing');
  };

  // Create new bill for a specific visit
  const handleCreateBillForVisit = (patientId: string, visitCode: string) => {
    const targetPatient = patients.find((p) => p.id === patientId);
    const targetVisit = targetPatient?.visits.find((v) => v.visitCode === visitCode);
    const newBillId = `INV-2026-${String(bills.length + 90).padStart(4, '0')}`;

    const newBill: Bill = {
      id: newBillId,
      patientId,
      visitCode,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Draft',
      items: [
        {
          id: `item-${Date.now()}`,
          category: 'Doctor Fee',
          description: `Consultation Fee (${targetVisit?.assignedDoctor || 'Specialist'})`,
          quantity: 1,
          unitPrice: 5000,
          amount: 5000,
        },
      ],
      subtotal: 5000,
      discount: 0,
      total: 5000,
      advanceReceived: 2500,
      balance: 2500,
      paymentMethod: 'Cash',
      notes: `Billing for visit ${visitCode} (${targetVisit?.visitType || 'Clinical'}).`,
    };

    setBills((prev) => [newBill, ...prev]);
    setActiveBillId(newBill.id);
    setViewingPatientId(null);
    setActiveTab('billing');
  };

  // Update Bill
  const handleUpdateBill = (updated: Bill) => {
    setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleCreateNewBill = (newBill: Bill) => {
    setBills((prev) => [newBill, ...prev]);
  };

  // If not logged in, show login screen
  if (!currentUser) {
    return <LoginScreen onSelectRole={handleSelectRole} />;
  }

  // Find patient for viewing folder
  const viewingPatient = viewingPatientId ? patients.find((p) => p.id === viewingPatientId) : null;
  const patientBills = viewingPatient ? bills.filter((b) => b.patientId === viewingPatient.id) : [];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Navigation Bar with Admin Quick Search */}
      <Navbar
        currentUser={currentUser}
        patients={patients}
        recentPatients={recentPatients}
        onOpenPatientFolder={handleOpenPatientFolder}
        onSwitchRole={handleSelectRole}
        onLogout={handleLogout}
        availableUsers={DEMO_USERS}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentRole={currentUser.role}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setViewingPatientId(null);
            setTargetVisitCode(undefined);
            setActiveTab(tab);
          }}
          onLogout={handleLogout}
          patientCount={patients.length}
          billCount={bills.length}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          {/* Patient Folder View overlay / inline */}
          {viewingPatient ? (
            <PatientFolderView
              patient={viewingPatient}
              linkedBills={patientBills}
              targetVisitCode={targetVisitCode}
              onClose={handleClosePatientFolder}
              onOpenBill={handleOpenBill}
              onCreateBillForVisit={handleCreateBillForVisit}
              onAddNewVisit={handleAddNewVisitFromFolder}
              currentRole={currentUser.role}
              onPrintInvoiceModal={(b) => setPrintBill(b)}
            />
          ) : (
            <>
              {/* Role-enforced Content Tabs */}
              {activeTab === 'overview' && currentUser.role === 'admin' && (
                <AdminOverview
                  patients={patients}
                  bills={bills}
                  babies={babies}
                  prescriptions={prescriptions}
                  onOpenFolder={handleOpenPatientFolder}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {activeTab === 'registration' && (currentUser.role === 'admin' || currentUser.role === 'doctor') && (
                <PatientRegistration
                  patients={patients}
                  onRegisterPatient={handleRegisterPatient}
                  onOpenFolder={handleOpenPatientFolder}
                  onOpenBillingForVisit={(pid, vcode) => handleCreateBillForVisit(pid, vcode)}
                  currentRole={currentUser.role}
                  preSelectedPatientId={preSelectedRegPatientId}
                />
              )}

              {activeTab === 'directory' && currentUser.role === 'admin' && (
                <PatientDirectory
                  patients={patients}
                  bills={bills}
                  onOpenFolder={handleOpenPatientFolder}
                  onAddNewVisit={handleAddNewVisitFromFolder}
                  onOpenBillForPatient={(pid) => {
                    const b = bills.find((bill) => bill.patientId === pid);
                    if (b) handleOpenBill(b.id);
                  }}
                  currentRole={currentUser.role}
                />
              )}

              {activeTab === 'billing' && currentUser.role === 'admin' && (
                <BillingPage
                  bills={bills}
                  patients={patients}
                  activeBillId={activeBillId}
                  onUpdateBill={handleUpdateBill}
                  onCreateNewBill={handleCreateNewBill}
                  currentRole={currentUser.role}
                  onSelectPatientFolder={handleOpenPatientFolder}
                />
              )}

              {activeTab === 'nursery' && (currentUser.role === 'admin' || currentUser.role === 'nursery') && (
                <NurseryPage
                  currentRole={currentUser.role}
                  patients={patients}
                  onOpenMotherFolder={handleOpenPatientFolder}
                />
              )}

              {activeTab === 'pharmacy' && (currentUser.role === 'admin' || currentUser.role === 'pharmacist') && (
                <PharmacyPage
                  currentRole={currentUser.role}
                  patients={patients}
                  onOpenPatientFolder={handleOpenPatientFolder}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Standalone Print Invoice Modal when triggered anywhere */}
      {printBill && (
        <PrintInvoiceModal
          bill={printBill}
          patient={patients.find((p) => p.id === printBill.patientId) || patients[0]}
          visit={patients.find((p) => p.id === printBill.patientId)?.visits.find((v) => v.visitCode === printBill.visitCode)}
          onClose={() => setPrintBill(null)}
        />
      )}
    </div>
  );
}

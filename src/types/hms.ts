export type UserRole = 'admin' | 'doctor' | 'nursery' | 'pharmacist';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  avatarColor: string;
}

export type VisitType = 'OPD' | 'IPD' | 'Emergency' | 'Surgery';

export type VisitStatus = 'Registered' | 'In Consultation' | 'Admitted' | 'In OT' | 'Discharged' | 'Completed';

export interface Visit {
  visitCode: string; // e.g. P-000012-V03
  patientId: string; // e.g. P-000012
  visitNumber: number; // e.g. 3
  date: string; // ISO date format
  time: string; // e.g. 10:30 AM
  complaint: string;
  assignedDoctor: string;
  department: string;
  visitType: VisitType;
  status: VisitStatus;
  roomNo?: string;
  vitals?: {
    bp?: string;
    pulse?: number;
    temp?: string;
    weight?: string;
    spo2?: number;
  };
  clinicalNotes?: string;
}

export interface Patient {
  id: string; // e.g. P-000012
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  city: string;
  cnic?: string;
  bloodGroup?: string;
  guardianName?: string;
  registeredDate: string;
  visits: Visit[];
}

export type BillCategory =
  | 'Doctor Fee'
  | 'Operation Fee'
  | 'Anesthesia'
  | 'Room'
  | 'Medical Treatment'
  | 'Medicines'
  | 'OT Equipment'
  | 'Lab'
  | 'Other';

export interface BillLineItem {
  id: string;
  category: BillCategory;
  description: string;
  quantity: number;
  unitPrice: number; // in PKR
  amount: number; // quantity * unitPrice
}

export type BillStatus = 'Draft' | 'Finalized';

export interface Bill {
  id: string; // e.g. INV-2026-0042
  patientId: string; // e.g. P-000012
  visitCode: string; // e.g. P-000012-V03
  createdAt: string;
  items: BillLineItem[];
  subtotal: number;
  discount: number; // in PKR
  total: number;
  advanceReceived: number;
  balance: number;
  status: BillStatus;
  finalizedAt?: string;
  finalizedBy?: string;
  paymentMethod?: 'Cash' | 'Card' | 'Bank Transfer' | 'Pay Order';
  notes?: string;
}

export interface NurseryBaby {
  id: string;
  babyName: string;
  motherName: string;
  motherPatientId: string; // links to patient P-000004
  motherVisitCode: string;
  birthDateTime: string;
  gestationalWeeks: number;
  birthWeightKg: number;
  currentWeightKg: number;
  incubatorId: string;
  status: 'Critical' | 'Stable' | 'Observation' | 'Ready for Discharge';
  phototherapy: boolean;
  feedType: 'Maternal Milk' | 'Formula Pre-term' | 'NPO / IV Fluids';
  feedSchedule: string;
  vitals: {
    spo2: number;
    temp: string;
    heartRate: number;
  };
  notes: string;
}

export interface PharmacyItem {
  id: string;
  medicineName: string;
  genericName: string;
  category: 'Antibiotic' | 'Analgesic' | 'IV Fluid' | 'Cardiac' | 'Anesthetic' | 'Gastro' | 'Surgical Consumable';
  unit: string;
  stock: number;
  unitPricePKR: number;
  batchNumber: string;
  expiryDate: string;
}

export interface PharmacyPrescription {
  id: string;
  patientId: string;
  visitCode: string;
  patientName: string;
  doctorName: string;
  date: string;
  medicines: {
    medicineId: string;
    name: string;
    dosage: string;
    qty: number;
    unitPricePKR: number;
  }[];
  status: 'Pending' | 'Dispensed';
  dispensedAt?: string;
}

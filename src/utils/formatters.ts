/**
 * Formatting utilities for MedPulse HMS
 */

export function formatPKR(amount: number): string {
  const formatted = Math.round(amount).toLocaleString('en-PK');
  return `PKR ${formatted}`;
}

export function formatPKRShort(amount: number): string {
  const formatted = Math.round(amount).toLocaleString('en-PK');
  return `Rs. ${formatted}`;
}

export function generatePatientId(sequenceNumber: number): string {
  const padded = String(sequenceNumber).padStart(6, '0');
  return `P-${padded}`;
}

export function generateVisitCode(patientId: string, visitNumber: number): string {
  const paddedVisit = String(visitNumber).padStart(2, '0');
  return `${patientId}-V${paddedVisit}`;
}

export function parseSearchQuery(query: string): {
  normalized: string;
  isSpecificVisit: boolean;
  patientIdQuery: string;
  visitCodeQuery?: string;
} {
  const trimmed = query.trim().toUpperCase();
  
  // Check if user entered just numbers e.g. "12" -> convert to "P-000012"
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    const convertedId = generatePatientId(num);
    return {
      normalized: convertedId,
      isSpecificVisit: false,
      patientIdQuery: convertedId,
    };
  }

  // Check if user entered visit code e.g. "P-000012-V03" or "P-12-V3" or "12-V3"
  const visitMatch = trimmed.match(/^(?:P-)?0*(\d+)-V0*(\d+)$/i);
  if (visitMatch) {
    const pNum = parseInt(visitMatch[1], 10);
    const vNum = parseInt(visitMatch[2], 10);
    const targetPatientId = generatePatientId(pNum);
    const targetVisitCode = generateVisitCode(targetPatientId, vNum);
    return {
      normalized: targetVisitCode,
      isSpecificVisit: true,
      patientIdQuery: targetPatientId,
      visitCodeQuery: targetVisitCode,
    };
  }

  // Check if user entered e.g. "P-12" or "P-000012"
  const patientMatch = trimmed.match(/^P-0*(\d+)$/i);
  if (patientMatch) {
    const pNum = parseInt(patientMatch[1], 10);
    const targetPatientId = generatePatientId(pNum);
    return {
      normalized: targetPatientId,
      isSpecificVisit: false,
      patientIdQuery: targetPatientId,
    };
  }

  return {
    normalized: trimmed,
    isSpecificVisit: false,
    patientIdQuery: trimmed,
  };
}

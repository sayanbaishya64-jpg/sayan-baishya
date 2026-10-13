import { Application, Appointment } from '../types';
import { INITIAL_APPLICATIONS, INITIAL_APPOINTMENTS } from '../data/servicesData';

const APPS_KEY = 'cyberpoint_applications_v1';
const APPOINTMENTS_KEY = 'cyberpoint_appointments_v1';

export function getStoredApplications(): Application[] {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) {
      localStorage.setItem(APPS_KEY, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPLICATIONS;
  }
}

export function saveApplications(apps: Application[]): void {
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save applications:', e);
  }
}

export function getStoredAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

export function saveAppointments(apts: Appointment[]): void {
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(apts));
  } catch (e) {
    console.error('Failed to save appointments:', e);
  }
}

export function generateApplicationId(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CYBER-2026-${random}`;
}

export function generateToken(isExpress: boolean): string {
  const prefix = isExpress ? 'E' : 'R';
  const num = Math.floor(10 + Math.random() * 89);
  return `TOKEN #${prefix}-${num}`;
}

export function formatWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

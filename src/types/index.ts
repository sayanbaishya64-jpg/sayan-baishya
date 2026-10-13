export interface CyberService {
  id: string;
  title: string;
  category: 'Govt IDs' | 'Exams & Admissions' | 'Certificates' | 'Banking & Utility' | 'Printing & Typing';
  govtFee: number;
  serviceFee: number;
  totalFee: number;
  turnaround: string;
  badge?: string;
  description: string;
  requiredDocs: string[];
  eligibleForOnline: boolean;
  appointmentRecommended?: boolean;
}

export interface UploadedDoc {
  id: string;
  name: string;
  docType: string;
  size: string;
  dataUrl?: string;
  uploadDate: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface WebsiteConfig {
  cafeName: string;
  tagline: string;
  phone: string;
  whatsappPhone: string;
  email: string;
  address: string;
  hours: string;
  heroHeadline: string;
  heroSubtitle: string;
  announcementText: string;
  announcementEnabled: boolean;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  bwPrintRate: number;
  colorPrintRate: number;
  laminationRate: number;
  spiralBindingRate: number;
  urgentFee: number;
}

export interface Application {
  id: string;
  userId?: string;
  serviceId: string;
  serviceTitle: string;
  category: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  applicantAddress?: string;
  deliveryMode: 'digital' | 'pickup' | 'courier';
  notes?: string;
  documents: UploadedDoc[];
  totalFee: number;
  status: 'Received' | 'Documents Verified' | 'In Progress' | 'Form Submitted' | 'Ready for Pickup' | 'Completed';
  createdAt: string;
  updatedAt: string;
  adminRemarks?: string;
  acknowledgmentNo?: string;
}

export interface Appointment {
  id: string;
  userId?: string;
  tokenNumber: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  serviceId: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  counterType: 'Regular Desk' | 'Express Desk';
  status: 'Confirmed' | 'Active at Desk' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

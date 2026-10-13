import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db, auth } from './config';
import { Application, Appointment } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Applications Firestore operations
export function subscribeToApplications(
  onSuccess: (apps: Application[]) => void,
  onError?: (err: any) => void
) {
  const path = 'applications';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const apps: Application[] = [];
        snapshot.forEach((docSnap) => {
          apps.push(docSnap.data() as Application);
        });
        // Sort descending by createdAt
        apps.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onSuccess(apps);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    if (onError) onError(error);
    return () => {};
  }
}

export async function saveApplicationToFirestore(app: Application): Promise<void> {
  const path = `applications/${app.id}`;
  try {
    // Sanitize any undefined properties for Firestore
    const cleanApp = JSON.parse(JSON.stringify(app));
    await setDoc(doc(db, 'applications', app.id), cleanApp);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function updateApplicationInFirestore(
  appId: string,
  updates: Partial<Application>
): Promise<void> {
  const path = `applications/${appId}`;
  try {
    const cleanUpdates = JSON.parse(JSON.stringify(updates));
    await updateDoc(doc(db, 'applications', appId), cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// Appointments Firestore operations
export function subscribeToAppointments(
  onSuccess: (apts: Appointment[]) => void,
  onError?: (err: any) => void
) {
  const path = 'appointments';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const apts: Appointment[] = [];
        snapshot.forEach((docSnap) => {
          apts.push(docSnap.data() as Appointment);
        });
        apts.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onSuccess(apts);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    if (onError) onError(error);
    return () => {};
  }
}

export async function saveAppointmentToFirestore(apt: Appointment): Promise<void> {
  const path = `appointments/${apt.id}`;
  try {
    const cleanApt = JSON.parse(JSON.stringify(apt));
    await setDoc(doc(db, 'appointments', apt.id), cleanApt);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function updateAppointmentInFirestore(
  aptId: string,
  updates: Partial<Appointment>
): Promise<void> {
  const path = `appointments/${aptId}`;
  try {
    const cleanUpdates = JSON.parse(JSON.stringify(updates));
    await updateDoc(doc(db, 'appointments', aptId), cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteAppointmentFromFirestore(aptId: string): Promise<void> {
  const path = `appointments/${aptId}`;
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'appointments', aptId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// Website Configuration Firestore operations
export function subscribeToWebsiteConfig(
  onSuccess: (config: import('../types').WebsiteConfig) => void
) {
  const path = 'settings/website_config';
  try {
    return onSnapshot(
      doc(db, 'settings', 'website_config'),
      (snap) => {
        if (snap.exists()) {
          onSuccess(snap.data() as import('../types').WebsiteConfig);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

export async function saveWebsiteConfigToFirestore(
  config: import('../types').WebsiteConfig
): Promise<void> {
  const path = 'settings/website_config';
  try {
    const clean = JSON.parse(JSON.stringify(config));
    await setDoc(doc(db, 'settings', 'website_config'), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Services Firestore operations
export function subscribeToServices(
  onSuccess: (services: import('../types').CyberService[]) => void
) {
  const path = 'services';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: import('../types').CyberService[] = [];
          snapshot.forEach((snap) => {
            list.push(snap.data() as import('../types').CyberService);
          });
          onSuccess(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

export async function saveServiceToFirestore(
  service: import('../types').CyberService
): Promise<void> {
  const path = `services/${service.id}`;
  try {
    const clean = JSON.parse(JSON.stringify(service));
    await setDoc(doc(db, 'services', service.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteServiceFromFirestore(serviceId: string): Promise<void> {
  const path = `services/${serviceId}`;
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'services', serviceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}


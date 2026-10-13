import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { SendDocumentsSection } from './components/SendDocumentsSection';
import { AppointmentSection } from './components/AppointmentSection';
import { TrackApplicationSection } from './components/TrackApplicationSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { ApplyModal } from './components/ApplyModal';
import { FeeCalculatorModal } from './components/FeeCalculatorModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { CyberService, Application, Appointment, UploadedDoc, WebsiteConfig, UserProfile } from './types';
import { SERVICES_CATALOG } from './data/servicesData';
import { getStoredWebsiteConfig, saveStoredWebsiteConfig } from './data/websiteConfigData';
import {
  getStoredApplications,
  saveApplications,
  getStoredAppointments,
  saveAppointments,
  generateApplicationId,
} from './utils/storage';
import {
  subscribeToApplications,
  saveApplicationToFirestore,
  updateApplicationInFirestore,
  subscribeToAppointments,
  saveAppointmentToFirestore,
  updateAppointmentInFirestore,
  deleteAppointmentFromFirestore,
  subscribeToWebsiteConfig,
  saveWebsiteConfigToFirestore,
  subscribeToServices,
  saveServiceToFirestore,
  deleteServiceFromFirestore,
} from './firebase/db';
import { subscribeToAuth, logoutUser } from './firebase/auth';
import { AuthModal } from './components/AuthModal';
import { UserBookingsModal } from './components/UserBookingsModal';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>(() => getStoredWebsiteConfig());
  const [services, setServices] = useState<CyberService[]>(SERVICES_CATALOG);
  const [applications, setApplications] = useState<Application[]>(() => getStoredApplications());
  const [appointments, setAppointments] = useState<Appointment[]>(() => getStoredAppointments());
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Modal states
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedServiceForApply, setSelectedServiceForApply] = useState<CyberService | null>(null);

  const [selectedServiceForAppointment, setSelectedServiceForAppointment] = useState<CyberService | null>(null);
  const [isFeeCalculatorOpen, setIsFeeCalculatorOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authBookingNotice, setAuthBookingNotice] = useState(false);
  const [isUserBookingsModalOpen, setIsUserBookingsModalOpen] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('services');
  const [trackInitialQuery, setTrackInitialQuery] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Auth listener
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Real-time Firestore sync with local fallback
  useEffect(() => {
    const unsubApps = subscribeToApplications((firestoreApps) => {
      if (firestoreApps && firestoreApps.length > 0) {
        setApplications(firestoreApps);
        saveApplications(firestoreApps);
        setIsFirebaseSynced(true);
      }
    });

    const unsubApts = subscribeToAppointments((firestoreApts) => {
      if (firestoreApts && firestoreApts.length > 0) {
        setAppointments(firestoreApts);
        saveAppointments(firestoreApts);
        setIsFirebaseSynced(true);
      }
    });

    const unsubConfig = subscribeToWebsiteConfig((remoteConfig) => {
      if (remoteConfig) {
        setWebsiteConfig(remoteConfig);
        saveStoredWebsiteConfig(remoteConfig);
      }
    });

    const unsubServices = subscribeToServices((remoteServices) => {
      if (remoteServices && remoteServices.length > 0) {
        setServices(remoteServices);
      }
    });

    return () => {
      unsubApps();
      unsubApts();
      unsubConfig();
      unsubServices();
    };
  }, []);

  // Sync state to local storage
  useEffect(() => {
    saveApplications(applications);
  }, [applications]);

  useEffect(() => {
    saveAppointments(appointments);
  }, [appointments]);

  useEffect(() => {
    saveStoredWebsiteConfig(websiteConfig);
  }, [websiteConfig]);

  // Handlers
  const handleOpenApplyForService = (service: CyberService) => {
    setSelectedServiceForApply(service);
    setIsApplyModalOpen(true);
  };

  const handleOpenGeneralApply = () => {
    setSelectedServiceForApply(services[0]);
    setIsApplyModalOpen(true);
  };

  const handleSelectServiceForAppointment = (service: CyberService) => {
    setSelectedServiceForAppointment(service);
    setActiveTab('appointment');
    const elem = document.getElementById('appointment');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTrackLookup = (query: string) => {
    setTrackInitialQuery(query);
    setActiveTab('track');
    const elem = document.getElementById('track');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApplicationCreated = (newApp: Application) => {
    setApplications((prev) => [newApp, ...prev]);
    saveApplicationToFirestore(newApp).catch((err) => {
      console.warn('Saved locally, Firestore sync pending:', err);
    });
    showToast(`Application ${newApp.id} submitted & synced!`);
  };

  const handleAppointmentBooked = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
    saveAppointmentToFirestore(newApt).catch((err) => {
      console.warn('Saved locally, Firestore sync pending:', err);
    });
    showToast(`Token ${newApt.tokenNumber} reserved for ${newApt.date}!`);
  };

  const handleDocumentSubmissionComplete = (
    docs: UploadedDoc[],
    targetType: string,
    refId?: string,
    instructions?: string
  ) => {
    // If referencing existing application, attach documents to it
    if (refId && applications.some((a) => a.id.toLowerCase() === refId.toLowerCase())) {
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id.toLowerCase() === refId.toLowerCase()) {
            const updatedApp = {
              ...app,
              documents: [...app.documents, ...docs],
              adminRemarks: `Customer uploaded ${docs.length} additional file(s). Note: ${instructions || 'None'}`,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            };
            updateApplicationInFirestore(app.id, {
              documents: updatedApp.documents,
              adminRemarks: updatedApp.adminRemarks,
              updatedAt: updatedApp.updatedAt,
            }).catch(() => {});
            return updatedApp;
          }
          return app;
        })
      );
      showToast(`Files attached to application ${refId}!`);
    } else {
      // Create new lightweight print/document submission record
      const isPrint = targetType === 'printing';
      const newApp: Application = {
        id: refId || generateApplicationId(),
        serviceId: isPrint ? 'color-xerox-print' : 'doc-scanning',
        serviceTitle: isPrint ? 'Remote Laser Print Order' : 'Online Document Submission & Check',
        category: 'Printing & Typing',
        applicantName: 'Remote Customer',
        applicantPhone: 'Online Submission',
        applicantEmail: '',
        deliveryMode: 'pickup',
        notes: instructions || '',
        documents: docs,
        totalFee: isPrint ? 20 : 50,
        status: 'Received',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        adminRemarks: `Remote files received at desk for ${targetType}.`,
      };
      setApplications((prev) => [newApp, ...prev]);
      saveApplicationToFirestore(newApp).catch(() => {});
      showToast(`Documents received at desk! Reference: ${newApp.id}`);
    }
  };

  const handleUpdateApplicationStatus = (
    appId: string,
    newStatus: Application['status'],
    remarks?: string,
    ackNo?: string
  ) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: newStatus,
              adminRemarks: remarks || app.adminRemarks,
              acknowledgmentNo: ackNo || app.acknowledgmentNo,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : app
      )
    );
    updateApplicationInFirestore(appId, {
      status: newStatus,
      adminRemarks: remarks,
      acknowledgmentNo: ackNo,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    }).catch(() => {});
    showToast(`Updated application ${appId} to ${newStatus}`);
  };

  const handleUpdateAppointmentStatus = (
    aptId: string,
    newStatus: Appointment['status'],
    notes?: string
  ) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === aptId
          ? { ...apt, status: newStatus, notes: notes !== undefined ? notes : apt.notes }
          : apt
      )
    );
    updateAppointmentInFirestore(aptId, {
      status: newStatus,
      ...(notes !== undefined ? { notes } : {}),
    }).catch(() => {});
    showToast(`Appointment status updated to ${newStatus}`);
  };

  const handleAddNewBooking = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
    saveAppointmentToFirestore(newApt).catch((err) => {
      console.warn('Saved booking locally, Firestore sync pending:', err);
    });
    showToast(`Token ${newApt.tokenNumber} issued for ${newApt.applicantName}!`);
  };

  const handleDeleteBooking = (aptId: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== aptId));
    deleteAppointmentFromFirestore(aptId).catch(() => {});
    showToast('Booking record deleted.');
  };

  const handleAddNewService = (newService: CyberService) => {
    setServices((prev) => [newService, ...prev]);
    saveServiceToFirestore(newService).catch((err) => {
      console.warn('Saved service locally, Firestore sync pending:', err);
    });
    showToast(`Service "${newService.title}" added to catalog!`);
  };

  const handleUpdateService = (updatedService: CyberService) => {
    setServices((prev) => prev.map((s) => (s.id === updatedService.id ? updatedService : s)));
    saveServiceToFirestore(updatedService).catch((err) => {
      console.warn('Updated service locally, Firestore sync pending:', err);
    });
    showToast(`Service "${updatedService.title}" updated!`);
  };

  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    deleteServiceFromFirestore(serviceId).catch(() => {});
    showToast('Service removed from catalog.');
  };

  const handleUpdateWebsiteConfig = (newConfig: WebsiteConfig) => {
    setWebsiteConfig(newConfig);
    saveStoredWebsiteConfig(newConfig);
    saveWebsiteConfigToFirestore(newConfig).catch((err) => {
      console.warn('Saved config locally, Firestore sync pending:', err);
    });
    showToast('Website customization published successfully!');
  };

  const handleSelectServicesFromCalculator = (selectedServices: CyberService[]) => {
    if (selectedServices.length > 0) {
      handleOpenApplyForService(selectedServices[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5 text-xs max-w-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar following Top Bar Contract */}
      <Navbar
        websiteConfig={websiteConfig}
        onOpenApply={handleOpenGeneralApply}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthBookingNotice(false);
          setIsAuthModalOpen(true);
        }}
        onOpenUserBookings={() => setIsUserBookingsModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          websiteConfig={websiteConfig}
          onOpenApply={handleOpenGeneralApply}
          onOpenAppointment={() => {
            const el = document.getElementById('appointment');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenSendDocs={() => {
            const el = document.getElementById('send-docs');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onTrackLookup={handleTrackLookup}
        />

        {/* Services & Fees Catalog Section */}
        <ServicesSection
          services={services}
          onSelectServiceForApply={handleOpenApplyForService}
          onSelectServiceForAppointment={handleSelectServiceForAppointment}
          onOpenFeeCalculator={() => setIsFeeCalculatorOpen(true)}
        />

        {/* Send Documents Section */}
        <SendDocumentsSection
          websiteConfig={websiteConfig}
          onDocumentSubmissionComplete={handleDocumentSubmissionComplete}
        />

        {/* Book Appointment Section with Auth Gating */}
        <AppointmentSection
          services={services}
          websiteConfig={websiteConfig}
          selectedServicePreload={selectedServiceForAppointment}
          currentUser={currentUser}
          onRequireAuth={() => {
            setAuthBookingNotice(true);
            setIsAuthModalOpen(true);
          }}
          onAppointmentBooked={handleAppointmentBooked}
        />

        {/* Track Application Section */}
        <TrackApplicationSection
          applications={applications}
          initialSearchQuery={trackInitialQuery}
        />

        {/* About Desk & Facility Section */}
        <AboutSection websiteConfig={websiteConfig} />
      </main>

      {/* Clean quiet footer */}
      <Footer
        websiteConfig={websiteConfig}
        onOpenApply={handleOpenGeneralApply}
        onOpenAppointment={() => {
          const el = document.getElementById('appointment');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenSendDocs={() => {
          const el = document.getElementById('send-docs');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
      />

      {/* User Sign In & Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthBookingNotice(false);
        }}
        bookingIntentNotice={authBookingNotice}
        onSuccess={(profile) => {
          setCurrentUser(profile);
          showToast(`Welcome, ${profile.name}! You are now signed in.`);
          if (authBookingNotice) {
            const el = document.getElementById('appointment');
            el?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* User Bookings & Applications View */}
      <UserBookingsModal
        isOpen={isUserBookingsModalOpen}
        onClose={() => setIsUserBookingsModalOpen(false)}
        user={currentUser}
        appointments={appointments}
        applications={applications}
        onLogout={async () => {
          await logoutUser();
          setCurrentUser(null);
          showToast('Signed out successfully');
        }}
      />

      {/* Apply Online Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        service={selectedServiceForApply}
        currentUser={currentUser}
        onApplicationCreated={handleApplicationCreated}
      />

      {/* Fee Calculator Modal */}
      <FeeCalculatorModal
        isOpen={isFeeCalculatorOpen}
        onClose={() => setIsFeeCalculatorOpen(false)}
        websiteConfig={websiteConfig}
        services={services}
        onSelectServicesToApply={handleSelectServicesFromCalculator}
      />

      {/* Cafe Operator / Admin Desk */}
      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        applications={applications}
        appointments={appointments}
        services={services}
        websiteConfig={websiteConfig}
        onUpdateWebsiteConfig={handleUpdateWebsiteConfig}
        onUpdateApplicationStatus={handleUpdateApplicationStatus}
        onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
        onAddNewBooking={handleAddNewBooking}
        onDeleteBooking={handleDeleteBooking}
        onAddNewService={handleAddNewService}
        onUpdateService={handleUpdateService}
        onDeleteService={handleDeleteService}
      />
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  X,
  SlidersHorizontal,
  CheckCircle2,
  Calendar,
  Users,
  Eye,
  FileText,
  Save,
  Plus,
  Lock,
  LogOut,
  Search,
  Printer,
  Trash2,
  AlertCircle,
  Sparkles,
  Ticket,
  Palette,
  Edit2,
  RotateCcw,
  Megaphone,
  Check,
} from 'lucide-react';
import { Application, Appointment, CyberService, WebsiteConfig } from '../types';
import { generateToken } from '../utils/storage';
import { DEFAULT_WEBSITE_CONFIG } from '../data/websiteConfigData';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
  appointments: Appointment[];
  services: CyberService[];
  websiteConfig: WebsiteConfig;
  onUpdateWebsiteConfig: (newConfig: WebsiteConfig) => void;
  onUpdateApplicationStatus: (appId: string, newStatus: Application['status'], remarks?: string, ackNo?: string) => void;
  onUpdateAppointmentStatus: (aptId: string, newStatus: Appointment['status'], notes?: string) => void;
  onAddNewBooking: (newApt: Appointment) => void;
  onDeleteBooking: (aptId: string) => void;
  onAddNewService: (service: CyberService) => void;
  onUpdateService: (service: CyberService) => void;
  onDeleteService: (serviceId: string) => void;
}

const ADMIN_CREDENTIALS = {
  email: 'sayanbaishya64@gmail.com',
  password: 'Sayan8116@',
};

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  applications,
  appointments,
  services,
  websiteConfig,
  onUpdateWebsiteConfig,
  onUpdateApplicationStatus,
  onUpdateAppointmentStatus,
  onAddNewBooking,
  onDeleteBooking,
  onAddNewService,
  onUpdateService,
  onDeleteService,
}) => {
  if (!isOpen) return null;

  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('cyberpoint_admin_logged_in') === 'true';
  });
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'appointments' | 'applications' | 'services' | 'customization'>('appointments');

  // Website Customization Draft State
  const [draftConfig, setDraftConfig] = useState<WebsiteConfig>({ ...websiteConfig });
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  React.useEffect(() => {
    setDraftConfig({ ...websiteConfig });
  }, [websiteConfig, isOpen]);

  // Bookings Filter & Search
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'All' | 'Today' | 'Confirmed' | 'Active at Desk' | 'Completed' | 'Cancelled'>('All');

  // Add New Booking Drawer/Modal
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newServiceId, setNewServiceId] = useState(services[0]?.id || 'pan-new');
  const [newBookingDate, setNewBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTimeSlot, setNewTimeSlot] = useState('Immediate Walk-In (Current Slot)');
  const [newCounterType, setNewCounterType] = useState<'Regular Desk' | 'Express Desk'>('Express Desk');
  const [newBookingNotes, setNewBookingNotes] = useState('Walk-in customer at admin counter');

  // Applications tab state
  const [selectedApp, setSelectedApp] = useState<Application | null>(applications[0] || null);
  const [editingStatus, setEditingStatus] = useState<Application['status']>('Received');
  const [editingRemarks, setEditingRemarks] = useState('');
  const [editingAckNo, setEditingAckNo] = useState('');

  // Service Edit / Add state
  const [showServiceFormModal, setShowServiceFormModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceCategory, setServiceCategory] = useState<CyberService['category']>('Govt IDs');
  const [serviceGovtFee, setServiceGovtFee] = useState(0);
  const [serviceFee, setServiceFee] = useState(100);
  const [serviceTurnaround, setServiceTurnaround] = useState('24 - 48 Hours');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceDocs, setServiceDocs] = useState('Aadhaar Card, Passport Photo');

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailMatch = adminEmailInput.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
    const passMatch = adminPasswordInput === ADMIN_CREDENTIALS.password;

    if (emailMatch && passMatch) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('cyberpoint_admin_logged_in', 'true');
      setAuthError(null);
    } else {
      setAuthError('Access Denied: Invalid admin email or password.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('cyberpoint_admin_logged_in');
    setAdminEmailInput('');
    setAdminPasswordInput('');
  };

  const handleQuickAdminFill = () => {
    setAdminEmailInput(ADMIN_CREDENTIALS.email);
    setAdminPasswordInput(ADMIN_CREDENTIALS.password);
    setAuthError(null);
  };

  // Filtered Appointments
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const q = bookingSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.tokenNumber.toLowerCase().includes(q) ||
        apt.applicantName.toLowerCase().includes(q) ||
        apt.applicantPhone.includes(q) ||
        apt.serviceTitle.toLowerCase().includes(q);

      let matchesFilter = true;
      if (bookingStatusFilter === 'Today') {
        matchesFilter = apt.date === todayStr;
      } else if (bookingStatusFilter !== 'All') {
        matchesFilter = apt.status === bookingStatusFilter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [appointments, bookingSearch, bookingStatusFilter, todayStr]);

  const todayCount = appointments.filter((a) => a.date === todayStr).length;
  const activeCount = appointments.filter((a) => a.status === 'Active at Desk').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;

  // Handle Create New Booking from Admin End
  const handleCreateNewBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const chosenService = services.find((s) => s.id === newServiceId) || services[0];
    const token = generateToken(newCounterType === 'Express Desk');

    const newApt: Appointment = {
      id: `APT-ADM-${Date.now().toString().slice(-4)}`,
      tokenNumber: token,
      applicantName: newCustName.trim(),
      applicantPhone: newCustPhone.trim(),
      applicantEmail: newCustEmail.trim() || 'walkin@cyberpoint.in',
      serviceId: chosenService.id,
      serviceTitle: chosenService.title,
      date: newBookingDate,
      timeSlot: newTimeSlot,
      counterType: newCounterType,
      status: 'Confirmed',
      notes: newBookingNotes,
      createdAt: new Date().toISOString(),
    };

    onAddNewBooking(newApt);
    setShowAddBookingModal(false);

    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewBookingNotes('Walk-in customer at admin counter');
  };

  // Handle Save Website Customizations
  const handleSaveWebsiteCustomization = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWebsiteConfig(draftConfig);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleResetWebsiteCustomization = () => {
    if (confirm('Reset all website settings to original defaults?')) {
      setDraftConfig(DEFAULT_WEBSITE_CONFIG);
      onUpdateWebsiteConfig(DEFAULT_WEBSITE_CONFIG);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    }
  };

  // Handle Select Application
  const handleSelectApp = (app: Application) => {
    setSelectedApp(app);
    setEditingStatus(app.status);
    setEditingRemarks(app.adminRemarks || '');
    setEditingAckNo(app.acknowledgmentNo || '');
  };

  const handleSaveAppStatus = () => {
    if (!selectedApp) return;
    onUpdateApplicationStatus(selectedApp.id, editingStatus, editingRemarks, editingAckNo);
    setSelectedApp({
      ...selectedApp,
      status: editingStatus,
      adminRemarks: editingRemarks,
      acknowledgmentNo: editingAckNo,
    });
  };

  // Open Service Form (New or Edit)
  const openNewServiceModal = () => {
    setEditingServiceId(null);
    setServiceTitle('');
    setServiceCategory('Govt IDs');
    setServiceGovtFee(0);
    setServiceFee(100);
    setServiceTurnaround('24 - 48 Hours');
    setServiceDesc('');
    setServiceDocs('Aadhaar Card, Passport Photo');
    setShowServiceFormModal(true);
  };

  const openEditServiceModal = (svc: CyberService) => {
    setEditingServiceId(svc.id);
    setServiceTitle(svc.title);
    setServiceCategory(svc.category);
    setServiceGovtFee(svc.govtFee);
    setServiceFee(svc.serviceFee);
    setServiceTurnaround(svc.turnaround);
    setServiceDesc(svc.description);
    setServiceDocs(svc.requiredDocs.join(', '));
    setShowServiceFormModal(true);
  };

  const handleSaveServiceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle) return;

    const govtNum = Number(serviceGovtFee) || 0;
    const cafeNum = Number(serviceFee) || 0;

    const payload: CyberService = {
      id: editingServiceId || `svc-${Date.now()}`,
      title: serviceTitle.trim(),
      category: serviceCategory,
      govtFee: govtNum,
      serviceFee: cafeNum,
      totalFee: govtNum + cafeNum,
      turnaround: serviceTurnaround.trim(),
      description: serviceDesc.trim(),
      requiredDocs: serviceDocs.split(',').map((d) => d.trim()).filter(Boolean),
      eligibleForOnline: true,
      badge: editingServiceId ? undefined : 'Custom',
    };

    if (editingServiceId) {
      onUpdateService(payload);
    } else {
      onAddNewService(payload);
    }

    setShowServiceFormModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>CyberPoint Admin & CMS Control Center</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded font-mono font-semibold">
                  Admin Only
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Full site customizer, bookings queue, walk-in token generator & service fee editor
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={handleAdminLogout}
                title="Log out from Admin Desk"
                className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Admin Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTHENTICATION GATE */}
        {!isAdminAuthenticated ? (
          <div className="p-8 max-w-md mx-auto my-auto w-full text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200 shadow-xs">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Admin Authentication Required
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Access is restricted to authorized cyber cafe administrators only.
            </p>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-left text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="sayanbaishya64@gmail.com"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter admin password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                Sign In to Admin Portal
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleQuickAdminFill}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-fill Admin Credentials ({ADMIN_CREDENTIALS.email})</span>
              </button>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <>
            {/* Top Navigation Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-2.5 bg-slate-100 border-b border-slate-200 text-xs shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'appointments'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Bookings & Tokens ({appointments.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('customization')}
                  className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'customization'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-blue-600" />
                  <span>Customize Entire Website</span>
                </button>

                <button
                  onClick={() => setActiveTab('applications')}
                  className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'applications'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Applications ({applications.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'services'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Services & Fees ({services.length})</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-mono hidden md:block">
                Admin: <strong className="text-slate-800">{ADMIN_CREDENTIALS.email}</strong>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {/* 1. CUSTOMIZE ENTIRE WEBSITE CMS TAB */}
              {activeTab === 'customization' && (
                <form onSubmit={handleSaveWebsiteCustomization} className="space-y-6 max-w-4xl mx-auto">
                  {saveSuccessNotice && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">All website changes saved & published live!</span>
                      </div>
                      <span className="text-[11px] text-emerald-600">Updated in Firestore & Local state</span>
                    </div>
                  )}

                  {/* Top Bar / Notice Marquee Customization */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          01. Top Announcement Bar & Notice
                        </span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={draftConfig.announcementEnabled}
                          onChange={(e) => setDraftConfig({ ...draftConfig, announcementEnabled: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span>Enable Top Notice Banner</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Notice Text (Appears at the very top of the website for all visitors)
                      </label>
                      <input
                        type="text"
                        value={draftConfig.announcementText}
                        onChange={(e) => setDraftConfig({ ...draftConfig, announcementText: e.target.value })}
                        placeholder="e.g. ⚡ Notice: SSC CGL 2026 Form Fillings are now open at Counter 1!"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Brand & Business Details */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                      02. Brand Name & Contact Information
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Cafe / Center Name</label>
                        <input
                          type="text"
                          required
                          value={draftConfig.cafeName}
                          onChange={(e) => setDraftConfig({ ...draftConfig, cafeName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Tagline / Sub-Heading</label>
                        <input
                          type="text"
                          value={draftConfig.tagline}
                          onChange={(e) => setDraftConfig({ ...draftConfig, tagline: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={draftConfig.phone}
                          onChange={(e) => setDraftConfig({ ...draftConfig, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">WhatsApp Number (e.g. +919876543210)</label>
                        <input
                          type="text"
                          value={draftConfig.whatsappPhone}
                          onChange={(e) => setDraftConfig({ ...draftConfig, whatsappPhone: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Official Email Address</label>
                        <input
                          type="email"
                          value={draftConfig.email}
                          onChange={(e) => setDraftConfig({ ...draftConfig, email: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Working / Operating Hours</label>
                        <input
                          type="text"
                          value={draftConfig.hours}
                          onChange={(e) => setDraftConfig({ ...draftConfig, hours: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold text-xs mb-1">Physical Center Address</label>
                      <input
                        type="text"
                        value={draftConfig.address}
                        onChange={(e) => setDraftConfig({ ...draftConfig, address: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Hero Section Copy & Metrics */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                      03. Hero Section Copy & Proof Metrics
                    </span>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Hero Main Headline</label>
                        <input
                          type="text"
                          value={draftConfig.heroHeadline}
                          onChange={(e) => setDraftConfig({ ...draftConfig, heroHeadline: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Hero Subtitle / Description</label>
                        <textarea
                          rows={2}
                          value={draftConfig.heroSubtitle}
                          onChange={(e) => setDraftConfig({ ...draftConfig, heroSubtitle: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3 bg-slate-50 border rounded-xl">
                          <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Stat Metric 1</label>
                          <input
                            type="text"
                            value={draftConfig.stat1Value}
                            onChange={(e) => setDraftConfig({ ...draftConfig, stat1Value: e.target.value })}
                            className="w-full px-2 py-1 mb-1 font-bold font-mono bg-white border rounded text-xs"
                          />
                          <input
                            type="text"
                            value={draftConfig.stat1Label}
                            onChange={(e) => setDraftConfig({ ...draftConfig, stat1Label: e.target.value })}
                            className="w-full px-2 py-1 text-[11px] bg-white border rounded text-slate-600"
                          />
                        </div>

                        <div className="p-3 bg-slate-50 border rounded-xl">
                          <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Stat Metric 2</label>
                          <input
                            type="text"
                            value={draftConfig.stat2Value}
                            onChange={(e) => setDraftConfig({ ...draftConfig, stat2Value: e.target.value })}
                            className="w-full px-2 py-1 mb-1 font-bold font-mono bg-white border rounded text-xs"
                          />
                          <input
                            type="text"
                            value={draftConfig.stat2Label}
                            onChange={(e) => setDraftConfig({ ...draftConfig, stat2Label: e.target.value })}
                            className="w-full px-2 py-1 text-[11px] bg-white border rounded text-slate-600"
                          />
                        </div>

                        <div className="p-3 bg-slate-50 border rounded-xl">
                          <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Stat Metric 3</label>
                          <input
                            type="text"
                            value={draftConfig.stat3Value}
                            onChange={(e) => setDraftConfig({ ...draftConfig, stat3Value: e.target.value })}
                            className="w-full px-2 py-1 mb-1 font-bold font-mono bg-white border rounded text-xs"
                          />
                          <input
                            type="text"
                            value={draftConfig.stat3Label}
                            onChange={(e) => setDraftConfig({ ...draftConfig, stat3Label: e.target.value })}
                            className="w-full px-2 py-1 text-[11px] bg-white border rounded text-slate-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Printing & Stationery Rates */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                      04. Stationery, Printing & Addon Price Rates (₹)
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-1">B&W Print / Page</label>
                        <input
                          type="number"
                          value={draftConfig.bwPrintRate}
                          onChange={(e) => setDraftConfig({ ...draftConfig, bwPrintRate: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Color Print / Page</label>
                        <input
                          type="number"
                          value={draftConfig.colorPrintRate}
                          onChange={(e) => setDraftConfig({ ...draftConfig, colorPrintRate: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Lamination Rate</label>
                        <input
                          type="number"
                          value={draftConfig.laminationRate}
                          onChange={(e) => setDraftConfig({ ...draftConfig, laminationRate: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Spiral Binding Rate</label>
                        <input
                          type="number"
                          value={draftConfig.spiralBindingRate}
                          onChange={(e) => setDraftConfig({ ...draftConfig, spiralBindingRate: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Express Queue Fee</label>
                        <input
                          type="number"
                          value={draftConfig.urgentFee}
                          onChange={(e) => setDraftConfig({ ...draftConfig, urgentFee: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleResetWebsiteCustomization}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Original Defaults</span>
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Publish All Website Changes</span>
                    </button>
                  </div>
                </form>
              )}

              {/* 2. BOOKINGS & TOKENS TAB */}
              {activeTab === 'appointments' && (
                <div className="space-y-6">
                  {/* KPI Stat Cards Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] text-slate-500 font-medium">Total Bookings</div>
                      <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                        {appointments.length}
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] text-blue-600 font-medium">Today's Visits</div>
                      <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums mt-0.5">
                        {todayCount}
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] text-amber-600 font-medium">Active at Desk</div>
                      <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums mt-0.5">
                        {activeCount}
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] text-emerald-600 font-medium">Completed / Served</div>
                      <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums mt-0.5">
                        {completedCount}
                      </div>
                    </div>
                  </div>

                  {/* Filter & Action Toolbar */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search Token, Name, Phone..."
                          value={bookingSearch}
                          onChange={(e) => setBookingSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-1 overflow-x-auto text-xs">
                        {(['All', 'Today', 'Confirmed', 'Active at Desk', 'Completed', 'Cancelled'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => setBookingStatusFilter(st)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                              bookingStatusFilter === st
                                ? 'bg-blue-600 text-white font-semibold'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAddBookingModal(true)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ New Booking (Walk-in / Phone)</span>
                    </button>
                  </div>

                  {/* Bookings List */}
                  <div className="space-y-3">
                    {filteredAppointments.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-400">
                        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p>No bookings match the selected filter criteria.</p>
                      </div>
                    ) : (
                      filteredAppointments.map((apt) => {
                        const isToday = apt.date === todayStr;
                        return (
                          <div
                            key={apt.id}
                            className={`p-4 rounded-xl border transition-all text-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                              apt.status === 'Active at Desk'
                                ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                                : apt.status === 'Completed'
                                ? 'bg-white border-slate-200 opacity-80'
                                : apt.status === 'Cancelled'
                                ? 'bg-slate-50 border-slate-200 opacity-60'
                                : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  {apt.tokenNumber}
                                </span>
                                <span className="text-sm font-bold text-slate-900">{apt.applicantName}</span>
                                <span className="text-slate-500 font-mono">({apt.applicantPhone})</span>
                                {isToday && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                    TODAY
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  {apt.counterType}
                                </span>
                              </div>

                              <div className="text-slate-700 font-medium">
                                Service: <strong className="text-slate-900">{apt.serviceTitle}</strong>
                              </div>

                              <div className="text-slate-500 text-[11px] flex flex-wrap items-center gap-2">
                                <span>Scheduled: <strong className="text-slate-700 font-mono">{apt.date}</strong> · <strong className="text-slate-700 font-mono">{apt.timeSlot}</strong></span>
                                {apt.applicantEmail && (
                                  <>
                                    <span>·</span>
                                    <span>{apt.applicantEmail}</span>
                                  </>
                                )}
                                {apt.notes && (
                                  <>
                                    <span>·</span>
                                    <span className="italic text-slate-600">"{apt.notes}"</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <span
                                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                                  apt.status === 'Active at Desk'
                                    ? 'bg-amber-100 text-amber-800'
                                    : apt.status === 'Confirmed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : apt.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {apt.status}
                              </span>

                              {apt.status === 'Confirmed' && (
                                <button
                                  onClick={() => onUpdateAppointmentStatus(apt.id, 'Active at Desk')}
                                  className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors whitespace-nowrap"
                                >
                                  Call to Desk
                                </button>
                              )}

                              {apt.status !== 'Completed' && (
                                <button
                                  onClick={() => onUpdateAppointmentStatus(apt.id, 'Completed')}
                                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                                >
                                  Mark Served
                                </button>
                              )}

                              {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                                <button
                                  onClick={() => onUpdateAppointmentStatus(apt.id, 'Cancelled')}
                                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-700 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              )}

                              <button
                                onClick={() => window.print()}
                                title="Print Token Slip"
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Delete booking for ${apt.applicantName} (${apt.tokenNumber})?`)) {
                                    onDeleteBooking(apt.id);
                                  }
                                }}
                                title="Delete Booking Record"
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* 3. APPLICATIONS MANAGEMENT TAB */}
              {activeTab === 'applications' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between">
                      <span>Online Applications</span>
                      <span className="font-mono text-slate-500">{applications.length} Total</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                      {applications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No customer applications received yet.
                        </div>
                      ) : (
                        applications.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => handleSelectApp(app)}
                            className={`p-3.5 cursor-pointer text-xs transition-colors ${
                              selectedApp?.id === app.id
                                ? 'bg-blue-50/70 border-l-4 border-blue-600'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-blue-700">{app.id}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{app.createdAt.slice(0, 10)}</span>
                            </div>
                            <div className="font-semibold text-slate-900 mt-0.5 truncate">
                              {app.applicantName}
                            </div>
                            <div className="text-slate-500 text-[11px] truncate">
                              {app.serviceTitle}
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/60">
                              <span className="text-[10px] font-semibold text-slate-600">
                                Status: <strong className="text-blue-800">{app.status}</strong>
                              </span>
                              <span className="font-mono font-bold text-slate-800 text-[11px]">
                                ₹{app.totalFee}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                    {selectedApp ? (
                      <>
                        <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                          <div>
                            <div className="text-xs text-slate-500">Applicant Details</div>
                            <div className="text-base font-bold text-slate-900">{selectedApp.applicantName}</div>
                            <div className="text-xs text-slate-600 font-mono mt-0.5">
                              Phone: {selectedApp.applicantPhone} {selectedApp.applicantEmail ? `· ${selectedApp.applicantEmail}` : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-blue-600 text-sm">{selectedApp.id}</div>
                            <div className="text-[11px] text-slate-500">Total: ₹{selectedApp.totalFee}</div>
                          </div>
                        </div>

                        <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="font-semibold text-slate-900">Service: {selectedApp.serviceTitle}</div>
                          <div className="text-slate-500 mt-1">Delivery: {selectedApp.deliveryMode.toUpperCase()}</div>
                          {selectedApp.notes && (
                            <div className="text-slate-600 mt-1.5 pt-1.5 border-t border-slate-100">
                              <strong className="text-slate-800">Customer Note:</strong> {selectedApp.notes}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-bold text-slate-800 mb-2">
                            Uploaded Documents ({selectedApp.documents.length})
                          </div>
                          {selectedApp.documents.length === 0 ? (
                            <div className="text-xs text-slate-400 italic">No files attached with this application.</div>
                          ) : (
                            <div className="space-y-2">
                              {selectedApp.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                >
                                  <div className="truncate mr-2">
                                    <div className="font-medium text-slate-800 truncate">{doc.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{doc.size}</div>
                                  </div>
                                  {doc.dataUrl ? (
                                    <a
                                      href={doc.dataUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={doc.name}
                                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-white border border-blue-200 rounded transition-colors whitespace-nowrap flex items-center gap-1"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>View / Download</span>
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-mono">File on Desk</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
                            Update Application Status
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-slate-600 mb-1 font-medium">New Status</label>
                              <select
                                value={editingStatus}
                                onChange={(e) => setEditingStatus(e.target.value as any)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                              >
                                <option value="Received">Received</option>
                                <option value="Documents Verified">Documents Verified</option>
                                <option value="In Progress">In Progress (Processing Portal)</option>
                                <option value="Form Submitted">Form Submitted</option>
                                <option value="Ready for Pickup">Ready for Pickup</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-600 mb-1 font-medium">Govt Acknowledgment No</label>
                              <input
                                type="text"
                                placeholder="e.g. ACK-NSDL-882941"
                                value={editingAckNo}
                                onChange={(e) => setEditingAckNo(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-600 mb-1 font-medium text-xs">
                              Operator Remarks (Visible to customer on tracking page)
                            </label>
                            <textarea
                              rows={2}
                              value={editingRemarks}
                              onChange={(e) => setEditingRemarks(e.target.value)}
                              placeholder="e.g. Documents verified. Submitted on NSDL portal. Slip generated."
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                            />
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={handleSaveAppStatus}
                              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Save & Update Customer Record</span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10 text-xs text-slate-400">
                        Select an application from the left to inspect and update.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. SERVICES & FEES CATALOG TAB */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-600">
                      Full live service catalog. You can edit official fees, documentation charges, or delete any service.
                    </div>
                    <button
                      onClick={openNewServiceModal}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Service</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                        <tr>
                          <th className="py-2.5 px-4">Service Name</th>
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4 font-mono">Govt Fee</th>
                          <th className="py-2.5 px-4 font-mono">Cafe Fee</th>
                          <th className="py-2.5 px-4 font-mono">Total Fee</th>
                          <th className="py-2.5 px-4">Turnaround</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {services.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-medium text-slate-900">{s.title}</td>
                            <td className="py-2.5 px-4">{s.category}</td>
                            <td className="py-2.5 px-4 font-mono">₹{s.govtFee}</td>
                            <td className="py-2.5 px-4 font-mono">₹{s.serviceFee}</td>
                            <td className="py-2.5 px-4 font-mono font-bold text-blue-700">₹{s.totalFee}</td>
                            <td className="py-2.5 px-4 text-slate-500">{s.turnaround}</td>
                            <td className="py-2.5 px-4 text-right space-x-1">
                              <button
                                onClick={() => openEditServiceModal(s)}
                                title="Edit Service"
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete service "${s.title}"?`)) {
                                    onDeleteService(s.id);
                                  }
                                }}
                                title="Delete Service"
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL: ADD NEW BOOKING FROM ADMIN END */}
            {showAddBookingModal && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-[11px] font-bold uppercase text-blue-600 tracking-wider">
                        Admin Desk
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Create New Counter Booking (Walk-in / Phone)
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowAddBookingModal(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateNewBooking} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Customer Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Chandra"
                          value={newCustName}
                          onChange={(e) => setNewCustName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 98450 12345"
                          value={newCustPhone}
                          onChange={(e) => setNewCustPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Email (Optional)</label>
                        <input
                          type="email"
                          placeholder="customer@email.com"
                          value={newCustEmail}
                          onChange={(e) => setNewCustEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Target Service *</label>
                        <select
                          value={newServiceId}
                          onChange={(e) => setNewServiceId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        >
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title} (₹{s.totalFee})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Booking Date</label>
                        <input
                          type="date"
                          value={newBookingDate}
                          onChange={(e) => setNewBookingDate(e.target.value)}
                          className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Time Slot</label>
                        <select
                          value={newTimeSlot}
                          onChange={(e) => setNewTimeSlot(e.target.value)}
                          className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-[11px]"
                        >
                          <option value="Immediate Walk-In (Current Slot)">Immediate Walk-In</option>
                          <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                          <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                          <option value="12:00 PM - 12:30 PM">12:00 PM - 12:30 PM</option>
                          <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                          <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                          <option value="06:00 PM - 06:30 PM">06:00 PM - 06:30 PM</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Counter</label>
                        <select
                          value={newCounterType}
                          onChange={(e) => setNewCounterType(e.target.value as any)}
                          className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-[11px]"
                        >
                          <option value="Express Desk">Express Fast-Track</option>
                          <option value="Regular Desk">Regular Counter</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Admin Notes</label>
                      <input
                        type="text"
                        value={newBookingNotes}
                        onChange={(e) => setNewBookingNotes(e.target.value)}
                        placeholder="e.g. Paid in cash at desk, bringing original marksheets"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowAddBookingModal(false)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Confirm & Generate Token</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: ADD OR EDIT SERVICE */}
            {showServiceFormModal && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900">
                      {editingServiceId ? 'Edit Service & Fees' : 'Add New Service to Catalog'}
                    </h4>
                    <button onClick={() => setShowServiceFormModal(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveServiceForm} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Service Title *</label>
                      <input
                        type="text"
                        required
                        value={serviceTitle}
                        onChange={(e) => setServiceTitle(e.target.value)}
                        placeholder="e.g. Passport Police Verification Filing"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Category</label>
                        <select
                          value={serviceCategory}
                          onChange={(e) => setServiceCategory(e.target.value as any)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="Govt IDs">Govt IDs</option>
                          <option value="Exams & Admissions">Exams & Admissions</option>
                          <option value="Certificates">Certificates</option>
                          <option value="Banking & Utility">Banking & Utility</option>
                          <option value="Printing & Typing">Printing & Typing</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Turnaround Time</label>
                        <input
                          type="text"
                          value={serviceTurnaround}
                          onChange={(e) => setServiceTurnaround(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Official Govt Portal Fee (₹)</label>
                        <input
                          type="number"
                          value={serviceGovtFee}
                          onChange={(e) => setServiceGovtFee(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Cyber Cafe Fee (₹)</label>
                        <input
                          type="number"
                          value={serviceFee}
                          onChange={(e) => setServiceFee(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={serviceDesc}
                        onChange={(e) => setServiceDesc(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        placeholder="Explain what the service includes..."
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Required Documents (Comma separated)</label>
                      <input
                        type="text"
                        value={serviceDocs}
                        onChange={(e) => setServiceDocs(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowServiceFormModal(false)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                      >
                        {editingServiceId ? 'Save Changes' : 'Add Service'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

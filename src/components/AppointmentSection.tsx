import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Ticket, Printer, ArrowRight, UserCheck, Lock, User } from 'lucide-react';
import { CyberService, Appointment, UserProfile, WebsiteConfig } from '../types';
import { SERVICES_CATALOG } from '../data/servicesData';
import { generateToken } from '../utils/storage';

interface AppointmentSectionProps {
  selectedServicePreload?: CyberService | null;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
  onAppointmentBooked: (apt: Appointment) => void;
  services?: CyberService[];
  websiteConfig?: WebsiteConfig;
}

export const AppointmentSection: React.FC<AppointmentSectionProps> = ({
  selectedServicePreload,
  currentUser,
  onRequireAuth,
  onAppointmentBooked,
  services,
  websiteConfig,
}) => {
  const servicesCatalog = services && services.length > 0 ? services : SERVICES_CATALOG;
  const [serviceId, setServiceId] = useState(selectedServicePreload?.id || servicesCatalog[0]?.id || SERVICES_CATALOG[0].id);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM - 11:30 AM');
  const [counterType, setCounterType] = useState<'Regular Desk' | 'Express Desk'>('Express Desk');
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');
  const [notes, setNotes] = useState('');

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);

  // Sync user profile when user logs in
  useEffect(() => {
    if (currentUser) {
      if (!applicantName) setApplicantName(currentUser.name);
      if (!applicantEmail) setApplicantEmail(currentUser.email);
      if (!applicantPhone && currentUser.phone) setApplicantPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Generate next 14 days
  const upcomingDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayName, dayNum, monthName };
  });

  const timeSlots = [
    { time: '09:30 AM - 10:00 AM', period: 'Morning', available: true },
    { time: '10:30 AM - 11:00 AM', period: 'Morning', available: true },
    { time: '11:00 AM - 11:30 AM', period: 'Morning', available: true },
    { time: '12:00 PM - 12:30 PM', period: 'Afternoon', available: true },
    { time: '01:30 PM - 02:00 PM', period: 'Afternoon', available: false },
    { time: '02:30 PM - 03:00 PM', period: 'Afternoon', available: true },
    { time: '04:00 PM - 04:30 PM', period: 'Evening', available: true },
    { time: '05:30 PM - 06:00 PM', period: 'Evening', available: true },
    { time: '07:00 PM - 07:30 PM', period: 'Evening', available: true },
  ];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!applicantName || !applicantPhone) return;

    const chosenService = servicesCatalog.find((s) => s.id === serviceId) || servicesCatalog[0] || SERVICES_CATALOG[0];
    const token = generateToken(counterType === 'Express Desk');

    const newApt: Appointment = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.uid,
      tokenNumber: token,
      applicantName,
      applicantPhone,
      applicantEmail: applicantEmail || currentUser.email,
      serviceId: chosenService.id,
      serviceTitle: chosenService.title,
      date: selectedDate,
      timeSlot: selectedSlot,
      counterType,
      status: 'Confirmed',
      notes,
      createdAt: new Date().toISOString(),
    };

    setConfirmedApt(newApt);
    setBookingConfirmed(true);
    onAppointmentBooked(newApt);
  };

  const handleDownloadIcs = () => {
    if (!confirmedApt) return;
    const cafeName = websiteConfig?.cafeName || 'CyberPoint Online';
    const address = websiteConfig?.address || 'CyberPoint Digital Services Desk';
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//${cafeName}//Appointment//EN
BEGIN:VEVENT
SUMMARY:${cafeName} Appointment: ${confirmedApt.serviceTitle}
DESCRIPTION:Token: ${confirmedApt.tokenNumber}\\nCounter: ${confirmedApt.counterType}\\nBring required ID cards.
LOCATION:${address}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CyberPoint_Token_${confirmedApt.tokenNumber.replace(/[^a-zA-Z0-9]/g, '')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="appointment" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-blue-600 mb-2">
              Queue-Free In-Person Visit
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Book a Dedicated Counter Slot
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Prefer sitting with our expert for complex passport filings, college choice filling, or biometric Aadhaar updates? Reserve a timed slot and receive an instant priority token.
            </p>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 self-start md:self-auto bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Dedicated Operator Reserved</span>
          </div>
        </div>

        {bookingConfirmed && confirmedApt ? (
          /* Confirmation Slip */
          <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="text-center pb-6 border-b border-slate-100">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Appointment Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your priority slot has been booked and saved to your account in our cyber cafe queue.
              </p>
            </div>

            {/* Token Badge */}
            <div className="my-6 p-5 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <div className="text-[11px] font-semibold uppercase text-blue-700 tracking-wider">
                Priority Counter Token
              </div>
              <div className="text-3xl font-extrabold font-mono text-blue-900 my-1">
                {confirmedApt.tokenNumber}
              </div>
              <div className="text-xs text-blue-800 font-medium">
                {confirmedApt.counterType} · Show this token at counter reception
              </div>
            </div>

            {/* Slot Details */}
            <div className="space-y-2.5 text-xs text-slate-700 pb-6 border-b border-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-900 text-right">{confirmedApt.serviceTitle}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-semibold text-slate-900 font-mono">{confirmedApt.date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Time Slot:</span>
                <span className="font-semibold text-slate-900 font-mono">{confirmedApt.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-medium text-slate-900">{confirmedApt.applicantName} ({confirmedApt.applicantPhone})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Account:</span>
                <span className="font-mono text-blue-600 text-[11px]">{confirmedApt.applicantEmail}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Token Slip</span>
              </button>
              <button
                onClick={handleDownloadIcs}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Add to Calendar (.ics)</span>
              </button>
            </div>

            <button
              onClick={() => {
                setBookingConfirmed(false);
                setConfirmedApt(null);
              }}
              className="w-full text-center text-xs text-blue-600 hover:underline pt-4 block"
            >
              Book another appointment
            </button>
          </div>
        ) : (
          /* Booking Form */
          <div className="space-y-4">
            {/* User status alert banner */}
            {!currentUser ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Sign in required before appointment booking</span>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Please log in or create an account so we can store your booking and generate your verified token.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs whitespace-nowrap shadow-xs transition-colors"
                >
                  Sign In / Register
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Authenticated as <strong className="text-emerald-950">{currentUser.name}</strong> ({currentUser.email}).
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 font-medium">Ready to Book</span>
              </div>
            )}

            <form
              onSubmit={handleBookingSubmit}
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8"
            >
            {/* Step 1: Select Service & Desk Type */}
            <div>
              <div className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-3">
                01. Select Service & Counter Type
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Select Target Service *
                  </label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {servicesCatalog.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} (Fee: ₹{s.totalFee})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Counter Type
                  </label>
                  <select
                    value={counterType}
                    onChange={(e) => setCounterType(e.target.value as 'Regular Desk' | 'Express Desk')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Express Desk">Express Fast-Track Desk (Zero Wait)</option>
                    <option value="Regular Desk">Standard Counter</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Choose Date */}
            <div>
              <div className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-3 flex items-center justify-between">
                <span>02. Select Date (Upcoming 14 Days)</span>
                <span className="text-[11px] text-slate-500 font-normal">Open Mon–Sun</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 overflow-x-auto pb-1">
                {upcomingDays.map((day) => {
                  const isSelected = selectedDate === day.dateStr;
                  return (
                    <button
                      type="button"
                      key={day.dateStr}
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {day.dayName}
                      </div>
                      <div className="text-base font-bold font-mono my-0.5">
                        {day.dayNum}
                      </div>
                      <div className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                        {day.monthName}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Choose Time Slot */}
            <div>
              <div className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-3">
                03. Select Time Slot
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button
                      type="button"
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-3 rounded-lg border text-left text-xs transition-all ${
                        !slot.available
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold ring-1 ring-blue-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{slot.time}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {slot.available ? `${slot.period} slot` : 'Full'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Applicant Contact Details */}
            <div>
              <div className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-3">
                04. Applicant Information
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98450 12345"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. applicant@email.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Notes or Inquiries for the Operator (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Need help with signature resizing; will bring 10th marksheet original"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-blue-600" />
                <span>Zero pre-payment required to book a slot. Settle fees at the counter.</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {!currentUser ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In & Book Slot</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Appointment & Generate Token</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        )}
      </div>
    </section>
  );
};

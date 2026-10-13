import React from 'react';
import { X, Calendar, FileText, Clock, User, LogOut, CheckCircle2 } from 'lucide-react';
import { UserProfile, Appointment, Application } from '../types';

interface UserBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  appointments: Appointment[];
  applications: Application[];
  onLogout: () => void;
}

export const UserBookingsModal: React.FC<UserBookingsModalProps> = ({
  isOpen,
  onClose,
  user,
  appointments,
  applications,
  onLogout,
}) => {
  if (!isOpen || !user) return null;

  // Filter items matching user
  const userAppointments = appointments.filter(
    (apt) =>
      apt.userId === user.uid ||
      apt.applicantEmail?.toLowerCase() === user.email.toLowerCase() ||
      (user.phone && apt.applicantPhone && apt.applicantPhone.includes(user.phone.replace(/[^0-9]/g, '').slice(-10)))
  );

  const userApplications = applications.filter(
    (app) =>
      app.userId === user.uid ||
      app.applicantEmail?.toLowerCase() === user.email.toLowerCase() ||
      (user.phone && app.applicantPhone && app.applicantPhone.includes(user.phone.replace(/[^0-9]/g, '').slice(-10)))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl my-6 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm uppercase">
              {user.name.slice(0, 2)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{user.name}</h3>
              <p className="text-[11px] text-slate-400 font-mono">{user.email} {user.phone ? `· ${user.phone}` : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              title="Sign Out"
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Appointments section */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>My Counter Appointments ({userAppointments.length})</span>
            </div>

            {userAppointments.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                You have no booked counter appointments yet. Book a priority slot below!
              </div>
            ) : (
              <div className="space-y-2.5">
                {userAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                          {apt.tokenNumber}
                        </span>
                        <span className="font-semibold text-slate-900">{apt.serviceTitle}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{apt.date} · {apt.timeSlot}</span>
                        <span>·</span>
                        <span>{apt.counterType}</span>
                      </div>
                    </div>

                    <span
                      className={`self-start sm:self-auto px-2.5 py-1 rounded text-[11px] font-semibold ${
                        apt.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applications section */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>My Online Applications ({userApplications.length})</span>
            </div>

            {userApplications.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                No online service applications submitted under this account yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {userApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{app.id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-800">{app.serviceTitle}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-1">
                        Submitted: {app.createdAt} · Fee: ₹{app.totalFee}
                      </div>
                    </div>

                    <span className="self-start sm:self-auto px-2.5 py-1 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

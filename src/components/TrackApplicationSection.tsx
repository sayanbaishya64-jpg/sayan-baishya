import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, FileText, Printer, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { Application } from '../types';

interface TrackApplicationSectionProps {
  applications: Application[];
  initialSearchQuery?: string;
  onSelectApplicationForReceipt?: (app: Application) => void;
}

export const TrackApplicationSection: React.FC<TrackApplicationSectionProps> = ({
  applications,
  initialSearchQuery = '',
  onSelectApplicationForReceipt,
}) => {
  const [query, setQuery] = useState(initialSearchQuery);
  const [searchedApp, setSearchedApp] = useState<Application | null>(() => {
    if (initialSearchQuery) {
      return (
        applications.find(
          (a) =>
            a.id.toLowerCase() === initialSearchQuery.toLowerCase() ||
            a.applicantPhone.includes(initialSearchQuery)
        ) || null
      );
    }
    return applications[0] || null;
  });
  const [hasSearched, setHasSearched] = useState(false);

  const stages = [
    'Received',
    'Documents Verified',
    'In Progress',
    'Form Submitted',
    'Completed',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const clean = query.trim().toLowerCase();
    if (!clean) {
      setSearchedApp(null);
      return;
    }

    const found = applications.find(
      (a) =>
        a.id.toLowerCase() === clean ||
        a.applicantPhone.toLowerCase().includes(clean) ||
        a.applicantName.toLowerCase().includes(clean)
    );
    setSearchedApp(found || null);
  };

  const getStageIndex = (status: string) => {
    if (status === 'Received') return 0;
    if (status === 'Documents Verified') return 1;
    if (status === 'In Progress') return 2;
    if (status === 'Form Submitted' || status === 'Ready for Pickup') return 3;
    if (status === 'Completed') return 4;
    return 1;
  };

  return (
    <section id="track" className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-blue-600 mb-2">
              Real-Time Order Tracking
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Check Application & Document Status
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              Track the exact progress of your PAN card, college admission form, certificate or print job anytime using your reference ID.
            </p>
          </div>

          {/* Quick sample chips (functional buttons with click handlers) */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-400">Quick Try:</span>
            {applications.slice(0, 3).map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  setQuery(app.id);
                  setSearchedApp(app);
                  setHasSearched(true);
                }}
                className="text-xs font-mono font-medium px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                {app.id}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter Reference ID (e.g. CYBER-2026-8842) or Phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shadow-xs"
            >
              Lookup Status
            </button>
          </form>
        </div>

        {/* Search Results */}
        {searchedApp ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
            {/* Top Bar of Record */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>Application Reference</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-700">{searchedApp.createdAt}</span>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900">
                  {searchedApp.id}
                </div>
                <div className="text-sm font-medium text-slate-700 mt-1">
                  {searchedApp.serviceTitle}
                </div>
              </div>

              <div className="sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-900 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  <span>{searchedApp.status}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1.5">
                  Fee: <span className="font-mono font-bold text-slate-800">₹{searchedApp.totalFee}</span> ({searchedApp.deliveryMode.toUpperCase()})
                </div>
              </div>
            </div>

            {/* Stage Tracker Steps */}
            <div className="py-8">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-6">
                Processing Lifecycle
              </div>

              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0 hidden sm:block" />

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                  {stages.map((stageName, idx) => {
                    const currentIdx = getStageIndex(searchedApp.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={stageName} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="text-left sm:text-center">
                          <div className={`text-xs font-semibold ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                            {stageName}
                          </div>
                          {isCurrent && (
                            <div className="text-[10px] text-blue-600 font-medium">
                              Active Stage
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Operator Remarks and Official Acknowledgment */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 text-xs space-y-3">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Operator Remarks & Updates:</div>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {searchedApp.adminRemarks || 'Document verification in progress. Our desk operator will submit to the government portal shortly.'}
                  </p>
                </div>
              </div>

              {searchedApp.acknowledgmentNo && (
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                  <span className="text-slate-500">Official Government Department Acknowledgment No:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {searchedApp.acknowledgmentNo}
                  </span>
                </div>
              )}
            </div>

            {/* Applicant Documents list */}
            {searchedApp.documents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Uploaded Documents ({searchedApp.documents.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchedApp.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <div className="truncate mr-2">
                        <div className="font-medium text-slate-800 truncate">{doc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{doc.size} · {doc.uploadDate}</div>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Attached
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Print Slip Action */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Official Tracking Slip</span>
              </button>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No application found for "{query}"</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Please verify your 14-digit reference ID (e.g. CYBER-2026-8842) or mobile number without spaces.
            </p>
            <button
              onClick={() => {
                setQuery(applications[0]?.id || '');
                setSearchedApp(applications[0] || null);
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Load sample application
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Printer, Check, Laptop } from 'lucide-react';
import { WebsiteConfig } from '../types';

interface AboutSectionProps {
  websiteConfig?: WebsiteConfig;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ websiteConfig }) => {
  const cafeName = websiteConfig?.cafeName || 'CyberPoint Digital Services';
  const address = websiteConfig?.address || 'Shop No. 12, Main Market Road, Near City Post Office & Tehsil Complex';
  const hours = websiteConfig?.hours || 'Mon - Sat: 8:30 AM – 9:00 PM | Sun: 10:00 AM – 6:00 PM';
  const phone = websiteConfig?.phone || '+91 98765 43210';
  const email = websiteConfig?.email || 'desk@cyberpointonline.in';

  return (
    <section id="about" className="py-16 sm:py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Cafe Profile & Infrastructure */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-blue-400 mb-2">
                Authorized Digital Service Counter
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance mb-4">
                About {cafeName}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Established as a full-service citizen digital facilitation center and high-speed cyber cafe, CyberPoint connects citizens, students, and local businesses with critical government and online utility portals.
              </p>

              {/* Hardware specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Printer className="w-4 h-4 text-blue-400" />
                    <span>Commercial Xerox & Print</span>
                  </div>
                  <p className="text-slate-400">
                    High-speed Xerox laser engine with 1200 DPI resolution, double-sided auto-duplex on 80 GSM bond.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Laptop className="w-4 h-4 text-emerald-400" />
                    <span>Dedicated Client Terminals</span>
                  </div>
                  <p className="text-slate-400">
                    High-speed fiber connectivity, webcam, biometric scanner, and secure isolated browsing.
                  </p>
                </div>
              </div>

              {/* Standards checklist */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Authorized government portal filings (NSDL, UIDAI, Parivahan, SSC, UPSC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Zero storage of customer biometric data or passwords post-submission</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Digital stamped acknowledgment receipts provided for every transaction</span>
                </div>
              </div>
            </div>

            {/* Adjacency proof */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Trusted by 14,000+ local citizens and college students
              </span>
              <span className="font-mono text-slate-400">Operating Since 2018</span>
            </div>
          </div>

          {/* Right Column: Printing Station Image & Contact Card */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shadow-xl group">
              <img
                src="/src/assets/images/service_print_station_1791813763088.jpg"
                alt="Production print and lamination workstation"
                referrerPolicy="no-referrer"
                className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-xs text-slate-200">
                <span className="font-semibold text-white">Production Station 01:</span> High-speed Xerox laser printing, PVC card printing & 125-micron thermal lamination.
              </div>
            </div>

            {/* Visit & Desk Hours */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 text-xs space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                Desk Hours & Physical Center
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>{address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{hours}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono">{phone} (Direct Desk / WhatsApp)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-mono">{email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

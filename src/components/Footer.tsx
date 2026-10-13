import React from 'react';
import { ShieldCheck, MessageSquare, Phone } from 'lucide-react';
import { formatWhatsAppUrl } from '../utils/storage';

import { WebsiteConfig } from '../types';

interface FooterProps {
  onOpenApply: () => void;
  onOpenAppointment: () => void;
  onOpenSendDocs: () => void;
  onOpenAdmin: () => void;
  websiteConfig?: WebsiteConfig;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenApply,
  onOpenAppointment,
  onOpenSendDocs,
  onOpenAdmin,
  websiteConfig,
}) => {
  const cafeName = websiteConfig?.cafeName || 'CyberPoint Online';
  const tagline = websiteConfig?.tagline || 'Authorized digital seva and online cyber cafe counter for government IDs, competitive exam applications, utility payments, and production laser printing.';
  const whatsappNum = websiteConfig?.whatsappPhone || '+919876543210';
  const displayPhone = websiteConfig?.phone || '+91 98765 43210';

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                {cafeName.substring(0, 2)}
              </span>
              <span>{cafeName}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {tagline}
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              ISO/IEC compliant document handling · 100% Data Confidentiality
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Citizen Portals
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  PAN Card (New & Correction)
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Aadhaar PVC & Address Update
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Govt Exam Form Filling (SSC, UPSC)
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Income, Domicile & Caste Certs
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  EPFO / PF Withdrawal Claim
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Actions */}
          <div>
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Direct Services
            </div>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenApply} className="hover:text-white transition-colors text-left">
                  Apply Online for Any Service
                </button>
              </li>
              <li>
                <button onClick={onOpenSendDocs} className="hover:text-white transition-colors text-left">
                  Send Documents for Print & Xerox
                </button>
              </li>
              <li>
                <button onClick={onOpenAppointment} className="hover:text-white transition-colors text-left">
                  Book Counter Appointment Token
                </button>
              </li>
              <li>
                <a href="#track" className="hover:text-white transition-colors">
                  Track Application Status
                </a>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="text-blue-400 hover:text-blue-300 transition-colors text-left">
                  Operator Desk Login
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Support Desk
            </div>
            <p className="text-slate-400">
              Need assistance filling out an online form or sending a PDF? Connect directly with our on-duty operator.
            </p>
            <div className="space-y-2 pt-1">
              <a
                href={formatWhatsAppUrl(whatsappNum, `Hello ${cafeName}, I need help with online services.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800 rounded-lg transition-colors font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp: {whatsappNum}</span>
              </a>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>Phone: {displayPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} CyberPoint Online Seva & Services Center. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Official Portal Compliant
            </span>
            <span>·</span>
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Service Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

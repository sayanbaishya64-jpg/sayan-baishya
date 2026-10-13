import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Clock, FileCheck, Calendar } from 'lucide-react';
import { WebsiteConfig } from '../types';

interface HeroProps {
  onOpenApply: () => void;
  onOpenAppointment: () => void;
  onOpenSendDocs: () => void;
  onTrackLookup: (query: string) => void;
  websiteConfig: WebsiteConfig;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenApply,
  onOpenAppointment,
  onOpenSendDocs,
  onTrackLookup,
  websiteConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onTrackLookup(searchQuery.trim());
    }
  };

  return (
    <section className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background radial gradient subtle texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Value proposition and primary action */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Trust kicker (no static pills) */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-400 mb-4">
                <span>{websiteConfig.tagline}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] text-balance mb-5">
                {websiteConfig.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mb-8">
                {websiteConfig.heroSubtitle}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <button
                  onClick={onOpenApply}
                  className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Apply For Service</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenSendDocs}
                  className="px-5 py-3 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  <span>Send Documents</span>
                </button>
                <button
                  onClick={onOpenAppointment}
                  className="px-5 py-3 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Book Counter Slot</span>
                </button>
              </div>

              {/* Quick Status Lookup Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-slate-800/90 border border-slate-700 p-2 rounded-xl flex items-center gap-2 max-w-xl"
              >
                <div className="pl-2 text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Track by Reference ID (e.g. CYBER-2026-8842) or Phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none px-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap"
                >
                  Track Now
                </button>
              </form>
            </div>

            {/* Proof Points Strip (Adjacency rule) */}
            <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-slate-800">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                  {websiteConfig.stat1Value}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {websiteConfig.stat1Label}
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400">
                  {websiteConfig.stat2Value}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {websiteConfig.stat2Label}
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-blue-400">
                  {websiteConfig.stat3Value}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {websiteConfig.stat3Label}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset with Real Cafe Image */}
          <div className="lg:col-span-5 relative flex flex-col justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-800 group">
              <img
                src="/src/assets/images/hero_cyber_cafe_1791813731671.jpg"
                alt="CyberPoint Modern Digital Services Center and Cyber Cafe"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover min-h-[340px] sm:min-h-[400px] lg:min-h-[480px] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

              {/* Overlay card for real operational hours & security */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Open: {websiteConfig.hours}</span>
                  </span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Active Online Counter
                  </span>
                </div>
                <p className="text-slate-300 leading-normal">
                  High-speed scanner, laser printers, Aadhaar & PAN portal biometric, and university admissions ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

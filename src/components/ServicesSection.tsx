import React, { useState, useMemo } from 'react';
import { Search, Calculator, Check, Clock, ChevronDown, ChevronUp, FileText, ArrowUpRight } from 'lucide-react';
import { CyberService } from '../types';
import { SERVICES_CATALOG } from '../data/servicesData';

interface ServicesSectionProps {
  services?: CyberService[];
  onSelectServiceForApply: (service: CyberService) => void;
  onSelectServiceForAppointment: (service: CyberService) => void;
  onOpenFeeCalculator: () => void;
}

type CategoryType = 'All' | 'Govt IDs' | 'Exams & Admissions' | 'Certificates' | 'Banking & Utility' | 'Printing & Typing';

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectServiceForApply,
  onSelectServiceForAppointment,
  onOpenFeeCalculator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDocsId, setExpandedDocsId] = useState<string | null>(null);

  const activeCatalog = services && services.length > 0 ? services : SERVICES_CATALOG;

  const categories: CategoryType[] = [
    'All',
    'Govt IDs',
    'Exams & Admissions',
    'Certificates',
    'Banking & Utility',
    'Printing & Typing',
  ];

  const filteredServices = useMemo(() => {
    return activeCatalog.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.requiredDocs.some((doc) => doc.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCatalog, selectedCategory, searchQuery]);

  const toggleDocs = (id: string) => {
    setExpandedDocsId(expandedDocsId === id ? null : id);
  };

  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-blue-600 mb-2">
              Transparent Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Services, Official Fees & Turnaround Time
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              Zero surprises. Every service displays the exact breakdown between statutory government portal fees and our cyber cafe documentation charges.
            </p>
          </div>

          <button
            onClick={onOpenFeeCalculator}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Calculator className="w-4 h-4 text-blue-600" />
            <span>Interactive Fee Calculator</span>
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center mb-8">
          {/* Category Tabs (Segmented control button group) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search PAN, SSC, PVC, print..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
            </input>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 mb-1">No services matched</h3>
            <p className="text-xs text-slate-500 mb-4">
              We provide almost every cyber cafe service. Try searching for a different keyword or view all categories.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const isDocsOpen = expandedDocsId === service.id;
              return (
                <div
                  key={service.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    {/* Quiet metadata line without pills */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-700">{service.category}</span>
                        {service.badge && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-blue-700 font-semibold">{service.badge}</span>
                          </>
                        )}
                      </div>
                      <span className="text-slate-400">{service.eligibleForOnline ? 'Online Ready' : 'In-Store / Slot'}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                      {service.description}
                    </p>

                    {/* Turnaround Time */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium">Estimated:</span>
                      <span className="text-slate-800">{service.turnaround}</span>
                    </div>

                    {/* Required Documents Toggle */}
                    <div className="mb-4">
                      <button
                        onClick={() => toggleDocs(service.id)}
                        className="w-full flex items-center justify-between text-xs font-medium text-blue-600 hover:text-blue-800 py-1"
                      >
                        <span>Documents required ({service.requiredDocs.length})</span>
                        {isDocsOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isDocsOpen && (
                        <ul className="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                          {service.requiredDocs.map((doc, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Fee Breakdown & Actions */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <div className="text-xs text-slate-500">
                          Govt: ₹{service.govtFee} + Cafe: ₹{service.serviceFee}
                        </div>
                        <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                          Total: ₹{service.totalFee}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-emerald-700 font-medium">All inclusive</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectServiceForApply(service)}
                        className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs whitespace-nowrap"
                      >
                        <span>Apply Online</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectServiceForAppointment(service)}
                        className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <span>Book Slot</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

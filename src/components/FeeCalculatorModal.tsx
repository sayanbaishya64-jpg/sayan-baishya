import React, { useState } from 'react';
import { X, Calculator, Plus, Minus, Check, ArrowRight } from 'lucide-react';
import { SERVICES_CATALOG } from '../data/servicesData';
import { CyberService, WebsiteConfig } from '../types';

interface FeeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectServicesToApply: (services: CyberService[]) => void;
  websiteConfig?: WebsiteConfig;
  services?: CyberService[];
}

export const FeeCalculatorModal: React.FC<FeeCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSelectServicesToApply,
  websiteConfig,
  services,
}) => {
  if (!isOpen) return null;

  // Print quantities
  const [bwPages, setBwPages] = useState<number>(0);
  const [colorPages, setColorPages] = useState<number>(0);
  const [laminationCount, setLaminationCount] = useState<number>(0);
  const [bindingCount, setBindingCount] = useState<number>(0);

  // Selected services from catalog
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [urgentDelivery, setUrgentDelivery] = useState<boolean>(false);

  // Pricing constants from website customization config
  const BW_RATE = websiteConfig?.bwPrintRate ?? 2;
  const COLOR_RATE = websiteConfig?.colorPrintRate ?? 5;
  const LAMINATION_RATE = websiteConfig?.laminationRate ?? 20;
  const BINDING_RATE = websiteConfig?.spiralBindingRate ?? 40;
  const URGENT_FEE = websiteConfig?.urgentFee ?? 30;

  const catalog = services && services.length > 0 ? services : SERVICES_CATALOG;

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedServices = catalog.filter((s) => selectedServiceIds.includes(s.id));

  const printTotal =
    bwPages * BW_RATE +
    colorPages * COLOR_RATE +
    laminationCount * LAMINATION_RATE +
    bindingCount * BINDING_RATE;

  const servicesTotal = selectedServices.reduce((sum, s) => sum + s.totalFee, 0);
  const grandTotal = printTotal + servicesTotal + (urgentDelivery ? URGENT_FEE : 0);

  const handleApplyClick = () => {
    if (selectedServices.length > 0) {
      onSelectServicesToApply(selectedServices);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Interactive Fee & Printing Calculator
              </h3>
              <p className="text-[11px] text-slate-500">
                Calculate total price for multiple services and printouts before ordering
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Printing & Stationery Section */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              01. Printouts, Xerox & Stationery Services
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* B&W Pages */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">B&W Print / Xerox</div>
                  <div className="text-[11px] text-slate-500 font-mono">₹{BW_RATE} per page</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBwPages(Math.max(0, bwPages - 5))}
                    className="w-7 h-7 bg-white border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-600"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono tabular-nums">{bwPages}</span>
                  <button
                    onClick={() => setBwPages(bwPages + 5)}
                    className="w-7 h-7 bg-white border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Color Pages */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">Color Laser Print</div>
                  <div className="text-[11px] text-slate-500 font-mono">₹{COLOR_RATE} per page</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setColorPages(Math.max(0, colorPages - 2))}
                    className="w-7 h-7 bg-white border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-600"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono tabular-nums">{colorPages}</span>
                  <button
                    onClick={() => setColorPages(colorPages + 2)}
                    className="w-7 h-7 bg-white border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Lamination */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">Waterproof Lamination</div>
                  <div className="text-[11px] text-slate-500 font-mono">₹{LAMINATION_RATE} per sheet/card</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLaminationCount(Math.max(0, laminationCount - 1))}
                    className="w-7 h-7 bg-white border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-600"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono tabular-nums">{laminationCount}</span>
                  <button
                    onClick={() => setLaminationCount(laminationCount + 1)}
                    className="w-7 h-7 bg-white border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Spiral Binding */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">Spiral Comb Binding</div>
                  <div className="text-[11px] text-slate-500 font-mono">₹{BINDING_RATE} per booklet</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBindingCount(Math.max(0, bindingCount - 1))}
                    className="w-7 h-7 bg-white border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-600"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono tabular-nums">{bindingCount}</span>
                  <button
                    onClick={() => setBindingCount(bindingCount + 1)}
                    className="w-7 h-7 bg-white border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Online Form Services */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              02. Select Portal Form Filling Services (Optional)
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {SERVICES_CATALOG.slice(0, 8).map((srv) => {
                const isChecked = selectedServiceIds.includes(srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srv.id)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-blue-50 border-blue-500 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="font-medium truncate">{srv.title}</span>
                    </div>
                    <span className="font-mono font-bold shrink-0">₹{srv.totalFee}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Urgent Processing Option */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-amber-900">Express Priority Queue (Desk Addon)</span>
              <p className="text-[11px] text-amber-700">Immediate processing without queue delay</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-900">
              <input
                type="checkbox"
                checked={urgentDelivery}
                onChange={(e) => setUrgentDelivery(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>+ ₹{URGENT_FEE}</span>
            </label>
          </div>

          {/* Grand Total Summary */}
          <div className="bg-slate-900 text-white p-5 rounded-xl space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Stationery & Printouts:</span>
              <span className="font-mono text-slate-200">₹{printTotal}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Portal Services ({selectedServices.length}):</span>
              <span className="font-mono text-slate-200">₹{servicesTotal}</span>
            </div>
            {urgentDelivery && (
              <div className="flex justify-between text-xs text-slate-400">
                <span>Express Queue Fee:</span>
                <span className="font-mono text-slate-200">₹{URGENT_FEE}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="font-bold text-sm">Estimated Total Amount:</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Close Calculator
          </button>

          <button
            onClick={handleApplyClick}
            disabled={selectedServices.length === 0}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Apply for Selected Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

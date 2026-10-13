import React, { useState, useRef } from 'react';
import { UploadCloud, File, Trash2, CheckCircle2, MessageSquare, Printer, Shield, ArrowRight } from 'lucide-react';
import { UploadedDoc, WebsiteConfig } from '../types';
import { formatWhatsAppUrl } from '../utils/storage';

interface SendDocumentsSectionProps {
  onDocumentSubmissionComplete: (docs: UploadedDoc[], targetType: string, refId?: string, instructions?: string) => void;
  websiteConfig?: WebsiteConfig;
}

export const SendDocumentsSection: React.FC<SendDocumentsSectionProps> = ({
  onDocumentSubmissionComplete,
  websiteConfig,
}) => {
  const bwRate = websiteConfig?.bwPrintRate ?? 2;
  const colorRate = websiteConfig?.colorPrintRate ?? 5;
  const laminationRate = websiteConfig?.laminationRate ?? 20;
  const bindingRate = websiteConfig?.spiralBindingRate ?? 40;
  const whatsappNum = websiteConfig?.whatsappPhone || '+919876543210';
  const [purpose, setPurpose] = useState<'printing' | 'application' | 'general'>('printing');
  const [refId, setRefId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [printCopies, setPrintCopies] = useState(1);
  const [printColor, setPrintColor] = useState<'bw' | 'color'>('bw');
  const [needLamination, setNeedLamination] = useState(false);
  const [needBinding, setNeedBinding] = useState(false);

  const [files, setFiles] = useState<UploadedDoc[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newDocs: UploadedDoc[] = [];
    Array.from(selectedFiles).forEach((file) => {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      // Read as data URL for local preview/storage
      const reader = new FileReader();
      reader.onload = (event) => {
        newDocs.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          docType: purpose === 'printing' ? 'Document to Print' : 'Application Document',
          size: sizeStr,
          dataUrl: event.target?.result as string,
          uploadDate: new Date().toLocaleString(),
        });

        if (newDocs.length === selectedFiles.length) {
          setFiles((prev) => [...prev, ...newDocs]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedRef = refId.trim() || `DOCS-${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmittedRef(generatedRef);
      setSubmittedSuccess(true);
      setIsSubmitting(false);

      const customNotes = purpose === 'printing'
        ? `Print Config: ${printCopies} copies, ${printColor === 'bw' ? 'B&W' : 'Color'}, Lamination: ${needLamination ? 'Yes' : 'No'}, Binding: ${needBinding ? 'Yes' : 'No'}. Customer Notes: ${instructions}`
        : instructions;

      onDocumentSubmissionComplete(files, purpose, generatedRef, customNotes);
    }, 600);
  };

  const resetForm = () => {
    setFiles([]);
    setRefId('');
    setInstructions('');
    setSubmittedSuccess(false);
  };

  // WhatsApp formatted string
  const getWhatsAppMessage = () => {
    let msg = `*CyberPoint Online Document Submission*\n`;
    msg += `Applicant: ${customerName || 'Customer'}\n`;
    msg += `Phone: ${customerPhone || 'Not specified'}\n`;
    msg += `Submission Ref: ${submittedRef || 'Pending'}\n`;
    msg += `Files Uploaded: ${files.map((f) => f.name).join(', ')}\n`;
    if (purpose === 'printing') {
      msg += `Print Settings: ${printCopies} copies | ${printColor === 'bw' ? 'Black & White' : 'Color'}\n`;
      if (needLamination) msg += `- Lamination Required\n`;
      if (needBinding) msg += `- Spiral Binding Required\n`;
    }
    if (instructions) {
      msg += `Instructions: ${instructions}\n`;
    }
    return msg;
  };

  return (
    <section id="send-docs" className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Context, instructions & image */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-blue-600 mb-2">
                Remote File Submission Desk
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                Send Your Documents Online
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Save a trip to the counter. Upload your documents directly from your smartphone or laptop for quick printing, scanning, or government form verification.
              </p>
            </div>

            {/* Visual preview card */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
              <img
                src="/src/assets/images/service_doc_desk_1791813749352.jpg"
                alt="Document verification and high-speed scanning desk"
                referrerPolicy="no-referrer"
                className="w-full h-56 object-cover"
              />
              <div className="p-4 bg-white text-xs space-y-2 border-t border-slate-200">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Strict Data Privacy Assurance</span>
                </div>
                <p className="text-slate-500 leading-normal">
                  Uploaded files are encrypted during transit, used exclusively for your requested official filing or printout, and automatically purged from temporary buffers after completion.
                </p>
              </div>
            </div>

            {/* Feature bullets without pills */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <Printer className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Print & Pickup in 10 Minutes</strong>
                  Upload PDFs now; collect them crisp, stapled, or laminated at our dedicated pickup counter without waiting.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <File className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Form Filling File Check</strong>
                  Send Aadhaar, marksheets, or photos for pre-submission error check and size formatting.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Upload Form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
              {submittedSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Documents Sent Successfully!
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Our cyber cafe operator has received your files and queued them for processing.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-left">
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">
                      Submission Tracking ID
                    </div>
                    <div className="text-lg font-bold font-mono text-blue-600 mt-0.5">
                      {submittedRef}
                    </div>
                    <div className="text-xs text-slate-600 mt-2">
                      Total Files: <span className="font-semibold">{files.length}</span> · Status: <span className="text-emerald-700 font-semibold">Received by Desk</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <a
                      href={formatWhatsAppUrl(whatsappNum, getWhatsAppMessage())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Notify via WhatsApp</span>
                    </a>
                    <button
                      onClick={resetForm}
                      className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                    >
                      Send More Documents
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Select Purpose */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider mb-2">
                      Submission Purpose
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPurpose('printing')}
                        className={`p-3 text-left rounded-xl border text-xs transition-all ${
                          purpose === 'printing'
                            ? 'bg-white border-blue-600 shadow-xs ring-1 ring-blue-600 font-semibold text-blue-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Printer className="w-4 h-4 mb-1 text-blue-600" />
                        <div>Printing / Xerox</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">Ready for pickup</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPurpose('application')}
                        className={`p-3 text-left rounded-xl border text-xs transition-all ${
                          purpose === 'application'
                            ? 'bg-white border-blue-600 shadow-xs ring-1 ring-blue-600 font-semibold text-blue-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <File className="w-4 h-4 mb-1 text-emerald-600" />
                        <div>Online Application</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">Attach to form</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPurpose('general')}
                        className={`p-3 text-left rounded-xl border text-xs transition-all ${
                          purpose === 'general'
                            ? 'bg-white border-blue-600 shadow-xs ring-1 ring-blue-600 font-semibold text-blue-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <UploadCloud className="w-4 h-4 mb-1 text-amber-600" />
                        <div>Scan / Lamination</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">Verification check</div>
                      </button>
                    </div>
                  </div>

                  {/* Applicant Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        WhatsApp / Contact Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98765 43210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Optional Reference link */}
                  {purpose === 'application' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Existing Application ID (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CYBER-2026-8842 (leave blank if creating new)"
                        value={refId}
                        onChange={(e) => setRefId(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  )}

                  {/* Printing preferences if purpose === printing */}
                  {purpose === 'printing' && (
                    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                      <div className="text-xs font-semibold text-slate-900">
                        Printout Configuration
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Color Mode</label>
                          <select
                            value={printColor}
                            onChange={(e) => setPrintColor(e.target.value as 'bw' | 'color')}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                          >
                            <option value="bw">B&W (₹{bwRate}/pg)</option>
                            <option value="color">Color (₹{colorRate}/pg)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Copies</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={printCopies}
                            onChange={(e) => setPrintCopies(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 tabular-nums font-mono"
                          />
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={needLamination}
                              onChange={(e) => setNeedLamination(e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span>Lamination (+₹{laminationRate})</span>
                          </label>
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                            <input
                              type="checkbox"
                              checked={needBinding}
                              onChange={(e) => setNeedBinding(e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span>Spiral Binding (+₹{bindingRate})</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Drag and Drop Upload Area */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Upload Files (PDF, JPG, PNG, DOCX) *
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-white cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-slate-800">
                        Click to browse or drop documents here
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Supports Aadhaar copies, marksheets, photos, signatures, PDFs up to 25 MB
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* List of uploaded files */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-700">
                        Selected Files ({files.length})
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                          >
                            <div className="flex items-center gap-2 truncate mr-2">
                              <File className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="font-medium text-slate-800 truncate">{file.name}</span>
                              <span className="text-[11px] text-slate-400 shrink-0 font-mono">{file.size}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extra Instructions */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Special Instructions / Requirements (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Please print page 1 to 5 only; or need back-to-back print; or call me if photo resolution looks low."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={files.length === 0 || isSubmitting}
                      className="w-full py-3 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Submitting Files to Desk...</span>
                      ) : (
                        <>
                          <span>Submit Documents to Cyber Cafe Desk</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    {files.length === 0 && (
                      <p className="text-[11px] text-slate-400 text-center mt-2">
                        Please attach at least one file before submitting.
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

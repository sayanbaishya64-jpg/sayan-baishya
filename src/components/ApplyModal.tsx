import React, { useState, useRef } from 'react';
import { X, Check, UploadCloud, File, Trash2, ArrowRight, ShieldCheck, Printer, MessageSquare, CheckCircle2 } from 'lucide-react';
import { CyberService, Application, UploadedDoc, UserProfile } from '../types';
import { generateApplicationId, formatWhatsAppUrl } from '../utils/storage';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: CyberService | null;
  currentUser?: UserProfile | null;
  onApplicationCreated: (app: Application) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  service,
  currentUser,
  onApplicationCreated,
}) => {
  if (!isOpen || !service) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'digital' | 'pickup' | 'courier'>('digital');
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDoc[]>([]);

  // Update fields if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      if (!applicantName) setApplicantName(currentUser.name);
      if (!applicantPhone && currentUser.phone) setApplicantPhone(currentUser.phone);
      if (!applicantEmail) setApplicantEmail(currentUser.email);
    }
  }, [currentUser]);

  const [createdApplication, setCreatedApplication] = useState<Application | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: UploadedDoc[] = [];
    Array.from(files).forEach((file) => {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = (event) => {
        newDocs.push({
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          docType: 'Applicant Document',
          size: sizeStr,
          dataUrl: event.target?.result as string,
          uploadDate: new Date().toLocaleDateString(),
        });

        if (newDocs.length === files.length) {
          setUploadedFiles((prev) => [...prev, ...newDocs]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((d) => d.id !== id));
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone) return;

    const newApp: Application = {
      id: generateApplicationId(),
      userId: currentUser?.uid,
      serviceId: service.id,
      serviceTitle: service.title,
      category: service.category,
      applicantName,
      applicantPhone,
      applicantEmail,
      applicantAddress,
      deliveryMode,
      notes,
      documents: uploadedFiles,
      totalFee: service.totalFee,
      status: 'Received',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminRemarks: 'Application received online. Queued for document verification by cyber cafe operator.',
    };

    setCreatedApplication(newApp);
    onApplicationCreated(newApp);
    setStep(3);
  };

  const resetAndClose = () => {
    setStep(1);
    setCreatedApplication(null);
    setApplicantName('');
    setApplicantPhone('');
    setApplicantEmail('');
    setApplicantAddress('');
    setUploadedFiles([]);
    setNotes('');
    onClose();
  };

  const getWhatsAppReceiptMessage = () => {
    if (!createdApplication) return '';
    let msg = `*CyberPoint Online Service Application*\n`;
    msg += `Reference ID: ${createdApplication.id}\n`;
    msg += `Service: ${createdApplication.serviceTitle}\n`;
    msg += `Applicant: ${createdApplication.applicantName}\n`;
    msg += `Phone: ${createdApplication.applicantPhone}\n`;
    msg += `Delivery Mode: ${createdApplication.deliveryMode}\n`;
    msg += `Total Fee: ₹${createdApplication.totalFee}\n`;
    msg += `Files Uploaded: ${createdApplication.documents.length} document(s)\n`;
    msg += `Status: Received at Online Desk\n`;
    return msg;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              Online Application Portal
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {service.title}
            </h3>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress bar */}
        {step !== 3 && (
          <div className="grid grid-cols-2 text-xs border-b border-slate-200 font-medium">
            <button
              onClick={() => setStep(1)}
              className={`py-3 text-center border-b-2 transition-colors ${
                step === 1
                  ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              1. Details & Fee Breakdown
            </button>
            <button
              onClick={() => {
                if (applicantName && applicantPhone) setStep(2);
              }}
              className={`py-3 text-center border-b-2 transition-colors ${
                step === 2
                  ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              2. Upload Documents & Review
            </button>
          </div>
        )}

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Fee and Turnaround Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-slate-500">Official Govt Portal Fee:</span>{' '}
                    <strong className="text-slate-800 font-mono">₹{service.govtFee}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Cyber Cafe Documentation:</span>{' '}
                    <strong className="text-slate-800 font-mono">₹{service.serviceFee}</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900">Total Payable:</span>
                  <span className="font-extrabold text-blue-700 font-mono text-lg">₹{service.totalFee}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Estimated turnaround: <strong className="text-slate-700">{service.turnaround}</strong>
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div>
                <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  Documents Needed for this Service
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {service.requiredDocs.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Applicant Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Applicant Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="As per Aadhaar / Official records"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="For OTP and status updates"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e-PAN or acknowledgments will be sent here"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Delivery / Output Preference *
                    </label>
                    <select
                      value={deliveryMode}
                      onChange={(e) => setDeliveryMode(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                    >
                      <option value="digital">Digital PDF on WhatsApp & Email (Fastest)</option>
                      <option value="pickup">In-Store Laminated Card / Print Pickup</option>
                      <option value="courier">Speed Post / Postal Courier to Address</option>
                    </select>
                  </div>
                </div>

                {deliveryMode === 'courier' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Postal Delivery Address with PIN *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="House No, Street, Landmark, City, State, PIN Code"
                      value={applicantAddress}
                      onChange={(e) => setApplicantAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Next step button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!applicantName || !applicantPhone}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Continue to Document Upload</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              {/* Document upload box */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  Upload Supporting Documents
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-50 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-800">
                    Upload Aadhaar, Passport Photo, or Marks Certificate
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Select JPG, PNG or PDF files. You can also send them later via WhatsApp.
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Uploaded files list */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Attached Files ({uploadedFiles.length})
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {uploadedFiles.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <File className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{doc.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(doc.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes / Specific Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please verify father's name spelling from 10th marksheet; or need urgent filing today."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Back to Details
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Application to Desk</span>
                </button>
              </div>
            </form>
          )}

          {step === 3 && createdApplication && (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">Application Submitted!</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your request is securely queued at CyberPoint Online Services Desk.
                </p>
              </div>

              {/* Reference Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-md mx-auto text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 uppercase font-semibold text-[10px]">Reference Tracking ID</span>
                  <span className="font-mono font-bold text-sm text-blue-600">{createdApplication.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-900 text-right">{createdApplication.serviceTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-medium text-slate-900">{createdApplication.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Payable:</span>
                  <span className="font-mono font-bold text-slate-900">₹{createdApplication.totalFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-700 font-semibold">{createdApplication.status}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={formatWhatsAppUrl('+919876543210', getWhatsAppReceiptMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send to Cafe WhatsApp</span>
                </a>

                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={resetAndClose}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Done & Back to Services
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Mail, 
  ExternalLink, 
  Edit3, 
  RotateCcw, 
  FileText,
  Building2,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { Order } from '../types/ink';
import { generateOrderEmailSummary, copyOrderEmailToClipboard } from '../utils/orderEmailSummary';

interface EmailSummaryModalProps {
  order: Order | null;
  currencySymbol?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSummaryModal: React.FC<EmailSummaryModalProps> = ({
  order,
  currencySymbol = '₹',
  isOpen,
  onClose,
}) => {
  const [copiedStatus, setCopiedStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copyFeedbackText, setCopyFeedbackText] = useState<string>('Copy to Clipboard');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');

  useEffect(() => {
    if (order) {
      const generated = generateOrderEmailSummary(order, currencySymbol);
      setCustomText(generated.fullText);
      setIsEditing(false);
      setCopiedStatus('idle');
      setCopyFeedbackText('Copy to Clipboard');
    }
  }, [order, currencySymbol, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const summary = generateOrderEmailSummary(order, currencySymbol);

  const handleCopy = async (textToCopy: string, feedback: string = 'Copied to Clipboard!') => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedStatus('copied');
      setCopyFeedbackText(feedback);
      setTimeout(() => {
        setCopiedStatus('idle');
        setCopyFeedbackText('Copy to Clipboard');
      }, 2500);
    } catch {
      setCopiedStatus('error');
      setCopyFeedbackText('Failed to Copy');
      setTimeout(() => {
        setCopiedStatus('idle');
        setCopyFeedbackText('Copy to Clipboard');
      }, 2500);
    }
  };

  const handleReset = () => {
    setCustomText(summary.fullText);
    setIsEditing(false);
  };

  const mailtoHref = `mailto:${encodeURIComponent(order.customer.email || '')}?subject=${encodeURIComponent(
    summary.subject
  )}&body=${encodeURIComponent(summary.body)}`;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-summary-title"
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Client Dispatch Summary
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Order #{order.orderNumber}
                </span>
              </div>
              <h2 id="email-summary-title" className="text-lg font-bold text-white tracking-tight mt-0.5">
                Text-Based Order Email for {order.customer.companyName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Metadata Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{order.customer.companyName}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>{order.deliveryAddress?.city || order.customer.city}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600 font-mono">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{order.totalKg} kg ({order.items.length} CMYK items)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-2.5 py-1 text-xs rounded-lg border font-medium inline-flex items-center gap-1.5 transition-colors ${
                isEditing
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditing ? 'Editing Mode Active' : 'Customize Text'}</span>
            </button>

            {isEditing && (
              <button
                onClick={handleReset}
                title="Reset to original generated email"
                className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          {/* Quick Subject preview */}
          <div className="mb-4 p-3 bg-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Email Subject Line:
              </span>
              <button
                onClick={() => handleCopy(summary.subject, 'Subject Copied!')}
                className="text-[11px] text-cyan-700 hover:text-cyan-900 font-sans font-medium inline-flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Subject</span>
              </button>
            </div>
            <p className="font-semibold text-slate-900 select-all font-sans text-sm">
              {summary.subject}
            </p>
          </div>

          {/* Email Body / Monospace Raw Preview */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1 text-[10px] text-slate-500 font-sans uppercase tracking-wider">
              <span>Full Text Summary (Ready to Paste):</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopy(summary.body, 'Body Copied!')}
                  className="text-cyan-700 hover:text-cyan-900 font-medium inline-flex items-center gap-1 text-[11px]"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Body Only</span>
                </button>
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={18}
                className="w-full p-4 bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed rounded-xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 shadow-inner resize-y"
                placeholder="Edit order email summary..."
              />
            ) : (
              <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed rounded-xl border border-slate-800 overflow-x-auto whitespace-pre select-all max-h-[380px] shadow-inner">
                {customText}
              </pre>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={mailtoHref}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Open in Email Client</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => handleCopy(customText, 'Copied Full Summary!')}
              className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-sm inline-flex items-center gap-2 ${
                copiedStatus === 'copied'
                  ? 'bg-emerald-600 text-white'
                  : copiedStatus === 'error'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {copiedStatus === 'copied' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>{copyFeedbackText}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>{copyFeedbackText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

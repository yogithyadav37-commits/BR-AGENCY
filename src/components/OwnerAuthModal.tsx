import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, Eye, EyeOff, X, Check } from 'lucide-react';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: () => void;
  savedPin: string;
  onUpdatePin?: (newPin: string) => void;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
  savedPin,
  onUpdatePin,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === savedPin) {
      setError('');
      setPin('');
      onAuthenticate();
      onClose();
    } else {
      setError('Incorrect Owner PIN. Please try again.');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPinInput !== savedPin) {
      setError('Current PIN is incorrect.');
      return;
    }
    if (newPinInput.length < 4) {
      setError('New PIN must be at least 4 digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setError('New PIN and confirmation do not match.');
      return;
    }

    if (onUpdatePin) {
      onUpdatePin(newPinInput);
      setPinChangeSuccess(true);
      setError('');
      setTimeout(() => {
        setPinChangeSuccess(false);
        setIsChangingPin(false);
        setCurrentPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
      }, 1500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-cyan-400">
                Security Access Control
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Owner &amp; Supplier Portal
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isChangingPin ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800">
                <div className="font-semibold flex items-center gap-1.5 mb-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Owner Authentication Required</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Only the plant owner can manage warehouse stock inventory, configure ink pricing, review stock requests, and update order delivery stages.
                </p>
                <div className="mt-2 pt-2 border-t border-amber-200 font-mono text-[11px] text-amber-900 font-medium">
                  Default Access PIN: <span className="bg-amber-100 px-1.5 py-0.5 rounded font-bold">{savedPin}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter 4-Digit Owner PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={10}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter PIN (e.g. 1234)"
                    autoFocus
                    className="w-full px-4 py-2.5 text-sm font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(true);
                    setError('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2"
                >
                  Change Owner PIN
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Unlock Owner Mode</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePin} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Change Owner PIN</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(false);
                    setError('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Back to Login
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Current PIN</label>
                <input
                  type="password"
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">New PIN</label>
                <input
                  type="password"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="At least 4 digits"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New PIN</label>
                <input
                  type="password"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {pinChangeSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>PIN updated successfully!</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Save New PIN
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

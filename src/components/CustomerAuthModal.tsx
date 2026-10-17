import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  KeyRound, 
  Building2, 
  User, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Printer, 
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';
import { CustomerProfile, DeliveryAddress } from '../types/ink';
import { SAMPLE_CUSTOMERS } from '../data/mockData';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (customer: CustomerProfile) => void;
  registeredCustomers: CustomerProfile[];
  onRegisterCustomer: (newCustomer: CustomerProfile) => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  registeredCustomers,
  onRegisterCustomer,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  
  // Phone form state
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // Sign up fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [pressModel, setPressModel] = useState('Heidelberg Speedmaster XL 106');

  // OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [matchedCustomer, setMatchedCustomer] = useState<CustomerProfile | null>(null);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setAuthStep('phone');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      setPhoneError('');
      setIsVerifying(false);
    }
  }, [isOpen]);

  // Resend timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && authStep === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, authStep, resendTimer]);

  if (!isOpen) return null;

  // Clean raw phone digits
  const sanitizePhone = (val: string) => val.replace(/\D/g, '');

  const formatPhoneWithCountry = (raw10: string) => `+91 ${raw10.slice(0, 5)} ${raw10.slice(5, 10)}`;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    const raw = sanitizePhone(phoneInput);
    if (raw.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    const fullFormatted = `+91 ${raw.slice(0, 5)} ${raw.slice(5, 10)}`;

    if (authMode === 'signup') {
      if (!companyName.trim()) {
        setPhoneError('Company / Press Name is required');
        return;
      }
      if (!contactPerson.trim()) {
        setPhoneError('Contact person name is required');
        return;
      }
      // Prepare new customer profile
      const newProf: CustomerProfile = {
        id: `CUST-${Date.now().toString().slice(-4)}`,
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        phone: fullFormatted,
        email: email.trim() || `dispatch@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'press'}.in`,
        gstNumber: gstNumber.trim().toUpperCase() || '07AABCA0000Z1Z5',
        address: streetAddress.trim() || 'Industrial Estate Phase II',
        city: city.trim() || 'New Delhi',
        state: 'Delhi',
        postalCode: postalCode.trim() || '110028',
        pressModel: pressModel.trim() || 'Heidelberg Sheetfed Offset',
        paymentTerms: 'Net 30',
        accountCreatedAt: new Date().toISOString().split('T')[0],
        deliveryAddress: {
          plantOrUnitName: `${companyName.trim()} Pressroom Unit 1`,
          streetAddress: streetAddress.trim() || 'Industrial Estate Phase II',
          landmark: 'Main Road',
          city: city.trim() || 'New Delhi',
          state: 'Delhi',
          postalCode: postalCode.trim() || '110028',
          dockContactPerson: contactPerson.trim(),
          dockContactPhone: fullFormatted,
          gateOrBayNumber: 'Bay 1 (Ground Floor)',
          unloadingRequirements: 'Standard dock unloading. Pallet truck on site.',
          deliveryTimeSlot: '09:00 AM - 06:00 PM'
        }
      };
      setMatchedCustomer(newProf);
    } else {
      // Find existing customer by phone
      const found = registeredCustomers.find(c => {
        const cRaw = sanitizePhone(c.phone);
        return cRaw.endsWith(raw) || cRaw === raw;
      });

      if (found) {
        setMatchedCustomer(found);
      } else {
        // Not found, offer auto-profile or hint
        const autoProf: CustomerProfile = {
          id: `CUST-${Date.now().toString().slice(-4)}`,
          companyName: 'Modern Litho Graphics',
          contactPerson: 'Operations Lead',
          phone: fullFormatted,
          email: 'press@modernlitho.in',
          gstNumber: '07AAACM8821F1ZX',
          address: 'Plot 18, Industrial Area',
          city: 'New Delhi',
          state: 'Delhi',
          postalCode: '110020',
          pressModel: 'Heidelberg Speedmaster XL 106',
          paymentTerms: 'Net 30',
          accountCreatedAt: new Date().toISOString().split('T')[0],
          deliveryAddress: {
            plantOrUnitName: 'Modern Litho Central Pressroom',
            streetAddress: 'Plot 18, Industrial Area Phase I',
            landmark: 'Near Transporter Hub',
            city: 'New Delhi',
            state: 'Delhi',
            postalCode: '110020',
            dockContactPerson: 'Receiving Team',
            dockContactPhone: fullFormatted,
            gateOrBayNumber: 'Gate 3',
            unloadingRequirements: 'Standard dock',
            deliveryTimeSlot: '10:00 AM - 05:00 PM'
          }
        };
        setMatchedCustomer(autoProf);
      }
    }

    setResendTimer(30);
    setAuthStep('otp');
  };

  // Direct 1-Click Demo Login selection
  const handleQuickDemoSelect = (customer: CustomerProfile) => {
    setMatchedCustomer(customer);
    setPhoneInput(sanitizePhone(customer.phone).slice(-10));
    setAuthStep('otp');
    setResendTimer(30);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);
    setOtpError('');

    // Auto advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleQuickFillOtp = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
    setOtpError('');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');
    if (enteredCode.length !== 6) {
      setOtpError('Please enter all 6 digits of the verification code');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      if (!matchedCustomer) {
        setOtpError('Session expired. Please re-enter your mobile number.');
        setAuthStep('phone');
        return;
      }

      // If new registration, inform parent
      if (authMode === 'signup' && !registeredCustomers.some(c => c.id === matchedCustomer.id)) {
        onRegisterCustomer(matchedCustomer);
      }

      onLoginSuccess(matchedCustomer);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Customer Press Portal</span>
              </h2>
              <p className="text-xs text-slate-300">
                Sign in with mobile OTP to track orders, download tax invoices, and re-order inks
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator & Tabs */}
        {authStep === 'phone' && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setPhoneError('');
              }}
              className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-colors ${
                authMode === 'signin'
                  ? 'border-cyan-600 text-cyan-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In (Existing Press)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setPhoneError('');
              }}
              className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-colors ${
                authMode === 'signup'
                  ? 'border-cyan-600 text-cyan-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              New Press Registration
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {authStep === 'phone' ? (
            /* STEP 1: Phone & Profile Entry */
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {/* Quick Demo Logins banner (Only in Sign In mode) */}
              {authMode === 'signin' && (
                <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-cyan-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Instant 1-Click Demo Accounts</span>
                    </span>
                    <span className="text-[11px] text-cyan-700">Pre-seeded history</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {registeredCustomers.slice(0, 2).map((demo) => (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => handleQuickDemoSelect(demo)}
                        className="text-left px-3 py-2 bg-white hover:bg-cyan-100/50 border border-cyan-200/80 rounded-lg transition-colors group cursor-pointer shadow-2xs"
                      >
                        <p className="text-xs font-bold text-slate-900 group-hover:text-cyan-800 truncate">
                          {demo.companyName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {demo.phone}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Phone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex rounded-xl border border-slate-300 focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-500/20 overflow-hidden shadow-2xs">
                  <span className="inline-flex items-center px-3.5 bg-slate-100 border-r border-slate-300 text-xs font-mono font-semibold text-slate-600">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(sanitizePhone(e.target.value));
                      setPhoneError('');
                    }}
                    placeholder="98112 34890"
                    className="w-full px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  We will send a 6-digit one-time password (OTP) via SMS to verify this number.
                </p>
              </div>

              {/* Sign Up Specific Fields */}
              {authMode === 'signup' && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Company &amp; Pressroom Profile
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Printing Company / Press Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Pragati Offset Graphics"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-cyan-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Press Operations / Contact Person <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          placeholder="e.g. Arun Kumar (Plant Head)"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-cyan-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        GSTIN Number (for Tax Invoices)
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        placeholder="07AABCA8821D1ZQ"
                        className="w-full px-3 py-2 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:border-cyan-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Email Address (for PDF Invoices)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="press@pragatioffset.in"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-cyan-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Primary Delivery Plant Address
                      </label>
                      <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="Plot 44, Naraina Industrial Area Phase-II"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-cyan-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New Delhi"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-cyan-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Primary Press Machinery
                    </label>
                    <div className="relative">
                      <Printer className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={pressModel}
                        onChange={(e) => setPressModel(e.target.value)}
                        placeholder="e.g. Heidelberg Speedmaster XL 106-6+L / Komori GL 40"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-cyan-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error note */}
              {phoneError && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {phoneError}
                </p>
              )}

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wide rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Send One-Time Password (OTP)</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 text-cyan-800 mb-1">
                  <KeyRound className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Enter 6-Digit Verification Code
                </h3>
                <p className="text-xs text-slate-500">
                  Sent to <span className="font-mono font-semibold text-slate-800">{matchedCustomer?.phone || formatPhoneWithCountry(phoneInput)}</span>
                  {' · '}
                  <button
                    type="button"
                    onClick={() => setAuthStep('phone')}
                    className="text-cyan-700 underline hover:text-cyan-900 font-medium"
                  >
                    Change
                  </button>
                </p>
                {matchedCustomer && (
                  <p className="text-xs text-slate-600 font-semibold pt-1">
                    Press Account: {matchedCustomer.companyName}
                  </p>
                )}
              </div>

              {/* 1-Click Demo Code Fill Button */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Instant Demo Mode Verification
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Click to auto-populate test code <span className="font-mono font-bold">123456</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillOtp}
                  className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  Fill Code 123456
                </button>
              </div>

              {/* 6-Digit PIN Boxes */}
              <div>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-mono font-bold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 focus:outline-hidden"
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-center text-xs text-rose-600 font-medium mt-2">
                    {otpError}
                  </p>
                )}
              </div>

              {/* Resend Action */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Didn't receive SMS?</span>
                {resendTimer > 0 ? (
                  <span className="font-mono text-slate-400">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResendTimer(30);
                      handleQuickFillOtp();
                    }}
                    className="text-cyan-700 font-semibold hover:text-cyan-900 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>

              {/* Submit Verification */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-semibold text-xs tracking-wide rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                {isVerifying ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Enter Customer Portal</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Device Persistence Note */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Secure session is saved to this browser so you remain signed in on this device.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

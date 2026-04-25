import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Shield, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (userData: { email: string; name: string }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const generateOTP = () => {
    // Simulate OTP generation (in production, this would be sent via email/SMS)
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production: Send OTP via email/SMS API
    const otpCode = generateOTP();
    console.log('Generated OTP:', otpCode); // For testing purposes
    
    setLoading(false);
    setStep('otp');
    setCountdown(60);
    
    // Auto-focus first OTP input
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);

    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production: Verify OTP with backend
    // For demo: Accept any 6-digit code
    if (otpCode.length === 6) {
      setStep('success');
      
      // Auto-login after success animation
      setTimeout(() => {
        onLogin({
          email,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        });
      }, 1500);
    } else {
      setError('Invalid OTP. Please try again.');
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newOTP = generateOTP();
    console.log('New OTP:', newOTP);
    
    setLoading(false);
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary/5 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary shadow-xl shadow-primary/20 mb-4"
          >
            <span className="text-white font-bold text-4xl tracking-tighter">F</span>
          </motion.div>
          <h1 className="text-4xl font-heading font-bold text-slate-900 mb-2">FitMirror</h1>
          <p className="text-slate-600 font-medium">Your AI-Powered Personal Stylist</p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 backdrop-blur-xl"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Email Input */}
            {step === 'email' && (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOTP}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Mail size={32} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                  <p className="text-slate-600 text-sm">Enter your email to receive a verification code</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none transition-colors text-lg font-medium"
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm font-medium text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </motion.form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOTP}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Shield size={32} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify OTP</h2>
                  <p className="text-slate-600 text-sm">
                    Enter the 6-digit code sent to <br />
                    <span className="font-semibold text-slate-900">{email}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none transition-colors"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm font-medium text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.some(d => !d)}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Login
                      <CheckCircle size={20} />
                    </>
                  )}
                </button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-slate-600 text-sm">
                      Resend code in <span className="font-bold text-primary">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-primary font-semibold text-sm hover:underline disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); }}
                  className="w-full text-slate-600 font-medium text-sm hover:text-slate-900 transition-colors"
                >
                  ← Change email address
                </button>
              </motion.form>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500 mb-6"
                >
                  <CheckCircle size={48} className="text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome!</h2>
                <p className="text-slate-600 font-medium">Login successful. Redirecting...</p>
                <div className="mt-6 flex justify-center">
                  <Loader2 size={32} className="text-primary animate-spin" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Demo Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"
        >
          <p className="text-amber-800 text-sm font-medium">
            🎓 <strong>Demo Mode:</strong> Any email and 6-digit OTP will work
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

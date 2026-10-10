import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, MapPin, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validation Checkers
  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isLengthValid = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isPasswordValid = isLengthValid && hasUppercase && hasSpecial;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isNameValid) {
      setError('Full Name must be strictly between 20 and 60 characters in length.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must meet all complexity requirements (8–16 chars, 1 uppercase, 1 special character).');
      return;
    }

    if (!isAddressValid) {
      setError('Address is required and must not exceed 400 characters.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        address: address.trim(),
      });
      navigate('/stores');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please review your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Create Account</h1>
            <p className="mt-1 text-xs text-neutral-500">
              Sign up as a normal user to explore and rate local stores
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-brand-dark">
                  Full Name
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    name.length === 0
                      ? 'text-neutral-400'
                      : isNameValid
                      ? 'text-emerald-600 font-semibold'
                      : 'text-rose-500 font-semibold'
                  }`}
                >
                  {name.length}/60 chars (min 20)
                </span>
              </div>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanmay Ravindra Thakare"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`h-10 w-full rounded-xl border pl-10 pr-3 text-sm text-brand-dark placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 transition-all ${
                    name.length > 0 && !isNameValid
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/20'
                      : 'border-neutral-200 focus:border-brand-accent focus:ring-brand-accent/20'
                  }`}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                Email Address (Lowercase)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 text-sm text-brand-dark placeholder:text-neutral-400 focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20 transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-brand-dark">
                  Address
                </label>
                <span className="text-[11px] font-mono text-neutral-400">
                  {address.length}/400 chars
                </span>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                <textarea
                  required
                  rows={2}
                  maxLength={400}
                  placeholder="Street name, building, area, city..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 py-2 text-sm text-brand-dark placeholder:text-neutral-400 focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 text-sm text-brand-dark placeholder:text-neutral-400 focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20 transition-all"
                />
              </div>

              {/* Real-time Password Rules Checklist */}
              <div className="mt-2.5 rounded-xl bg-neutral-50 p-3 space-y-1.5 border border-neutral-100">
                <div className="flex items-center gap-2 text-[11px]">
                  {isLengthValid ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border border-neutral-300 shrink-0" />
                  )}
                  <span className={isLengthValid ? 'text-emerald-700 font-medium' : 'text-neutral-500'}>
                    8 to 16 characters in length
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  {hasUppercase ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border border-neutral-300 shrink-0" />
                  )}
                  <span className={hasUppercase ? 'text-emerald-700 font-medium' : 'text-neutral-500'}>
                    At least one uppercase letter (A-Z)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  {hasSpecial ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border border-neutral-300 shrink-0" />
                  )}
                  <span className={hasSpecial ? 'text-emerald-700 font-medium' : 'text-neutral-500'}>
                    At least one special character (!@#$%^&*...)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isNameValid || !isPasswordValid || !isAddressValid}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary font-semibold text-sm text-white shadow-xs hover:bg-brand-navy active:scale-98 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-primary hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}

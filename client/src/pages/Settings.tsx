import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, MapPin, Lock, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

export function Settings() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Password complexity
  const isLengthValid = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const isNewPasswordValid = isLengthValid && hasUppercase && hasSpecial;
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isNewPasswordValid) {
      setError('New password must be 8–16 characters long and contain at least one uppercase letter and one special character.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password cannot be identical to your current password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setSuccess(res.data.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Account & Security</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Manage your personal profile details and security credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Profile Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy text-brand-accent shadow-xs mb-4">
              <User className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-brand-dark">{user?.name}</h3>
            <p className="text-xs text-neutral-500 break-all">{user?.email}</p>

            <div className="mt-6 pt-5 border-t border-neutral-100 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-neutral-600">
                <Mail className="h-4 w-4 shrink-0 mt-0.5 text-neutral-400" />
                <span className="break-all">{user?.email}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-neutral-600">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-neutral-400" />
                <span>{user?.address}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-600">
                <Shield className="h-4 w-4 shrink-0 text-neutral-400" />
                <span>Account Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Change Password Form */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-brand-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-dark">Change Password</h2>
                <p className="text-xs text-neutral-500">Update your account login password</p>
              </div>
            </div>

            {/* Error & Success Feedback */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-brand-dark placeholder:text-neutral-400 focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-brand-dark placeholder:text-neutral-400 focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20 transition-all"
                />

                {/* Password requirements */}
                <div className="mt-2 rounded-xl bg-neutral-50 p-2.5 space-y-1 border border-neutral-100">
                  <div className="flex items-center gap-2 text-[11px]">
                    {isLengthValid ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-neutral-300 shrink-0" />
                    )}
                    <span className={isLengthValid ? 'text-emerald-700 font-medium' : 'text-neutral-500'}>
                      8 to 16 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    {hasUppercase ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-neutral-300 shrink-0" />
                    )}
                    <span className={hasUppercase ? 'text-emerald-700 font-medium' : 'text-neutral-500'}>
                      At least one uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    {hasSpecial ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-neutral-300 shrink-0" />
                    )}
                    <span className={hasSpecial ? 'text-emerald-700 font-medium' : 'text-neutral-500'}>
                      At least one special character (!@#$%^&*...)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`h-10 w-full rounded-xl border px-3.5 text-sm text-brand-dark placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 transition-all ${
                    confirmPassword.length > 0 && !doPasswordsMatch
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/20'
                      : 'border-neutral-200 focus:border-brand-accent focus:ring-brand-accent/20'
                  }`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !isNewPasswordValid || !doPasswordsMatch || !currentPassword}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 font-semibold text-xs text-white shadow-xs hover:bg-brand-navy active:scale-98 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

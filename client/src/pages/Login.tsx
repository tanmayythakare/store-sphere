import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

export function Login() {
  const { login, getHomeRouteForRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      navigate(getHomeRouteForRole(user.role));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Card Container */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <BrandLogo size="lg" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Sign In to StoreSphere</h1>
            <p className="mt-1 text-xs text-neutral-500">
              Access your store catalog, reviews, or administration console
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                Email Address
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary font-semibold text-sm text-white shadow-xs hover:bg-brand-navy active:scale-98 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-neutral-500">
          Do not have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-primary hover:underline">
            Register as a Normal User
          </Link>
        </p>
      </div>
    </div>
  );
}

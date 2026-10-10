import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Settings, LogOut, LayoutDashboard, ShoppingBag, User } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy text-brand-accent shadow-xs transition-transform group-hover:scale-105">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-brand-dark">Roxiler Portal</span>
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">Store Directory</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              {/* Role specific links */}
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-neutral-100 text-brand-primary'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-brand-dark'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}

              {user.role === 'STORE_OWNER' && (
                <Link
                  to="/owner"
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                    isActive('/owner')
                      ? 'bg-neutral-100 text-brand-primary'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-brand-dark'
                  }`}
                >
                  <Store className="h-4 w-4" />
                  <span>My Store</span>
                </Link>
              )}

              {user.role === 'NORMAL_USER' && (
                <Link
                  to="/stores"
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                    isActive('/stores')
                      ? 'bg-neutral-100 text-brand-primary'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-brand-dark'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Stores</span>
                </Link>
              )}

              {/* Clean Human UX: Settings link */}
              <Link
                to="/settings"
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  isActive('/settings')
                    ? 'bg-neutral-100 text-brand-primary'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-brand-dark'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>

              {/* User Identity & Logout */}
              <div className="ml-2 flex items-center gap-3 pl-3 border-l border-neutral-200">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-brand-dark max-w-[150px] truncate">{user.name}</span>
                  <span className="text-[11px] text-neutral-400 max-w-[150px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out of account"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-2xs transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-brand-dark"
                >
                  <LogOut className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 shadow-2xs transition-all hover:bg-neutral-50 hover:text-brand-dark"
              >
                <User className="h-4 w-4 text-neutral-400" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white shadow-xs transition-all hover:bg-brand-navy"
              >
                Create Account
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

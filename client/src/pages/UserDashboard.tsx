import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Store } from '../types';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/StarRating';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import {
  Search,
  Store as StoreIcon,
  MapPin,
  Mail,
  Star,
  Edit3,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react';

export function UserDashboard() {
  const { user } = useAuth();

  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'address' | 'rating'>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Rating Modal State
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(
        `/stores?search=${encodeURIComponent(search)}&sortBy=${sortBy}&order=${order}`
      );
      setStores(res.data.stores || []);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, sortBy, order]);

  const handleOpenRatingModal = (store: Store) => {
    setSelectedStore(store);
    setRatingScore(store.userRating?.score || 5);
    setRatingComment(store.userRating?.comment || '');
    setRatingError(null);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;

    if (ratingScore < 1 || ratingScore > 5) {
      setRatingError('Please select a star rating between 1 and 5.');
      return;
    }

    if (ratingComment.length > 100) {
      setRatingError('Comment must not exceed 100 characters in length.');
      return;
    }

    setIsSubmitting(true);
    setRatingError(null);

    try {
      const res = await api.post(`/stores/${selectedStore.id}/rate`, {
        score: ratingScore,
        comment: ratingComment.trim() || undefined,
      });

      // Update store in state immediately without requiring full reload
      setStores((prevStores) =>
        prevStores.map((s) => {
          if (s.id === selectedStore.id) {
            return {
              ...s,
              averageRating: res.data.averageRating,
              ratingCount: res.data.ratingCount,
              userRating: {
                score: res.data.rating.score,
                comment: res.data.rating.comment,
              },
            };
          }
          return s;
        })
      );

      setSelectedStore(null);
    } catch (err: any) {
      setRatingError(err.response?.data?.error || 'Failed to submit rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Store Directory</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Search, explore ratings, and submit your verified merchant feedback
        </p>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search stores by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-xs text-brand-dark placeholder:text-neutral-400 focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20 transition-all shadow-2xs"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white p-1 text-xs shadow-2xs">
            <span className="px-2 text-neutral-400 font-medium">Sort by:</span>
            <button
              onClick={() => setSortBy('name')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                sortBy === 'name' ? 'bg-brand-navy text-white' : 'text-neutral-600 hover:text-brand-dark'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('address')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                sortBy === 'address' ? 'bg-brand-navy text-white' : 'text-neutral-600 hover:text-brand-dark'
              }`}
            >
              Address
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                sortBy === 'rating' ? 'bg-brand-navy text-white' : 'text-neutral-600 hover:text-brand-dark'
              }`}
            >
              Rating
            </button>
          </div>

          <button
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            title="Toggle ascending / descending"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-2xs hover:bg-neutral-50 transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stores Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl border border-neutral-200/80 bg-white p-6 animate-pulse">
              <div className="h-4 w-1/2 bg-neutral-200 rounded mb-3" />
              <div className="h-3 w-3/4 bg-neutral-100 rounded mb-2" />
              <div className="h-3 w-2/3 bg-neutral-100 rounded mb-6" />
              <div className="h-10 bg-neutral-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title="No Stores Found"
          description="We couldn't find any stores matching your current search criteria. Try a different keyword."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs hover:border-neutral-300 hover:shadow-md transition-all group"
            >
              <div className="space-y-4">
                {/* Store Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-brand-accent shadow-2xs group-hover:scale-105 transition-transform">
                      <StoreIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-dark leading-tight">{store.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs">
                        {store.averageRating !== null ? (
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <span>{store.averageRating.toFixed(1)}</span>
                            <StarRating value={Math.round(store.averageRating)} readOnly size="sm" />
                            <span className="text-neutral-400 font-normal">({store.ratingCount})</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-neutral-400">New (No ratings yet)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" />
                    <span className="line-clamp-2">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="truncate">{store.email}</span>
                  </div>
                </div>

                {/* User's Existing Rating (if any) */}
                {store.userRating && (
                  <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-brand-primary">Your Submitted Rating</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-brand-dark">{store.userRating.score}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                    {store.userRating.comment && (
                      <p className="text-xs text-neutral-600 italic line-clamp-2">
                        "{store.userRating.comment}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-neutral-100">
                {user ? (
                  user.role === 'NORMAL_USER' ? (
                    <button
                      onClick={() => handleOpenRatingModal(store)}
                      className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-98 ${
                        store.userRating
                          ? 'border border-neutral-200 bg-white text-brand-dark hover:bg-neutral-50'
                          : 'bg-brand-primary text-white hover:bg-brand-navy shadow-xs'
                      }`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>{store.userRating ? 'Modify Rating' : 'Rate this Store'}</span>
                    </button>
                  ) : (
                    <div className="text-center py-1 text-[11px] text-neutral-400 italic">
                      Ratings reserved for normal users
                    </div>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Sign in to Rate
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Rate Store */}
      <Modal
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        title={selectedStore?.userRating ? `Modify Rating for ${selectedStore?.name}` : `Rate ${selectedStore?.name}`}
        description="Share your experience to help the community"
      >
        {ratingError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{ratingError}</span>
          </div>
        )}

        <form onSubmit={handleRatingSubmit} className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-xs font-semibold text-brand-dark mb-2">Select Your Star Score</span>
            <StarRating
              value={ratingScore}
              size="lg"
              onChange={(newScore) => setRatingScore(newScore)}
            />
            <span className="mt-2 text-xs font-bold text-amber-500">
              {ratingScore} {ratingScore === 1 ? 'Star' : 'Stars'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-brand-dark">
                Feedback Comment (Optional)
              </label>
              <span className="text-[10px] font-mono text-neutral-400">
                {ratingComment.length}/100 chars
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={100}
              placeholder="Tell others what you enjoyed or how the store could improve..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-brand-dark focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedStore(null)}
              className="rounded-xl border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : selectedStore?.userRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

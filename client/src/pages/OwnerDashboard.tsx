import { useState, useEffect } from 'react';
import api from '../services/api';
import { Store, Review } from '../types';
import { StarRating } from '../components/StarRating';
import { SortableHeader } from '../components/SortableHeader';
import { EmptyState } from '../components/EmptyState';
import { Store as StoreIcon, MessageSquare, Mail, MapPin, Star, AlertCircle } from 'lucide-react';

export function OwnerDashboard() {
  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const fetchStoreData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [storeRes, reviewsRes] = await Promise.all([
        api.get('/stores/owner/my-store'),
        api.get(`/stores/owner/reviews?sortBy=${sortBy}&order=${order}`),
      ]);

      setStore(storeRes.data.store);
      setReviews(reviewsRes.data.reviews || []);
    } catch (err: any) {
      console.error('Failed to load store owner data:', err);
      setError(err.response?.data?.error || 'Unable to retrieve store details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [sortBy, order]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setOrder('desc');
    }
  };

  if (isLoading && !store) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-neutral-500 font-medium">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
          <span>Loading store insights...</span>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <EmptyState
          icon={StoreIcon}
          title="No Store Assigned"
          description="Your account is not currently assigned as an owner of any registered store. Please contact the administrator to attach your store."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Store Owner Portal</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Monitor your customer satisfaction metrics and real-time review feedback
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Store Information Banner */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy text-brand-accent shadow-xs">
                <StoreIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-dark">{store.name}</h2>
                <span className="text-xs text-neutral-400">Assigned Merchant Store</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-neutral-400" />
                <span>{store.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span>{store.address}</span>
              </div>
            </div>
          </div>

          {/* Average Rating Scorecard */}
          <div className="flex items-center gap-6 rounded-xl bg-neutral-50 p-4 border border-neutral-100">
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Average Score</span>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-brand-dark">
                  {store.averageRating !== null ? store.averageRating.toFixed(1) : '—'}
                </span>
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              </div>
            </div>

            <div className="h-10 w-px bg-neutral-200" />

            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total Reviews</span>
              <p className="text-3xl font-extrabold text-brand-dark mt-0.5">
                {reviews.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-brand-primary" />
            <h3 className="text-base font-bold text-brand-dark">Customer Reviews & Ratings</h3>
          </div>
          <span className="text-xs text-neutral-400 font-medium">Click headers to sort</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50/70">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">Customer Name</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">Customer Email</th>
                  <SortableHeader label="Rating" columnKey="score" currentSortBy={sortBy} currentOrder={order} onSort={handleSort} />
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">Comment / Feedback</th>
                  <SortableHeader label="Submitted Date" columnKey="date" currentSortBy={sortBy} currentOrder={order} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12">
                      <EmptyState
                        icon={MessageSquare}
                        title="No Customer Reviews Yet"
                        description="Once consumers rate your store on the platform, their scores and feedback notes will display here."
                      />
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-brand-dark">{review.customerName}</td>
                      <td className="px-4 py-3.5 text-neutral-500">{review.customerEmail}</td>
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-bold text-brand-dark">{review.score}</span>
                          <StarRating value={review.score} readOnly size="sm" />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-neutral-700 max-w-sm">
                        {review.comment ? (
                          <span className="italic">"{review.comment}"</span>
                        ) : (
                          <span className="text-neutral-400 italic">No comment provided</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500 font-mono text-[11px]">
                        {new Date(review.updatedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

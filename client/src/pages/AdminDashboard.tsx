import { useState, useEffect } from 'react';
import api from '../services/api';
import { AdminMetrics, Store, User, Role } from '../types';
import { StarRating } from '../components/StarRating';
import { SortableHeader } from '../components/SortableHeader';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { CustomDropdown } from '../components/CustomDropdown';
import {
  Users,
  Store as StoreIcon,
  Star,
  Plus,
  Search,
  Filter,
  AlertCircle,
} from 'lucide-react';

const ROLE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'STORE_OWNER', label: 'Store Owner' },
  { value: 'NORMAL_USER', label: 'Normal User' },
];

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics>({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stores' | 'users'>('stores');

  // Search & Filter States
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeOrder, setStoreOrder] = useState<'asc' | 'desc'>('asc');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userOrder, setUserOrder] = useState<'asc' | 'desc'>('asc');

  // Modal States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('NORMAL_USER');

  // New Store Form State
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreEmail, setNewStoreEmail] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreOwnerId, setNewStoreOwnerId] = useState<string>('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, storesRes, usersRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get(`/admin/stores?search=${encodeURIComponent(storeSearch)}&sortBy=${storeSortBy}&order=${storeOrder}`),
        api.get(`/admin/users?search=${encodeURIComponent(userSearch)}&role=${userRoleFilter === 'ALL' ? '' : userRoleFilter}&sortBy=${userSortBy}&order=${userOrder}`),
      ]);

      setMetrics(metricsRes.data);
      setStores(storesRes.data.stores);
      setUsers(usersRes.data.users);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeSearch, storeSortBy, storeOrder, userSearch, userRoleFilter, userSortBy, userOrder]);

  const handleStoreSort = (column: string) => {
    if (storeSortBy === column) {
      setStoreOrder(storeOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStoreSortBy(column);
      setStoreOrder('asc');
    }
  };

  const handleUserSort = (column: string) => {
    if (userSortBy === column) {
      setUserOrder(userOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortBy(column);
      setUserOrder('asc');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    try {
      await api.post('/admin/users', {
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        password: newUserPassword,
        address: newUserAddress.trim(),
        role: newUserRole,
      });

      setIsAddUserOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserAddress('');
      setNewUserRole('NORMAL_USER');
      await fetchData();
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    try {
      await api.post('/admin/stores', {
        name: newStoreName.trim(),
        email: newStoreEmail.trim().toLowerCase(),
        address: newStoreAddress.trim(),
        ownerId: newStoreOwnerId ? Number(newStoreOwnerId) : null,
      });

      setIsAddStoreOpen(false);
      setNewStoreName('');
      setNewStoreEmail('');
      setNewStoreAddress('');
      setNewStoreOwnerId('');
      await fetchData();
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to create store.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const storeOwnersList = users.filter((u) => u.role === 'STORE_OWNER');

  return (
    <div className="mx-auto max-w-7xl py-6 space-y-8">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Administration Console</h1>
          <p className="mt-1 text-xs text-neutral-500">
            System metrics, user directory, and store management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setModalError(null);
              setIsAddStoreOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-all active:scale-98"
          >
            <Plus className="h-4 w-4 text-brand-primary" />
            <span>Add Store</span>
          </button>
          <button
            onClick={() => {
              setModalError(null);
              setIsAddUserOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-navy transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>Provision Account</span>
          </button>
        </div>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Users</span>
            <p className="text-3xl font-extrabold text-brand-dark mt-1">{metrics.totalUsers}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand-primary">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Stores</span>
            <p className="text-3xl font-extrabold text-brand-dark mt-1">{metrics.totalStores}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <StoreIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Submitted Ratings</span>
            <p className="text-3xl font-extrabold text-brand-dark mt-1">{metrics.totalRatings}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('stores')}
          className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'stores'
              ? 'border-brand-primary text-brand-primary font-bold'
              : 'border-transparent text-neutral-400 hover:text-brand-dark'
          }`}
        >
          Stores Directory ({stores.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-brand-primary text-brand-primary font-bold'
              : 'border-transparent text-neutral-400 hover:text-brand-dark'
          }`}
        >
          Users Directory ({users.length})
        </button>
      </div>

      {/* Tab 1: Stores Directory */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search stores by name or address..."
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 text-xs text-brand-dark placeholder:text-neutral-400 focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20 transition-all"
              />
            </div>
            <span className="text-xs text-neutral-400 font-medium">Click column headers to sort</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/70">
                  <tr>
                    <SortableHeader label="Store Name" columnKey="name" currentSortBy={storeSortBy} currentOrder={storeOrder} onSort={handleStoreSort} />
                    <SortableHeader label="Email" columnKey="email" currentSortBy={storeSortBy} currentOrder={storeOrder} onSort={handleStoreSort} />
                    <SortableHeader label="Address" columnKey="address" currentSortBy={storeSortBy} currentOrder={storeOrder} onSort={handleStoreSort} />
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">Store Owner</th>
                    <SortableHeader label="Rating" columnKey="rating" currentSortBy={storeSortBy} currentOrder={storeOrder} onSort={handleStoreSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-neutral-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
                          <span>Loading store records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : stores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12">
                        <EmptyState icon={StoreIcon} title="No stores found" description="Try adjusting your search criteria." />
                      </td>
                    </tr>
                  ) : (
                    stores.map((store) => (
                      <tr key={store.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-brand-dark">{store.name}</td>
                        <td className="px-4 py-3.5 text-neutral-600">{store.email}</td>
                        <td className="px-4 py-3.5 text-neutral-600 max-w-xs truncate">{store.address}</td>
                        <td className="px-4 py-3.5 text-neutral-600">
                          {store.owner ? (
                            <span className="inline-flex items-center gap-1 font-medium text-brand-dark">
                              {store.owner.name}
                            </span>
                          ) : (
                            <span className="text-neutral-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {store.averageRating !== null ? (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="font-bold text-brand-dark">{store.averageRating.toFixed(1)}</span>
                              <StarRating value={Math.round(store.averageRating)} readOnly size="sm" />
                              <span className="text-[11px] text-neutral-400 font-medium">({store.ratingCount})</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-neutral-400 font-medium">New (No ratings yet)</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Directory */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or address..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 text-xs text-brand-dark placeholder:text-neutral-400 focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-neutral-400 shrink-0" />
              <CustomDropdown
                value={userRoleFilter}
                options={ROLE_FILTER_OPTIONS}
                onChange={setUserRoleFilter}
                className="w-48"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50/70">
                  <tr>
                    <SortableHeader label="Full Name" columnKey="name" currentSortBy={userSortBy} currentOrder={userOrder} onSort={handleUserSort} />
                    <SortableHeader label="Email" columnKey="email" currentSortBy={userSortBy} currentOrder={userOrder} onSort={handleUserSort} />
                    <SortableHeader label="Address" columnKey="address" currentSortBy={userSortBy} currentOrder={userOrder} onSort={handleUserSort} />
                    <SortableHeader label="Role" columnKey="role" currentSortBy={userSortBy} currentOrder={userOrder} onSort={handleUserSort} />
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-neutral-500">Store / Rating Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-neutral-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
                          <span>Loading user directory...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12">
                        <EmptyState icon={Users} title="No users found" description="Try adjusting your search criteria." />
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-brand-dark">{user.name}</td>
                        <td className="px-4 py-3.5 text-neutral-600">{user.email}</td>
                        <td className="px-4 py-3.5 text-neutral-600 max-w-xs truncate">{user.address}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : user.role === 'STORE_OWNER'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                            }`}
                          >
                            {user.role === 'ADMIN'
                              ? 'Admin'
                              : user.role === 'STORE_OWNER'
                              ? 'Store Owner'
                              : 'Normal User'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-neutral-600">
                          {user.role === 'STORE_OWNER' && user.store ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-brand-dark">{user.store.name}</span>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                {user.store.averageRating !== null ? (
                                  <>
                                    <span className="font-bold text-brand-dark">{user.store.averageRating.toFixed(1)}</span>
                                    <StarRating value={Math.round(user.store.averageRating)} readOnly size="sm" />
                                  </>
                                ) : (
                                  <span className="text-neutral-400">No ratings yet</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New User */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Provision New Account" description="Create an administrator, store owner, or normal user account">
        {modalError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-3.5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-brand-dark">Full Name</label>
              <span className={`text-[10px] font-mono ${newUserName.length >= 20 && newUserName.length <= 60 ? 'text-emerald-600 font-bold' : 'text-neutral-400'}`}>
                {newUserName.length}/60 (min 20)
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Rameshwar Shrikant Kulkarni"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-brand-dark focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value.toLowerCase())}
              className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-brand-dark focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">Role</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as Role)}
              className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-brand-dark focus:border-brand-accent focus:outline-hidden"
            >
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="8-16 chars, 1 uppercase, 1 special"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-brand-dark focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">Address</label>
            <textarea
              required
              rows={2}
              maxLength={400}
              placeholder="Full address (max 400 chars)"
              value={newUserAddress}
              onChange={(e) => setNewUserAddress(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || newUserName.length < 20 || newUserName.length > 60}
              className="rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add New Store */}
      <Modal isOpen={isAddStoreOpen} onClose={() => setIsAddStoreOpen(false)} title="Register New Store" description="Add a new store and assign a store owner">
        {modalError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleCreateStore} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">Store Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Phoenix Hypermarket"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-brand-dark focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">Store Email</label>
            <input
              type="email"
              required
              placeholder="contact@store.com"
              value={newStoreEmail}
              onChange={(e) => setNewStoreEmail(e.target.value.toLowerCase())}
              className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-brand-dark focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">Store Address</label>
            <textarea
              required
              rows={2}
              maxLength={400}
              placeholder="Physical street address (max 400 chars)"
              value={newStoreAddress}
              onChange={(e) => setNewStoreAddress(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-accent focus:outline-hidden focus:ring-2 focus:ring-brand-accent/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1">Assign Store Owner (Optional)</label>
            <select
              value={newStoreOwnerId}
              onChange={(e) => setNewStoreOwnerId(e.target.value)}
              className="h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-brand-dark focus:border-brand-accent focus:outline-hidden"
            >
              <option value="">No Owner Assigned</option>
              {storeOwnersList.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddStoreOpen(false)}
              className="rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newStoreName || !newStoreEmail || !newStoreAddress}
              className="rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Store'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

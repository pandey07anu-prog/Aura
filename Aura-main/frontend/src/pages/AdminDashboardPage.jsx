import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import { formatINR } from '../utils/formatters';
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Receipt,
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  History,
  Lock,
  ArrowUpDown,
  X,
  TrendingUp,
  TrendingDown,
  IndianRupee
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'audit'

  // Selected User for Details Drawer
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Status Change Dialog
  const [statusChangeTarget, setStatusChangeTarget] = useState(null); // { user, nextStatus }
  const [statusReason, setStatusReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data?.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin summary:', err);
    }
  };

  const fetchUsers = async (page = 0) => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 10);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data?.success && res.data?.data) {
        setUsers(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 0);
        setCurrentPage(res.data.data.number || 0);
        setTotalElements(res.data.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.data?.success) {
        setAuditLogs(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchUsers(0), fetchAuditLogs()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    fetchUsers(0);
  }, [roleFilter, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // View User Details
  const handleOpenUserDetails = async (userId) => {
    setSelectedUserId(userId);
    setDetailsLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      if (res.data?.success) {
        setUserDetails(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Status Change Submit
  const handleConfirmStatusChange = async () => {
    if (!statusChangeTarget) return;
    setStatusLoading(true);
    setStatusError('');

    try {
      await api.patch(`/admin/users/${statusChangeTarget.user.id}/status`, {
        status: statusChangeTarget.nextStatus,
        reason: statusReason.trim() || 'Administrative review',
      });
      setStatusChangeTarget(null);
      setStatusReason('');
      fetchUsers(currentPage);
      fetchSummary();
      fetchAuditLogs();
      if (selectedUserId === statusChangeTarget.user.id) {
        handleOpenUserDetails(selectedUserId);
      }
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Admin Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-fintech-redSubtle border border-fintech-red/30 text-fintech-red font-mono text-[10px] font-bold uppercase">
              RESTRICTED ACCESS
            </span>
            <span className="text-xs text-[#737373] font-mono">ROLE_ADMIN PRIVILEGED</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">System Administration Console</h2>
        </div>
      </div>

      {/* Aggregate Overview Metrics (Real Database Queries) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Registered Users"
              amount={summary?.totalUsers || 0}
              isCurrency={false}
              prefix=""
              icon={Users}
              subtitle={`${summary?.newUsersThisMonth || 0} registrations this month`}
            />
            <MetricCard
              title="Active Accounts"
              amount={summary?.activeUsers || 0}
              isCurrency={false}
              prefix=""
              icon={UserCheck}
              subtitle={`${summary?.suspendedUsers || 0} accounts suspended`}
            />
            <MetricCard
              title="Total Transactions"
              amount={summary?.totalTransactions || 0}
              isCurrency={false}
              prefix=""
              icon={Receipt}
              subtitle="All user records across platform"
            />
            <MetricCard
              title="Aggregate Volume"
              amount={summary?.aggregateExpenseVolume || 0}
              icon={IndianRupee}
              subtitle="Total logged application spending"
            />
          </>
        )}
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-3 border-b border-[#292929] pb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'users'
              ? 'bg-white text-black font-bold shadow-sm'
              : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Registered Users ({totalElements})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'audit'
              ? 'bg-white text-black font-bold shadow-sm'
              : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: All Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Filters */}
          <div className="fintech-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="">All Roles</option>
                <option value="ROLE_USER">Standard Users</option>
                <option value="ROLE_ADMIN">Administrators</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {tableLoading ? (
            <TableSkeleton rows={6} />
          ) : users.length === 0 ? (
            <div className="fintech-card p-12 text-center text-xs text-[#737373]">
              No users matching the specified search criteria.
            </div>
          ) : (
            <div className="fintech-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141414] border-b border-[#292929] text-[#737373] uppercase font-mono tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Registration</th>
                      <th className="py-3 px-4">Last Login</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222]">
                    {users.map((u) => {
                      const isActive = u.status === 'ACTIVE';
                      const isAdminRole = u.role === 'ROLE_ADMIN';

                      return (
                        <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{u.fullName}</div>
                            <div className="text-[11px] text-[#737373] font-mono">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#525252] text-[11px]">
                            {u.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                                isAdminRole
                                  ? 'bg-white/10 text-white font-bold border border-white/20'
                                  : 'bg-[#222222] text-[#A3A3A3]'
                              }`}
                            >
                              {u.role?.replace('ROLE_', '')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                                isActive
                                  ? 'bg-fintech-greenSubtle text-fintech-green border border-fintech-green/30'
                                  : 'bg-fintech-redSubtle text-fintech-red border border-fintech-red/30'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-fintech-green' : 'bg-fintech-red'}`} />
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#737373] text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#737373] text-[11px]">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenUserDetails(u.id)}
                                className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#262626] transition-colors"
                                title="View User Ledger Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {!isAdminRole && (
                                <button
                                  onClick={() =>
                                    setStatusChangeTarget({
                                      user: u,
                                      nextStatus: isActive ? 'SUSPENDED' : 'ACTIVE',
                                    })
                                  }
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isActive
                                      ? 'text-[#737373] hover:text-fintech-red hover:bg-fintech-redSubtle'
                                      : 'text-[#737373] hover:text-fintech-green hover:bg-fintech-greenSubtle'
                                  }`}
                                  title={isActive ? 'Suspend User' : 'Activate User'}
                                >
                                  {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-[#242424] bg-[#121212] flex items-center justify-between text-xs text-[#737373]">
                  <div>
                    Page {currentPage + 1} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 0}
                      onClick={() => fetchUsers(currentPage - 1)}
                      className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-[#222222]"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => fetchUsers(currentPage + 1)}
                      className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-[#222222]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Security Audit Logs */}
      {activeTab === 'audit' && (
        <div className="fintech-card overflow-hidden">
          <div className="p-6 border-b border-[#242424]">
            <h3 className="text-sm font-bold text-white">Administrative Audit Trail</h3>
            <p className="text-xs text-[#737373]">Immutable record of administrative actions and status mutations</p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#737373]">
              No administrative audit events recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141414] border-b border-[#292929] text-[#737373] uppercase font-mono tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Admin Email</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target User ID</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#1a1a1a] transition-colors font-mono">
                      <td className="py-3.5 px-4 text-[#A3A3A3] whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-white font-semibold">
                        {log.adminEmail}
                      </td>
                      <td className="py-3.5 px-4 text-white">
                        <span className="px-2 py-0.5 rounded bg-[#242424] text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#737373] text-[11px]">
                        {log.targetUserId || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[#A3A3A3] font-sans max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="py-3.5 px-4 text-[#525252]">
                        {log.ipAddress || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* User Details Drawer / Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl h-full bg-[#111111] border-l border-[#2e2e2e] p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#292929]">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#737373]">Administrative View</span>
                <h3 className="text-lg font-bold text-white">User Financial Profile</h3>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-1.5 text-[#A3A3A3] hover:text-white rounded-lg hover:bg-[#1f1f1f]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-20 text-center text-xs text-[#737373]">
                Loading user profile...
              </div>
            ) : userDetails ? (
              <div className="space-y-6">
                {/* User Identity Header */}
                <div className="p-4 rounded-xl bg-[#171717] border border-[#262626]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-white">{userDetails.user?.fullName}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                        userDetails.user?.status === 'ACTIVE'
                          ? 'bg-fintech-greenSubtle text-fintech-green border border-fintech-green/30'
                          : 'bg-fintech-redSubtle text-fintech-red border border-fintech-red/30'
                      }`}
                    >
                      {userDetails.user?.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs font-mono text-[#737373]">
                    <div>Email: <span className="text-white">{userDetails.user?.email}</span></div>
                    <div>User ID: <span>{userDetails.user?.id}</span></div>
                    <div>Joined: <span>{new Date(userDetails.user?.createdAt).toLocaleDateString()}</span></div>
                  </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#171717] border border-[#262626]">
                    <div className="text-[10px] uppercase font-mono text-[#737373]">Total Income</div>
                    <div className="text-base font-mono font-bold text-fintech-green mt-1">
                      {formatINR(userDetails.totalIncome)}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#171717] border border-[#262626]">
                    <div className="text-[10px] uppercase font-mono text-[#737373]">Total Expense</div>
                    <div className="text-base font-mono font-bold text-white mt-1">
                      {formatINR(userDetails.totalExpenses)}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#171717] border border-[#262626]">
                    <div className="text-[10px] uppercase font-mono text-[#737373]">Net Balance</div>
                    <div className="text-base font-mono font-bold text-white mt-1">
                      {formatINR(userDetails.currentBalance)}
                    </div>
                  </div>
                </div>

                {/* Top Spending Categories */}
                <div className="p-4 rounded-xl bg-[#171717] border border-[#262626]">
                  <h5 className="text-xs font-mono uppercase text-[#A3A3A3] mb-3">Top Categories Used</h5>
                  {userDetails.topCategories?.length === 0 ? (
                    <div className="text-xs text-[#737373]">No expenses recorded</div>
                  ) : (
                    <div className="space-y-2">
                      {userDetails.topCategories?.map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-white">{c.category}</span>
                          <span className="font-mono text-[#A3A3A3]">
                            {formatINR(c.amount)} ({c.percentage?.toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Transactions List */}
                <div className="p-4 rounded-xl bg-[#171717] border border-[#262626]">
                  <h5 className="text-xs font-mono uppercase text-[#A3A3A3] mb-3">Recent Transactions</h5>
                  {userDetails.recentTransactions?.length === 0 ? (
                    <div className="text-xs text-[#737373]">No transactions logged</div>
                  ) : (
                    <div className="space-y-2">
                      {userDetails.recentTransactions?.slice(0, 5).map((t) => (
                        <div key={t.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#141414]">
                          <div>
                            <div className="text-white font-semibold truncate max-w-[180px]">{t.description}</div>
                            <div className="text-[10px] font-mono text-[#737373]">{t.date} • {t.category}</div>
                          </div>
                          <div className={`font-mono font-bold ${t.type === 'EXPENSE' ? 'text-white' : 'text-fintech-green'}`}>
                            {t.type === 'EXPENSE' ? '-' : '+'}{formatINR(t.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Account Status Change Confirmation Modal */}
      {statusChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#141414] border border-[#2e2e2e] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Change Account Status</h3>
                <p className="text-xs text-[#737373]">Administrative Action Confirmation</p>
              </div>
            </div>

            {statusError && (
              <div className="p-3 rounded-xl bg-fintech-redSubtle border border-fintech-red/30 text-fintech-red text-xs">
                {statusError}
              </div>
            )}

            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Are you sure you want to change <span className="text-white font-bold">{statusChangeTarget.user.fullName}</span>'s status to{' '}
              <span className="text-white font-mono uppercase font-bold">{statusChangeTarget.nextStatus}</span>?
            </p>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#A3A3A3] mb-1.5">
                Reason for Audit Log
              </label>
              <textarea
                rows={2}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#292929]">
              <button
                type="button"
                onClick={() => setStatusChangeTarget(null)}
                disabled={statusLoading}
                className="px-4 py-2 rounded-xl border border-[#292929] text-xs font-semibold text-[#A3A3A3] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={statusLoading}
                className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-white/90 disabled:opacity-50"
              >
                {statusLoading ? 'Updating...' : 'Confirm Status Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

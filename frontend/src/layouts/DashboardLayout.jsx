import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { TransactionModal } from '../components/TransactionModal';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Determine Title & Subtitle based on route
  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path === '/dashboard') return { title: 'Overview', subtitle: 'Live financial summary & recent activity' };
    if (path === '/transactions') return { title: 'Transactions Ledger', subtitle: 'Search, filter, and manage income & expenses' };
    if (path === '/income') return { title: 'Income Ledger', subtitle: 'Revenue, salaries, and investment earnings' };
    if (path === '/expenses') return { title: 'Expense Ledger', subtitle: 'All outflows, bills, and spending activity' };
    if (path === '/categories') return { title: 'Categories', subtitle: 'Manage custom & system financial classification' };
    if (path === '/budgets') return { title: 'Monthly Budgets', subtitle: 'Category spending allocations and thresholds' };
    if (path === '/recurring') return { title: 'Recurring Engine', subtitle: 'Automated schedules and scheduled cash flows' };
    if (path === '/reports') return { title: 'Reports & Analytics', subtitle: 'Period analysis, trends, and CSV exports' };
    if (path === '/admin') return { title: 'Administrator Console', subtitle: 'Platform-wide user management & security logs' };
    if (path === '/settings') return { title: 'Settings', subtitle: 'Personal profile and ledger configuration' };
    return { title: 'Dashboard', subtitle: '' };
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="min-h-screen bg-[#080808] text-white flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenNewTransaction={() => setIsTxModalOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openNewTransaction: () => setIsTxModalOpen(true) }} />
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={() => {
          // Trigger a window custom event to notify active view to refresh
          window.dispatchEvent(new Event('aura:transaction-updated'));
        }}
      />
    </div>
  );
};

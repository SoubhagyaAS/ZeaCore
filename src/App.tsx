import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/ToastContainer';
import AuthWrapper from './components/AuthWrapper';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AppsManagement from './components/AppsManagement';
import CustomersManagement from './components/CustomersManagement';
import CustomerDashboard from './components/CustomerDashboard';
import SubscriptionsManagement from './components/SubscriptionsManagement';
import PlansManagement from './components/PlansManagement';
import FeaturesManagement from './components/FeaturesManagement';
import MapFeaturesManagement from './components/MapFeaturesManagement';
import FeatureControl from './components/FeatureControl';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import AppDashboard from './components/AppDashboard';
import FinanceDashboard from './components/finance/FinanceDashboard';
import InvoicesManagement from './components/finance/InvoicesManagement';
import PaymentsManagement from './components/finance/PaymentsManagement';
import RefundsManagement from './components/finance/RefundsManagement';
import InvoiceDetails from './components/finance/InvoiceDetails';
import PaymentDetails from './components/finance/PaymentDetails';
import TicketsDashboard from './components/TicketsDashboard';
import TicketsManagement from './components/TicketsManagement';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'apps':
        return <AppsManagement onAppSelect={(appId) => {
          setSelectedAppId(appId);
          setActiveTab('app-dashboard');
        }} />;
      case 'app-dashboard':
        return <AppDashboard 
          appId={selectedAppId} 
          onBack={() => {
            setActiveTab('apps');
            setSelectedAppId(null);
          }}
        />;
      case 'customers':
        return <CustomersManagement onCustomerSelect={(customerId) => {
          setSelectedCustomerId(customerId);
          setActiveTab('customer-dashboard');
        }} />;
      case 'customer-dashboard':
        return <CustomerDashboard 
          customerId={selectedCustomerId} 
          onBack={() => {
            setActiveTab('customers');
            setSelectedCustomerId(null);
          }}
        />;
      case 'subscriptions':
        return <SubscriptionsManagement />;
      case 'plans':
        return <PlansManagement />;
      case 'tickets':
        return <TicketsDashboard onNavigateToTicketsList={() => setActiveTab('tickets-list')} />;
      case 'tickets-list':
        return <TicketsManagement onNavigateToDashboard={() => setActiveTab('tickets')} />;
      case 'features':
        return <FeaturesManagement />;
      case 'map-features':
        return <MapFeaturesManagement />;
      case 'feature-control':
        return <FeatureControl />;
      case 'analytics':
        return <Analytics />;
      case 'finance':
        return <FinanceDashboard />;
      case 'invoices':
        return <InvoicesManagement onInvoiceSelect={(invoiceId) => {
          setSelectedInvoiceId(invoiceId);
          setActiveTab('invoice-details');
        }} />;
      case 'invoice-details':
        return <InvoiceDetails 
          invoiceId={selectedInvoiceId} 
          onBack={() => {
            setActiveTab('invoices');
            setSelectedInvoiceId(null);
          }}
        />;
      case 'payments':
        return <PaymentsManagement onPaymentSelect={(paymentId) => {
          setSelectedPaymentId(paymentId);
          setActiveTab('payment-details');
        }} />;
      case 'payment-details':
        return <PaymentDetails 
          paymentId={selectedPaymentId} 
          onBack={() => {
            setActiveTab('payments');
            setSelectedPaymentId(null);
          }}
        />;
      case 'refunds':
        return <RefundsManagement />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <UserProfile onBack={() => setActiveTab('dashboard')} />;
      default:
        return <Dashboard />;
    }
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  return (
    <ToastProvider>
      <AuthWrapper onProfileClick={handleProfileClick}>
        <div className="flex h-screen bg-light-gray">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="flex-1 overflow-auto">
            <div className="p-8 min-h-full">
              {renderContent()}
            </div>
          </main>
        </div>
      </AuthWrapper>
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;
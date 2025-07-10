import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  CreditCard, 
  Settings, 
  BarChart3, 
  Shield,
  FileText,
  UserCog,
  Sliders,
  MapPin,
  DollarSign,
  Receipt,
  CreditCard as CreditCardIcon,
  RefreshCcw,
  Ticket,
  List
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { 
      id: 'finance', 
      label: 'Finance', 
      icon: DollarSign,
      submenu: [
        { id: 'finance', label: 'Finance Dashboard', icon: BarChart3 },
        { id: 'invoices', label: 'Invoices', icon: Receipt },
        { id: 'payments', label: 'Payments', icon: CreditCardIcon },
        { id: 'refunds', label: 'Refunds', icon: RefreshCcw }
      ]
    },
    { id: 'feature-control', label: 'Feature Control', icon: Shield },
    { 
      id: 'apps', 
      label: 'Apps', 
      icon: Package,
      submenu: [
        { id: 'features', label: 'Features', icon: Sliders }
      ]
    },
    { 
      id: 'plans', 
      label: 'Plans', 
      icon: FileText,
      submenu: [
        { id: 'map-features', label: 'Map Features', icon: MapPin }
      ]
    },
    { 
      id: 'tickets', 
      label: 'Tickets', 
      icon: Ticket,
      submenu: [
        { id: 'tickets', label: 'Dashboard', icon: BarChart3 },
        { id: 'tickets-list', label: 'Tickets List', icon: List }
      ]
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: UserCog },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // System status - you can modify these values based on actual system monitoring
  const systemUptime = 99.9;
  const systemIssues = []; // Add issues here if any exist, e.g., ['Database slow', 'API rate limited']

  return (
    <div className="bg-charcoal text-soft-white w-72 min-h-screen p-6 shadow-2xl flex flex-col">
      {/* Removed the logo section completely */}
      
      <nav className="space-y-3 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isParentActive = activeTab === item.id || (hasSubmenu && item.submenu.some(sub => sub.id === activeTab));
          
          return (
            <div key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-5 py-4 rounded-xl transition-all duration-300 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-royal-blue to-sky-blue text-soft-white shadow-lg transform scale-105'
                    : isParentActive
                    ? 'bg-charcoal-light text-soft-white'
                    : 'text-gray-300 hover:bg-charcoal-light hover:text-soft-white hover:transform hover:scale-102'
                }`}
              >
                <Icon className={`mr-4 h-5 w-5 transition-colors ${
                  activeTab === item.id ? 'text-soft-white' : 'text-sky-blue group-hover:text-bright-cyan'
                }`} />
                <span className="font-medium">{item.label}</span>
              </button>
              
              {/* Submenu */}
              {hasSubmenu && isParentActive && (
                <div className="ml-6 mt-2 space-y-2">
                  {item.submenu.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => onTabChange(subItem.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-sm ${
                          activeTab === subItem.id
                            ? 'bg-gradient-to-r from-royal-blue to-sky-blue text-soft-white shadow-md'
                            : 'text-gray-400 hover:bg-charcoal-light hover:text-soft-white'
                        }`}
                      >
                        <SubIcon className={`mr-3 h-4 w-4 transition-colors ${
                          activeTab === subItem.id ? 'text-soft-white' : 'text-sky-blue'
                        }`} />
                        <span className="font-medium">{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* System Uptime */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-royal-blue-dark to-royal-blue rounded-xl p-4 border border-sky-blue border-opacity-30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm font-medium text-soft-white">System Uptime</span>
            </div>
            <div className="bg-sky-blue bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-sm font-bold text-soft-white">{systemUptime}%</span>
            </div>
          </div>
          
          {/* Show issues only if they exist */}
          {systemIssues.length > 0 && (
            <div className="space-y-1">
              {systemIssues.map((issue, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                  <p className="text-xs text-red-200">{issue}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Powered by Zealogics Footer */}
      <div className="mt-6 pt-4 border-t border-charcoal-light">
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <span className="font-semibold text-sky-blue">
              Zealogics
              <span className="inline-flex items-center justify-center w-3 h-3 ml-1 text-xs border border-sky-blue rounded-full text-sky-blue">
                R
              </span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
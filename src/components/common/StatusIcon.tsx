import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Pause, 
  Settings, 
  Shield,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  UserMinus,
  Package,
  PackageX,
  Wrench
} from 'lucide-react';

interface StatusIconProps {
  status: string;
  type?: 'user' | 'app' | 'customer' | 'subscription' | 'payment' | 'general';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({ 
  status, 
  type = 'general', 
  size = 'md',
  showTooltip = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const getStatusConfig = () => {
    const normalizedStatus = status.toLowerCase();
    
    switch (type) {
      case 'user':
        switch (normalizedStatus) {
          case 'active':
            return { 
              icon: UserCheck, 
              color: 'text-green-600', 
              bgColor: 'bg-green-100',
              tooltip: 'Active User'
            };
          case 'inactive':
            return { 
              icon: UserX, 
              color: 'text-red-600', 
              bgColor: 'bg-red-100',
              tooltip: 'Inactive User'
            };
          case 'suspended':
            return { 
              icon: UserMinus, 
              color: 'text-orange-600', 
              bgColor: 'bg-orange-100',
              tooltip: 'Suspended User'
            };
          default:
            return { 
              icon: AlertCircle, 
              color: 'text-gray-600', 
              bgColor: 'bg-gray-100',
              tooltip: 'Unknown Status'
            };
        }

      case 'app':
        switch (normalizedStatus) {
          case 'active':
            return { 
              icon: Package, 
              color: 'text-green-600', 
              bgColor: 'bg-green-100',
              tooltip: 'Active App'
            };
          case 'inactive':
            return { 
              icon: PackageX, 
              color: 'text-red-600', 
              bgColor: 'bg-red-100',
              tooltip: 'Inactive App'
            };
          case 'maintenance':
            return { 
              icon: Wrench, 
              color: 'text-yellow-600', 
              bgColor: 'bg-yellow-100',
              tooltip: 'Under Maintenance'
            };
          default:
            return { 
              icon: AlertCircle, 
              color: 'text-gray-600', 
              bgColor: 'bg-gray-100',
              tooltip: 'Unknown Status'
            };
        }

      case 'customer':
        switch (normalizedStatus) {
          case 'active':
            return { 
              icon: CheckCircle, 
              color: 'text-green-600', 
              bgColor: 'bg-green-100',
              tooltip: 'Active Customer'
            };
          case 'inactive':
            return { 
              icon: XCircle, 
              color: 'text-red-600', 
              bgColor: 'bg-red-100',
              tooltip: 'Inactive Customer'
            };
          case 'suspended':
            return { 
              icon: Pause, 
              color: 'text-orange-600', 
              bgColor: 'bg-orange-100',
              tooltip: 'Suspended Customer'
            };
          default:
            return { 
              icon: AlertCircle, 
              color: 'text-gray-600', 
              bgColor: 'bg-gray-100',
              tooltip: 'Unknown Status'
            };
        }

      case 'subscription':
        switch (normalizedStatus) {
          case 'active':
            return { 
              icon: CheckCircle, 
              color: 'text-green-600', 
              bgColor: 'bg-green-100',
              tooltip: 'Active Subscription'
            };
          case 'trial':
            return { 
              icon: Clock, 
              color: 'text-blue-600', 
              bgColor: 'bg-blue-100',
              tooltip: 'Trial Period'
            };
          case 'cancelled':
            return { 
              icon: XCircle, 
              color: 'text-red-600', 
              bgColor: 'bg-red-100',
              tooltip: 'Cancelled Subscription'
            };
          case 'expired':
            return { 
              icon: AlertCircle, 
              color: 'text-gray-600', 
              bgColor: 'bg-gray-100',
              tooltip: 'Expired Subscription'
            };
          default:
            return { 
              icon: AlertCircle, 
              color: 'text-gray-600', 
              bgColor: 'bg-gray-100',
              tooltip: 'Unknown Status'
            };
        }

      case 'payment':
        switch (normalizedStatus) {
          case 'completed':
          case 'success':
            return { 
              icon: CheckCircle, 
              color: 'text-green-600', 
              bgColor: 'bg-green-100',
              tooltip: 'Payment Completed'
            };
          case 'pending':
            return { 
              icon: Clock, 
              color: 'text-yellow-600', 
              bgColor: 'bg-yellow-100',
              tooltip: 'Payment Pending'
            };
          case 'failed':
          case 'error':
            return { 
              icon: XCircle, 
              color: 'text-red-600', 
              bgColor: 'bg-red-100',
              tooltip: 'Payment Failed'
            };
          default:
            return { 
              icon: AlertCircle, 
              color: 'text-gray-600', 
              bgColor: 'bg-gray-100',
              tooltip: 'Unknown Status'
            };
        }

      default:
        switch (normalizedStatus) {
          case 'active':
          case 'enabled':
          case 'online':
          case 'success':
            return { 
              icon: CheckCircle, 
              color: 'text-green-600', 
              bgColor: 'bg-green-100',
              tooltip: 'Active'
            };
          case 'inactive':
          case 'disabled':
          case 'offline':
          case 'failed':
            return { 
              icon: XCircle, 
              color: 'text-red-600', 
              bgColor: 'bg-red-100',
              tooltip: 'Inactive'
            };
          case 'pending':
          case 'processing':
            return { 
              icon: Clock, 
              color: 'text-yellow-600', 
              bgColor: 'bg-yellow-100',
              tooltip: 'Pending'
            };
          case 'warning':
          case 'maintenance':
            return { 
              icon: AlertCircle, 
              color: 'text-orange-600', 
              bgColor: 'bg-orange-100',
              tooltip: 'Warning'
            };
          default:
            return { 
              icon: AlertCircle, 
              color: 'text-gray-600', 
              bgColor: 'bg-gray-100',
              tooltip: status
            };
        }
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div 
      className={`inline-flex items-center justify-center p-2 rounded-full ${config.bgColor} ${className}`}
      title={showTooltip ? config.tooltip : undefined}
    >
      <Icon className={`${sizeClasses[size]} ${config.color}`} />
    </div>
  );
};

export default StatusIcon;
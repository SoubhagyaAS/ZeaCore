import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../../context/ToastContext';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-white" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-white" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-white" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-white" />;
    }
  };

  const getToastClasses = () => {
    const baseClasses = "flex items-center p-4 mb-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out";
    
    switch (toast.type) {
      case 'success':
        return `${baseClasses} bg-green-600 text-white`;
      case 'error':
        return `${baseClasses} bg-red-600 text-white`;
      case 'warning':
        return `${baseClasses} bg-amber-500 text-white`;
      case 'info':
      default:
        return `${baseClasses} bg-sky-blue text-white`;
    }
  };

  return (
    <div 
      className={getToastClasses()} 
      role="alert"
      style={{ 
        animation: 'slide-in-down 0.3s ease-out forwards',
        maxWidth: '90vw',
        width: '400px'
      }}
    >
      <div className="flex-shrink-0 mr-3">
        {getToastIcon()}
      </div>
      <div className="flex-1 mr-2 text-sm font-medium">
        {toast.message}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4 text-white" />
      </button>
    </div>
  );
};

export default Toast;
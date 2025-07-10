import React from 'react';
import Toast from './Toast';
import { useToast } from '../../context/ToastContext';

const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ToastProps {
  className?: string;
}

const ToastProvider = ({ children, className = '' }: ToastProps) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

export const useToast = () => {
  return {
    toast: toast,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    promise: toast.promise,
    loading: toast.loading,
    dismiss: toast.dismiss,
    destroy: toast.destroy,
  };
};

export default ToastProvider;
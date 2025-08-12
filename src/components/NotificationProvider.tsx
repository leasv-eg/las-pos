import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NotificationToast, NotificationProps } from './NotificationToast';

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationProps, 'id' | 'onClose'>) => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showNotification = (notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onClose: removeNotification,
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const showSuccess = (title: string, message?: string, duration?: number) => {
    showNotification({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message?: string, duration?: number) => {
    showNotification({ type: 'error', title, message, duration });
  };

  const showWarning = (title: string, message?: string, duration?: number) => {
    showNotification({ type: 'warning', title, message, duration });
  };

  const showInfo = (title: string, message?: string, duration?: number) => {
    showNotification({ type: 'info', title, message, duration });
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo,
    }}>
      {children}
      {notifications.map(notification => (
        <NotificationToast key={notification.id} {...notification} />
      ))}
    </NotificationContext.Provider>
  );
};

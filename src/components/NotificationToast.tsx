import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div<{ type: 'success' | 'error' | 'warning' | 'info'; isExiting: boolean }>`
  position: fixed;
  top: 60px; /* Below the status bar */
  right: 20px;
  background: ${({ type }) => {
    switch (type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      case 'warning': return '#fff3cd';
      case 'info': return '#d1ecf1';
    }
  }};
  color: ${({ type }) => {
    switch (type) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      case 'warning': return '#856404';
      case 'info': return '#0c5460';
    }
  }};
  border: 1px solid ${({ type }) => {
    switch (type) {
      case 'success': return '#c3e6cb';
      case 'error': return '#f5c6cb';
      case 'warning': return '#ffeaa7';
      case 'info': return '#b8daff';
    }
  }};
  border-radius: 8px;
  padding: 16px 20px;
  max-width: 400px;
  min-width: 280px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: ${({ isExiting }) => isExiting ? slideOut : slideIn} 0.3s ease-out forwards;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ToastIcon = styled.div<{ type: 'success' | 'error' | 'warning' | 'info' }>`
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const ToastMessage = styled.div`
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  margin-left: 8px;
  opacity: 0.7;
  flex-shrink: 0;
  
  &:hover {
    opacity: 1;
  }
`;

export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  };

  return (
    <ToastContainer type={type} isExiting={isExiting}>
      <ToastIcon type={type}>{getIcon()}</ToastIcon>
      <ToastContent>
        <ToastTitle>{title}</ToastTitle>
        {message && <ToastMessage>{message}</ToastMessage>}
      </ToastContent>
      <CloseButton onClick={handleClose}>×</CloseButton>
    </ToastContainer>
  );
};

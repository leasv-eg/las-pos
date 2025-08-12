import React from 'react';
import { ModularGrid } from './ModularGrid';
import { NotificationProvider } from './NotificationProvider';

export const ModularPOSInterface: React.FC = () => {
  return (
    <NotificationProvider>
      <ModularGrid />
    </NotificationProvider>
  );
};

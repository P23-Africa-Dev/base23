import React from 'react';
import { SidebarProvider } from './sidebar-context';


interface AppShellProps {
  children: React.ReactNode;
  defaultSidebarOpen?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, defaultSidebarOpen = true }) => {
  return <SidebarProvider defaultOpen={defaultSidebarOpen}>{children}</SidebarProvider>;
};
import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
};

export default AdminLayout; 
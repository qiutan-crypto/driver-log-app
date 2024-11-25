'use client'
 
import { DriverManagement } from '@/components/driver-management';
import { NavHeader } from '@/components/nav-header';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavHeader title="路线管理系统" />
      <div className="py-6">
        <DriverManagement />
      </div>
    </div>
  );
}
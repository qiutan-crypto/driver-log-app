'use client'
 
import { DriverInterface } from '@/components/driver-interface';
import { NavHeader } from '@/components/nav-header';

export default function DriverPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavHeader title="司机配送系统" />
      <div className="py-6">
        <DriverInterface />
      </div>
    </div>
  );
}
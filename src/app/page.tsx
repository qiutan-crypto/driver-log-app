'use client'
 
import React from 'react';
import Link from 'next/link';
import { Settings, Truck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">司机路线管理系统</h1>
        
        <div className="space-y-4 p-4">
          <Link href="/admin" className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Settings className="w-6 h-6 mr-3 text-blue-500" />
              <div>
                <h2 className="font-semibold">管理端</h2>
                <p className="text-sm text-gray-500">管理司机和路线</p>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </Link>

          <Link href="/driver" className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Truck className="w-6 h-6 mr-3 text-green-500" />
              <div>
                <h2 className="font-semibold">司机端</h2>
                <p className="text-sm text-gray-500">记录配送路线</p>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
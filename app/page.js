'use client';

import { useState, useEffect } from 'react';
import OrdersTab from '@/components/OrdersTab';
import SalesTab from '@/components/SalesTab';
import { ChefHat, BarChart3, Bell, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // Set initial time and update every 30 seconds
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleTimeString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    {
      id: 'orders',
      label: 'Orders',
      icon: ChefHat,
      component: OrdersTab
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: BarChart3,
      component: SalesTab
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || OrdersTab;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cafe Admin</h1>
                <p className="text-sm text-gray-600">Management Dashboard</p>
              </div>
            </div>
            
            {/* <div className="flex items-center gap-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div> */}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ActiveComponent />
      </main>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {/* <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Connected</span>
            </div> */}
            <span>Last updated: {lastUpdated || '--:--:--'}</span>
          </div>
          <div className="text-xs text-gray-500">
            Cafe Admin Dashboard v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
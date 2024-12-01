'use client'

import React, { useState, useEffect } from 'react';
import { ChevronRight, Navigation, CheckCircle, Save } from 'lucide-react';
import { Driver, Route as RouteType, LogEntry } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Loading } from './loading';
import { ErrorMessage } from './error-message';

export const DriverInterface = () => {
  const { 
    value: drivers, 
    isLoading: driversLoading, 
    error: driversError 
  } = useLocalStorage<Driver[]>('drivers', []);

  const [isMounted, setIsMounted] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [currentStop, setCurrentStop] = useState<number>(0);
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showSelection, setShowSelection] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (selectedDriver) {
      const savedLogs = localStorage.getItem(`logs_${selectedDriver}`);
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }
    }
  }, [selectedDriver]);

  useEffect(() => {
    if (selectedDriver && logs.length > 0) {
      localStorage.setItem(`logs_${selectedDriver}`, JSON.stringify(logs));
    }
  }, [selectedDriver, logs]);

  if (!isMounted || driversLoading) {
    return <Loading />;
  }

  if (driversError) {
    return (
      <ErrorMessage 
        message="加载司机数据时出错" 
        onRetry={() => window.location.reload()} 
      />
    );
  }const checkTimeInterval = (route: RouteType) => {
    if (route.type !== 'dropoff') return { allowed: true };

    // 找到对应的接客户路线（去掉 '-dropoff' 后缀来匹配）
    const pickupRouteName = route.name.replace('-dropoff', '');
    
    const pickupRoute = drivers
      .find(d => d.id === selectedDriver)
      ?.routes
      .find(r => r.type === 'pickup' && r.name === pickupRouteName);

    if (!pickupRoute) return { 
      allowed: false, 
      message: `找不到对应的接客户路线记录: ${pickupRouteName}` 
    };

    // 获取接客户路线的最后一站到达时间
    const pickupLogs = JSON.parse(localStorage.getItem(`logs_${selectedDriver}`) || '[]');
    const lastPickupLog = pickupLogs
      .filter((log: any) => log.routeId === pickupRoute.id)
      .sort((a: any, b: any) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())[0];

    if (!lastPickupLog) return { 
      allowed: false, 
      message: '找不到接客户路线的完成记录，请先完成接客户行程' 
    };

    const lastPickupTime = new Date(lastPickupLog.endTime);
    const requiredWaitTime = 6 * 60 * 60 * 1000; // 6小时（毫秒）
    const earliestAllowedTime = new Date(lastPickupTime.getTime() + requiredWaitTime);
    const now = new Date();

    const formatDateTime = (date: Date) => {
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    return {
      allowed: now.getTime() >= earliestAllowedTime.getTime(),
      message: 
        `接客户路线（${pickupRoute.name}）最后到达时间：${formatDateTime(lastPickupTime)}\n` +
        `需要等待6小时后才能发车\n` +
        `最早可发车时间：${formatDateTime(earliestAllowedTime)}`
    };
  };

  const getCurrentRoute = () => {
    if (!selectedDriver || !selectedRoute) return null;
    const driver = drivers.find(d => d.id === selectedDriver);
    return driver?.routes.find(r => r.id === selectedRoute);
  };

  const handleStart = () => {
    setStartTime(new Date());
    setIsStarted(true);
  };

  const handleArrive = () => {
    const currentRoute = getCurrentRoute();
    if (!currentRoute || !selectedDriver || !startTime) return;

    const mileage = parseFloat(prompt('请输入当前里程表读数（英里）：') || '0');
    if (isNaN(mileage)) {
      alert('请输入有效的数字！');
      return;
    }

    const currentStopData = currentRoute.stops[currentStop];
    const newLog: LogEntry = {
      driverId: selectedDriver,
      routeId: selectedRoute!,
      stopId: currentStopData.id,
      customerName: currentStopData.customerName,
      address: currentStopData.address,
      startTime: startTime,
      endTime: new Date(),
      mileage: mileage
    };

    setLogs([...logs, newLog]);

    if (currentStop < currentRoute.stops.length - 1) {
      setCurrentStop(currentStop + 1);
      setIsStarted(false);
      setStartTime(null);
    } else {
      setShowSelection(true);
      setCurrentStop(0);
      setIsStarted(false);
      setStartTime(null);
      setSelectedRoute(null);
    }
  };
  
  const handleRouteSelect = (routeId: string) => {
    const selectedRoute = drivers
      .find(d => d.id === selectedDriver)
      ?.routes
      .find(r => r.id === routeId);

    if (!selectedRoute) return;

    if (selectedRoute.type === 'dropoff') {
      const timeCheck = checkTimeInterval(selectedRoute);
      if (!timeCheck.allowed) {
        alert(timeCheck.message);
        return;
      }
    }

    setSelectedRoute(routeId);
    setShowSelection(false);
  };
  const exportLogs = () => {
    if (!selectedDriver || logs.length === 0) return;

    const formatTime = (date: Date) => {
      const d = new Date(date);
      return d.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
    };

    const formatDate = (date: Date) => {
      const d = new Date(date);
      return d.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    };

    const csvContent = [
      ['日期', '客户', '地址', '开始时间', '结束时间', '里程表读数(英里)'].join(','),
      ...logs.map(log => {
        const date = new Date(log.startTime);
        return [
          `"${formatDate(date)}"`,
          `"${log.customerName}"`,
          `"${log.address}"`,
          `"${formatTime(log.startTime)}"`,
          `"${formatTime(log.endTime)}"`,
          log.mileage.toFixed(1)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `司机日志_${drivers.find(d => d.id === selectedDriver)?.name}_${formatDate(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  if (showSelection) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">选择司机和路线</h2>
          
          <div className="mb-6">
            <label className="block text-base font-medium mb-3">选择司机</label>
            <select
              className="w-full border p-3 rounded-lg text-base bg-white"
              value={selectedDriver || ''}
              onChange={(e) => setSelectedDriver(e.target.value)}
            >
              <option value="">请选择司机</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>

          {selectedDriver && (
            <div className="mb-6">
              <label className="block text-base font-medium mb-3">选择路线</label>
              <select
                className="w-full border p-3 rounded-lg text-base bg-white"
                value={selectedRoute || ''}
                onChange={(e) => handleRouteSelect(e.target.value)}
              >
                <option value="">请选择路线</option>
                {drivers
                  .find(d => d.id === selectedDriver)
                  ?.routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name} ({route.type === 'pickup' ? '接' : '送'})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {selectedDriver && logs.length > 0 && (
            <button
              onClick={exportLogs}
              className="w-full bg-blue-500 text-white p-4 rounded-lg text-base font-medium flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              导出日志
            </button>
          )}
        </div>
      </div>
    );
  }
  
  const currentRoute = getCurrentRoute();
  if (!currentRoute) return null;

  const currentStopData = currentRoute.stops[currentStop];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white">
      <div className="p-4 border-b sticky top-0 bg-white">
        <h2 className="text-xl font-bold mb-2">
          当前站点 ({currentStop + 1}/{currentRoute.stops.length})
        </h2>
        <p className="text-gray-600">
          {drivers.find(d => d.id === selectedDriver)?.name} - {currentRoute.name}
          <span className={`ml-2 px-3 py-1 text-sm rounded-full ${
            currentRoute.type === 'pickup' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {currentRoute.type === 'pickup' ? '接客户' : '送客户'}
          </span>
        </p>
      </div>

      <div className="p-4">
        <div className="mb-6 text-base space-y-3 bg-gray-50 p-4 rounded-lg">
          <p><span className="text-gray-500">客户：</span>{currentStopData.customerName}</p>
          <p>
            <span className="text-gray-500">电话：</span>
            <a 
              href={`tel:${currentStopData.phone}`}
              className="text-blue-500 hover:underline text-base"
              onClick={(e) => {
                if (!window.confirm(`确定要拨打 ${currentStopData.phone} 吗？`)) {
                  e.preventDefault();
                }
              }}
            >
              {currentStopData.phone}
            </a>
          </p>
          <p><span className="text-gray-500">地址：</span>{currentStopData.address}</p>
        </div>
        
        <div className="space-y-4 fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          {!isStarted ? (
            <button 
              className="w-full bg-blue-500 text-white p-4 rounded-lg text-base font-medium flex items-center justify-center"
              onClick={handleStart}
            >
              <ChevronRight className="w-5 h-5 mr-2" />
              开始配送
            </button>
          ) : (
            <button 
              className="w-full bg-green-500 text-white p-4 rounded-lg text-base font-medium flex items-center justify-center"
              onClick={handleArrive}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              已送达
            </button>
          )}
          
          <button 
            className="w-full border border-gray-300 p-4 rounded-lg text-base font-medium flex items-center justify-center mb-4"
            onClick={() => {
              const address = encodeURIComponent(currentStopData.address);
              window.open(`https://www.google.com/maps/search/?api=1&query=${address}`);
            }}
          >
            <Navigation className="w-5 h-5 mr-2" />
            打开导航
          </button>
        </div>
      </div>
    </div>
  );
};
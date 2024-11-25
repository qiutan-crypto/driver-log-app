'use client'

import React, { useState } from 'react';
import { Plus, Edit, Trash, Download, Route, Users, ChevronRight, ChevronDown } from 'lucide-react';
import { Driver, Route as RouteType, Stop } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Loading } from './loading';
import { ErrorMessage } from './error-message';

export const DriverManagement = () => {
  const { 
    value: drivers, 
    setValue: setDrivers, 
    isLoading, 
    error 
  } = useLocalStorage<Driver[]>('drivers', []);

  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newRoute, setNewRoute] = useState({
    name: '',
    type: 'pickup' as 'pickup' | 'dropoff',  // 默认为接客户
    stops: [{
      customerName: '',
      address: '',
      phone: ''
    }]
  });

  const [editingDriver, setEditingDriver] = useState<string | null>(null);
  const [editingDriverName, setEditingDriverName] = useState('');
  const [editingRoute, setEditingRoute] = useState<{
    id: string;
    name: string;
    type: 'pickup' | 'dropoff';
    stops: {
      customerName: string;
      address: string;
      phone: string;
    }[];
  } | null>(null);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="加载数据时出错" 
        onRetry={() => window.location.reload()} 
      />
    );
  }
  const handleAddDriver = () => {
    if (newDriverName.trim()) {
      const newDriver: Driver = {
        id: Date.now().toString(),
        name: newDriverName.trim(),
        routes: []
      };
      setDrivers([...drivers, newDriver]);
      setNewDriverName('');
      setShowAddDriver(false);
    }
  };

  const handleDeleteDriver = (driverId: string) => {
    if (confirm('确定要删除这个司机吗？')) {
      setDrivers(drivers.filter(d => d.id !== driverId));
    }
  };

  const handleEditDriver = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setEditingDriver(driverId);
      setEditingDriverName(driver.name);
    }
  };

  const handleSaveDriverName = () => {
    if (editingDriver && editingDriverName.trim()) {
      setDrivers(drivers.map(driver => 
        driver.id === editingDriver 
          ? { ...driver, name: editingDriverName.trim() }
          : driver
      ));
      setEditingDriver(null);
      setEditingDriverName('');
    }
  };

  const handleAddStop = () => {
    if (editingRoute) {
      setEditingRoute({
        ...editingRoute,
        stops: [...editingRoute.stops, {
          customerName: '',
          address: '',
          phone: ''
        }]
      });
    } else {
      setNewRoute({
        ...newRoute,
        stops: [...newRoute.stops, {
          customerName: '',
          address: '',
          phone: ''
        }]
      });
    }
  };

  const handleRemoveStop = (index: number) => {
    if (editingRoute) {
      setEditingRoute({
        ...editingRoute,
        stops: editingRoute.stops.filter((_, i) => i !== index)
      });
    } else {
      setNewRoute({
        ...newRoute,
        stops: newRoute.stops.filter((_, i) => i !== index)
      });
    }
  };

  const handleAddRoute = (driverId: string) => {
    if (newRoute.name && newRoute.stops.some(stop => stop.customerName && stop.address)) {
      const stops: Stop[] = newRoute.stops
        .map((stop, index) => ({
          id: Date.now().toString() + index,
          order: index + 1,
          customerName: stop.customerName.trim(),
          address: stop.address.trim(),
          phone: stop.phone.trim()
        }))
        .filter(stop => stop.customerName && stop.address);

      const route: RouteType = {
        id: Date.now().toString(),
        name: newRoute.name,
        type: newRoute.type,
        stops,
        assignedDate: new Date().toISOString()
      };

      setDrivers(drivers.map(driver => 
        driver.id === driverId
          ? { ...driver, routes: [...driver.routes, route] }
          : driver
      ));

      setNewRoute({
        name: '',
        type: 'pickup',
        stops: [{
          customerName: '',
          address: '',
          phone: ''
        }]
      });
      setShowAddRoute(false);
    }
  };

  const handleEditRoute = (driverId: string, route: RouteType) => {
    setEditingRoute({
      id: route.id,
      name: route.name,
      type: route.type,
      stops: route.stops.map(stop => ({
        customerName: stop.customerName,
        address: stop.address,
        phone: stop.phone
      }))
    });
  };

  const handleSaveRoute = (driverId: string) => {
    if (!editingRoute) return;

    const stops: Stop[] = editingRoute.stops
      .map((stop, index) => ({
        id: Date.now().toString() + index,
        order: index + 1,
        customerName: stop.customerName.trim(),
        address: stop.address.trim(),
        phone: stop.phone.trim()
      }))
      .filter(stop => stop.customerName && stop.address);

    const updatedRoute: RouteType = {
      id: editingRoute.id,
      name: editingRoute.name,
      type: editingRoute.type,
      stops,
      assignedDate: new Date().toISOString()
    };

    setDrivers(drivers.map(driver => 
      driver.id === driverId
        ? {
            ...driver,
            routes: driver.routes.map(r => 
              r.id === editingRoute.id ? updatedRoute : r
            )
          }
        : driver
    ));

    setEditingRoute(null);
  };

  const handleDeleteRoute = (driverId: string, routeId: string) => {
    if (confirm('确定要删除这条路线吗？')) {
      setDrivers(drivers.map(driver => 
        driver.id === driverId
          ? {
              ...driver,
              routes: driver.routes.filter(r => r.id !== routeId)
            }
          : driver
      ));
    }
  };

  const exportDriverLogs = (driverId: string) => {
    const logs = JSON.parse(localStorage.getItem(`logs_${driverId}`) || '[]');
    if (logs.length === 0) {
      alert('没有找到日志记录');
      return;
    }

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
      ...logs.map((log: any) => {
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
    a.download = `司机日志_${drivers.find(d => d.id === driverId)?.name}_${formatDate(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">司机路线管理系统</h1>
        <button
          onClick={() => setShowAddDriver(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加司机
        </button>
      </div>

      {showAddDriver && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">添加新司机</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newDriverName}
              onChange={(e) => setNewDriverName(e.target.value)}
              placeholder="输入司机姓名"
              className="flex-1 border p-2 rounded"
            />
            <button
              onClick={handleAddDriver}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              确认添加
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {drivers.map(driver => (
          <div key={driver.id} className="bg-white rounded-lg shadow">
            <div className="p-4 flex items-center justify-between">
              {editingDriver === driver.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingDriverName}
                    onChange={(e) => setEditingDriverName(e.target.value)}
                    className="flex-1 border p-2 rounded"
                  />
                  <button
                    onClick={handleSaveDriverName}
                    className="bg-green-500 text-white px-3 py-2 rounded"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditingDriver(null);
                      setEditingDriverName('');
                    }}
                    className="bg-gray-500 text-white px-3 py-2 rounded"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center flex-1">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="font-medium">{driver.name}</span>
                  <button
                    onClick={() => handleEditDriver(driver.id)}
                    className="ml-2 text-gray-500 hover:text-blue-500"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportDriverLogs(driver.id)}
                  className="text-blue-500 p-2 hover:bg-blue-50 rounded"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDriver(driver.id)}
                  className="text-red-500 p-2 hover:bg-red-50 rounded"
                >
                  <Trash className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
                  className="p-2"
                >
                  {selectedDriver === driver.id ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>{selectedDriver === driver.id && (
              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">路线列表</h3>
                  <button
                    onClick={() => setShowAddRoute(true)}
                    className="text-blue-500 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加路线
                  </button>
                </div>

                {showAddRoute && (
                  <div className="mb-4 bg-gray-50 p-4 rounded">
                    <input
                      type="text"
                      value={newRoute.name}
                      onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                      placeholder="路线名称"
                      className="w-full border p-2 rounded mb-4"
                    />

                    <div className="flex items-center space-x-4 mb-4">
                      <label className="font-medium">路线类型:</label>
                      <select
                        value={newRoute.type}
                        onChange={(e) => setNewRoute({
                          ...newRoute,
                          type: e.target.value as 'pickup' | 'dropoff'
                        })}
                        className="border p-2 rounded"
                      >
                        <option value="pickup">接客户</option>
                        <option value="dropoff">送客户</option>
                      </select>
                    </div>
                    
                    <div className="space-y-4">
                      {newRoute.stops.map((stop, index) => (
                        <div key={index} className="border p-3 rounded bg-white">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">站点 {index + 1}</span>
                            {newRoute.stops.length > 1 && (
                              <button
                                onClick={() => handleRemoveStop(index)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={stop.customerName}
                              onChange={(e) => {
                                const newStops = [...newRoute.stops];
                                newStops[index].customerName = e.target.value;
                                setNewRoute({ ...newRoute, stops: newStops });
                              }}
                              placeholder="客户姓名"
                              className="w-full border p-2 rounded"
                            />
                            <input
                              type="text"
                              value={stop.phone}
                              onChange={(e) => {
                                const newStops = [...newRoute.stops];
                                newStops[index].phone = e.target.value;
                                setNewRoute({ ...newRoute, stops: newStops });
                              }}
                              placeholder="联系电话"
                              className="w-full border p-2 rounded"
                            />
                            <input
                              type="text"
                              value={stop.address}
                              onChange={(e) => {
                                const newStops = [...newRoute.stops];
                                newStops[index].address = e.target.value;
                                setNewRoute({ ...newRoute, stops: newStops });
                              }}
                              placeholder="详细地址"
                              className="w-full border p-2 rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleAddStop}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        添加站点
                      </button>
                      <button
                        onClick={() => handleAddRoute(driver.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                      >
                        保存路线
                      </button>
                      <button
                        onClick={() => {
                          setShowAddRoute(false);
                          setNewRoute({
                            name: '',
                            type: 'pickup',
                            stops: [{
                              customerName: '',
                              address: '',
                              phone: ''
                            }]
                          });
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {driver.routes.map(route => (
                    <div key={route.id} className="border p-3 rounded">
                      {editingRoute?.id === route.id ? (
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editingRoute.name}
                            onChange={(e) => setEditingRoute({
                              ...editingRoute,
                              name: e.target.value
                            })}
                            className="w-full border p-2 rounded"
                            placeholder="路线名称"
                          />

                          <div className="flex items-center space-x-4">
                            <label className="font-medium">路线类型:</label>
                            <select
                              value={editingRoute.type}
                              onChange={(e) => setEditingRoute({
                                ...editingRoute,
                                type: e.target.value as 'pickup' | 'dropoff'
                              })}
                              className="border p-2 rounded"
                            >
                              <option value="pickup">接客户</option>
                              <option value="dropoff">送客户</option>
                            </select>
                          </div>
                          
                          {editingRoute.stops.map((stop, index) => (
                            <div key={index} className="border p-3 rounded bg-white">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">站点 {index + 1}</span>
                                {editingRoute.stops.length > 1 && (
                                  <button
                                    onClick={() => {
                                      const newStops = [...editingRoute.stops];
                                      newStops.splice(index, 1);
                                      setEditingRoute({
                                        ...editingRoute,
                                        stops: newStops
                                      });
                                    }}
                                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={stop.customerName}
                                  onChange={(e) => {
                                    const newStops = [...editingRoute.stops];
                                    newStops[index].customerName = e.target.value;
                                    setEditingRoute({
                                      ...editingRoute,
                                      stops: newStops
                                    });
                                  }}
                                  placeholder="客户姓名"
                                  className="w-full border p-2 rounded"
                                />
                                <input
                                  type="text"
                                  value={stop.phone}
                                  onChange={(e) => {
                                    const newStops = [...editingRoute.stops];
                                    newStops[index].phone = e.target.value;
                                    setEditingRoute({
                                      ...editingRoute,
                                      stops: newStops
                                    });
                                  }}
                                  placeholder="联系电话"
                                  className="w-full border p-2 rounded"
                                />
                                <input
                                  type="text"
                                  value={stop.address}
                                  onChange={(e) => {
                                    const newStops = [...editingRoute.stops];
                                    newStops[index].address = e.target.value;
                                    setEditingRoute({
                                      ...editingRoute,
                                      stops: newStops
                                    });
                                  }}
                                  placeholder="详细地址"
                                  className="w-full border p-2 rounded"
                                />
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddStop()}
                              className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                              添加站点
                            </button>
                            <button
                              onClick={() => handleSaveRoute(driver.id)}
                              className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingRoute(null)}
                              className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Route className="w-4 h-4 mr-2" />
                              <span className="font-medium">{route.name}</span>
                              <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                route.type === 'pickup' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {route.type === 'pickup' ? '接客户' : '送客户'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditRoute(driver.id, route)}
                                className="text-blue-500 hover:bg-blue-50 p-1 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoute(driver.id, route.id)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {route.stops.map((stop, idx) => (
                              <div key={idx} className="ml-6 p-2 border rounded">
                                <div className="flex items-center text-sm">
                                  <span className="font-medium mr-2">{idx + 1}.</span>
                                </div>
                                <div className="ml-6 text-sm">
                                  <p><span className="text-gray-500">客户：</span>{stop.customerName}</p>
                                  <p>
                                    <span className="text-gray-500">电话：</span>
                                    <a 
                                      href={`tel:${stop.phone}`}
                                      className="text-blue-500 hover:underline"
                                      onClick={(e) => {
                                        if (!window.confirm(`确定要拨打 ${stop.phone} 吗？`)) {
                                          e.preventDefault();
                                        }
                                      }}
                                    >
                                      {stop.phone}
                                    </a>
                                  </p>
                                  <p><span className="text-gray-500">地址：</span>{stop.address}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            最后更新: {new Date(route.assignedDate!).toLocaleString()}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
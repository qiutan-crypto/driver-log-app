export interface Driver {
  id: string;
  name: string;
  routes: Route[];
}

export interface Route {
  id: string;
  name: string;
  type: 'pickup' | 'dropoff';  // 添加路线类型
  stops: Stop[];
  assignedDate?: string;
}

export interface Stop {
  id: string;
  order: number;
  customerName: string;
  address: string;
  phone: string;
}

export interface LogEntry {
  driverId: string;
  routeId: string;
  stopId: string;
  customerName: string;
  address: string;
  startTime: Date;
  endTime: Date;
  mileage: number;
}
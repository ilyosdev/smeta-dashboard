import { UserRole } from './permissions';

export { UserRole };

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  orgId: string;
  telegramId?: string;
  createdAt: string;
  updatedAt: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  address?: string;
  description?: string;
  budget?: number;
  status: string;
  floors?: number;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

// Smeta (Estimate) types
export interface Smeta {
  id: string;
  name: string;
  projectId: string;
  uploadedBy: string;
  validatedBy?: string;
  status: SmetaStatus;
  filePath?: string;
  createdAt: string;
  updatedAt: string;
}

export enum SmetaStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
}

// Purchase Request (Zayavka) types
export interface PurchaseRequest {
  id: string;
  projectId: string;
  requestedBy: string;
  approvedBy?: string;
  status: RequestStatus;
  items: RequestItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  notes?: string;
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

// Financial types
export interface Income {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  accountId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  category?: string;
  accountId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  orgId: string;
  debt: number;
  createdAt: string;
  updatedAt: string;
}

// Supply Order (Buyurtma) types
export interface SupplyOrder {
  id: string;
  supplierId: string;
  projectId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  deliveredAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Worker (Usta) types
export interface Worker {
  id: string;
  name: string;
  phone?: string;
  specialty?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// Work Log (Bajarilgan Ish) types
export interface WorkLog {
  id: string;
  workerId: string;
  projectId: string;
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  status: WorkLogStatus;
  validatedBy?: string;
  createdBy: string;
  workDate: string;
  createdAt: string;
  updatedAt: string;
}

export enum WorkLogStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  PAID = 'PAID',
}

// Warehouse (Sklad) types
export interface WarehouseItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Common types
export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

// Re-export permission types
export * from './permissions';

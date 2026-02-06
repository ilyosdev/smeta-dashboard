import { apiClient, PaginationParams, PaginatedResponse } from './client';

// Related data returned by backend JOINs
export interface SmetaItemRelation {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface UserRelation {
  id: string;
  name: string;
}

export interface PurchaseRequest {
  id: string;
  smetaItemId: string;
  requestedQty: number;
  requestedAmount: number;
  note?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedById: string;
  approvedById?: string;
  approvedAt?: string;
  rejectionReason?: string;
  source: 'DASHBOARD' | 'TELEGRAM';
  isOverrun: boolean;
  overrunQty?: number;
  overrunPercent?: number;
  createdAt: string;
  updatedAt: string;
  // Related data from JOINs
  smetaItem?: SmetaItemRelation;
  requestedBy?: UserRelation;
  approvedBy?: UserRelation | null;
}

export interface CreatePurchaseRequestRequest {
  smetaItemId: string;
  requestedQty: number;
  requestedAmount: number;
  note?: string;
  source?: 'DASHBOARD' | 'TELEGRAM';
}

export interface GetPurchaseRequestsParams extends PaginationParams {
  status?: string;
  smetaItemId?: string;
  requestedBy?: string;
  search?: string;
  projectId?: string;
}

// Alias for backwards compatibility
export type GetRequestsParams = GetPurchaseRequestsParams;

export interface ApproveRequestResponse {
  id: string;
  status: string;
  approvedById: string;
  approvedAt: string;
}

export interface RejectRequestRequest {
  reason: string;
}

export interface RejectRequestResponse {
  id: string;
  status: string;
  rejectionReason: string;
}

export interface UpdatePurchaseRequestRequest {
  requestedQty?: number;
  requestedAmount?: number;
  note?: string;
}

export const requestsApi = {
  getAll: (params?: GetPurchaseRequestsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.smetaItemId) searchParams.append('smetaItemId', params.smetaItemId);
    if (params?.requestedBy) searchParams.append('requestedBy', params.requestedBy);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.projectId) searchParams.append('projectId', params.projectId);

    const query = searchParams.toString();
    return apiClient<PaginatedResponse<PurchaseRequest>>(
      `/vendor/requests${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  },

  getById: (id: string) =>
    apiClient<PurchaseRequest>(`/vendor/requests/${id}`, {
      method: 'GET',
    }),

  create: (data: CreatePurchaseRequestRequest) =>
    apiClient<PurchaseRequest>('/vendor/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePurchaseRequestRequest) =>
    apiClient<PurchaseRequest>(`/vendor/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<void>(`/vendor/requests/${id}`, {
      method: 'DELETE',
    }),

  approve: (id: string) =>
    apiClient<ApproveRequestResponse>(`/vendor/requests/${id}/approve`, {
      method: 'POST',
    }),

  reject: (id: string, reason: string) =>
    apiClient<RejectRequestResponse>(`/vendor/requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

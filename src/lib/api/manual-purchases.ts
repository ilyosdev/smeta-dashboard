import { apiClient, PaginationParams, PaginatedResponse } from './client';

export interface ManualPurchase {
  id: string;
  smetaItemId: string;
  supplierId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchaseDate: string;
  receiptUrl?: string;
  description?: string;
  createdBy: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateManualPurchaseRequest {
  smetaItemId: string;
  supplierId?: string;
  quantity: number;
  unitPrice: number;
  purchaseDate: string;
  receiptUrl?: string;
  description?: string;
}

export interface UpdateManualPurchaseRequest {
  quantity?: number;
  amount?: number;
  receiptUrl?: string;
  note?: string;
}

export interface GetManualPurchasesParams extends PaginationParams {
  smetaItemId?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const manualPurchasesApi = {
  getAll: (params?: GetManualPurchasesParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.smetaItemId) searchParams.append('smetaItemId', params.smetaItemId);
    if (params?.supplierId) searchParams.append('supplierId', params.supplierId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.search) searchParams.append('search', params.search);
    
    const query = searchParams.toString();
    return apiClient<PaginatedResponse<ManualPurchase>>(
      `/vendor/manual-purchases${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  },

  getById: (id: string) =>
    apiClient<ManualPurchase>(`/vendor/manual-purchases/${id}`, {
      method: 'GET',
    }),

  create: (data: CreateManualPurchaseRequest) =>
    apiClient<ManualPurchase>('/vendor/manual-purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateManualPurchaseRequest) =>
    apiClient<ManualPurchase>(`/vendor/manual-purchases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<void>(`/vendor/manual-purchases/${id}`, {
      method: 'DELETE',
    }),
};

import { apiClient, PaginationParams, PaginatedResponse } from './client';

export interface Smeta {
  id: string;
  name: string;
  projectId: string;
  status: string;
  totalAmount?: number;
  description?: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSmetaRequest {
  name: string;
  projectId: string;
  status?: string;
  description?: string;
}

export interface UpdateSmetaRequest {
  name?: string;
  projectId?: string;
  status?: string;
  description?: string;
}

export interface GetSmetasParams extends PaginationParams {
  projectId?: string;
  status?: string;
  search?: string;
}

export const smetasApi = {
  getAll: (params?: GetSmetasParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.projectId) searchParams.append('projectId', params.projectId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    
    const query = searchParams.toString();
    return apiClient<PaginatedResponse<Smeta>>(
      `/vendor/smetas${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  },

  getById: (id: string) =>
    apiClient<Smeta>(`/vendor/smetas/${id}`, {
      method: 'GET',
    }),

  create: (data: CreateSmetaRequest) =>
    apiClient<Smeta>('/vendor/smetas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSmetaRequest) =>
    apiClient<Smeta>(`/vendor/smetas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<void>(`/vendor/smetas/${id}`, {
      method: 'DELETE',
    }),
};

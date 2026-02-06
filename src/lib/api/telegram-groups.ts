import { apiClient, PaginationParams, PaginatedResponse } from './client';

export interface TelegramGroupProject {
  id: string;
  name: string;
}

export interface TelegramGroup {
  id: string;
  projectId: string;
  chatId: string;
  title?: string;
  isActive: boolean;
  joinedAt: string;
  project?: TelegramGroupProject;
}

export interface CreateTelegramGroupRequest {
  projectId: string;
  chatId: string;
  title?: string;
}

export interface UpdateTelegramGroupRequest {
  title?: string;
  isActive?: boolean;
}

export interface GetTelegramGroupsParams extends PaginationParams {
  projectId?: string;
}

export const telegramGroupsApi = {
  getAll: (params?: GetTelegramGroupsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.projectId) searchParams.append('projectId', params.projectId);

    const query = searchParams.toString();
    return apiClient<PaginatedResponse<TelegramGroup>>(
      `/bot/telegram-groups${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  },

  getByProject: (projectId: string) =>
    apiClient<PaginatedResponse<TelegramGroup>>(
      `/bot/telegram-groups?projectId=${projectId}`,
      { method: 'GET' }
    ),

  getById: (id: string) =>
    apiClient<TelegramGroup>(`/bot/telegram-groups/${id}`, {
      method: 'GET',
    }),

  create: (data: CreateTelegramGroupRequest) =>
    apiClient<TelegramGroup>('/bot/telegram-groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTelegramGroupRequest) =>
    apiClient<TelegramGroup>(`/bot/telegram-groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ success: boolean }>(`/bot/telegram-groups/${id}`, {
      method: 'DELETE',
    }),
};

import { api } from './api';
import {
  SupportRequest,
  SupportMessage,
  CreateSupportRequestData,
  SendMessageData,
  MarkMessagesReadData,
  GetSupportRequestsParams,
} from '../types/support';

export const supportService = {
  createSupportRequest: async (data: CreateSupportRequestData): Promise<SupportRequest> => {
    const response = await api.post('/client/support-requests', data);
    return response.data;
  },

  getClientSupportRequests: async (params?: GetSupportRequestsParams): Promise<SupportRequest[]> => {
    const response = await api.get('/client/support-requests', { params });
    return response.data;
  },

  getManagerSupportRequests: async (params?: GetSupportRequestsParams): Promise<SupportRequest[]> => {
    const response = await api.get('/manager/support-requests', { params });
    return response.data;
  },

  getSupportRequestMessages: async (supportRequestId: string): Promise<SupportMessage[]> => {
    const response = await api.get(`/common/support-requests/${supportRequestId}/messages`);
    return response.data;
  },

  sendMessage: async (supportRequestId: string, data: SendMessageData): Promise<SupportMessage> => {
    const response = await api.post(`/common/support-requests/${supportRequestId}/messages`, data);
    return response.data;
  },

  markMessagesAsRead: async (supportRequestId: string, data: MarkMessagesReadData): Promise<{ success: boolean }> => {
    const response = await api.post(`/common/support-requests/${supportRequestId}/messages/read`, data);
    return response.data;
  },

  closeSupportRequest: async (supportRequestId: string): Promise<void> => {
    await api.delete(`/manager/support-requests/${supportRequestId}`);
  },
};
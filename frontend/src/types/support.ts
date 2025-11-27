export interface SupportRequest {
  id: string;
  createdAt: string;
  isActive: boolean;
  hasNewMessages: boolean;
  client?: {
    id: string;
    name: string;
    email: string;
    contactPhone?: string;
  };
}

export interface SupportMessage {
  id: string;
  createdAt: string;
  text: string;
  readAt: string | null;
  author: {
    id: string;
    name: string;
  };
}

export interface CreateSupportRequestData {
  text: string;
}

export interface SendMessageData {
  text: string;
}

export interface MarkMessagesReadData {
  createdBefore: string;
}

export interface GetSupportRequestsParams {
  limit?: number;
  offset?: number;
  isActive?: boolean;
}
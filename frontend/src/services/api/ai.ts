import { apiClient } from '../api';

export interface MerchantRestrictions {
  type: "NONE" | "ALLOWLIST" | "BLOCKLIST";
  list: string[];
}

export interface ExtractedIntent {
  currency: string;
  max_total_amount: number;
  allowed_categories: string[];
  banned_categories: string[];
  max_quantity?: number | null;
  recurring_payment_allowed: boolean;
  merchant_restrictions: MerchantRestrictions;
}

export interface IntentExtractionResponse {
  intent: ExtractedIntent | null;
  interpretation: string;
  success: boolean;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  success: boolean;
  error?: string;
}

export const aiService = {
  /**
   * Extract intent from natural language or chat
   */
  extractIntent: async (text: string, history: ChatMessage[] = []): Promise<IntentExtractionResponse> => {
    const response = await apiClient.post('/ai/extract', { text, history });
    return response.data;
  },

  /**
   * Finance-expert chat with live account context
   */
  chat: async (message: string, history: ChatMessage[] = []): Promise<ChatResponse> => {
    const response = await apiClient.post('/ai/chat', { message, history });
    return response.data;
  }
};

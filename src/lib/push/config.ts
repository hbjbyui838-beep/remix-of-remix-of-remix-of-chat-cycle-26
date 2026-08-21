// Web Push Configuration for DooghcheyeYar
// Generate VAPID keys using: npx web-push generate-vapid-keys

export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
export const VAPID_PRIVATE_KEY = import.meta.env.VITE_VAPID_PRIVATE_KEY || '';
export const VAPID_SUBJECT = 'mailto:support@dooghcheyeyar.com';

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    type?: 'purchase' | 'expense' | 'task' | 'invoice' | 'system';
    id?: string;
    timestamp?: number;
  };
  tag?: string;
  requireInteraction?: boolean;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: string;
  userAgent: string;
}

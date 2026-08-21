// Client-side functions for push notifications
// These can be imported from client components

import { VAPID_PUBLIC_KEY, type PushPayload } from './config';
import { addOfflineNotification, getOfflineNotifications, markOfflineNotificationRead } from './db';

let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
let pushSubscription: PushSubscription | null = null;
let isOnline = navigator.onLine;

// Listen for online/offline events
window.addEventListener('online', () => {
  isOnline = true;
  console.log('[Push] Online - syncing...');
  triggerSync();
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('[Push] Offline - queuing actions');
});

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[Push] Notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('[Push] Notification permission:', permission);
  return permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if ('serviceWorker' in navigator) {
    serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    
    console.log('[Push] Service Worker registered:', serviceWorkerRegistration.scope);
    
    // Handle updates
    serviceWorkerRegistration.addEventListener('updatefound', () => {
      const newWorker = serviceWorkerRegistration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[Push] New content available, please refresh.');
          }
        });
      }
    });

    return serviceWorkerRegistration;
  }
  
  throw new Error('Service Workers not supported');
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!serviceWorkerRegistration) {
    await registerServiceWorker();
  }

  if (!('PushManager' in window)) {
    console.warn('[Push] Push notifications not supported');
    return null;
  }

  try {
    // Check for existing subscription
    pushSubscription = await serviceWorkerRegistration!.pushManager.getSubscription();
    
    if (pushSubscription) {
      console.log('[Push] Already subscribed to push notifications');
      return pushSubscription;
    }

    // Request permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('[Push] Notification permission denied');
      return null;
    }

    // Convert VAPID key from base64 to Uint8Array
    const vapidKeyUint8 = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    // Subscribe to push
    pushSubscription = await serviceWorkerRegistration!.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKeyUint8,
    });

    console.log('[Push] Subscribed to push notifications');
    
    // Send subscription to server
    await sendSubscriptionToServer(pushSubscription);
    
    return pushSubscription;
  } catch (error) {
    console.error('[Push] Failed to subscribe to push:', error);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!pushSubscription) {
    pushSubscription = await serviceWorkerRegistration?.pushManager.getSubscription() || null;
  }

  if (!pushSubscription) {
    return true;
  }

  try {
    const result = await pushSubscription.unsubscribe();
    if (result) {
      console.log('[Push] Unsubscribed from push notifications');
      await removeSubscriptionFromServer(pushSubscription);
      pushSubscription = null;
    }
    return result;
  } catch (error) {
    console.error('[Push] Failed to unsubscribe:', error);
    return false;
  }
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  if (!isOnline) {
    console.log('[Push] Offline - will sync subscription when online');
    await queueSubscriptionForSync(subscription);
    return;
  }

  try {
    const subscriptionData = subscription.toJSON();
    
    // Use fetch API directly instead of importing server modules
    const response = await fetch('/api/push/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }
    
    console.log('[Push] Subscription sent to server');
  } catch (error) {
    console.error('[Push] Failed to send subscription to server:', error);
    // Queue for later sync
    await queueSubscriptionForSync(subscription);
  }
}

async function removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
  if (!isOnline) {
    return;
  }

  try {
    const response = await fetch(`/api/push/subscription?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove subscription from server');
    }
    
    console.log('[Push] Subscription removed from server');
  } catch (error) {
    console.error('[Push] Failed to remove subscription from server:', error);
  }
}

async function queueSubscriptionForSync(subscription: PushSubscription): Promise<void> {
  const { addToQueue } = await import('./db');
  await addToQueue({
    type: 'sync',
    action: 'create',
    payload: { subscription: subscription.toJSON() },
    timestamp: Date.now(),
  });
}

export async function triggerSync(): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in window.SyncManager.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-push-data');
      console.log('[Push] Background sync registered');
    } catch (error) {
      console.log('[Push] Background sync not available, manual sync triggered');
      await manualSync();
    }
  } else {
    await manualSync();
  }
}

async function manualSync(): Promise<void> {
  if (!isOnline) return;

  try {
    const { getPendingQueueItems, updateQueueItem, removeFromQueue } = await import('./db');
    const pendingItems = await getPendingQueueItems();

    for (const item of pendingItems) {
      try {
        await updateQueueItem(item.id!, { status: 'processing' });
        
        // Process based on type
        if (item.type === 'sync' && item.action === 'create') {
          const response = await fetch('/api/push/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload.subscription),
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Failed to sync subscription');
          }
        }
        
        await updateQueueItem(item.id!, { status: 'completed' });
        setTimeout(() => removeFromQueue(item.id!), 5000); // Remove after 5 seconds
      } catch (error) {
        console.error('[Push] Failed to sync item:', item.id, error);
        const retryCount = (item.retryCount || 0) + 1;
        if (retryCount >= 3) {
          await updateQueueItem(item.id!, { status: 'failed', retryCount });
        } else {
          await updateQueueItem(item.id!, { retryCount, status: 'pending' });
        }
      }
    }
  } catch (error) {
    console.error('[Push] Manual sync failed:', error);
  }
}

export async function showLocalNotification(payload: PushPayload): Promise<void> {
  // Always store in offline notifications
  const notification = {
    id: payload.tag || `notif_${Date.now()}`,
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    timestamp: payload.data?.timestamp || Date.now(),
    read: false,
    data: payload.data,
  };

  await addOfflineNotification(notification);

  // Show browser notification if permitted and online
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        badge: payload.badge || '/badge-72.png',
        data: payload.data,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction || false,
        vibrate: [200, 100, 200],
      });
    } catch (error) {
      console.error('[Push] Failed to show notification:', error);
    }
  } else if ('serviceWorker' in navigator) {
    // Fallback: send message to SW to show notification
    const swReg = await navigator.serviceWorker.ready;
    swReg.active?.postMessage({
      type: 'SHOW_NOTIFICATION',
      payload,
    });
  }
}

export async function getUnreadOfflineNotifications() {
  return await getOfflineNotifications(true);
}

export async function markNotificationAsRead(id: string) {
  await markOfflineNotificationRead(id);
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!pushSubscription && serviceWorkerRegistration) {
    pushSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
  }
  return pushSubscription;
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Initialize push notifications on app start
export async function initializePush(): Promise<{ success: boolean; message: string }> {
  try {
    // Register service worker
    await registerServiceWorker();

    // Check if already subscribed
    const existingSub = await getPushSubscription();
    if (existingSub) {
      console.log('[Push] Already initialized with existing subscription');
      return { success: true, message: 'Already subscribed' };
    }

    // Try to subscribe
    const newSub = await subscribeToPush();
    if (newSub) {
      return { success: true, message: 'Successfully subscribed to push notifications' };
    } else {
      return { success: false, message: 'Could not subscribe to push notifications' };
    }
  } catch (error) {
    console.error('[Push] Initialization failed:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Export for use in components
export const PushService = {
  initializePush,
  subscribeToPush,
  unsubscribeFromPush,
  showLocalNotification,
  getUnreadOfflineNotifications,
  markNotificationAsRead,
  getPushSubscription,
  triggerSync,
  requestNotificationPermission,
};

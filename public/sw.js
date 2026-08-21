/// <reference lib="webworker" />

import { VAPID_PUBLIC_KEY } from '../src/lib/push/config';

const DB_NAME = 'dooghcheye-yar-db';
const DB_VERSION = 1;

// Cache names
const CACHE_NAME = 'dooghcheye-yar-cache-v1';
const OFFLINE_CACHE = 'dooghcheye-yar-offline-v1';

// Assets to cache immediately
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

// Install event - cache assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - network first, fallback to cache, then offline page
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    handleFetch(request)
  );
});

async function handleFetch(request: Request): Promise<Response> {
  try {
    // Try network first for fresh data
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    // If successful, cache the response (for GET requests)
    if (networkResponse.ok && request.method === 'GET') {
      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
    }
    
    return networkResponse;
  } catch (networkError) {
    console.log('[SW] Network failed, trying cache:', networkError);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache');
      return cachedResponse;
    }
    
    // If it's a navigation request, serve offline page
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
      console.log('[SW] Serving offline page');
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
      
      // Create a simple offline response if offline.html is not cached
      return new Response(
        `
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>آفلاین - دوچرخه‌یار</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
              }
              h1 { font-size: 2rem; margin-bottom: 1rem; }
              p { font-size: 1.1rem; opacity: 0.9; }
              .icon { font-size: 4rem; margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">📡</div>
              <h1>شما آفلاین هستید</h1>
              <p>اتصال اینترنت خود را بررسی کنید</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }
    
    // For other requests, return error
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function fetchWithTimeout(request: Request, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Push event - show notifications even when app is closed
self.addEventListener('push', (event: PushEvent) => {
  console.log('[SW] Push event received');
  
  let data: any = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'دوچرخه‌یار', body: event.data.text() };
    }
  }
  
  const options = {
    body: data.body || 'پیام جدید',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'open', title: 'باز کردن' },
      { action: 'dismiss', title: 'بستن' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'دوچرخه‌یار', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Message event from main thread
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const payload = event.data.payload;
    const options = {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/badge-72.png',
      data: payload.data,
      tag: payload.tag,
      requireInteraction: payload.requireInteraction,
      vibrate: [200, 100, 200],
    };
    
    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    );
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync event
self.addEventListener('sync', (event: SyncEvent) => {
  console.log('[SW] Sync event:', event.tag);
  
  if (event.tag === 'sync-push-data') {
    event.waitUntil(syncPushData());
  }
});

async function syncPushData(): Promise<void> {
  try {
    // Open IndexedDB
    const db = await openDB();
    
    // Get pending items
    const tx = db.transaction('offlineQueue', 'readonly');
    const store = tx.objectStore('offlineQueue');
    const index = store.index('status');
    const pendingItems = await getAllFromIndex(index, 'pending');
    
    console.log('[SW] Found', pendingItems.length, 'pending items to sync');
    
    for (const item of pendingItems) {
      try {
        // Update status to processing
        await updateItemStatus(db, item.id, 'processing');
        
        // Send to server
        if (item.type === 'sync' && item.action === 'create') {
          await fetch('/api/push/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
          });
        }
        
        // Mark as completed
        await updateItemStatus(db, item.id, 'completed');
        
        // Remove after delay
        setTimeout(async () => {
          const writeDb = await openDB();
          const writeTx = writeDb.transaction('offlineQueue', 'readwrite');
          await writeTx.objectStore('offlineQueue').delete(item.id);
          await writeTx.done;
        }, 5000);
        
      } catch (error) {
        console.error('[SW] Failed to sync item:', item.id, error);
        const retryCount = (item.retryCount || 0) + 1;
        
        if (retryCount >= 3) {
          await updateItemStatus(await openDB(), item.id, 'failed', retryCount);
        } else {
          await updateItemStatus(await openDB(), item.id, 'pending', retryCount);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// IndexedDB helpers
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('offlineQueue')) {
        const store = db.createObjectStore('offlineQueue', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('type', 'type');
        store.createIndex('status', 'status');
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

function getAllFromIndex(index: IDBIndex, value: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = index.getAll(value);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function updateItemStatus(db: IDBDatabase, id: number, status: string, retryCount?: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offlineQueue', 'readwrite');
    const store = tx.objectStore('offlineQueue');
    
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.status = status;
        if (retryCount !== undefined) {
          item.retryCount = retryCount;
        }
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

console.log('[SW] Service Worker loaded');

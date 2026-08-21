import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'dooghcheye-yar-db';
const DB_VERSION = 1;

export interface OfflineQueueItem {
  id?: number;
  type: 'purchase' | 'expense' | 'task' | 'notification' | 'sync';
  action: 'create' | 'update' | 'delete';
  payload: any;
  endpoint?: string;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

export interface OfflineNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

export async function initDB(): Promise<IDBPDatabase> {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Offline Queue Store
      if (!db.objectStoreNames.contains('offlineQueue')) {
        const queueStore = db.createObjectStore('offlineQueue', {
          keyPath: 'id',
          autoIncrement: true,
        });
        queueStore.createIndex('type', 'type');
        queueStore.createIndex('status', 'status');
        queueStore.createIndex('timestamp', 'timestamp');
      }

      // Cache Store
      if (!db.objectStoreNames.contains('cache')) {
        const cacheStore = db.createObjectStore('cache', {
          keyPath: 'key',
        });
        cacheStore.createIndex('expiresAt', 'expiresAt');
      }

      // Offline Notifications Store
      if (!db.objectStoreNames.contains('offlineNotifications')) {
        const notifStore = db.createObjectStore('offlineNotifications', {
          keyPath: 'id',
        });
        notifStore.createIndex('timestamp', 'timestamp');
        notifStore.createIndex('read', 'read');
      }

      // Sync Status Store
      if (!db.objectStoreNames.contains('syncStatus')) {
        db.createObjectStore('syncStatus', {
          keyPath: 'key',
        });
      }
    },
  });
}

// Offline Queue Operations
export async function addToQueue(item: Omit<OfflineQueueItem, 'id' | 'status'>): Promise<number> {
  const db = await initDB();
  const tx = db.transaction('offlineQueue', 'readwrite');
  const store = tx.objectStore('offlineQueue');
  
  const newItem: OfflineQueueItem = {
    ...item,
    retryCount: 0,
    status: 'pending',
  };
  
  const id = await store.add(newItem);
  await tx.done;
  return id as number;
}

export async function getPendingQueueItems(limit: number = 50): Promise<OfflineQueueItem[]> {
  const db = await initDB();
  const index = db.transaction('offlineQueue').objectStore('offlineQueue').index('status');
  return await index.getAll('pending', limit);
}

export async function updateQueueItem(id: number, updates: Partial<OfflineQueueItem>): Promise<void> {
  const db = await initDB();
  const item = await db.get('offlineQueue', id);
  if (item) {
    await db.put('offlineQueue', { ...item, ...updates });
  }
}

export async function removeFromQueue(id: number): Promise<void> {
  const db = await initDB();
  await db.delete('offlineQueue', id);
}

export async function clearCompletedQueueItems(): Promise<void> {
  const db = await initDB();
  const items = await db.getAllFromIndex('offlineQueue', 'status', 'completed');
  const tx = db.transaction('offlineQueue', 'readwrite');
  for (const item of items) {
    await tx.objectStore('offlineQueue').delete(item.id);
  }
  await tx.done;
}

// Cache Operations
export async function setCache(key: string, data: any, ttlMinutes: number = 30): Promise<void> {
  const db = await initDB();
  const now = Date.now();
  await db.put('cache', {
    key,
    data,
    timestamp: now,
    expiresAt: now + ttlMinutes * 60 * 1000,
  });
}

export async function getCache<T>(key: string): Promise<T | null> {
  const db = await initDB();
  const item = await db.get('cache', key);
  
  if (!item) return null;
  
  if (Date.now() > item.expiresAt) {
    await db.delete('cache', key);
    return null;
  }
  
  return item.data as T;
}

export async function clearExpiredCache(): Promise<void> {
  const db = await initDB();
  const now = Date.now();
  const allItems = await db.getAll('cache');
  
  const tx = db.transaction('cache', 'readwrite');
  for (const item of allItems) {
    if (now > item.expiresAt) {
      await tx.objectStore('cache').delete(item.key);
    }
  }
  await tx.done;
}

// Offline Notifications Operations
export async function addOfflineNotification(notification: OfflineNotification): Promise<void> {
  const db = await initDB();
  await db.put('offlineNotifications', notification);
}

export async function getOfflineNotifications(unreadOnly: boolean = false): Promise<OfflineNotification[]> {
  const db = await initDB();
  
  if (unreadOnly) {
    const index = db.transaction('offlineNotifications').objectStore('offlineNotifications').index('read');
    return await index.getAll(false);
  }
  
  return await db.getAll('offlineNotifications');
}

export async function markOfflineNotificationRead(id: string): Promise<void> {
  const db = await initDB();
  const notif = await db.get('offlineNotifications', id);
  if (notif) {
    await db.put('offlineNotifications', { ...notif, read: true });
  }
}

export async function clearOfflineNotifications(): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('offlineNotifications', 'readwrite');
  await tx.objectStore('offlineNotifications').clear();
  await tx.done;
}

// Sync Status Operations
export async function setSyncStatus(key: string, status: { lastSync: number; success: boolean; error?: string }): Promise<void> {
  const db = await initDB();
  await db.put('syncStatus', { key, ...status });
}

export async function getSyncStatus(key: string): Promise<{ lastSync: number; success: boolean; error?: string } | null> {
  const db = await initDB();
  return await db.get('syncStatus', key);
}

// Utility Functions
export async function getQueueCount(): Promise<number> {
  const db = await initDB();
  const pending = await db.getAllFromIndex('offlineQueue', 'status', 'pending');
  return pending.length;
}

export async function getCacheSize(): Promise<number> {
  const db = await initDB();
  const all = await db.getAll('cache');
  return all.length;
}

export async function clearAllData(): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(['offlineQueue', 'cache', 'offlineNotifications', 'syncStatus'], 'readwrite');
  await tx.objectStore('offlineQueue').clear();
  await tx.objectStore('cache').clear();
  await tx.objectStore('offlineNotifications').clear();
  await tx.objectStore('syncStatus').clear();
  await tx.done;
}

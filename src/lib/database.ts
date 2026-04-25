// IndexedDB wrapper for storing wardrobe images and other large data
// This solves the localStorage 5MB limit issue

const DB_NAME = 'fitmirror-db';
const DB_VERSION = 1;
const WARDROBE_STORE = 'wardrobe-images';
const STATE_STORE = 'app-state';

interface ImageRecord {
  id: string;
  imageData: string; // base64 image data
  timestamp: number;
}

interface StateRecord {
  key: string;
  value: any;
  timestamp: number;
}

class FitMirrorDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create wardrobe images store
        if (!db.objectStoreNames.contains(WARDROBE_STORE)) {
          const imageStore = db.createObjectStore(WARDROBE_STORE, { keyPath: 'id' });
          imageStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('Created wardrobe-images store');
        }

        // Create app state store
        if (!db.objectStoreNames.contains(STATE_STORE)) {
          const stateStore = db.createObjectStore(STATE_STORE, { keyPath: 'key' });
          stateStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('Created app-state store');
        }
      };
    });
  }

  // Wardrobe Image Operations
  async saveImage(id: string, imageData: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([WARDROBE_STORE], 'readwrite');
      const store = transaction.objectStore(WARDROBE_STORE);
      
      const record: ImageRecord = {
        id,
        imageData,
        timestamp: Date.now(),
      };

      const request = store.put(record);

      request.onsuccess = () => {
        console.log(`Image saved: ${id}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`Failed to save image: ${id}`, request.error);
        reject(request.error);
      };
    });
  }

  async getImage(id: string): Promise<string | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([WARDROBE_STORE], 'readonly');
      const store = transaction.objectStore(WARDROBE_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const record = request.result as ImageRecord | undefined;
        resolve(record?.imageData || null);
      };

      request.onerror = () => {
        console.error(`Failed to get image: ${id}`, request.error);
        reject(request.error);
      };
    });
  }

  async deleteImage(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([WARDROBE_STORE], 'readwrite');
      const store = transaction.objectStore(WARDROBE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`Image deleted: ${id}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`Failed to delete image: ${id}`, request.error);
        reject(request.error);
      };
    });
  }

  async getAllImageIds(): Promise<string[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([WARDROBE_STORE], 'readonly');
      const store = transaction.objectStore(WARDROBE_STORE);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        console.error('Failed to get all image IDs', request.error);
        reject(request.error);
      };
    });
  }

  // App State Operations
  async saveState(key: string, value: any): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STATE_STORE], 'readwrite');
      const store = transaction.objectStore(STATE_STORE);
      
      const record: StateRecord = {
        key,
        value,
        timestamp: Date.now(),
      };

      const request = store.put(record);

      request.onsuccess = () => {
        console.log(`State saved: ${key}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`Failed to save state: ${key}`, request.error);
        reject(request.error);
      };
    });
  }

  async getState(key: string): Promise<any | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STATE_STORE], 'readonly');
      const store = transaction.objectStore(STATE_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        const record = request.result as StateRecord | undefined;
        resolve(record?.value || null);
      };

      request.onerror = () => {
        console.error(`Failed to get state: ${key}`, request.error);
        reject(request.error);
      };
    });
  }

  async deleteState(key: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STATE_STORE], 'readwrite');
      const store = transaction.objectStore(STATE_STORE);
      const request = store.delete(key);

      request.onsuccess = () => {
        console.log(`State deleted: ${key}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`Failed to delete state: ${key}`, request.error);
        reject(request.error);
      };
    });
  }

  // Clear all data
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([WARDROBE_STORE, STATE_STORE], 'readwrite');
      
      const imageStore = transaction.objectStore(WARDROBE_STORE);
      imageStore.clear();
      
      const stateStore = transaction.objectStore(STATE_STORE);
      stateStore.clear();

      transaction.oncomplete = () => {
        console.log('All data cleared');
        resolve();
      };

      transaction.onerror = () => {
        console.error('Failed to clear all data', transaction.error);
        reject(transaction.error);
      };
    });
  }

  // Get storage usage info
  async getStorageInfo(): Promise<{ images: number; stateSize: string }> {
    await this.init();
    
    const imageIds = await this.getAllImageIds();
    
    // Estimate state size
    let stateSize = 0;
    if (this.db) {
      const transaction = this.db!.transaction([STATE_STORE], 'readonly');
      const store = transaction.objectStore(STATE_STORE);
      const allRecords = await new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      stateSize = allRecords.reduce((total, record) => {
        return total + JSON.stringify(record.value).length;
      }, 0);
    }

    return {
      images: imageIds.length,
      stateSize: (stateSize / 1024).toFixed(2) + 'KB',
    };
  }
}

// Export singleton instance
export const db = new FitMirrorDB();

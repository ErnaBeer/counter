import { useState, useCallback } from 'react';
import { GenericStringStorage } from '../utils/GenericStringStorage';

export class InMemoryStringStorage implements GenericStringStorage {
  private storage: Map<string, string> = new Map();

  async get(key: string): Promise<string | null> {
    return this.storage.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
}

export function useInMemoryStorage() {
  const [storage] = useState(() => new InMemoryStringStorage());

  const clearStorage = useCallback(async () => {
    await storage.clear();
  }, [storage]);

  return { storage, clearStorage };
}
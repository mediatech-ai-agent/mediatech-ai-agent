/**
 * 로컬 스토리지 관리 유틸리티
 * 타입 안전성과 만료 시간, 네임스페이스 기능을 제공합니다.
 */

// 스토리지 데이터 타입 (만료 시간 포함)
interface StorageData<T = unknown> {
  value: T;
  timestamp: number;
  expiry?: number; // 만료 시간 (타임스탬프)
}

// 스토리지 옵션
interface StorageOptions {
  /** 만료 시간 (밀리초) */
  ttl?: number;
  /** 네임스페이스 (접두사) */
  namespace?: string;
}

// 에러 타입
export class StorageError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

class LocalStorageManager {
  private defaultNamespace: string;

  constructor(defaultNamespace: string = 'app') {
    this.defaultNamespace = defaultNamespace;
  }

  /**
   * 네임스페이스가 적용된 키를 생성합니다.
   */
  private createKey(key: string, namespace?: string): string {
    const ns = namespace || this.defaultNamespace;
    return `${ns}:${key}`;
  }

  /**
   * 스토리지에서 데이터를 가져옵니다.
   */
  get<T = unknown>(key: string, options: Omit<StorageOptions, 'ttl'> = {}): T | null {
    try {
      const storageKey = this.createKey(key, options.namespace);
      const item = window.localStorage.getItem(storageKey);
      
      if (!item) {
        return null;
      }

      const data: StorageData<T> = JSON.parse(item);
      
      // 만료 시간 확인
      if (data.expiry && Date.now() > data.expiry) {
        this.remove(key, options);
        return null;
      }

      return data.value;
    } catch (error) {
      throw new StorageError(`Failed to get item "${key}"`, error as Error);
    }
  }

  /**
   * 스토리지에 데이터를 저장합니다.
   */
  set<T = unknown>(key: string, value: T, options: StorageOptions = {}): void {
    try {
      const storageKey = this.createKey(key, options.namespace);
      const data: StorageData<T> = {
        value,
        timestamp: Date.now(),
        expiry: options.ttl ? Date.now() + options.ttl : undefined,
      };

      window.localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new StorageError('Storage quota exceeded', error);
      }
      throw new StorageError(`Failed to set item "${key}"`, error as Error);
    }
  }

  /**
   * 스토리지에서 데이터를 삭제합니다.
   */
  remove(key: string, options: Omit<StorageOptions, 'ttl'> = {}): void {
    try {
      const storageKey = this.createKey(key, options.namespace);
      window.localStorage.removeItem(storageKey);
    } catch (error) {
      throw new StorageError(`Failed to remove item "${key}"`, error as Error);
    }
  }

  /**
   * 키가 존재하는지 확인합니다.
   */
  has(key: string, options: Omit<StorageOptions, 'ttl'> = {}): boolean {
    const value = this.get(key, options);
    return value !== null;
  }

  /**
   * 특정 네임스페이스의 모든 키를 가져옵니다.
   */
  getKeys(namespace?: string): string[] {
    const ns = namespace || this.defaultNamespace;
    const prefix = `${ns}:`;
    const keys: string[] = [];

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.substring(prefix.length));
      }
    }

    return keys;
  }

  /**
   * 특정 네임스페이스의 모든 데이터를 가져옵니다.
   */
  getAll<T = unknown>(namespace?: string): Record<string, T> {
    const keys = this.getKeys(namespace);
    const result: Record<string, T> = {};

    keys.forEach(key => {
      const value = this.get<T>(key, { namespace });
      if (value !== null) {
        result[key] = value;
      }
    });

    return result;
  }

  /**
   * 특정 네임스페이스의 모든 데이터를 삭제합니다.
   */
  clear(namespace?: string): void {
    const keys = this.getKeys(namespace);
    keys.forEach(key => {
      this.remove(key, { namespace });
    });
  }

  /**
   * 만료된 데이터를 정리합니다.
   */
  cleanup(namespace?: string): number {
    const keys = this.getKeys(namespace);
    let cleanedCount = 0;

    keys.forEach(key => {
      try {
        const storageKey = this.createKey(key, namespace);
        const item = window.localStorage.getItem(storageKey);
        
        if (item) {
          const data: StorageData = JSON.parse(item);
          if (data.expiry && Date.now() > data.expiry) {
            this.remove(key, { namespace });
            cleanedCount++;
          }
        }
      } catch {
        // 파싱 에러가 발생한 항목도 정리
        this.remove(key, { namespace });
        cleanedCount++;
      }
    });

    return cleanedCount;
  }

  /**
   * 스토리지 사용량 정보를 가져옵니다.
   */
  getStorageInfo(namespace?: string): {
    itemCount: number;
    totalSize: number;
    keys: string[];
  } {
    const keys = this.getKeys(namespace);
    let totalSize = 0;

    keys.forEach(key => {
      const storageKey = this.createKey(key, namespace);
      const item = window.localStorage.getItem(storageKey);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    });

    return {
      itemCount: keys.length,
      totalSize,
      keys,
    };
  }

  /**
   * 데이터를 업데이트합니다 (기존 값과 병합)
   */
  update<T extends Record<string, unknown>>(
    key: string, 
    updater: (current: T | null) => T, 
    options: StorageOptions = {}
  ): void {
    const current = this.get<T>(key, options);
    const updated = updater(current);
    this.set(key, updated, options);
  }

  /**
   * 배열에 아이템을 추가합니다.
   */
  pushToArray<T>(
    key: string, 
    item: T, 
    options: StorageOptions = {}
  ): void {
    const current = this.get<T[]>(key, options) || [];
    current.push(item);
    this.set(key, current, options);
  }

  /**
   * 배열에서 조건에 맞는 아이템을 제거합니다.
   */
  removeFromArray<T>(
    key: string, 
    predicate: (item: T, index: number) => boolean,
    options: StorageOptions = {}
  ): boolean {
    const current = this.get<T[]>(key, options);
    if (!current || !Array.isArray(current)) {
      return false;
    }

    const initialLength = current.length;
    const filtered = current.filter((item, index) => !predicate(item, index));
    
    if (filtered.length !== initialLength) {
      this.set(key, filtered, options);
      return true;
    }
    
    return false;
  }
}

// 기본 인스턴스 생성 및 내보내기
export const localStorage = new LocalStorageManager();

// 특정 네임스페이스를 가진 인스턴스 생성 함수
export const createStorageManager = (namespace: string) => {
  return new LocalStorageManager(namespace);
};

// 편의 함수들
export const storage = {
  // 기본 CRUD 함수들
  get: <T = unknown>(key: string) => localStorage.get<T>(key),
  set: <T = unknown>(key: string, value: T, ttl?: number) => 
    localStorage.set(key, value, { ttl }),
  remove: (key: string) => localStorage.remove(key),
  has: (key: string) => localStorage.has(key),
  clear: () => localStorage.clear(),
  
  // 만료 시간과 함께 저장
  setWithExpiry: <T = unknown>(key: string, value: T, ttl: number) =>
    localStorage.set(key, value, { ttl }),
  
  // 배열 관리
  pushToArray: <T>(key: string, item: T) => localStorage.pushToArray(key, item),
  removeFromArray: <T>(key: string, predicate: (item: T, index: number) => boolean) =>
    localStorage.removeFromArray(key, predicate),
  
  // 객체 업데이트
  update: <T extends Record<string, unknown>>(
    key: string, 
    updater: (current: T | null) => T
  ) => localStorage.update(key, updater),
  
  // 유틸리티
  getKeys: () => localStorage.getKeys(),
  getAll: <T = unknown>() => localStorage.getAll<T>(),
  cleanup: () => localStorage.cleanup(),
  getStorageInfo: () => localStorage.getStorageInfo(),
}; 
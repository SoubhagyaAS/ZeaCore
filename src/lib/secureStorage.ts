/**
 * Secure Storage Utility
 * Provides encrypted storage for sensitive data with additional security measures
 */

interface StorageOptions {
  encrypt?: boolean;
  expiry?: number; // Time in milliseconds
}

class SecureStorage {
  private static instance: SecureStorage;
  private readonly storageKey = 'zeacore_secure_';

  private constructor() {}

  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * Simple encryption using base64 encoding
   * Note: This is basic obfuscation, not true encryption
   * For production, consider using Web Crypto API or a proper encryption library
   */
  private encrypt(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch {
      return data; // Fallback to plain text if encoding fails
    }
  }

  private decrypt(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return data; // Fallback to plain text if decoding fails
    }
  }

  /**
   * Store data securely in localStorage
   */
  public setItem(key: string, value: any, options: StorageOptions = {}): void {
    try {
      const { encrypt = false, expiry } = options;
      
      const data = {
        value: encrypt ? this.encrypt(JSON.stringify(value)) : JSON.stringify(value),
        encrypted: encrypt,
        timestamp: Date.now(),
        expiry: expiry ? Date.now() + expiry : null
      };

      localStorage.setItem(this.storageKey + key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to store data securely:', error);
    }
  }

  /**
   * Retrieve data securely from localStorage
   */
  public getItem<T>(key: string): T | null {
    try {
      const storedData = localStorage.getItem(this.storageKey + key);
      
      if (!storedData) {
        return null;
      }

      const data = JSON.parse(storedData);

      // Check if data has expired
      if (data.expiry && Date.now() > data.expiry) {
        this.removeItem(key);
        return null;
      }

      const value = data.encrypted 
        ? this.decrypt(data.value) 
        : data.value;

      return JSON.parse(value);
    } catch (error) {
      console.warn('Failed to retrieve data securely:', error);
      return null;
    }
  }

  /**
   * Remove item from secure storage
   */
  public removeItem(key: string): void {
    try {
      localStorage.removeItem(this.storageKey + key);
    } catch (error) {
      console.warn('Failed to remove data securely:', error);
    }
  }

  /**
   * Clear all secure storage data
   */
  public clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storageKey)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear secure storage:', error);
    }
  }

  /**
   * Check if an item exists and is not expired
   */
  public hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Store login credentials securely
   */
  public storeLoginCredentials(email: string, rememberMe: boolean): void {
    if (rememberMe) {
      this.setItem('rememberedEmail', email, { 
        encrypt: true,
        expiry: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      this.setItem('rememberMe', true, {
        expiry: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    } else {
      this.removeItem('rememberedEmail');
      this.removeItem('rememberMe');
    }
  }

  /**
   * Retrieve stored login credentials
   */
  public getLoginCredentials(): { email: string | null; rememberMe: boolean } {
    const email = this.getItem<string>('rememberedEmail');
    const rememberMe = this.getItem<boolean>('rememberMe') || false;
    
    return { email, rememberMe };
  }

  /**
   * Clear login credentials
   */
  public clearLoginCredentials(): void {
    this.removeItem('rememberedEmail');
    this.removeItem('rememberMe');
  }
}

export const secureStorage = SecureStorage.getInstance();
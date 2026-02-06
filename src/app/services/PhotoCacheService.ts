import { Injectable } from '@angular/core';
import { DrivePhoto } from './ViewPhotos';

interface PhotoCache {
  photos: DrivePhoto[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoCacheService {
  private readonly CACHE_KEY = 'drive_photos_cache';
  private readonly CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  private blobUrlCache = new Map<string, string>();
  private loadingPromises = new Map<string, Promise<string>>();

  constructor() {
    // Cleanup blob URLs on service destruction
    window.addEventListener('beforeunload', () => {
      this.cleanupBlobUrls();
    });
  }

  /**
   * Get cached photos if they exist and are not expired
   */
  getCachedPhotos(): DrivePhoto[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const photoCache: PhotoCache = JSON.parse(cached);
      const isExpired = Date.now() - photoCache.timestamp > this.CACHE_DURATION;

      if (isExpired) {
        this.clearCache();
        return null;
      }

      console.log(`📷 Loaded ${photoCache.photos.length} photos from cache`);
      return photoCache.photos;
    } catch (error) {
      console.error('Error reading photo cache:', error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Cache photos with current timestamp
   */
  setCachedPhotos(photos: DrivePhoto[]): void {
    try {
      const photoCache: PhotoCache = {
        photos,
        timestamp: Date.now()
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(photoCache));
      console.log(`💾 Cached ${photos.length} photos`);
    } catch (error) {
      console.error('Error caching photos:', error);
      // If localStorage is full, clear cache and try again
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearCache();
        try {
          const photoCache: PhotoCache = { photos, timestamp: Date.now() };
          localStorage.setItem(this.CACHE_KEY, JSON.stringify(photoCache));
        } catch (retryError) {
          console.error('Failed to cache photos after clearing storage:', retryError);
        }
      }
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    this.cleanupBlobUrls();
    console.log('🗑️ Photo cache cleared');
  }

  /**
   * Get or create blob URL for faster image loading
   */
  async getBlobUrl(imageUrl: string): Promise<string> {
    // Return cached blob URL if exists
    if (this.blobUrlCache.has(imageUrl)) {
      return this.blobUrlCache.get(imageUrl)!;
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(imageUrl)) {
      return this.loadingPromises.get(imageUrl)!;
    }

    // Create new loading promise
    const loadingPromise = this.createBlobUrl(imageUrl);
    this.loadingPromises.set(imageUrl, loadingPromise);

    try {
      const blobUrl = await loadingPromise;
      this.blobUrlCache.set(imageUrl, blobUrl);
      return blobUrl;
    } finally {
      this.loadingPromises.delete(imageUrl);
    }
  }

  /**
   * Create blob URL from image URL
   */
  private async createBlobUrl(imageUrl: string): Promise<string> {
    try {
      console.log(`🔄 Creating blob URL for:`, imageUrl);
      
      // For Google Drive URLs, we might need to handle them differently
      if (imageUrl.includes('drive.google.com') || imageUrl.includes('googleusercontent.com')) {
        // Try to fetch with proper headers
        const response = await fetch(imageUrl, {
          method: 'GET',
          mode: 'cors', // This might fail due to CORS
          cache: 'default'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        console.log(`✅ Blob URL created successfully`);
        return blobUrl;
      } else {
        // Regular fetch for non-Google Drive URLs
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        return blobUrl;
      }
    } catch (error) {
      console.warn('🚫 Error creating blob URL:', error);
      console.log('📝 Falling back to original URL');
      // Fallback to original URL
      return imageUrl;
    }
  }

  /**
   * Preload blob URLs for an array of photos
   */
  async preloadBlobUrls(photos: DrivePhoto[]): Promise<void> {
    const promises = photos.map(photo => {
      const imageUrl = photo.thumbnailUrl || photo.webViewLink;
      return this.getBlobUrl(imageUrl).catch(error => {
        console.warn(`Failed to preload blob for ${photo.name}:`, error);
        return imageUrl; // Fallback to original URL
      });
    });

    await Promise.all(promises);
    console.log(`🚀 Preloaded ${photos.length} photo blob URLs`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { 
    isCached: boolean; 
    photoCount: number; 
    cacheAge: number; 
    blobUrlCount: number;
    timeUntilExpiry: number;
  } {
    const cached = localStorage.getItem(this.CACHE_KEY);
    
    if (!cached) {
      return { 
        isCached: false, 
        photoCount: 0, 
        cacheAge: 0, 
        blobUrlCount: this.blobUrlCache.size,
        timeUntilExpiry: 0
      };
    }

    try {
      const photoCache: PhotoCache = JSON.parse(cached);
      const cacheAge = Date.now() - photoCache.timestamp;
      const timeUntilExpiry = Math.max(0, this.CACHE_DURATION - cacheAge);

      return {
        isCached: true,
        photoCount: photoCache.photos.length,
        cacheAge,
        blobUrlCount: this.blobUrlCache.size,
        timeUntilExpiry
      };
    } catch (error) {
      console.error('Error reading cache stats:', error);
      return { 
        isCached: false, 
        photoCount: 0, 
        cacheAge: 0, 
        blobUrlCount: this.blobUrlCache.size,
        timeUntilExpiry: 0
      };
    }
  }

  /**
   * Check if cache is expired
   */
  isCacheExpired(): boolean {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (!cached) return true;

    try {
      const photoCache: PhotoCache = JSON.parse(cached);
      return Date.now() - photoCache.timestamp > this.CACHE_DURATION;
    } catch {
      return true;
    }
  }

  /**
   * Refresh cache by clearing and allowing fresh fetch
   */
  refreshCache(): void {
    this.clearCache();
    console.log('🔄 Cache refreshed - next photo load will fetch fresh data');
  }

  /**
   * Cleanup all blob URLs to prevent memory leaks
   */
  private cleanupBlobUrls(): void {
    for (const blobUrl of this.blobUrlCache.values()) {
      if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    }
    this.blobUrlCache.clear();
    console.log('🧹 Blob URLs cleaned up');
  }

  /**
   * Get blob URL from cache without creating new one
   */
  getCachedBlobUrl(imageUrl: string): string | null {
    return this.blobUrlCache.get(imageUrl) || null;
  }

  /**
   * Manually add a blob URL to cache
   */
  setCachedBlobUrl(imageUrl: string, blobUrl: string): void {
    this.blobUrlCache.set(imageUrl, blobUrl);
  }
}

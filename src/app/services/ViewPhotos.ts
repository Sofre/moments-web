import { Injectable } from '@angular/core';
import { PhotoCacheService } from './PhotoCacheService';
import { environment } from '../../environments/environment';

export interface DrivePhoto {
    id: string;
    name: string;
    thumbnailUrl: string;
    webViewLink: string;
    downloadUrl: string;
    displayUrl?: string; // Blob URL for actual display
    size: number;
    mimeType: string;
    createdTime: string;
    modifiedTime: string;
    metadata?: {
        originalName?: string;
        userName?: string;
        category?: string;
        tags?: string[];
        eventDate?: string;
        description?: string;
        userLocation?: string;
        uploadTimestamp?: string;
    };
    folderPath?: string;
}

export interface AlbumData {
    id: string;
    name: string;
    photos: DrivePhoto[];
    createdDate: string;
    coverPhoto?: DrivePhoto;
    totalCount: number;
    folderPath: string;
}

@Injectable({
    providedIn: 'root'
})
export class ViewPhotosService {
    // Google Drive API credentials from environment
    private clientId: string = environment.googleDrive.clientId;
    private clientSecret: string = environment.googleDrive.clientSecret;
    private accessToken: string = '';
    private momentsRootFolder: string = 'Moments';
    
    // Refresh token from environment (secure)
    private readonly REFRESH_TOKEN: string = environment.googleDrive.refreshToken;

    constructor(private photoCacheService: PhotoCacheService) {}

    // Authentication methods (using environment configuration)
    async getAccessToken(): Promise<string> {
        if (this.REFRESH_TOKEN) {
            return this.getTokenFromRefreshToken();
        }
        
        const storedToken = localStorage.getItem('google_drive_token');
        if (storedToken) {
            const tokenData = JSON.parse(storedToken);
            if (tokenData.expires_at && Date.now() < tokenData.expires_at) {
                this.accessToken = tokenData.access_token;
                return this.accessToken;
            }
        }

        throw new Error('Setup required: Please configure GOOGLE_REFRESH_TOKEN in environment');
    }
    
    private async getTokenFromRefreshToken(): Promise<string> {
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    refresh_token: this.REFRESH_TOKEN,
                    grant_type: 'refresh_token'
                })
            });
            
            const data = await response.json();
            
            if (data.access_token) {
                this.accessToken = data.access_token;
                
                const expiresAt = Date.now() + (data.expires_in * 1000) - 60000;
                localStorage.setItem('google_drive_token', JSON.stringify({
                    access_token: data.access_token,
                    expires_at: expiresAt
                }));
                
                return this.accessToken;
            } else {
                throw new Error('Failed to refresh token: ' + JSON.stringify(data));
            }
        } catch (error) {
            throw new Error('Token refresh failed: ' + error);
        }
    }

    // Main method to get all photos from Google Drive
    async getAllPhotos(): Promise<DrivePhoto[]> {
        // Check cache first
        const cachedPhotos = this.photoCacheService.getCachedPhotos();
        if (cachedPhotos) {
            // DISABLED: Background preloading causes 429 rate limit errors
            // this.photoCacheService.preloadBlobUrls(cachedPhotos).catch(error => {
            //     console.warn('Background blob preload failed:', error);
            // });
            return cachedPhotos;
        }

        // No cache - fetch from API
        console.log('🌐 Fetching photos from Google Drive API...');
        try {
            await this.getAccessToken();
        } catch (error) {
            throw new Error('Failed to authenticate with Google Drive. Please try again.');
        }

        const momentsRootId = await this.findMomentsFolder();
        if (!momentsRootId) {
            return [];
        }

        const photos = await this.getAllPhotosFromFolder(momentsRootId);
        
        // Cache the results
        this.photoCacheService.setCachedPhotos(photos);
        
        // DISABLED: Background preloading causes 429 rate limit errors
        // this.photoCacheService.preloadBlobUrls(photos).catch(error => {
        //     console.warn('Background blob preload failed:', error);
        // });
        
        return photos;
    }

    // Get photos organized by albums (folders)
    async getPhotoAlbums(): Promise<AlbumData[]> {
        try {
            await this.getAccessToken();
        } catch (error) {
            throw new Error('Failed to authenticate with Google Drive. Please try again.');
        }

        const momentsRootId = await this.findMomentsFolder();
        if (!momentsRootId) {
            return [];
        }

        return this.buildAlbumStructure(momentsRootId, '');
    }

    // Get photos from a specific folder/album
    async getPhotosFromAlbum(folderId: string): Promise<DrivePhoto[]> {
        try {
            await this.getAccessToken();
        } catch (error) {
            throw new Error('Failed to authenticate with Google Drive. Please try again.');
        }

        return this.getAllPhotosFromFolder(folderId);
    }

    // Search photos by tags or metadata
    async searchPhotos(query: string): Promise<DrivePhoto[]> {
        const allPhotos = await this.getAllPhotos();
        
        return allPhotos.filter(photo => {
            const searchStr = query.toLowerCase();
            
            // Search in filename
            if (photo.name.toLowerCase().includes(searchStr)) return true;
            
            // Search in metadata
            if (photo.metadata) {
                const metadata = photo.metadata;
                if (metadata.originalName?.toLowerCase().includes(searchStr)) return true;
                if (metadata.userName?.toLowerCase().includes(searchStr)) return true;
                if (metadata.description?.toLowerCase().includes(searchStr)) return true;
                if (metadata.userLocation?.toLowerCase().includes(searchStr)) return true;
                if (metadata.tags?.some(tag => tag.toLowerCase().includes(searchStr))) return true;
            }
            
            return false;
        });
    }

    // Get photos by tag
    async getPhotosByTag(tag: string): Promise<DrivePhoto[]> {
        const allPhotos = await this.getAllPhotos();
        
        return allPhotos.filter(photo => 
            photo.metadata?.tags?.includes(tag.toLowerCase())
        );
    }

    // Private helper methods
    private async findMomentsFolder(): Promise<string | null> {
        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${this.momentsRootFolder}' and mimeType='application/vnd.google-apps.folder'`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            
            const data = await response.json();
            return data.files && data.files.length > 0 ? data.files[0].id : null;
        } catch (error) {
            console.error('Error finding Moments folder:', error);
            return null;
        }
    }

    private async getAllPhotosFromFolder(folderId: string, folderPath: string = ''): Promise<DrivePhoto[]> {
        const photos: DrivePhoto[] = [];
        
        try {
            // Get all files in this folder
            const filesResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&fields=files(id,name,mimeType,size,createdTime,modifiedTime,description,thumbnailLink,webViewLink)`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            
            if (!filesResponse.ok) {
                throw new Error(`API request failed: ${filesResponse.status}`);
            }
            
            const filesData = await filesResponse.json();
            
            if (filesData.files) {
                // Process image files
                for (const file of filesData.files) {
                    if (file.mimeType && file.mimeType.startsWith('image/')) {
                        const photo = await this.convertToPhotoObject(file, folderPath);
                        photos.push(photo);
                    }
                }
                
                // Recursively process subfolders
                const folders = filesData.files.filter((file: any) => 
                    file.mimeType === 'application/vnd.google-apps.folder'
                );
                
                for (const folder of folders) {
                    const subfolderPath = folderPath ? `${folderPath}/${folder.name}` : folder.name;
                    const subfolderPhotos = await this.getAllPhotosFromFolder(folder.id, subfolderPath);
                    photos.push(...subfolderPhotos);
                }
            }
        } catch (error) {
            console.error('Error fetching photos from folder:', error);
        }
        
        return photos;
    }

    private async buildAlbumStructure(folderId: string, currentPath: string): Promise<AlbumData[]> {
        const albums: AlbumData[] = [];
        
        try {
            // Get folders in current directory
            const foldersResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType='application/vnd.google-apps.folder'&fields=files(id,name,createdTime)`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            
            const foldersData = await foldersResponse.json();
            
            if (foldersData.files) {
                for (const folder of foldersData.files) {
                    const folderPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
                    
                    // Get photos directly in this folder
                    const photos = await this.getPhotosDirectlyFromFolder(folder.id, folderPath);
                    
                    if (photos.length > 0) {
                        const album: AlbumData = {
                            id: folder.id,
                            name: folder.name,
                            photos: photos,
                            createdDate: folder.createdTime,
                            coverPhoto: photos[0], // Use first photo as cover
                            totalCount: photos.length,
                            folderPath: folderPath
                        };
                        albums.push(album);
                    }
                    
                    // Recursively get albums from subfolders
                    const subAlbums = await this.buildAlbumStructure(folder.id, folderPath);
                    albums.push(...subAlbums);
                }
            }
        } catch (error) {
            console.error('Error building album structure:', error);
        }
        
        return albums;
    }

    private async getPhotosDirectlyFromFolder(folderId: string, folderPath: string): Promise<DrivePhoto[]> {
        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType contains 'image/'&fields=files(id,name,mimeType,size,createdTime,modifiedTime,description,thumbnailLink,webViewLink)`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            
            const data = await response.json();
            const photos: DrivePhoto[] = [];
            
            if (data.files) {
                for (const file of data.files) {
                    const photo = await this.convertToPhotoObject(file, folderPath);
                    photos.push(photo);
                }
            }
            
            return photos;
        } catch (error) {
            console.error('Error getting photos from folder:', error);
            return [];
        }
    }

    private async convertToPhotoObject(file: any, folderPath: string): Promise<DrivePhoto> {
        // Parse metadata from description if available
        let metadata = undefined;
        if (file.description) {
            try {
                metadata = JSON.parse(file.description);
            } catch (e) {
                // Description is not JSON, ignore
            }
        }

        // Generate download URL
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
        
        // Don't create blob URL immediately - do it on demand to avoid blocking
        // Use Google's thumbnail if available, or we'll create blob URL later
        const displayUrl = file.thumbnailLink || '';

        return {
            id: file.id,
            name: file.name,
            thumbnailUrl: file.thumbnailLink || '',
            webViewLink: file.webViewLink || '',
            downloadUrl: downloadUrl,
            displayUrl: displayUrl, // Will be updated on-demand
            size: parseInt(file.size) || 0,
            mimeType: file.mimeType,
            createdTime: file.createdTime,
            modifiedTime: file.modifiedTime,
            metadata: metadata,
            folderPath: folderPath
        };
    }

    // Utility method to get photo as blob for display
    async getPhotoBlob(photoId: string): Promise<Blob> {
        try {
            await this.getAccessToken();
        } catch (error) {
            throw new Error('Failed to authenticate with Google Drive. Please try again.');
        }

        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${photoId}?alt=media`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch photo: ${response.status}`);
        }

        return response.blob();
    }

    // Get thumbnail blob (smaller size for faster loading)
    private async getThumbnailBlob(photoId: string): Promise<Blob> {
        try {
            await this.getAccessToken();
        } catch (error) {
            throw new Error('Failed to authenticate with Google Drive.');
        }

        // Try to get a smaller thumbnail first (faster loading)
        try {
            const thumbResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${photoId}?alt=media`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (thumbResponse.ok) {
                const blob = await thumbResponse.blob();
                // If the image is large, we could resize it here, but for now return as-is
                return blob;
            }
        } catch (error) {
            console.warn('Thumbnail fetch failed:', error);
        }

        // Fallback to full image
        return this.getPhotoBlob(photoId);
    }

    // Get photo as data URL for immediate display
    async getPhotoDataUrl(photoId: string): Promise<string> {
        const blob = await this.getPhotoBlob(photoId);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Get display URL for a photo (creates blob URL if needed)
    async getDisplayUrl(photoId: string): Promise<string> {
        try {
            const blob = await this.getThumbnailBlob(photoId);
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Failed to create display URL:', error);
            throw error;
        }
    }
    
    // Get authenticated image URL that works with img tags
    async getAuthenticatedImageUrl(photoId: string): Promise<string> {
        try {
            await this.getAccessToken();
            
            // Create a data URL that includes the image data
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${photoId}?alt=media`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch photo: ${response.status}`);
            }
            
            const blob = await response.blob();
            return URL.createObjectURL(blob);
            
        } catch (error) {
            // Return a placeholder image
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
        }
    }

    // Clean up blob URLs to free memory
    cleanupDisplayUrls(photos: DrivePhoto[]): void {
        photos.forEach(photo => {
            if (photo.displayUrl && photo.displayUrl.startsWith('blob:')) {
                URL.revokeObjectURL(photo.displayUrl);
            }
        });
    }

    // Refresh display URLs for photos (useful when tokens expire)
    async refreshDisplayUrls(photos: DrivePhoto[]): Promise<DrivePhoto[]> {
        // Clean up old URLs first
        this.cleanupDisplayUrls(photos);

        // Create new URLs
        const refreshedPhotos = await Promise.all(
            photos.map(async (photo) => {
                try {
                    const newDisplayUrl = await this.getDisplayUrl(photo.id);
                    return {
                        ...photo,
                        displayUrl: newDisplayUrl
                    };
                } catch (error) {
                    console.warn(`Failed to refresh display URL for ${photo.name}:`, error);
                    return photo; // Return original photo if refresh fails
                }
            })
        );

        return refreshedPhotos;
    }
}

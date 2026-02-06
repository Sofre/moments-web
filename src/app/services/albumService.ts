import { Injectable } from '@angular/core';
import { UploadService } from './uploadFunctions';
import { Album } from '../process_chain_modules/createAlbums_modul';
import { PhotoCacheService } from './PhotoCacheService';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  
  constructor(private uploadService: UploadService, private photoCacheService: PhotoCacheService) {}

  async loadAlbumsFromDrive(): Promise<Album[]> {
    try {
      await this.uploadService.getAccessToken();
      const accessToken = await this.uploadService.getAccessToken();
      
      // Find Moments/Albums folder
      const momentsRootId = await this.findDriveFolder('Moments', 'root', accessToken);
      if (!momentsRootId) return [];
      
      const albumsRootId = await this.findDriveFolder('Albums', momentsRootId, accessToken);
      if (!albumsRootId) return [];
      
      // Get all album folders
      const albumFolders = await this.getAlbumFolders(albumsRootId, accessToken);
      
      // Convert to Album objects
      return albumFolders.map(folder => ({
        id: folder.id,
        title: folder.name,
        createdDate: new Date(folder.createdTime),
        photoCount: 0, // Will be updated if needed
        coverImage: undefined,
        selectedPhotos: []
      }));
    } catch (error) {
      console.error('Failed to load albums from Google Drive:', error);
      return [];
    }
  }
  
  async deleteAlbumFromDrive(albumTitle: string): Promise<void> {
    try {
      const accessToken = await this.uploadService.getAccessToken();
      
      // Find the album folder to delete
      const momentsRootId = await this.findDriveFolder('Moments', 'root', accessToken);
      if (!momentsRootId) throw new Error('Moments folder not found');
      
      const albumsRootId = await this.findDriveFolder('Albums', momentsRootId, accessToken);
      if (!albumsRootId) throw new Error('Albums folder not found');
      
      const albumFolderId = await this.findDriveFolder(albumTitle, albumsRootId, accessToken);
      if (!albumFolderId) throw new Error(`Album "${albumTitle}" not found`);
      
      // Delete the album folder
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${albumFolderId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to delete album: ${response.statusText}`);
      }
      
      // Refresh photo cache since folder structure changed
      this.photoCacheService.refreshCache();
      console.log('🗑️ Album deleted and cache refreshed');
    } catch (error) {
      console.error('Error deleting album from Google Drive:', error);
      throw error;
    }
  }
  
  private async findDriveFolder(folderName: string, parentId: string, accessToken: string): Promise<string | null> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  }
  
  private async getAlbumFolders(albumsRootId: string, accessToken: string): Promise<any[]> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${albumsRootId}' in parents and mimeType='application/vnd.google-apps.folder'&fields=files(id,name,createdTime)`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    const data = await response.json();
    return data.files || [];
  }
  
  /**
   * Get photo cache statistics for debugging
   */
  getCacheStats() {
    return this.photoCacheService.getCacheStats();
  }
  
  /**
   * Manually refresh photo cache
   */
  refreshPhotoCache(): void {
    this.photoCacheService.refreshCache();
  }
  
  /**
   * Clear all photo cache
   */
  clearPhotoCache(): void {
    this.photoCacheService.clearCache();
  }
}

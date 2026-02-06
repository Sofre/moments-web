import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../services/translations';
import {UploadService} from '../services/uploadFunctions';
import {ViewPhotosService, DrivePhoto} from '../services/ViewPhotos';
import { PhotoCacheService } from '../services/PhotoCacheService';


export interface Album {
  id: string;
  title: string;
  createdDate: Date;
  photoCount: number;
  coverImage?: string;
  selectedPhotos?: string[];

}

@Component({
  selector: 'app-create-albums',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [UploadService, ViewPhotosService, PhotoCacheService],
  template: `
    <div class="albums-modal-overlay" *ngIf="showModal" (click)="onOverlayClick($event)">
      <div class="albums-modal-content" (click)="$event.stopPropagation()">
        <div class="albums-modal-header">
          <h3>{{ translate('createAlbum') }}</h3>
          <button class="close-btn" (click)="closeModal()">&times;</button>
        </div>
        
        <div class="albums-form">
          <div class="form-group">
            <label for="albumTitle">{{ translate('albumTitle') }}</label>
            <input 
              type="text" 
              id="albumTitle"
              [(ngModel)]="newAlbum.title"
              placeholder="{{ translate('albumTitlePlaceholder') }}"
              class="form-input"
              maxlength="50"
              required>
          </div>
          
          <div class="form-group">
            <label>{{ translate('selectPhotos') }}</label>
            <div class="photo-selection" *ngIf="!isLoadingPhotos">
              <div class="photo-grid">
                <div 
                  *ngFor="let photo of availablePhotos" 
                  class="photo-item"
                  [class.selected]="selectedPhotoIds.includes(photo.id)"
                  (click)="togglePhotoSelection(photo.id)">
                  <img [src]="getBlobUrl(photo)" [alt]="photo.name" class="photo-thumbnail" (load)="onImageLoad(photo)" (error)="onImageError(photo, $event)">
                  <div class="photo-overlay">
                    <div class="photo-checkbox" [class.checked]="selectedPhotoIds.includes(photo.id)">
                      ✓
                    </div>
                  </div>
                  <span class="photo-name">{{ photo.name }}</span>
                </div>
              </div>
              <div class="selection-summary" *ngIf="selectedPhotoIds.length > 0">
                {{ selectedPhotoIds.length }} photo(s) selected
              </div>
            </div>
            <div *ngIf="isLoadingPhotos" class="loading-photos">
              <div class="spinner"></div>
              <span>Loading photos...</span>
            </div>
          </div>
        </div>
        
        <div class="albums-modal-footer">
          <button class="btn btn-outline" (click)="skipAlbum()">
            {{ translate('skip') }}
          </button>
          <button 
            class="btn btn-primary" 
            (click)="createAlbum()"
            [disabled]="!newAlbum.title?.trim() || selectedPhotoIds.length === 0">
            {{ translate('createAlbumBtn') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .albums-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .albums-modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(247, 113, 4, 0.5);
    }
    
    .albums-modal-header {

      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
     
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #eee;
      background: linear-gradient(135deg, #ffae00, #ff9900);
      color: white;
    }
    
    .albums-modal-header h3 {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      color: white;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: white;
      cursor: pointer;
      padding: 5px;
      border-radius: 50%;
      transition: background 0.2s;
    }
    
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .albums-form {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 24px;
    }
    
    .form-group {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #333;
    }
    
    .form-input, .form-textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    
    .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: #ff6b35;
    }
    
    .form-textarea {
      resize: vertical;
      font-family: inherit;
    }
    
    .form-help {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: #666;
    }
    
    .albums-modal-footer {
      padding: 20px 24px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background: #f9f9f9;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #ffae00, #ff9900);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 174, 0, 0.4);
    }
    
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background: white;
      color: #666;
      border: 2px solid #ddd;
    }
    
    .btn-secondary:hover {
      background: #f0f0f0;
      border-color: #999;
    }
    
    .photo-selection {
      margin-top: 10px;
    }
    
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 12px;
    }
    
    .photo-item {
      position: relative;
      cursor: pointer;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.2s;
      border: 2px solid transparent;
    }
    
    .photo-item:hover {
      transform: scale(1.05);
    }
    
    .photo-item.selected {
      border-color: #ff6b35;
      box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
    }
    
    .photo-thumbnail {
      width: 100%;
      height: 80px;
      object-fit: cover;
      display: block;
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
    }
    
    .photo-thumbnail:not([src]),
    .photo-thumbnail[src=""] {
      background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                  linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                  linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
      background-size: 8px 8px;
      background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
    }
    
    .photo-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 80px;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .photo-item:hover .photo-overlay,
    .photo-item.selected .photo-overlay {
      opacity: 1;
    }
    
    .photo-checkbox {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: transparent;
      transition: all 0.2s;
    }
    
    .photo-checkbox.checked {
      background: #ff6b35;
      color: white;
    }
    
    .photo-name {
      display: block;
      font-size: 11px;
      text-align: center;
      padding: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .selection-summary {
      margin-top: 10px;
      padding: 8px;
      background: #f0f8ff;
      border-radius: 4px;
      text-align: center;
      font-size: 14px;
      color: #ff6b35;
      font-weight: 500;
    }
    
    .loading-photos {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-align: center;
      padding: 40px;
      color: #666;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f0f0f0;
      border-top: 3px solid #ff6b35;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .albums-modal-content {
        width: 95%;
        margin: 20px 0;
      }
      
      .albums-modal-header,
      .albums-form,
      .albums-modal-footer {
        padding: 16px;
      }
    }
  `]
})
export class CreateAlbumsComponent implements OnInit {
  @Output() albumCreated = new EventEmitter<Album>();
  @Output() modalClosed = new EventEmitter<void>();
  @Output() albumSkipped = new EventEmitter<void>();
  
  showModal: boolean = true; // Show immediately when component is loaded
  translationService = new TranslationService();
  uploadService = new UploadService();
  
  constructor(
    private photoCacheService: PhotoCacheService,
    private viewPhotosService: ViewPhotosService
  ) {}
  
  newAlbum: Partial<Album> = {
    title: '',
    selectedPhotos: []
  };
  
  availablePhotos: DrivePhoto[] = [];
  selectedPhotoIds: string[] = [];
  isLoadingPhotos: boolean = false;
  photoUrls = new Map<string, string>(); // Track photo URLs for proper display
  
  ngOnInit(): void {
    this.resetForm();
    this.loadAvailablePhotos();
  }
  
  // Get display URL for photo thumbnail
  getBlobUrl(photo: DrivePhoto): string {
    // Check if we already have a processed URL for this photo
    if (this.photoUrls.has(photo.id)) {
      return this.photoUrls.get(photo.id)!;
    }
    
    // Start with a loading placeholder
    const loadingPlaceholder = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="100" height="80" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="80" fill="#f8f9fa"/>
        <circle cx="50" cy="40" r="12" fill="none" stroke="#6c757d" stroke-width="2">
          <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <text x="50" y="70" text-anchor="middle" font-size="8" fill="#6c757d">Loading...</text>
      </svg>
    `)}`;
    
    this.photoUrls.set(photo.id, loadingPlaceholder);
    
    // Get authenticated image URL using ViewPhotosService
    this.viewPhotosService.getAuthenticatedImageUrl(photo.id).then(authenticatedUrl => {
      this.photoUrls.set(photo.id, authenticatedUrl);
      // Update the image src for this photo
      const imgElement = document.querySelector(`img[alt="${photo.name}"]`) as HTMLImageElement;
      if (imgElement) {
        imgElement.src = authenticatedUrl;
      }
    }).catch(error => {
      console.warn(`Failed to get authenticated URL for ${photo.name}:`, error);
      // Keep the loading placeholder as fallback
    });
    
    return loadingPlaceholder;
  }
  
  // Handle successful image load
  onImageLoad(photo: DrivePhoto): void {
    // Image loaded successfully - could add loading state management here
  }
  
  // Handle image load error (simplified to avoid infinite loops)
  onImageError(photo: DrivePhoto, event: any): void {
    const imgElement = event.target as HTMLImageElement;
    
    // Prevent infinite error loops by checking if we've already set placeholder
    if (imgElement.src.includes('data:image/svg+xml')) {
      return; // Already showing placeholder, don't loop
    }
    
    console.warn(`❌ Image failed to load for ${photo.name}, using placeholder`);
    
    // Set a simple error placeholder
    const errorPlaceholder = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="100" height="80" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="80" fill="#f8f8f8"/>
        <rect x="20" y="20" width="60" height="40" fill="none" stroke="#dc3545" stroke-width="2" rx="4" stroke-dasharray="4,4"/>
        <text x="50" y="45" text-anchor="middle" font-size="20" fill="#dc3545">X</text>
        <text x="50" y="70" text-anchor="middle" font-size="8" fill="#6c757d">Error loading</text>
      </svg>
    `)}`;
    
    imgElement.src = errorPlaceholder;
    this.photoUrls.set(photo.id, errorPlaceholder);
  }
  
  closeModal(): void {
    this.showModal = false;
    this.modalClosed.emit();
  }
  
  skipAlbum(): void {
    this.showModal = false;
    this.albumSkipped.emit();
  }
  
  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
  
  async createAlbum(): Promise<void> {
    if (!this.newAlbum.title?.trim() || this.selectedPhotoIds.length === 0) {
      return;
    }
    
    try {
      // Get selected photos
      const selectedPhotos = this.availablePhotos.filter(photo => 
        this.selectedPhotoIds.includes(photo.id)
      );
      
      // Create album folder in Google Drive hierarchy: Moments/AlbumTitle
      await this.uploadService.getAccessToken(); // Ensure we're authenticated
      const albumFolderId = await this.createAlbumFolder(this.newAlbum.title.trim());
            // Copy selected photos into the album folder
      console.log(`Copying ${selectedPhotos.length} photos into album folder...`);
      await this.copyPhotosToAlbum(this.selectedPhotoIds, albumFolderId);
            const album: Album = {
        id: this.generateId(),
        title: this.newAlbum.title.trim(),
        createdDate: new Date(),
        photoCount: selectedPhotos.length,
        coverImage: selectedPhotos.length > 0 ? selectedPhotos[0].thumbnailUrl : undefined,
        selectedPhotos: this.selectedPhotoIds
      };
      
      console.log(`Created album "${album.title}" with ${album.photoCount} photos`);
      this.albumCreated.emit(album);
      this.closeModal();
      
    } catch (error) {
      console.error('Failed to create album:', error);
      // You could add error handling UI here
    }
  }
  
  resetForm(): void {
    this.newAlbum = {
      title: '',
    };
    this.selectedPhotoIds = [];
  }
  
  translate(key: string): string {
    return this.translationService.translate(key as any) || key;
  }
  
  async loadAvailablePhotos(): Promise<void> {
    this.isLoadingPhotos = true;
    console.log('📸 Loading available photos...');
    try {
      this.availablePhotos = await this.viewPhotosService.getAllPhotos();
      console.log(`✅ Loaded ${this.availablePhotos.length} photos`);
      
      // Debug: Log first few photo URLs
      this.availablePhotos.slice(0, 3).forEach(photo => {
        console.log(`📷 Photo ${photo.name}:`, {
          thumbnailUrl: photo.thumbnailUrl,
          webViewLink: photo.webViewLink
        });
      });
    } catch (error) {
      console.error('❌ Failed to load photos:', error);
      this.availablePhotos = [];
    } finally {
      this.isLoadingPhotos = false;
    }
  }
  
  togglePhotoSelection(photoId: string): void {
    const index = this.selectedPhotoIds.indexOf(photoId);
    if (index > -1) {
      this.selectedPhotoIds.splice(index, 1);
    } else {
      this.selectedPhotoIds.push(photoId);
    }
  }
  
  private generateId(): string {
    return 'album_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  private async createAlbumFolder(albumTitle: string): Promise<string> {
    // Create the hierarchy: Moments/Albums/AlbumTitle
    const momentsRootId = await this.getMomentsRootFolder();
    const albumsRootId = await this.getAlbumsRootFolder(momentsRootId);
    return await this.createDriveFolder(albumTitle, albumsRootId);
  }
  
  private async getMomentsRootFolder(): Promise<string> {
    // Search for Moments folder or create it
    return await this.createDriveFolder('Moments', 'root');
  }
  
  private async getAlbumsRootFolder(momentsRootId: string): Promise<string> {
    // Search for Albums folder inside Moments or create it
    return await this.createDriveFolder('Albums', momentsRootId);
  }
  
  private async createDriveFolder(folderName: string, parentId: string): Promise<string> {
    const accessToken = await this.uploadService.getAccessToken();
    
    // Search for existing folder first
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    const searchData = await searchResponse.json();
    
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
    
    // Create new folder if not found
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      })
    });
    
    const createData = await createResponse.json();
    return createData.id;
  }
  
  private async copyPhotosToAlbum(photoIds: string[], albumFolderId: string): Promise<void> {
    const accessToken = await this.uploadService.getAccessToken();
    
    const copyPromises = photoIds.map(async (photoId) => {
      try {
        // Copy the photo into the album folder
        const copyResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            parents: [albumFolderId],
            name: `copy_of_${photoId}` // Will get the actual filename from the original
          })
        });
        
        if (!copyResponse.ok) {
          // If copy fails, try adding the photo as a parent (sharing approach)
          const updateResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${photoId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              addParents: albumFolderId
            })
          });
          
          if (!updateResponse.ok) {
            console.warn(`Failed to add photo ${photoId} to album folder`);
          } else {
            console.log(`Added photo ${photoId} to album folder as additional parent`);
          }
        } else {
          console.log(`Copied photo ${photoId} to album folder`);
        }
      } catch (error) {
        console.error(`Error copying photo ${photoId}:`, error);
      }
    });
    
    await Promise.all(copyPromises);
    console.log(`Finished copying ${photoIds.length} photos to album`);
  }
}

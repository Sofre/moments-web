import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { LoadingService } from '../services/loading.service';
import { LoadingComponent } from '../animations/loading.component';
import { ViewPhotosService, DrivePhoto } from '../services/ViewPhotos';

// Using DrivePhoto from ViewPhotosService
// Adding local interfaces for gallery functionality
interface GalleryPhoto extends DrivePhoto {
  category: 'nature' | 'people' | 'events' | 'all';
  displayTitle: string;
  displayDate: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css'
})
export class GalleryComponent implements OnInit, OnDestroy {
  
  photos: GalleryPhoto[] = [];
  filteredPhotos: GalleryPhoto[] = [];
  activeFilter: string = 'all';
  isLoading: boolean = false;
  errorMessage: string = '';
  
  constructor(
    private router: Router, 
    private loadingService: LoadingService,
    private viewPhotosService: ViewPhotosService
  ) {
    // Removed automatic refresh on navigation - cache should persist when navigating back and forth
    // Only refresh when explicitly requested (upload or manual reload)
  }
  
  ngOnInit(): void {
    this.loadPhotosFromDrive();
  }
  
  // Load photos from Google Drive
  private async loadPhotosFromDrive(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadingService.show();
    
    try {
      const drivePhotos = await this.viewPhotosService.getAllPhotos();
      
      // Convert DrivePhoto to GalleryPhoto
      this.photos = drivePhotos.map(photo => this.convertToGalleryPhoto(photo));
      
      // Apply default filter
      this.filterPhotos('all');
      
      if (this.photos.length === 0) {
        this.errorMessage = 'No photos found in your Google Drive Moments folder.';
      } else {
        // Start preloading images in the background
        setTimeout(() => this.preloadImages(), 100);
      }
      
    } catch (error) {
      this.errorMessage = 'Failed to load photos from Google Drive. Please try again.';
      // Load sample photos as fallback
      this.loadSamplePhotos();
    } finally {
      this.isLoading = false;
      this.loadingService.hide();
    }
  }

  // Public method to refresh photos
  async refreshPhotos(): Promise<void> {
    console.log('🔄 Refreshing gallery photos with fresh data...');
    this.isLoading = true;
    this.errorMessage = '';
    this.loadingService.show();
    
    try {
      // Force fresh load by passing true to getAllPhotos
      const drivePhotos = await this.viewPhotosService.getAllPhotos(true);
      
      // Convert DrivePhoto to GalleryPhoto
      this.photos = drivePhotos.map(photo => this.convertToGalleryPhoto(photo));
      
      // Apply default filter
      this.filterPhotos('all');
      
      if (this.photos.length === 0) {
        this.errorMessage = 'No photos found in your Google Drive Moments folder.';
      } else {
        // Start preloading images in the background
        setTimeout(() => this.preloadImages(), 100);
      }
      
    } catch (error) {
      this.errorMessage = 'Failed to refresh photos. Please try again.';
    } finally {
      this.isLoading = false;
      this.loadingService.hide();
    }
  }
  
  // Convert DrivePhoto to GalleryPhoto
  private convertToGalleryPhoto(drivePhoto: DrivePhoto): GalleryPhoto {
    // Determine category from tags or filename
    const category = this.determineCategory(drivePhoto);
    
    // Generate display title
    const displayTitle = drivePhoto.metadata?.description || 
                        drivePhoto.metadata?.originalName || 
                        drivePhoto.name || 
                        'Untitled Photo';
    
    // Format display date
    const displayDate = this.formatDisplayDate(drivePhoto.createdTime);
    
    return {
      ...drivePhoto,
      category,
      displayTitle,
      displayDate
    };
  }
  
  // Determine photo category from metadata
  private determineCategory(photo: DrivePhoto): 'nature' | 'people' | 'events' | 'all' {
    const tags = photo.metadata?.tags || [];
    const fileName = photo.name.toLowerCase();
    const description = (photo.metadata?.description || '').toLowerCase();
    
    // Check tags first
    if (tags.some(tag => ['nature', 'landscape', 'sunset', 'mountain', 'ocean', 'forest', 'beach'].includes(tag.toLowerCase()))) {
      return 'nature';
    }
    if (tags.some(tag => ['people', 'family', 'friends', 'selfie', 'group', 'portrait'].includes(tag.toLowerCase()))) {
      return 'people';
    }
    if (tags.some(tag => ['event', 'wedding', 'birthday', 'celebration', 'party', 'graduation'].includes(tag.toLowerCase()))) {
      return 'events';
    }
    
    // Check filename and description
    if (fileName.includes('nature') || fileName.includes('landscape') || description.includes('nature')) {
      return 'nature';
    }
    if (fileName.includes('people') || fileName.includes('family') || description.includes('people')) {
      return 'people';
    }
    if (fileName.includes('event') || fileName.includes('wedding') || description.includes('event')) {
      return 'events';
    }
    
    return 'all'; // Default category
  }
  
  // Format date for display
  private formatDisplayDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown Date';
    }
  }
  
  // Fallback sample photos
  private loadSamplePhotos(): void {
    const sampleDrivePhotos: DrivePhoto[] = [
      {
        id: 'sample_1',
        name: 'Beautiful_Sunset.jpg',
        thumbnailUrl: 'https://via.placeholder.com/400x300/4f46e5/ffffff?text=Beautiful+Sunset',
        webViewLink: '',
        downloadUrl: 'https://via.placeholder.com/400x300/4f46e5/ffffff?text=Beautiful+Sunset',
        size: 1024000,
        mimeType: 'image/jpeg',
        createdTime: '2026-01-15T10:00:00Z',
        modifiedTime: '2026-01-15T10:00:00Z',
        metadata: {
          description: 'Beautiful Sunset',
          tags: ['nature', 'sunset']
        }
      },
      {
        id: 'sample_2',
        name: 'Family_Time.jpg',
        thumbnailUrl: 'https://via.placeholder.com/400x350/f59e0b/ffffff?text=Family+Time',
        webViewLink: '',
        downloadUrl: 'https://via.placeholder.com/400x350/f59e0b/ffffff?text=Family+Time',
        size: 1024000,
        mimeType: 'image/jpeg',
        createdTime: '2026-02-03T10:00:00Z',
        modifiedTime: '2026-02-03T10:00:00Z',
        metadata: {
          description: 'Family Time',
          tags: ['people', 'family']
        }
      }
    ];
    
    this.photos = sampleDrivePhotos.map(photo => this.convertToGalleryPhoto(photo));
  }
  
  // Filter photos by category
  filterPhotos(category: string): void {
    this.activeFilter = category;
    
    if (category === 'all') {
      this.filteredPhotos = [...this.photos];
    } else {
      this.filteredPhotos = this.photos.filter(photo => photo.category === category);
    }
    
    // Update active filter button
    this.updateActiveFilterButton(category);
  }
  
  private updateActiveFilterButton(category: string): void {
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected button
    const activeButton = document.querySelector(`[data-filter="${category}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }
  
  // View photo in full size
  viewPhoto(photo: GalleryPhoto): void {
    // Implement lightbox or modal view
    console.log('Viewing photo:', photo.displayTitle);
    // You can integrate with a lightbox library or create a modal component
    // For now, open in new tab
    if (photo.webViewLink) {
      window.open(photo.webViewLink, '_blank');
    }
  }
  
  // Download photo
  async downloadPhoto(photo: GalleryPhoto): Promise<void> {
    try {
      // Get the actual photo data from Google Drive
      const dataUrl = await this.viewPhotosService.getPhotoDataUrl(photo.id);
      
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = dataUrl;
      const fileName = photo.metadata?.originalName || photo.name || 'photo.jpg';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download photo. Please try again.');
    }
  }
  
  // Share photo
  sharePhoto(photo: GalleryPhoto): void {
    const shareUrl = photo.webViewLink || photo.downloadUrl;
    
    if (navigator.share && shareUrl) {
      // Use Web Share API if available
      navigator.share({
        title: photo.displayTitle,
        text: `Check out this photo: ${photo.displayTitle}`,
        url: shareUrl
      }).catch(err => {
        console.log('Error sharing:', err);
        this.fallbackShare(photo);
      });
    } else {
      this.fallbackShare(photo);
    }
  }
  
  private fallbackShare(photo: GalleryPhoto): void {
    // Fallback share method - copy to clipboard
    const shareUrl = photo.webViewLink || photo.downloadUrl;
    const shareText = `Check out this photo: ${photo.displayTitle} - ${shareUrl}`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Photo link copied to clipboard!');
    }).catch(() => {
      // Last resort - show share dialog
      alert(`Share this photo: ${photo.displayTitle}\n${shareUrl}`);
    });
  }
  
  // Load more photos (pagination)
  loadMorePhotos(): void {
    // Implement pagination logic here
    console.log('Loading more photos...');
    // For now, refresh all photos
    this.loadPhotosFromDrive();
  }
  
  // Navigate back to home
  navigateToHome(): void {
    // Show loading animation
    this.loadingService.show();
    this.router.navigate(['/']).then(() => {
      // Hide loading after navigation
      this.loadingService.hide();
    });
  }
  
  // Get photos for current filter
  getFilteredPhotos(): GalleryPhoto[] {
    return this.filteredPhotos;
  }
  
  // Get photo thumbnail URL for display
  getPhotoThumbnail(photo: GalleryPhoto): string {
    // Try displayUrl first (if we've created a blob URL)
    if (photo.displayUrl && photo.displayUrl !== '') {
      return photo.displayUrl;
    }
    
    // Fallback to Google's thumbnail (may not work without auth)
    if (photo.thumbnailUrl) {
      return photo.thumbnailUrl;
    }
    
    // Last resort: placeholder image
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==';
  }
  
  // Check if photos are loading
  isPhotosLoading(): boolean {
    return this.isLoading;
  }
  
  // Get error message
  getErrorMessage(): string {
    return this.errorMessage;
  }
  
  // Retry loading photos
  retryLoadPhotos(): void {
    this.loadPhotosFromDrive();
  }
  
  // Handle image loading errors - create authenticated URLs
  async onImageError(photo: GalleryPhoto, event: any): Promise<void> {
    // Prevent infinite error loops
    if (event.target.dataset.retryCount) {
      const retryCount = parseInt(event.target.dataset.retryCount);
      if (retryCount >= 2) {
        event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiNkZGRkZGQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
        return;
      }
      event.target.dataset.retryCount = (retryCount + 1).toString();
    } else {
      event.target.dataset.retryCount = '1';
    }
    
    try {
      // Show loading state
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSIyMCIgZmlsbD0iIzMzOTVmZiI+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiBhdHRyaWJ1dGVUeXBlPSJYTUwiIHR5cGU9InJvdGF0ZSIgZnJvbT0iMCAyMDAgMTUwIiB0bz0iMzYwIDIwMCAxNTAiIGR1cj0iMXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9jaXJjbGU+PC9zdmc+';
      
      // Try to create authenticated URL
      const authenticatedUrl = await this.viewPhotosService.getAuthenticatedImageUrl(photo.id);
      
      // Update photo object and image source
      photo.displayUrl = authenticatedUrl;
      event.target.src = authenticatedUrl;
      
    } catch (error) {
      // Show error placeholder
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZlYmVlIiBzdHJva2U9IiNmZGM4YzgiLz48dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2VmNGU0NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZhaWxlZCB0byBMb2FkPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2xpY2sgdG8gcmV0cnk8L3RleHQ+PC9zdmc+';
    }
  }
  
  // Clean up blob URLs when component is destroyed
  ngOnDestroy(): void {
    if (this.photos.length > 0) {
      this.viewPhotosService.cleanupDisplayUrls(this.photos);
    }
  }
  
  // Preload images for better UX (call this after photos are loaded)
  async preloadImages(): Promise<void> {
    console.log('Starting to preload images...');
    
    // Preload first few images for immediate display
    const imagesToPreload = this.filteredPhotos.slice(0, 6); // Load first 6 images
    
    for (const photo of imagesToPreload) {
      try {
        if (!photo.displayUrl || photo.displayUrl === '') {
          const authenticatedUrl = await this.viewPhotosService.getAuthenticatedImageUrl(photo.id);
          photo.displayUrl = authenticatedUrl;
          console.log('Preloaded image:', photo.name);
        }
      } catch (error) {
        console.warn('Failed to preload image:', photo.name, error);
      }
    }
    
    // Force change detection to update the UI
    // Note: In a real app, you might want to inject ChangeDetectorRef and call detectChanges()
  }
  
  // Check if filter is active
  isFilterActive(filter: string): boolean {
    return this.activeFilter === filter;
  }
  
  // Track by function for ngFor performance
  trackPhotoById(index: number, photo: GalleryPhoto): string {
    return photo.id;
  }
  
  // Test Google Drive connection
  async testGoogleDriveConnection(): Promise<void> {
    console.log('=== TESTING GOOGLE DRIVE CONNECTION ===');
    try {
      await this.viewPhotosService.getAccessToken();
      console.log('✅ Google Drive authentication successful');
      
      const photos = await this.viewPhotosService.getAllPhotos();
      console.log(`✅ Found ${photos.length} photos in Google Drive`);
      
      if (photos.length > 0) {
        console.log('📷 First photo:', photos[0]);
      }
      
    } catch (error) {
      console.error('❌ Google Drive connection failed:', error);
    }
    console.log('=== END TEST ===');
  }
}

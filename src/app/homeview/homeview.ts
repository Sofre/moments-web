import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslationService, Translation } from '../services/translations';
import { UploadModuleComponent } from '../process_chain_modules/upload_modul';
import { UploadService } from '../services/uploadFunctions';
import { CreateAlbumsComponent, Album } from '../process_chain_modules/createAlbums_modul';
import { ShareModuleComponent } from '../process_chain_modules/share_modul';
import { LoadingService } from '../services/loading.service';
import { LoadingComponent } from '../animations/loading.component';
import { AlbumService } from '../services/albumService';
import { PhotoCacheService } from '../services/PhotoCacheService';
import { ViewPhotosService } from '../services/ViewPhotos';

@Component({
  selector: 'app-homeview',
  standalone: true,
  imports: [CommonModule, RouterModule, UploadModuleComponent, CreateAlbumsComponent, ShareModuleComponent, LoadingComponent],
  providers: [UploadService, AlbumService, PhotoCacheService, ViewPhotosService],
  templateUrl: './homeview.html',
  styleUrl: './homeview.css'
})
export class HomeviewComponent implements OnInit {
  showUploadModal: boolean = false;
  showAlbumsModal: boolean = false;
  showShareModal: boolean = false;
  albums: Album[] = [];
  showPhotoPreview: boolean = false;
  selectedPhotoUrl: string = '';
  selectedPhotoTitle: string = '';
  
  constructor(private router: Router, private loadingService: LoadingService, private albumService: AlbumService, private uploadService: UploadService, private translationService: TranslationService) {}
  
  ngOnInit(): void {
    // Make upload service available in console for setup (DEV ONLY)
    (window as any).uploadService = this.uploadService;
    // Load albums from localStorage
    this.loadAlbums();
  }
  
  galleryItems = [
    'familyGathering',
    'sunsetVibes',
    'beachDay',
    'mountainPeak',
    'cityLights',
    'goldenHour'
  ];

  scrollToHowItWorks(): void {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  // Translation Methods and Language Toggle
  toggleLanguage(): void {
    const currentLang = this.translationService.getCurrentLanguage();
    const newLang = currentLang === 'en' ? 'mk' : 'en'; // Toggle between English and Macedonian , This is a if case
    this.translationService.setLanguage(newLang);
  }
  
  translate(key: string): string {
    return this.translationService.translate(key as keyof Translation);
  }
  
  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage();
  }

  // Upload Modal Methods
  openUploadModal(): void {
    console.log('🚀 Opening upload modal - homeview.ts');
    this.showUploadModal = true;
  }

  onUploadComplete(files: File[]): void {
    console.log('Upload completed with files:', files);
    this.showUploadModal = false;
    
    // Navigate to gallery to show the new photos
    this.router.navigate(['/gallery']);
  }

  onUploadSkipped(): void {
    console.log('Upload was skipped');
    this.showUploadModal = false;
    // If upload is skipped, still show create album modal
    this.showAlbumsModal = true;
  }

  onUploadModalClosed(): void {
    // Just close the upload modal without continuing to album creation
    this.showUploadModal = false;
  }

  // Albums Methods
  openAlbumsModal(): void {
    this.showAlbumsModal = true;
  }

  async onAlbumCreated(album: Album): Promise<void> {
    this.albums.unshift(album); // Add to beginning of array
    this.saveAlbums();
    console.log('Album created:', album);
    this.showAlbumsModal = false;
    
    // Refresh albums from Google Drive
    await this.loadAlbums();
    
    // After album creation, show share modal
    this.showShareModal = true;
  }

  onAlbumsModalClosed(): void {
    // Just close the modal without any additional workflow
    this.showAlbumsModal = false;
  }

  onAlbumsSkipped(): void {
    // Skip album creation - go to share modal
    console.log('Album creation was skipped');
    this.showAlbumsModal = false;
    this.showShareModal = true;
  }

  // Share Methods
  onShareModalClosed(): void {
    // End of workflow - just close
    this.showShareModal = false;
  }

  private async loadAlbums(): Promise<void> {
    try {
      // Load albums from Google Drive Albums folder using service
      const driveAlbums = await this.albumService.loadAlbumsFromDrive();
      this.albums = driveAlbums.slice(0, 4); // Show only first 4 albums
      console.log(`Loaded ${this.albums.length} albums from Google Drive`);
    } catch (error) {
      console.error('Error loading albums from Google Drive:', error);
      // Fallback to localStorage if Google Drive fails
      const savedAlbums = localStorage.getItem('userAlbums');
      if (savedAlbums) {
        try {
          this.albums = JSON.parse(savedAlbums).slice(0, 4);
        } catch (error) {
          console.error('Error loading albums from localStorage:', error);
          this.albums = [];
        }
      }
    }
  }

  private saveAlbums(): void {
    localStorage.setItem('userAlbums', JSON.stringify(this.albums));
  }

  async removeAlbum(albumId: string): Promise<void> {
    if (confirm(this.translate('confirmRemoveAlbum'))) {
      try {
        // Find the album to delete
        const albumToDelete = this.albums.find(album => album.id === albumId);
        if (albumToDelete) {
          // Delete from Google Drive using service
          await this.albumService.deleteAlbumFromDrive(albumToDelete.title);
          console.log(`Album "${albumToDelete.title}" deleted from Google Drive`);
        }
        
        // Remove from local array
        this.albums = this.albums.filter(album => album.id !== albumId);
        this.saveAlbums();
        console.log('Album removed:', albumId);
        
        // Reload albums to refresh the display
        await this.loadAlbums();
      } catch (error) {
        console.error('Error removing album:', error);
        alert('Failed to delete album. Please try again.');
      }
    }
  }

  removeSrednoAlbum(): void {
    this.albums = this.albums.filter(album => album.title.toLowerCase() !== 'sredno');
    this.saveAlbums();
    console.log('Sredno album removed');
    alert('Sredno album has been removed!');
  }

  navigateToGallery(): void {
    // Show loading animation
    this.loadingService.show();
    // Navigate to the gallery page using Angular Router
    this.router.navigate(['/gallery']).then(() => {
      // Hide loading after navigation
      this.loadingService.hide();
    });
  }
  trackByAlbumId(index: number, album: Album): string {
    return album.id;
  }

  // Photo Preview Methods
  openPhotoPreview(item: string, index: number): void {
    // Generate a sample photo URL (in real app, this would come from your data)
    const samplePhotos = [
      'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&q=80',
      'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=800&q=80',
      'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=80'
    ];
    
    this.selectedPhotoUrl = samplePhotos[index] || samplePhotos[0];
    this.selectedPhotoTitle = this.translate(item);
    this.showPhotoPreview = true;
  }

  openAlbumPreview(album: Album): void {
    // Sample album cover photo
    this.selectedPhotoUrl = album.coverImage || 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80';
    this.selectedPhotoTitle = album.title;
    this.showPhotoPreview = true;
  }

  closePhotoPreview(): void {
    this.showPhotoPreview = false;
    this.selectedPhotoUrl = '';
    this.selectedPhotoTitle = '';
  }
}

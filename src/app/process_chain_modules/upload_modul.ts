import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService, UserMetadata } from '../services/uploadFunctions';

@Component({
  selector: 'app-upload-module',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="upload-overlay" *ngIf="isVisible">
      <div class="upload-modal">
        <div class="upload-header">
          <h2 style="font-family: 'Pacifico', Tahoma, Geneva, Verdana, sans-serif;">{{ title }}</h2>
          <button class="close-btn" (click)="closeModal()">✕</button>
        </div>
        
        <div class="upload-content">
          <div class="drag-drop-area" 
               (dragover)="onDragOver($event)" 
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)"
               [class.drag-over]="isDragOver"
               (click)="triggerFileInput()">
            
            <div *ngIf="selectedFiles.length === 0" class="upload-placeholder">
              <div class="upload-icon">📸</div>
              <p class="upload-text">Drag & Drop your photos here</p>
              <p class="upload-subtext">or click to browse</p>
              <div class="supported-formats">
                <small>Supports: JPG, PNG, GIF, WEBP</small>
              </div>
            </div>
            
            <div *ngIf="selectedFiles.length > 0" class="file-preview">
              <div class="preview-grid">
                <div *ngFor="let file of selectedFiles; let i = index" class="preview-item">
                  <img [src]="getPreviewUrl(file)" [alt]="file.name" class="preview-image">
                  <div class="file-info">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  </div>
                  <button class="remove-file" (click)="removeFile(i)">🗑️</button>
                </div>
              </div>
            </div>
          </div>
          
          <input #fileInput 
                 type="file" 
                 multiple 
                 accept="image/*" 
                 (change)="onFileSelect($event)"
                 style="display: none;">
          
          <div class="upload-progress" *ngIf="isUploading">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="uploadProgress"></div>
            </div>
            <p class="progress-text">Uploading... {{ uploadProgress }}%</p>
          </div>

          <!-- Metadata Form -->
          <div class="metadata-form" *ngIf="showMetadataForm && !isUploading">
            <h3>Add Details to Your Moments</h3>
            <div class="form-row">
              <label for="userName">Your Name:</label>
              <input 
                type="text" 
                id="userName" 
                [(ngModel)]="userMetadata.userName" 
                placeholder="Enter your name"
                class="form-input">
            </div>
            
            <div class="form-row">
              <label for="location">Location:</label>
              <input 
                type="text" 
                id="location" 
                [(ngModel)]="userMetadata.location" 
                placeholder="Where was this taken?"
                class="form-input">
            </div>
            
            <div class="form-row">
              <label for="eventDate">Date:</label>
              <input 
                type="date" 
                id="eventDate" 
                [(ngModel)]="userMetadata.eventDate" 
                class="form-input">
            </div>
            
            <div class="form-row">
              <label for="description">Description:</label>
              <textarea 
                id="description" 
                [(ngModel)]="userMetadata.description" 
                placeholder="Describe this moment..."
                rows="3"
                class="form-textarea"></textarea>
            </div>
            
            <div class="form-row">
              <label for="tags">Tags:</label>
              <input 
                type="text" 
                id="tags" 
                [(ngModel)]="userMetadata.tags" 
                placeholder="sunset, beach, family (comma separated)"
                class="form-input">
            </div>
          </div>
        </div>
        
        <div class="upload-actions">
          <button class="btn-secondary" (click)="skipUpload()">
            Skip
          </button>
          
          <button class="btn-metadata" 
                  *ngIf="selectedFiles.length > 0 && !showMetadataForm && !isUploading"
                  (click)="showMetadataFormMethod()">
            Add Details
          </button>
          
          <button class="btn-secondary" 
                  *ngIf="showMetadataForm && !isUploading"
                  (click)="goBackFromMetadata()">
            Back
          </button>
          
          <button class="btn-primary" 
                  (click)="startUpload()" 
                  [disabled]="selectedFiles.length === 0 || isUploading">
            {{ isUploading ? 'Uploading...' : 'Upload Photos' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
    }
    
    .upload-modal {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(247, 113, 4, 0.5);
      animation: modalAppear 0.3s ease-out;
    }
    
    @keyframes modalAppear {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    .upload-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e41212;
      background: linear-gradient(135deg, #ffae00, #ff9900);
      color: white;
    }
    
    .upload-header h2 {
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
    
    .upload-content {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }
    
    .drag-drop-area {
      border: 3px dashed #ddd;
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .drag-drop-area:hover, .drag-drop-area.drag-over {
      border-color: #ffae00;
      background: #fff8e6;
      transform: scale(1.02);
    }
    
    .upload-placeholder {
      width: 100%;
    }
    
    .upload-icon {
      font-size: 4rem;
      margin-bottom: 15px;
    }
    
    .upload-text {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin: 10px 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .upload-subtext {
      color: #666;
      margin: 5px 0 15px;
    }
    
    .supported-formats {
      color: #999;
    }
    
    .file-preview {
      width: 100%;
    }
    
    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
    }
    
    .preview-item {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 10px;
      background: white;
      position: relative;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .preview-image {
      width: 100%;
      height: 100px;
      object-fit: cover;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    
    .file-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .file-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: #333;
      word-break: break-all;
    }
    
    .file-size {
      font-size: 0.8rem;
      color: #666;
    }
    
    .remove-file {
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(255, 0, 0, 0.8);
      color: white;
      border: none;
      border-radius: 50%;
      width: 25px;
      height: 25px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    
    .remove-file:hover {
      background: rgba(255, 0, 0, 1);
      transform: scale(1.1);
    }
    
    .upload-progress {
      margin-top: 20px;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #eee;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #ffae00, #ff9900);
      transition: width 0.3s ease;
      border-radius: 4px;
    }
    
    .progress-text {
      text-align: center;
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }
    
    .upload-actions {
      padding: 20px 24px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background: #f9f9f9;
    }
    
    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
    }
    
    .btn-metadata {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
    }
    
    .btn-metadata:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
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
    
    @media (max-width: 768px) {
      .upload-modal {
        width: 95%;
        margin: 20px;
      }
      
      .upload-header, .upload-content, .upload-actions {
        padding: 15px 20px;
      }
      
      .drag-drop-area {
        padding: 30px 15px;
        min-height: 150px;
      }
      
      .preview-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
      }
      
      .upload-actions {
        flex-direction: column;
      }
    }

    /* Metadata Form Styles */
    .metadata-form {
      margin-top: 20px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    
    .metadata-form h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.2rem;
      text-align: center;
    }
    
    .form-row {
      margin-bottom: 15px;
    }
    
    .form-row label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #555;
      font-size: 0.9rem;
    }
    
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }
    
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #ffae00;
      box-shadow: 0 0 0 3px rgba(255, 174, 0, 0.1);
    }
    
    .form-textarea {
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
    }
    
    .form-select {
      cursor: pointer;
    }
  `]
})
export class UploadModuleComponent {
  @Output() uploadComplete = new EventEmitter<File[]>();
  @Output() uploadSkipped = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  isVisible = true;
  title = 'Upload Your Moments';
  selectedFiles: File[] = [];
  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';
  uploadResults: any[] = [];
  
  // Metadata form properties
  showMetadataForm = false;
  userMetadata = {
    userName: '',
    location: '',
    eventDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    description: '',
    tags: ''
  };

  constructor(private cdr: ChangeDetectorRef, private uploadService: UploadService) {
    console.log('🔧 Upload module constructor - upload_modul.ts');
    // Initialize user metadata with default values
    this.userMetadata = {
      userName: '',
      location: '',
      eventDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      description: '',
      tags: ''
    };
    console.log('✅ Upload module initialized successfully');
  }

  closeModal(): void {
    this.isVisible = false;
    this.modalClosed.emit();
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  addFiles(files: File[]): void {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    this.selectedFiles = [...this.selectedFiles, ...imageFiles];
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  getPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async startUpload(): Promise<void> {
    if (this.selectedFiles.length === 0) return;
    
    this.isUploading = true;
    this.uploadProgress = 0;
    
    let uploadsComplete = false;
    let animationComplete = false;
    
    try {
      // Start the upload process - pass user metadata if collected
      const uploadPromise = this.uploadService.uploadToGoogleDrive(
        this.selectedFiles,
        this.showMetadataForm ? this.userMetadata : undefined
      ).then(results => {
        this.uploadResults = results;
        uploadsComplete = true;
        console.log('Uploads completed, waiting for animation...');
        return results;
      });
      
      // Start progress animation (independent of actual upload)
      const animationInterval = setInterval(() => {
        if (this.uploadProgress < 100) {
          this.uploadProgress += 12; // Slightly slower for more realistic feel
          this.cdr.detectChanges(); // Force Angular to detect the change
          
          if (this.uploadProgress >= 100) {
            this.uploadProgress = 100;
            animationComplete = true;
            console.log('Animation completed, checking uploads...');
          }
        }
        
        // Complete when both animation and uploads are done
        if (animationComplete && uploadsComplete) {
          clearInterval(animationInterval);
          this.completeUpload();
        }
      }, 250);
      
      // Wait for uploads to complete
      await uploadPromise;
      
      // If animation is still running when uploads complete, let it finish
      if (!animationComplete) {
        console.log('Uploads done, waiting for animation to complete...');
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      this.isUploading = false;
      this.uploadProgress = 0;
      this.cdr.detectChanges(); // Force change detection on error
      // Handle error - show user feedback via the UI instead of alert
      this.errorMessage = 'Upload failed. Please try again.';
    }
  }

  private completeUpload(): void {
    // Check if all uploads were successful
    const successfulUploads = this.uploadResults.filter(result => result.status === 'completed');
    const failedUploads = this.uploadResults.filter(result => result.status === 'failed');
    
    if (failedUploads.length > 0) {
      console.error('Some uploads failed:', failedUploads);
      // You can show error messages to user here
    }
    
    console.log('Upload process completed:', {
      successful: successfulUploads.length,
      failed: failedUploads.length,
      results: this.uploadResults
    });
    
    // Brief pause to show 100% completion
    setTimeout(() => {
      this.isUploading = false;
      this.uploadComplete.emit(this.selectedFiles);
      this.closeModal();
    }, 500);
  }

  skipUpload(): void {
    this.uploadSkipped.emit();
    this.closeModal();
  }

  showMetadataFormMethod(): void {
    this.showMetadataForm = true;
  }

  goBackFromMetadata(): void {
    this.showMetadataForm = false;
  }
}

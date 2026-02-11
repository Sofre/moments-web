import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../services/translations';

@Component({
  selector: 'app-share-module',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="share-modal-overlay" *ngIf="showModal" (click)="onOverlayClick($event)">
      <div class="share-modal-content" (click)="$event.stopPropagation()">
        <div class="share-modal-header">
          <h3>{{ translate('stepShare') }}</h3>
          <button class="close-btn" (click)="closeModal()">&times;</button>
        </div>
        
        <div class="share-content">
          <p class="share-description">{{ translate('stepShareDesc') }}</p>
          
          <div class="share-buttons">
            <a class="share-btn instagram-btn" [href]="shareLinks.instagram" target="_blank" rel="noopener">
              <div class="btn-icon"></div>
              <span>Instagram</span>
            </a>
            
            <a class="share-btn facebook-btn" [href]="shareLinks.facebook" target="_blank" rel="noopener">
              <div class="btn-icon"></div>
              <span>Facebook</span>
            </a>
            
            <a class="share-btn twitter-btn" [href]="shareLinks.twitter" target="_blank" rel="noopener">
              <div class="btn-icon"></div>
              <span>Twitter</span>
            </a>
            
            <a class="share-btn whatsapp-btn" [href]="shareLinks.whatsapp" target="_blank" rel="noopener">
              <div class="btn-icon"></div>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
        
        <div class="share-modal-footer">
          <p style="text-align: center; color: #666; margin: 0; font-size: 0.9rem;">Select a platform to share your moments!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .share-modal-overlay {
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
    
    .share-modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(247, 113, 4, 0.5);
    }
    
    .share-modal-header {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #eee;
      background: linear-gradient(135deg, #ffae00, #ff9900);
      color: white;
    }
    
    .share-modal-header h3 {
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
    
    .share-content {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 24px;
    }
    
    .share-description {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 1rem;
    }
    
    .share-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .share-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 15px 20px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      color: white;
    }
    
    .btn-icon {
      font-size: 1.5rem;
    }
    
    .instagram-btn {
      background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
    }
    
    .instagram-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(131, 58, 180, 0.4);
    }
    
    .facebook-btn {
      background: #1877f2;
    }
    
    .facebook-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(24, 119, 242, 0.4);
    }
    
    .twitter-btn {
      background: #1da1f2;
    }
    
    .twitter-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(29, 161, 242, 0.4);
    }
    
    .whatsapp-btn {
      background: #25d366;
    }
    
    .whatsapp-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
    }
    
    .share-modal-footer {
      padding: 20px 24px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: center;
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
      .share-modal-content {
        width: 95%;
        margin: 20px;
      }
      
      .share-modal-header,
      .share-content,
      .share-modal-footer {
        padding: 16px;
      }
      
      .share-buttons {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ShareModuleComponent {
  @Output() modalClosed = new EventEmitter<void>();
  
  showModal: boolean = true;
  shareLinks: { instagram: string; facebook: string; twitter: string; whatsapp: string } = {
    instagram: 'https://www.instagram.com/',
    facebook: '',
    twitter: '',
    whatsapp: ''
  };

  constructor(private translationService: TranslationService) {
    this.buildShareLinks();
  }

  private buildShareLinks(): void {
    const pageUrl = encodeURIComponent(window.location.href || '');
    const text = encodeURIComponent('Check out my Moments!');

    this.shareLinks.facebook = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
    this.shareLinks.twitter = `https://twitter.com/intent/tweet?text=${text}&url=${pageUrl}`;
    this.shareLinks.whatsapp = `https://api.whatsapp.com/send?text=${text}%20${pageUrl}`;
    // Instagram has no simple web intent for prefilled sharing; keep homepage as fallback
    this.shareLinks.instagram = 'https://www.instagram.com/';
  }
  
  closeModal(): void {
    this.showModal = false;
    this.modalClosed.emit();
  }
  
  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
  
  shareToInstagram(): void {
    console.log('Share to Instagram clicked');
    // Add Instagram sharing logic here
    this.closeModal();
  }
  
  shareToFacebook(): void {
    console.log('Share to Facebook clicked');
    // Add Facebook sharing logic here
    this.closeModal();
  }
  
  shareToTwitter(): void {
    console.log('Share to Twitter clicked');
    // Add Twitter sharing logic here
    this.closeModal();
  }
  
  shareToWhatsApp(): void {
    console.log('Share to WhatsApp clicked');
    // Add WhatsApp sharing logic here
    this.closeModal();
  }
  
  translate(key: string): string {
    return this.translationService.translate(key as any) || key;
  }
}

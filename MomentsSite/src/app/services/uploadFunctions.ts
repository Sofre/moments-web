 import { environment } from '../../environments/environment';

interface UploadFileMetadata {
    file: File;
    id: string;
    uploadedAt: Date;
    previewUrl: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    progress: number;
    errorMessage?: string;
    driveUrl?: string;
    driveFileId?: string;
    driveFolder?: string;
}

export interface UserMetadata {
    userName: string;
    location: string;
    eventDate: string;
    description: string;
    tags: string;
}

interface GoogleDriveUploadData {
    file: File;
    metadata: {
        originalName: string;
        size: number;
        type: string;
        uploadTimestamp: string;
        userName: string;
        category: string;
        tags: string[];
        dimensions: { width: number; height: number } | null;
        location: { lat: number; lng: number } | null;
        visibility: 'private' | 'public' | 'shared';
        eventDate?: string;
        description?: string;
        userLocation?: string;
    };
}


export class UploadService {
    // Google Drive API credentials from environment
    private googleDriveEndpoint: string = environment.googleDrive.uploadEndpoint;
    private clientId: string = environment.googleDrive.clientId;
    private clientSecret: string = environment.googleDrive.clientSecret;
    private accessToken: string = '';
    private momentsRootFolder: string = 'Moments';
    
    // Refresh token from environment (secure)
    private readonly REFRESH_TOKEN: string = environment.googleDrive.refreshToken;
    
    // Method to capture refresh token (use this once to get your token)
    async captureRefreshToken(): Promise<void> {
        const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${this.clientId}&redirect_uri=http://localhost:4200&scope=https://www.googleapis.com/auth/drive.file&response_type=code&access_type=offline&prompt=consent`;
        
        console.log('🔐 STEP 1: Go to this URL and authorize:', authUrl);
        console.log('🔐 STEP 2: Copy the "code" parameter from the redirect URL');
        console.log('🔐 STEP 3: Call exchangeCodeForTokens(code) with that code');
    }
    
    // Exchange authorization code for tokens (use this once)
    async exchangeCodeForTokens(authCode: string): Promise<void> {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code: authCode,
                grant_type: 'authorization_code',
                redirect_uri: 'http://localhost:4200'
            })
        });
        
        const tokens = await tokenResponse.json();
        console.log('🔐 YOUR REFRESH TOKEN (copy this):', tokens.refresh_token);
        console.log('🔐 Add this to your .env file as GOOGLE_REFRESH_TOKEN');
    }

    // Method to get access token using refresh token from environment (no popup needed)
    async getAccessToken(): Promise<string> {
        // If we have a refresh token from environment, use it
        if (this.REFRESH_TOKEN) {
            return this.getTokenFromRefreshToken();
        }
        
        // Fallback: Check stored token (for development/setup phase)
        const storedToken = localStorage.getItem('google_drive_token');
        if (storedToken) {
            const tokenData = JSON.parse(storedToken);
            if (tokenData.expires_at && Date.now() < tokenData.expires_at) {
                this.accessToken = tokenData.access_token;
                return this.accessToken;
            }
        }

        // If no environment token, show setup instructions
        throw new Error('Setup required: Please configure GOOGLE_REFRESH_TOKEN in environment');
    }
    
    // Get fresh access token using refresh token (no user interaction)
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
                
                // Store with expiration
                const expiresAt = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer
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

    async uploadFiles(files: File[]): Promise<UploadFileMetadata[]> {
        const uploadPromises = files.map(file => this.uploadSingleFile(file));
        return Promise.all(uploadPromises);
    }

    async uploadToGoogleDrive(files: File[], userMetadata?: UserMetadata): Promise<UploadFileMetadata[]> {
        // Get access token automatically
        try {
            await this.getAccessToken();
        } catch (error) {
            throw new Error('Failed to authenticate with Google Drive. Please try again.');
        }
        
        if (!this.accessToken) {
            throw new Error('Google Drive authentication required. Please sign in to Google Drive.');
        }

        const structuredData = this.structureUploadData(files, userMetadata);
        console.log('Structured upload data for Google Drive:', structuredData);
        
        const uploadPromises = structuredData.map(data => this.uploadToDriveStorage(data));
        return Promise.all(uploadPromises);
    }

    private structureUploadData(files: File[], userMetadata?: UserMetadata): GoogleDriveUploadData[] {
        return files.map(file => {
            // Parse tags from user input if provided
            const userTags = userMetadata?.tags 
                ? userMetadata.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                : [];
            
            // Combine system tags with user tags
            const allTags = ['user-upload', ...this.extractImageTags(file), ...userTags];
            
            return {
                file,
                metadata: {
                    originalName: file.name,
                    size: file.size,
                    type: file.type,
                    uploadTimestamp: new Date().toISOString(),
                    userName: userMetadata?.userName || 'general',
                    category: 'moment-photo',
                    tags: allTags,
                    dimensions: null, // Will be populated after image analysis
                    location: null,    // Can be populated from EXIF data
                    visibility: 'private',
                    eventDate: userMetadata?.eventDate,
                    description: userMetadata?.description,
                    userLocation: userMetadata?.location
                }
            };
        });
    }

    private extractImageTags(file: File): string[] {
        // Extract basic tags from filename and type
        const tags = ['user-upload'];
        let hasSpecificTag = false;
        
        // Check for specific content tags
        if (file.name.toLowerCase().includes('selfie')) { 
            tags.push('selfie'); 
            hasSpecificTag = true; 
        }
        if (file.name.toLowerCase().includes('group')) { 
            tags.push('group'); 
            hasSpecificTag = true; 
        }
        if (file.name.toLowerCase().includes('family')) { 
            tags.push('family'); 
            hasSpecificTag = true; 
        }
        if (file.name.toLowerCase().includes('travel')) { 
            tags.push('travel'); 
            hasSpecificTag = true; 
        }
        if (file.name.toLowerCase().includes('vacation')) { 
            tags.push('vacation'); 
            hasSpecificTag = true; 
        }
        if (file.name.toLowerCase().includes('wedding')) { 
            tags.push('wedding'); 
            hasSpecificTag = true; 
        }
        if (file.name.toLowerCase().includes('birthday')) { 
            tags.push('birthday'); 
            hasSpecificTag = true; 
        }
        
        // Fallback tags based on file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (fileExtension) {
            tags.push(fileExtension); // jpg, png, etc.
        }
        
        // Fallback tags based on file size
        if (file.size > 5000000) { // > 5MB
            tags.push('high-quality');
        } else if (file.size < 500000) { // < 500KB
            tags.push('compressed');
        }
        
        // Generic fallback tags if no specific content tags found
        if (!hasSpecificTag) {
            tags.push('memory', 'photo', 'moment');
            
            // Date-based fallback
            const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();
            tags.push(`${currentMonth}-upload`);
        }
        
        return tags;
    }
    private async uploadToDriveStorage(data: GoogleDriveUploadData): Promise<UploadFileMetadata> {
        const metadata: UploadFileMetadata = {
            file: data.file,
            id: this.generateUniqueId(),
            uploadedAt: new Date(),
            previewUrl: URL.createObjectURL(data.file),
            status: 'pending',
            progress: 0
        };

        try {
            metadata.status = 'uploading';
            
            // First, ensure folder structure exists in Google Drive
            const folderId = await this.ensureDriveFolderStructure(data.metadata);
            
            // Create file metadata for Google Drive API
            const driveMetadata = {
                name: `${this.generateUniqueId()}_${data.metadata.originalName}`,
                parents: [folderId],
                description: JSON.stringify({
                    originalName: data.metadata.originalName,
                    uploadTimestamp: data.metadata.uploadTimestamp,
                    userName: data.metadata.userName,
                    category: data.metadata.category,
                    tags: data.metadata.tags,
                    visibility: data.metadata.visibility,
                    eventDate: data.metadata.eventDate,
                    description: data.metadata.description,
                    userLocation: data.metadata.userLocation
                })
            };

            // Create multipart form data for Google Drive upload
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(driveMetadata)], { type: 'application/json' }));
            form.append('file', data.file);

            const response = await fetch(`${this.googleDriveEndpoint}?uploadType=multipart`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: form
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Google Drive upload failed with status ${response.status}: ${errorText}`);
            }

            const responseData = await response.json();
            metadata.status = 'completed';
            metadata.progress = 100;
            
            // Store Google Drive response data
            metadata.driveFileId = responseData.id;
            metadata.driveUrl = `https://drive.google.com/file/d/${responseData.id}/view`;
            metadata.driveFolder = folderId;
            
            console.log('Successfully uploaded to Google Drive:', {
                fileName: data.file.name,
                fileId: metadata.driveFileId,
                driveUrl: metadata.driveUrl,
                folderId: metadata.driveFolder
            });
            
        } catch (error) {
            metadata.status = 'failed';
            metadata.errorMessage = (error as Error).message;
            console.error('Google Drive upload error:', error);
        }

        return metadata;
    }

    private async ensureDriveFolderStructure(metadata: any): Promise<string> {
        // First, ensure Moments root folder exists
        const momentsRootId = await this.getOrCreateDriveFolder(this.momentsRootFolder, 'root');
        
        // Check if we have meaningful user data
        const hasUserName = metadata.userName && metadata.userName.trim() !== '' && metadata.userName !== 'general';
        const hasLocation = metadata.userLocation && metadata.userLocation.trim() !== '';
        
        // If no meaningful user data, create General folder inside Moments
        if (!hasUserName && !hasLocation) {
            return await this.getOrCreateDriveFolder('General', momentsRootId);
        }
        
        // Use user-provided date or current date as fallback
        let date: Date;
        if (metadata.eventDate) {
            date = new Date(metadata.eventDate);
        } else {
            date = new Date();
        }
        
        // Format date as single folder name YY-MM-DD
        const year = String(date.getFullYear()).slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateFolder = `${year}-${month}-${day}`;
        
        // Create user structure inside Moments: Username/Location/Date/Tags
        const folderHierarchy = [];
        
        // Add username (use 'General' if empty)
        const userName = hasUserName ? metadata.userName : 'General';
        folderHierarchy.push(userName);
        
        // Add location if provided
        if (hasLocation) {
            folderHierarchy.push(metadata.userLocation);
        }
        
        // Add date
        folderHierarchy.push(dateFolder);
        
        // Add first tag as folder if provided and has meaningful tags
        if (metadata.tags && metadata.tags.length > 0) {
            const firstTag = metadata.tags[0];
            if (firstTag !== 'user-upload' && firstTag.length > 0) {
                folderHierarchy.push(firstTag);
            }
        }
        
        let currentParentId = momentsRootId; // Start inside Moments folder
        
        for (const folderName of folderHierarchy) {
            currentParentId = await this.getOrCreateDriveFolder(folderName, currentParentId);
        }
        
        return currentParentId;
    }
    
    private async getOrCreateDriveFolder(folderName: string, parentId: string): Promise<string> {
        try {
            // Search for existing folder
            const searchResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder'`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
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
                    'Authorization': `Bearer ${this.accessToken}`,
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
            
        } catch (error) {
            console.error(`Error creating/finding folder ${folderName}:`, error);
            return parentId; // Fallback to parent folder
        }
    }
    private generateUniqueId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Legacy method for backward compatibility
    private async uploadSingleFile(file: File): Promise<UploadFileMetadata> {
        const structuredData = this.structureUploadData([file])[0];
        return this.uploadToDriveStorage(structuredData);
    }
    
    // === SETUP METHODS (Use these once to get your refresh token) ===
    // Call this method in browser console to get setup URL
    getSetupInstructions(): void {
        console.log('🔐 === SETUP YOUR ENVIRONMENT CONFIGURATION ===');
        console.log('Step 1: Call uploadService.captureRefreshToken()');
        console.log('Step 2: Go to the URL shown');
        console.log('Step 3: Authorize and copy the code from redirect URL');
        console.log('Step 4: Call uploadService.exchangeCodeForTokens("your_code_here")');
        console.log('Step 5: Copy the refresh token to your .env file as GOOGLE_REFRESH_TOKEN');
        console.log('Step 6: Restart your development server');
    }
}
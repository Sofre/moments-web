# MomentsSite Services Documentation

This folder contains all the core services that power the MomentsSite Angular PWA application. Below is a comprehensive overview of each service and the implemented functionality.

## 📁 Service Files Overview

### 1. `uploadFunctions.ts` - Core Upload Service
**Main Class:** `UploadService`

**Purpose:** Handles complete photo upload workflow to Google Drive with intelligent folder organization and metadata management.

**Key Features:**
- **Google Drive API Integration** with OAuth2 authentication
- **Smart Folder Organization** with dynamic structure based on user input
- **Metadata Collection** from user forms with rich tagging system
- **Progress Tracking** for upload operations
- **Error Handling** with comprehensive fallbacks

**Folder Structure Logic:**
- **Rich Structure:** `Moments/Username/Location/Date/Tags/photos`
- **Simple Fallback:** `Moments/General/photos` (for anonymous uploads)
- **Date Format:** YY-MM-DD (e.g., 26-02-03)
- **Intelligent Fallbacks:** Uses "General" when no meaningful user data provided

**Core Methods:**
- `getAccessToken()` - OAuth2 authentication with Google Drive
- `uploadToGoogleDrive(files, userMetadata)` - Main upload orchestrator
- `structureUploadData()` - Processes user metadata and file information
- `ensureDriveFolderStructure()` - Creates hierarchical folder organization
- `getOrCreateDriveFolder()` - Google Drive API folder management

**Interfaces:**
- `UserMetadata` - User input structure (userName, location, eventDate, description, tags)
- `GoogleDriveUploadData` - Complete file and metadata package
- `UploadFileMetadata` - Upload tracking and results

### 2. `translations.ts` - Multilingual Support
**Main Class:** `TranslationService`

**Purpose:** Provides comprehensive English/Macedonian language switching for the entire application.

**Key Features:**
- **Dual Language Support** (English/Macedonian)
- **Dynamic Language Switching** with localStorage persistence
- **Comprehensive Translation Coverage** for all UI elements
- **Component Integration** with easy-to-use translation methods

**Supported Sections:**
- Navigation and headers
- Homepage content (hero, gallery, how-it-works)
- Upload modal interface
- Button labels and actions
- Form fields and validation messages

### 3. `ViewPhotos.ts` - Photo Display Service
**Purpose:** Handles photo viewing and gallery functionality.

**Status:** Service placeholder for future photo viewing features including:
- Google Drive photo retrieval
- Gallery display logic
- Photo filtering and search
- Album creation and management

### 4. `QR.ts` - QR Code Service
**Purpose:** QR code generation and processing functionality.

**Status:** Service for QR code integration, likely for:
- Sharing photo albums
- Quick access links
- Mobile device pairing

### 5. `json_gcinfo/` - Google Cloud Configuration
**Contains:** `client_secret_843892357031-02muu171661ohf89gb62e6gv5rftl260.apps.googleusercontent.com.json`

**Purpose:** Google OAuth2 credentials for Drive API access
- Client ID and secret for authentication
- Redirect URIs configuration
- API scope permissions

## 🔧 Implementation Details

### Upload Workflow Architecture
1. **User Interaction** → Upload modal with drag-drop interface
2. **Metadata Collection** → Optional user form (name, location, date, tags, description)
3. **Authentication** → Automatic Google Drive OAuth2 flow
4. **Folder Creation** → Dynamic hierarchy based on user input
5. **File Upload** → Multipart Google Drive API upload with metadata
6. **Progress Tracking** → Real-time upload progress with completion animation

### Metadata Structure
```typescript
UserMetadata {
  userName: string;        // For folder organization
  location: string;        // Geographic context
  eventDate: string;       // Date picker (YYYY-MM-DD)
  description: string;     // Free text description
  tags: string;           // Comma-separated for grouping/albums
}
```

### Google Drive Integration
- **API Endpoint:** `https://www.googleapis.com/upload/drive/v3/files`
- **Authentication:** OAuth2 Bearer token with automatic refresh
- **Upload Type:** Multipart for file + metadata
- **Folder Management:** Hierarchical creation with search/create logic
- **Metadata Storage:** JSON in file description for rich search capabilities

### Folder Organization Strategy
The system creates intelligent folder structures:

**For Rich User Data:**
```
Moments/
├── John Doe/
│   ├── Paris France/
│   │   ├── 26-02-03/
│   │   │   └── vacation/
│   │   │       └── beach_sunset.jpg
```

**For Minimal Data:**
```
Moments/
├── General/
│   └── random_photo.jpg
```

### Language System Architecture
- **Storage:** Browser localStorage with fallback to English
- **Structure:** Nested object hierarchy matching UI components
- **Integration:** Injectable service with component subscription pattern
- **Switching:** Real-time language toggle with immediate UI updates

## 🚀 Future Enhancements

### Planned Features
1. **Photo Retrieval Service** - Complete ViewPhotos.ts implementation
2. **Album Creation** - Using tags for automatic grouping
3. **Search Functionality** - Metadata-based photo discovery
4. **QR Sharing** - Quick album access via QR codes
5. **Offline Support** - PWA capabilities with service worker integration
6. **Image Processing** - Automatic resizing and optimization
7. **EXIF Data Extraction** - Geographic and camera metadata

### Technical Improvements
1. **Caching Layer** - Reduce API calls with intelligent caching
2. **Batch Uploads** - Multiple file handling optimization
3. **Error Recovery** - Robust retry mechanisms
4. **Performance Monitoring** - Upload speed and success metrics
5. **Security Enhancements** - Token refresh and validation improvements

## 📊 Current Status

### ✅ Completed Features
- Google Drive OAuth2 integration
- Dynamic folder structure creation
- User metadata collection and processing
- Multilingual support (EN/MK)
- Upload progress tracking with animation
- Intelligent fallback handling
- Tag-based organization system

### 🔄 In Development
- Photo viewing and gallery display
- QR code sharing functionality
- Album creation based on tags

### 📋 Pending Implementation
- Advanced search and filtering
- Batch operation support
- Performance optimization
- Enhanced error handling

---

*This documentation reflects the current state of the MomentsSite services as of February 3, 2026.*
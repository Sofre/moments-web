# MomentsSite

**A Modern Photo Gallery Progressive Web App**

** Personal Project **

MomentsSite is a sophisticated photo management application that seamlessly integrates with Google Drive to provide a beautiful, offline-capable photo gallery experience. Built with Angular and designed as a Progressive Web App (PWA), it allows users to view, organize, and manage their photo collections with advanced caching and offline functionality.

## What It's For

MomentsSite serves as a personal photo gallery that connects directly to your Google Drive storage, providing:

- **Cloud Photo Access**: View photos stored in your Google Drive "Moments" folder
- **Offline Viewing**: Cached photos for offline access when internet is unavailable
- **Smart Organization**: Automatic photo categorization and filtering
- **Mobile-First Experience**: Installable PWA that works like a native app
- **Photo Management**: Upload, view, download, and organize photos with metadata

## Features

### Core Functionality
- **Google Drive Integration**: Secure OAuth2 authentication with Google Drive API
- **Photo Gallery**: Grid-based photo viewer with lazy loading and smooth scrolling
- **Smart Filtering**: Filter photos by categories (Nature, People, Events, All)
- **Photo Details**: View photo metadata including date, size, and custom tags
- **Offline Caching**: Intelligent caching system with 4-hour cache duration
- **Photo Download**: Download individual photos or share links

### Progressive Web App Features
- **Installable**: Add to home screen on mobile and desktop
- **Offline Support**: Service worker caches assets and photos for offline use
- **Background Sync**: Automatic photo synchronization when online
- **Push Notifications**: Photo upload status and offline notifications
- **Responsive Design**: Optimized for all screen sizes and devices

### Advanced Features
- **Album Creation**: Organize photos into custom albums and folders
- **Photo Upload**: Drag-and-drop upload with progress tracking
- **Search & Tags**: Search photos by metadata, tags, and descriptions
- **Photo Sharing**: Generate shareable links for individual photos
- **Batch Operations**: Select and manage multiple photos at once

### Technical Features
- **Server-Side Rendering**: Pre-rendered pages for better SEO and performance
- **Service Worker**: Advanced caching strategies for optimal loading
- **Lazy Loading**: Images load progressively for better performance
- **Error Handling**: Graceful fallbacks and retry mechanisms
- **TypeScript**: Fully typed codebase for better development experience

## Version 1.0 Production - Changes Incoming 

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `docs/` directory, optimized for GitHub Pages deployment. The build includes:

- Asset optimization and minification
- Service worker generation for offline support
- PWA manifest configuration
- Automatic asset copying from `public/` folder

For production builds with service worker and PWA optimization:

```bash
ng build --configuration production
```

## Production Server

To serve the production build locally with service worker support:

```bash
npm install -g http-server
http-server docs
```

Then open your browser to `http://localhost:8080` and install the PWA.

For GitHub Pages deployment, the app is automatically served from the `docs/` folder.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

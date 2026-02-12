export interface Translation {
  // Navigation
  home: string;
  about: string;
  gallery: string;
  contact: string;
  
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  getStarted: string;
  learnMore: string;
  
 
  
  // Gallery
  showcaseTitle: string;
  familyGathering: string;
  sunsetVibes: string;
  beachDay: string;
  mountainPeak: string;
  cityLights: string;
  goldenHour: string;
  

  
  // How It Works
  howItWorksTitle: string;
  stepUpload: string;
  stepUploadDesc: string;
  stepOrganize: string;
  stepOrganizeDesc: string;
  stepShare: string;
  stepShareDesc: string;
  stepEnjoy: string;
  stepEnjoyDesc: string;
  
  // Albums
  createAlbum: string;
  albumTitle: string;
  albumTitlePlaceholder: string;
  albumTags: string;
  albumTagsPlaceholder: string;
  albumTagsHelp: string;
  createAlbumBtn: string;
  cancel: string;
  skip: string;
  myAlbums: string;
  noAlbumsYet: string;
  createFirstAlbum: string;
  viewAlbum: string;
  editAlbum: string;
  deleteAlbum: string;
  removeAlbum: string;
  confirmRemoveAlbum: string;
  albumPhotos: string;
  
  // Photo Selection & Upload
  selectPhotos: string;
  selectedPhotos: string;
  photoSelected: string;
  photosSelected: string;
  noPhotosSelected: string;
  uploadingPhotos: string;
  uploadComplete: string;
  uploadFailed: string;
  loading: string;
  loadingPhotos: string;
  loadingAlbums: string;
  copyingPhotos: string;
  creatingAlbum: string;
  albumCreated: string;
  albumCreationFailed: string;
  
  // Error Messages
  errorLoadingPhotos: string;
  errorCreatingAlbum: string;
  errorCopyingPhotos: string;
  authenticationRequired: string;
  tryAgain: string;
  
  // Success Messages
  photosAddedToAlbum: string;
  albumSuccessfullyCreated: string;

  Photos: string;
  Back: string;
  
  // Footer
  aboutUs: string;
  blog: string;
  careers: string;
  helpCenter: string;
  faq: string;
  privacyPolicy: string;
  termsOfService: string;
  cookiePolicy: string;
  followUs: string;
  allRightsReserved: string;
  
  // Upload Module
  uploadTitle: string;
  dragDropText: string;
  orClickToBrowse: string;
  supportedFormats: string;
  uploading: string;
  addDetailsTitle: string;
  yourName: string;
  location: string;
  date: string;
  description: string;
  tags: string;
  tagsPlaceholder: string;
  addDetails: string;
  back: string;
  uploadPhotos: string;
  uploadingBtn: string;
}

export const translations: Record<string, Translation> = {
  en: {
    // Navigation
    home: 'Home',
    about: 'About',
    gallery: 'Gallery',
    contact: 'Contact',
    
    // Hero Section
    heroTitle: 'Moments',
    heroSubtitle: 'Our Moments, Our Stories',
    getStarted: 'Get Started',
    learnMore: 'How It Works',

    //Gallery Site
    Photos: 'Photos',
    Back: 'Back',
    
  
    
    // Gallery
    showcaseTitle: 'Showcase Your Moments',
    familyGathering: 'Family Gathering',
    sunsetVibes: 'Sunset Vibes',
    beachDay: 'Beach Day',
    mountainPeak: 'Mountain Peak',
    cityLights: 'City Lights',
    goldenHour: 'Golden Hour',
    
  
    
    // How It Works
    howItWorksTitle: 'How It Works',
    stepUpload: 'Upload',
    stepUploadDesc: 'Select and upload your favorite moments',
    stepOrganize: 'Organize',
    stepOrganizeDesc: 'Create albums and organize by memories',
    stepShare: 'Share',
    stepShareDesc: 'Share with friends and family securely',
    stepEnjoy: 'Enjoy',
    stepEnjoyDesc: 'Relive your best memories anytime',
    
    // Albums
    createAlbum: 'Create Album',
    albumTitle: 'Album Title',
    albumTitlePlaceholder: 'Enter album title...',
    albumTags: 'Tags (required)',
    albumTagsPlaceholder: 'vacation, family, summer (separated by commas)',
    albumTagsHelp: 'Photos with matching tags will automatically appear in this album',
    createAlbumBtn: 'Create Album',
    cancel: 'Cancel',
    skip: 'Skip',
    myAlbums: 'My Albums',
    noAlbumsYet: 'No albums yet',
    createFirstAlbum: 'Create your first album to get started!',
    viewAlbum: 'View Album',
    editAlbum: 'Edit Album',
    deleteAlbum: 'Delete Album',
    removeAlbum: 'Remove Album',
    confirmRemoveAlbum: 'Are you sure you want to remove this album? This action cannot be undone.',
    albumPhotos: 'photos',
    
    // Photo Selection & Upload
    selectPhotos: 'Select Photos',
    selectedPhotos: 'Selected Photos',
    photoSelected: '1 photo selected',
    photosSelected: 'photos selected',
    noPhotosSelected: 'No photos selected',
    uploadingPhotos: 'Uploading photos...',
    uploadComplete: 'Upload complete!',
    uploadFailed: 'Upload failed',
    loading: 'Loading...',
    loadingPhotos: 'Loading photos...',
    loadingAlbums: 'Loading albums...',
    copyingPhotos: 'Copying photos to album...',
    creatingAlbum: 'Creating album...',
    albumCreated: 'Album created successfully!',
    albumCreationFailed: 'Failed to create album',
    
    // Error Messages
    errorLoadingPhotos: 'Error loading photos. Please try again.',
    errorCreatingAlbum: 'Error creating album. Please check your connection.',
    errorCopyingPhotos: 'Some photos could not be added to the album.',
    authenticationRequired: 'Authentication required. Please sign in.',
    tryAgain: 'Try Again',
    
    // Success Messages
    photosAddedToAlbum: 'Photos successfully added to album!',
    albumSuccessfullyCreated: 'Album created and photos added successfully!',
    
    // Footer
    aboutUs: 'About Us',
    blog: 'Blog',
    careers: 'Careers',
    helpCenter: 'Help Center',
    faq: 'FAQ',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    cookiePolicy: 'Cookie Policy',
    followUs: 'Follow Us',
    allRightsReserved: 'All rights reserved.',
    
    // Upload Module
    uploadTitle: 'Upload Your Moments',
    dragDropText: 'Drag & Drop your photos here',
    orClickToBrowse: 'or click to browse',
    supportedFormats: 'Supports: JPG, PNG, GIF, WEBP',
    uploading: 'Uploading...',
    addDetailsTitle: 'Add Details to Your Moments',
    yourName: 'Your Name:',
    location: 'Location:',
    date: 'Date:',
    description: 'Description:',
    tags: 'Tags:',
    tagsPlaceholder: 'sunset, beach, family (comma separated)',
    addDetails: 'Add Details',
    back: 'Back',
    uploadPhotos: 'Upload Photos',
    uploadingBtn: 'Uploading...'
  },
  
  mk: {
    // Navigation
    home: 'Дома',
    about: 'За нас',
    gallery: 'Галерија',
    contact: 'Контакт',
    
    // Hero Section
    heroTitle: 'Моменти',
    heroSubtitle: 'Нашите моменти, нашите приказни',
    getStarted: 'Започнете',
    learnMore: 'Kако функционира',
    
  
    // Gallery
    showcaseTitle: 'Прикажете ги Вашите Моменти',
    familyGathering: 'Семејно Собирање',
    sunsetVibes: 'Вибрации на Залез',
    beachDay: 'Ден на Плажа',
    mountainPeak: 'Планински Врв',
    cityLights: 'Градски Светлини',
    goldenHour: 'Златен Час',


    Photos: 'Слики',
    Back: 'Назад',
    

    
    // How It Works
    howItWorksTitle: 'Како Функционира ? ( За Бетка и Софре )',
    stepUpload: 'Прикачете',
    stepUploadDesc: 'Селектирајте и качете ги вашите омилени моменти',
    stepOrganize: 'Организирајте',
    stepOrganizeDesc: 'Создајте албуми и организирајте според спомените',
    stepShare: 'Споделете',
    stepShareDesc: 'Споделете со пријатели и семејство безбедно',
    stepEnjoy: 'Уживајте',
    stepEnjoyDesc: 'Преживејте ги вашите најдобри спомени во секое време',
    
    // Albums
    createAlbum: 'Создај Албум',
    albumTitle: 'Назив на Албум',
    albumTitlePlaceholder: 'Внесете назив на албумот...',
    albumTags: 'Ознаки (задолжително)',
    albumTagsPlaceholder: 'одмор, семејство, лето (одделени со запирка)',
    albumTagsHelp: 'Фотографиите со соодветни ознаки автоматски ќе се појават во овој албум',
    createAlbumBtn: 'Создај Албум',
    cancel: 'Откажи',
    skip: 'Прескокни',
    myAlbums: 'Мои Албуми',
    noAlbumsYet: 'Сеуште нема албуми',
    createFirstAlbum: 'Создајте го вашиот прв албум за да започнете!',
    viewAlbum: 'Види Албум',
    editAlbum: 'Уреди Албум',
    deleteAlbum: 'Избриши Албум',
    removeAlbum: 'Отстрани Албум',
    confirmRemoveAlbum: 'Дали сте сигурни дека сакате да го отстраните овој албум? Ова дејство не може да се поврати.',
    albumPhotos: 'фотографии',
    
    // Photo Selection & Upload
    selectPhotos: 'Избери Фотографии',
    selectedPhotos: 'Избрани Фотографии',
    photoSelected: '1 фотографија избрана',
    photosSelected: 'фотографии избрани',
    noPhotosSelected: 'Нема избрани фотографии',
    uploadingPhotos: 'Се прикачуваат фотографиите...',
    uploadComplete: 'Прикачувањето завршено!',
    uploadFailed: 'Прикачувањето не успеа',
    loading: 'Се вчитува...',
    loadingPhotos: 'Се вчитуваат фотографиите...',
    loadingAlbums: 'Се вчитуваат албумите...',
    copyingPhotos: 'Се копираат фотографиите во албумот...',
    creatingAlbum: 'Се создава албум...',
    albumCreated: 'Албумот успешно е создаден!',
    albumCreationFailed: 'Не успеа да се создаде албумот',
    
    // Error Messages
    errorLoadingPhotos: 'Грешка при вчитувањето на фотографиите. Обидете се повторно.',
    errorCreatingAlbum: 'Грешка при создавањето на албумот. Проверете ја врската.',
    errorCopyingPhotos: 'Некои фотографии не можеа да се додадат во албумот.',
    authenticationRequired: 'Потребна е автентификација. Ве молиме најавете се.',
    tryAgain: 'Обиди се Повторно',
    
    // Success Messages
    photosAddedToAlbum: 'Фотографиите успешно се додадени во албумот!',
    albumSuccessfullyCreated: 'Албумот е создаден и фотографиите се додадени успешно!',
    
    // Footer
    aboutUs: 'За Нас',
    blog: 'Блог',
    careers: 'Кариери',
    helpCenter: 'Центар за Помош',
    faq: 'Често Поставувани Прашања',
    privacyPolicy: 'Политика за Приватност',
    termsOfService: 'Услови за Користење',
    cookiePolicy: 'Политика за Колачиња',
    followUs: 'Следете не',
    allRightsReserved: 'Сите права се задржани.',
    
    // Upload Module
    uploadTitle: 'Прикачете ги Вашите Моменти',
    dragDropText: 'Повлечете и пуштете ги вашите фотографии овде',
    orClickToBrowse: 'или кликнете за да пребарувате',
    supportedFormats: 'Поддржува: JPG, PNG, GIF, WEBP',
    uploading: 'Се прикачува...',
    addDetailsTitle: 'Додадете Детали на Вашите Моменти',
    yourName: 'Вашето Име:',
    location: 'Локација:',
    date: 'Датум:',
    description: 'Опис:',
    tags: 'Ознаки:',
    tagsPlaceholder: 'залез, плажа, семејство (одделени со запирка)',
    addDetails: 'Додадете Детали',
    back: 'Назад',
    uploadPhotos: 'Прикачете Фотографии',
    uploadingBtn: 'Се прикачува...'
  }
};

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage: string = 'en';
  
  setLanguage(language: string): void {
    if (translations[language]) {
      this.currentLanguage = language;
    }
  }
  
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
  
  toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'en' ? 'mk' : 'en';
  }
  
  translate(key: keyof Translation): string {
    return translations[this.currentLanguage][key] || translations['en'][key];
  }
  
  getAvailableLanguages(): string[] {
    return Object.keys(translations);
  }
}

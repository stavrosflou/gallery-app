import { Component, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GalleryService } from '../services/gallery.service';
import { register } from 'swiper/element/bundle';

// Register Swiper custom elements
register();

interface ImageItem {
  id: number;
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
  title: string;
}

interface Quote {
  text: string;
  author: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  images: ImageItem[] = [];
  selectedQuote: Quote = { text: '', author: '' };

  quotes: Quote[] = [
    { text: "Art enables us to find ourselves and lose ourselves at the same time.", author: "Thomas Merton" },
    { text: "Every artist was first an amateur.", author: "Ralph Waldo Emerson" },
    { text: "Art is not what you see, but what you make others see.", author: "Edgar Degas" },
    { text: "The purpose of art is washing the dust of daily life off our souls.", author: "Pablo Picasso" },
    { text: "Art should comfort the disturbed and disturb the comfortable.", author: "Cesar A. Cruz" },
    { text: "Creativity takes courage.", author: "Henri Matisse" },
    { text: "Art is the lie that enables us to realize the truth.", author: "Pablo Picasso" },
    { text: "Every canvas is a journey all its own.", author: "Helen Frankenthaler" },
    { text: "Art speaks where words are unable to explain.", author: "Mathiole" },
    { text: "The artist sees what others only catch a glimpse of.", author: "Leonardo da Vinci" }
  ];

  constructor(
    private galleryService: GalleryService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    // Select a random quote
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    this.selectedQuote = this.quotes[randomIndex];

    // Fetch random images from backend
    this.galleryService.getRandomImages().subscribe((data) => {
      this.images = data.map((item: any) => ({
        id: item.id,
        itemImageSrc: item.url,
        thumbnailImageSrc: item.url,
        alt: item.title,
        title: item.title
      }));
    });
  }

  ngAfterViewInit() {
    // Initialize Swiper after view is ready
    const swiperEl = this.swiperContainer.nativeElement;
    
    // Check if it's a mobile device
    const isMobile = window.innerWidth <= 768;
    
    const swiperParams = {
      navigation: {
        enabled: !isMobile, // Disable navigation on mobile
      },
      pagination: {
        clickable: true,
      },
      loop: true,
      slidesPerView: 1,
      spaceBetween: 0,
      centeredSlides: true,
      grabCursor: false,
      allowTouchMove: isMobile, // Only allow swipe on mobile
      simulateTouch: isMobile, // Only simulate touch on mobile
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      breakpoints: {
        // Ensure single slide on all screen sizes
        0: {
          slidesPerView: 1,
          spaceBetween: 0,
        },
        768: {
          slidesPerView: 1,
          spaceBetween: 0,
        },
        1024: {
          slidesPerView: 1,
          spaceBetween: 0,
        }
      }
    };

    Object.assign(swiperEl, swiperParams);
    swiperEl.initialize();

    // Add click event listener after initialization
    swiperEl.addEventListener('click', (event: any) => {
      const target = event.target;
      
      // Check if click is on image or image wrapper and not on navigation buttons or pagination
      if ((target.tagName === 'IMG' || target.classList.contains('image-wrapper')) && 
          !target.closest('.swiper-button-prev') && 
          !target.closest('.swiper-button-next') &&
          !target.closest('.swiper-pagination')) {
        const swiper = swiperEl.swiper;
        const activeIndex = swiper.realIndex;
        const imageId = this.images[activeIndex]?.id;
        console.log('Navigating to painting:', imageId, 'from index:', activeIndex);
        if (imageId) {
          this.ngZone.run(() => {
            console.log('About to navigate to:', `/paintings/${imageId}`);
            this.router.navigate(['/paintings', imageId]).then(success => {
              console.log('Navigation result:', success);
            }).catch(error => {
              console.error('Navigation error:', error);
            });
          });
        }
      }
    });
  }

  goToGallery() {
    this.router.navigate(['/paintings']);
  }

  goToPainting(id: number) {
    this.router.navigate(['/paintings', id]);
  }
}

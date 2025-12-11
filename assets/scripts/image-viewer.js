/**
 * Full-Screen Image Viewer
 * A modular component for viewing images in full-screen mode
 * Works with any image on the site
 */

class ImageViewer {
  constructor() {
    this.isOpen = false;
    this.currentImageIndex = 0;
    this.images = [];
    this.init();
  }

  init() {
    // Create viewer HTML
    this.createViewer();

    // Attach event listeners
    this.attachEventListeners();

    // Make all images on the page clickable
    this.makeImagesClickable();
  }

  createViewer() {
    const viewerHTML = `
      <div id="image-viewer-overlay" class="image-viewer-overlay">
        <div class="image-viewer-container">
          <button class="image-viewer-close" aria-label="Close viewer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <button class="image-viewer-prev" aria-label="Previous image">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <button class="image-viewer-next" aria-label="Next image">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <div class="image-viewer-content">
            <img id="image-viewer-img" src="" alt="">
            <div class="image-viewer-caption"></div>
            <div class="image-viewer-counter"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', viewerHTML);

    // Get references
    this.overlay = document.getElementById('image-viewer-overlay');
    this.img = document.getElementById('image-viewer-img');
    this.caption = this.overlay.querySelector('.image-viewer-caption');
    this.counter = this.overlay.querySelector('.image-viewer-counter');
    this.closeBtn = this.overlay.querySelector('.image-viewer-close');
    this.prevBtn = this.overlay.querySelector('.image-viewer-prev');
    this.nextBtn = this.overlay.querySelector('.image-viewer-next');
  }

  attachEventListeners() {
    // Close button
    this.closeBtn.addEventListener('click', () => this.close());

    // Navigation buttons
    this.prevBtn.addEventListener('click', () => this.showPrevious());
    this.nextBtn.addEventListener('click', () => this.showNext());

    // Click outside image to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      switch(e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          this.showPrevious();
          break;
        case 'ArrowRight':
          this.showNext();
          break;
      }
    });
  }

  makeImagesClickable() {
    // Add click handlers to all images
    document.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img) return;

      // Skip if image is in navigation or is a logo
      if (img.closest('.navbar-container, .footer-contacts, .navbar-item')) return;

      // Open viewer
      this.openWithImage(img);
    });
  }

  openWithImage(clickedImg) {
    // Get all images in the same container
    const container = clickedImg.closest('.slide-gallery-marquee-container, .custom-images-container, .content, article, main, .post-container') || document.body;
    this.images = Array.from(container.querySelectorAll('img')).filter(img => {
      // Exclude navigation and logo images
      return !img.closest('.navbar-container, .footer-contacts, .navbar-item');
    });

    // Find index of clicked image
    this.currentImageIndex = this.images.indexOf(clickedImg);

    // Show the image
    this.show(this.currentImageIndex);
  }

  show(index) {
    if (index < 0 || index >= this.images.length) return;

    this.currentImageIndex = index;
    const img = this.images[index];

    // Set image source
    this.img.src = img.src;
    this.img.alt = img.alt || '';

    // Set caption
    const caption = img.getAttribute('title') || img.getAttribute('alt') || '';
    this.caption.textContent = caption;

    // Set counter
    if (this.images.length > 1) {
      this.counter.textContent = `${index + 1} / ${this.images.length}`;
    } else {
      this.counter.textContent = '';
    }

    // Show/hide navigation buttons
    this.prevBtn.style.display = this.images.length > 1 ? 'flex' : 'none';
    this.nextBtn.style.display = this.images.length > 1 ? 'flex' : 'none';

    // Open overlay
    this.overlay.classList.add('active');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  showPrevious() {
    const newIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
    this.show(newIndex);
  }

  showNext() {
    const newIndex = (this.currentImageIndex + 1) % this.images.length;
    this.show(newIndex);
  }

  close() {
    this.overlay.classList.remove('active');
    this.isOpen = false;
    document.body.style.overflow = '';
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.imageViewer = new ImageViewer();
  });
} else {
  window.imageViewer = new ImageViewer();
}

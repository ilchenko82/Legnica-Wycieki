/* ==========================================================================
   WyciekiPro — Main JavaScript
   Header scroll, mobile menu, scroll reveal, counter animation, lightbox
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Header scroll effect ───────────────────────────────────────────────
  const header = document.getElementById('header');
  let lastScroll = 0;

  function updateHeader() {
    if (!header) return;
    const currentScroll = window.scrollY;
    if (currentScroll > 60 || document.body.classList.contains('always-scrolled')) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // Run on load

  // ── Mobile menu ────────────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active');

      if (isOpen) {
        // Compensate for scrollbar disappearing
        const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = scrollbarW + 'px';
        header.style.paddingRight = scrollbarW + 'px';
        const backLink = document.querySelector('.back-link-fixed');
        if (backLink) backLink.style.display = 'none';
      } else {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        header.style.paddingRight = '';
        const backLink = document.querySelector('.back-link-fixed');
        if (backLink) backLink.style.display = '';
      }
    });

    // Close on link click
    mobileMenu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        header.style.paddingRight = '';
        const backLink = document.querySelector('.back-link-fixed');
        if (backLink) backLink.style.display = '';
      });
    });
  }

  // ── Smooth scroll for nav links ────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Scroll Reveal (IntersectionObserver) ───────────────────────────────
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show everything
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // ── Counter Animation ──────────────────────────────────────────────────
  const counters = document.querySelectorAll('.counter-animated');

  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // ── Language Switcher (stub) ───────────────────────────────────────────
  const langBtns = document.querySelectorAll('.lang-switch__btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // TODO: implement i18n translation swap
    });
  });

  // ── Modal Form ─────────────────────────────────────────────────────────
  const modalForm = document.getElementById('modal-contact-form');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = modalForm.querySelector('.modal__submit');
      const originalText = btn.textContent;
      
      btn.textContent = 'Wysyłanie...';
      btn.disabled = true;

      const formData = new FormData(modalForm);

      fetch('send.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if(data.success) {
          btn.textContent = '✓ Wysłano!';
          btn.style.background = 'var(--color-success)';
          btn.style.borderColor = 'var(--color-success)';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.disabled = false;
            modalForm.reset();
            closeModal();
          }, 2000);
        } else {
          alert('Błąd: ' + (data.message || 'Nie udało się wysłać formularza.'));
          btn.textContent = originalText;
          btn.disabled = false;
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Wystąpił błąd podczas wysyłania.');
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  }

  // ── Dynamic Google Reviews ──────────────────────────────────────────────
  function initDynamicReviews() {
    const reviewsSection = document.getElementById('reviews');
    if (!reviewsSection) return;

    const ratingNum = document.getElementById('reviews-rating-num');
    const ratingCount = document.getElementById('reviews-rating-count');
    const reviewsGrid = document.getElementById('reviews-grid');
    const carouselViewport = document.getElementById('reviews-carousel-viewport');
    const gridCompact = document.getElementById('reviews-grid-compact');
    
    const writeBtns = document.querySelectorAll('.google-review-btn');
    const mapsBtns = document.querySelectorAll('.google-maps-btn');

    const lang = document.documentElement.lang || 'pl';

    const renderData = (data) => {
      // Update general rating and count if elements exist
      if (ratingNum && data.rating) {
        ratingNum.textContent = data.rating.toFixed(1);
      }
      if (ratingCount && data.reviews_count) {
        if (lang === 'en') {
          ratingCount.textContent = `based on ${data.reviews_count} Google reviews`;
        } else {
          ratingCount.textContent = `na podstawie ${data.reviews_count} opinii Google`;
        }
      }

      // Update links
      if (data.write_review_url) {
        writeBtns.forEach(btn => btn.setAttribute('href', data.write_review_url));
      }
      if (data.google_maps_url) {
        mapsBtns.forEach(btn => btn.setAttribute('href', data.google_maps_url));
      }

      // ── Render Option A: Carousel Slider ──
      if (carouselViewport && data.reviews && data.reviews.length > 0) {
        carouselViewport.innerHTML = ''; // clear

        data.reviews.forEach(review => {
          const card = document.createElement('div');
          card.className = 'review-card';

          const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
          const textContent = typeof review.text === 'object' ? (review.text[lang] || review.text['pl']) : review.text;
          const dateContent = typeof review.date === 'object' ? (review.date[lang] || review.date['pl']) : review.date;
          
          let avatarHTML = '';
          if (review.avatar_img) {
            avatarHTML = `<img src="${review.avatar_img}" alt="${review.author}" class="review-card__avatar-img">`;
          } else {
            const letter = review.avatar || (review.author ? review.author.charAt(0) : 'U');
            avatarHTML = `<div class="review-card__avatar">${letter}</div>`;
          }

          card.innerHTML = `
            <div class="review-card__header">
              ${avatarHTML}
              <div>
                <div class="review-card__name">${review.author}</div>
                <div class="review-card__date">${dateContent}</div>
              </div>
            </div>
            <div class="review-card__stars">${stars}</div>
            <p class="review-card__text">"${textContent}"</p>
            <div class="review-card__source">📍 Google Reviews</div>
          `;
          carouselViewport.appendChild(card);
        });

        // Carousel Arrow Logic
        const prevBtn = document.getElementById('reviews-carousel-prev');
        const nextBtn = document.getElementById('reviews-carousel-next');
        if (prevBtn && nextBtn) {
          const getScrollAmount = () => {
            const firstCard = carouselViewport.firstElementChild;
            const gap = parseFloat(window.getComputedStyle(carouselViewport).gap) || 12;
            return firstCard ? firstCard.clientWidth + gap : 320; // card width + gap
          };
          prevBtn.addEventListener('click', () => {
            carouselViewport.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
          });
          nextBtn.addEventListener('click', () => {
            carouselViewport.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
          });
        }
      }

      // ── Render Option B: Compact Grid ──
      if (gridCompact && data.reviews && data.reviews.length > 0) {
        gridCompact.innerHTML = ''; // clear

        data.reviews.forEach(review => {
          const card = document.createElement('div');
          card.className = 'review-card--compact';

          const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
          const textContent = typeof review.text === 'object' ? (review.text[lang] || review.text['pl']) : review.text;
          const dateContent = typeof review.date === 'object' ? (review.date[lang] || review.date['pl']) : review.date;
          
          let avatarHTMLCompact = '';
          if (review.avatar_img) {
            avatarHTMLCompact = `<img src="${review.avatar_img}" alt="${review.author}" class="review-card__avatar-img" style="width:28px; height:28px; border-radius:50%; object-fit:cover;">`;
          } else {
            const letter = review.avatar || (review.author ? review.author.charAt(0) : 'U');
            avatarHTMLCompact = `<div class="review-card__avatar">${letter}</div>`;
          }

          card.innerHTML = `
            <div class="review-card__header">
              <div class="review-card__author-info">
                ${avatarHTMLCompact}
                <div style="margin-left: 8px;">
                  <div class="review-card__name" style="font-weight:600; color:var(--color-text); line-height:1.2;">${review.author}</div>
                  <div class="review-card__date" style="color:var(--color-text-muted); line-height:1.2;">${dateContent}</div>
                </div>
              </div>
              <div class="review-card__stars" style="color: hsl(45, 100%, 50%);">${stars}</div>
            </div>
            <p class="review-card__text">"${textContent}"</p>
            <div class="review-card__source">📍 Google Reviews</div>
          `;
          gridCompact.appendChild(card);
        });
      }

      // Standard dynamic backup for original block (if present)
      if (reviewsGrid && data.reviews && data.reviews.length > 0) {
        reviewsGrid.innerHTML = '';
        data.reviews.forEach(review => {
          const card = document.createElement('div');
          card.className = 'review-card';
          const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
          const textContent = typeof review.text === 'object' ? (review.text[lang] || review.text['pl']) : review.text;
          const dateContent = typeof review.date === 'object' ? (review.date[lang] || review.date['pl']) : review.date;
          let avatarHTML = '';
          if (review.avatar_img) {
            avatarHTML = `<img src="${review.avatar_img}" alt="${review.author}" class="review-card__avatar-img" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">`;
          } else {
            const letter = review.avatar || (review.author ? review.author.charAt(0) : 'U');
            avatarHTML = `<div class="review-card__avatar">${letter}</div>`;
          }
          card.innerHTML = `
            <div class="review-card__header">
              ${avatarHTML}
              <div>
                <div class="review-card__name">${review.author}</div>
                <div class="review-card__date">${dateContent}</div>
              </div>
            </div>
            <div class="review-card__stars">${stars}</div>
            <p class="review-card__text">"${textContent}"</p>
            <div class="review-card__source">📍 Google Reviews</div>
          `;
          reviewsGrid.appendChild(card);
        });
      }
    };

    // If reviewsData script is already loaded globally, render instantly (works offline and via file:// protocol!)
    if (window.reviewsData) {
      console.log('[Reviews] Rendering dynamically from loaded window.reviewsData script.');
      renderData(window.reviewsData);
    } else {
      console.log('[Reviews] reviewsData script not found. Fetching data/reviews.json...');
      fetch('data/reviews.json')
        .then(response => response.json())
        .then(data => {
          renderData(data);
        })
        .catch(err => {
          console.warn('Could not load dynamic reviews from JSON, using HTML static fallback:', err);
        });
    }
  }

  initDynamicReviews();

});

// ── Lightbox ───────────────────────────────────────────────────────────────
let currentGalleryIndex = -1;
let galleryItems = [];

function initGalleryItems() {
  galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
}

function openLightbox(item) {
  if (galleryItems.length === 0) initGalleryItems();
  currentGalleryIndex = galleryItems.indexOf(item);
  
  const img = item.querySelector('img');
  const label = item.querySelector('.gallery__item-label');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');

  if (img && lightbox) {
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = label ? label.textContent : '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function updateLightbox() {
  if (currentGalleryIndex < 0 || currentGalleryIndex >= galleryItems.length) return;
  const item = galleryItems[currentGalleryIndex];
  const img = item.querySelector('img');
  const label = item.querySelector('.gallery__item-label');
  
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  
  if (lbImg && img) {
    lbImg.src = img.src;
    lbImg.alt = img.alt;
  }
  if (lbCaption) {
    lbCaption.textContent = label ? label.textContent : '';
  }
}

window.nextGalleryImage = function(e) {
  if (e) e.stopPropagation();
  if (galleryItems.length === 0) return;
  if (currentGalleryIndex < galleryItems.length - 1) {
    currentGalleryIndex++;
  } else {
    currentGalleryIndex = 0;
  }
  updateLightbox();
};

window.prevGalleryImage = function(e) {
  if (e) e.stopPropagation();
  if (galleryItems.length === 0) return;
  if (currentGalleryIndex > 0) {
    currentGalleryIndex--;
  } else {
    currentGalleryIndex = galleryItems.length - 1;
  }
  updateLightbox();
};

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

// Swipe handling for lightbox
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox && lightbox.classList.contains('open')) {
    touchStartX = e.changedTouches[0].screenX;
  }
}, { passive: true });

document.addEventListener('touchend', e => {
  const lightbox = document.getElementById('lightbox');
  if (lightbox && lightbox.classList.contains('open')) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }
}, { passive: true });

let isSwipe = false;

function handleSwipe() {
  const threshold = 50;
  if (touchEndX < touchStartX - threshold) {
    isSwipe = true;
    window.nextGalleryImage();
    setTimeout(() => isSwipe = false, 100);
  } else if (touchEndX > touchStartX + threshold) {
    isSwipe = true;
    window.prevGalleryImage();
    setTimeout(() => isSwipe = false, 100);
  }
}

// ── Modal Form ────────────────────────────────────────────────────────────
function openModal(e) {
  // Prevent any anchor from navigating / scrolling to #contact
  if (e && e.preventDefault) e.preventDefault();

  const modal = document.getElementById('modal-form');
  if (!modal) return;

  // Lock scroll without jumping: fix the body at current position
  const scrollY = window.scrollY;
  document.body.style.top = `-${scrollY}px`;
  document.body.style.overflow = 'hidden';
  document.body.dataset.scrollY = scrollY;

  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('modal-form');
  if (!modal) return;

  modal.classList.remove('open');

  // Restore scroll position
  const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
  document.body.style.overflow = '';
  document.body.style.top = '';
  window.scrollTo({ top: scrollY, behavior: 'instant' });
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const modal = document.getElementById('modal-form');
  
  if (lightbox && lightbox.classList.contains('open')) {
    // If user clicked the image or the backdrop, and it wasn't a swipe, close it.
    if ((e.target === lightbox || e.target === lbImg) && !isSwipe) {
      closeLightbox();
    }
  }
  
  if (modal && e.target === modal) closeModal();
});

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  const isLightboxOpen = lightbox && lightbox.classList.contains('open');

  if (e.key === 'Escape') {
    closeLightbox();
    closeModal();
  } else if (isLightboxOpen) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
      window.nextGalleryImage();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
      window.prevGalleryImage();
    }
  }
});

/**
 * @module TestimonialsSlider
 * @description Handles the horizontal scrolling testimonial slider and its dot navigation.
 */

const SELECTOR_SLIDER = '[data-testimonial-slider]';
const SELECTOR_DOTS = '[data-testimonial-dots]';

export function initTestimonials() {
  const slider = document.querySelector(SELECTOR_SLIDER);
  const dotsContainer = document.querySelector(SELECTOR_DOTS);

  if (!slider || !dotsContainer) return;

  const slides = Array.from(slider.children);
  const totalSlides = slides.length;

  // Create dots
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot';
    if (index === 0) dot.classList.add('is-active');
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function goToSlide(index) {
    slides[index].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  function updateActiveDot() {
    const scrollPosition = slider.scrollLeft;
    const slideWidth = slider.clientWidth;
    const activeIndex = Math.round(scrollPosition / slideWidth);

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
    });
  }

  // Use IntersectionObserver to update dots more reliably, or scroll event with debounce
  // Scroll event is simpler here since it's a native scroll container
  let isScrolling;
  slider.addEventListener('scroll', () => {
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(() => {
      updateActiveDot();
    }, 66);
  });
}

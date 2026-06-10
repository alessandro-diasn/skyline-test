/**
 * @module HeroSlider
 * @description Premium hero slider — cross-fade with staggered content
 * animations, progress bar, dot indicators, swipe support, and ARIA management.
 */

// ── Constants ────────────────────────────────────────────────────────────────
const AUTOPLAY_DURATION = 6000;

// ── State ─────────────────────────────────────────────────────────────────────
let state = {
  current: 0,
  total: 0,
  timer: null,
  progressTimer: null,
  isAnimating: false,
  touchStartX: 0,
};

// ── Utils ─────────────────────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Init ──────────────────────────────────────────────────────────────────────
export function initHeroSlider() {
  const slider = $('[data-hero-slider]');
  if (!slider) return;

  const slides = $$('[data-slide]', slider);
  state.total = slides.length;
  if (state.total <= 1) return;

  // Build dot indicators
  const dotsContainer = buildDots(slider);

  // Wire nav buttons
  const prevBtn = $('[data-slider-prev]', slider);
  const nextBtn = $('[data-slider-next]', slider);

  if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));

  // Touch / swipe support
  slider.addEventListener('touchstart', (e) => {
    state.touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - state.touchStartX;
    if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
  }, { passive: true });

  // Pause on hover
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', () => startAutoplay(slides, dotsContainer));

  // Keyboard
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Activate first slide (no transition on first load)
  goToSlide(slides, dotsContainer, 0, false);
  startAutoplay(slides, dotsContainer);
}

// ── Build dots ────────────────────────────────────────────────────────────────
function buildDots(slider) {
  const dotsContainer = $('[data-slider-dots]', slider);
  if (!dotsContainer) return null;

  dotsContainer.innerHTML = '';
  for (let i = 0; i < state.total; i++) {
    const btn = document.createElement('button');
    btn.className = 'hero-dot';
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.dataset.dotIndex = i;
    btn.addEventListener('click', () => navigate(i - state.current));
    dotsContainer.appendChild(btn);
  }
  return dotsContainer;
}

// ── Navigate ─────────────────────────────────────────────────────────────────
function navigate(delta) {
  if (state.isAnimating) return;
  stopAutoplay();
  const slides = $$('[data-slide]');
  const dotsContainer = $('[data-slider-dots]');
  const nextIndex = ((state.current + delta) % state.total + state.total) % state.total;
  goToSlide(slides, dotsContainer, nextIndex, true);
  startAutoplay(slides, dotsContainer);
}

// ── Go to slide ───────────────────────────────────────────────────────────────
function goToSlide(slides, dotsContainer, index, animate) {
  if (state.isAnimating && animate) return;
  if (animate) state.isAnimating = true;

  const outgoing = slides[state.current];
  const incoming = slides[index];

  // Reset all items in incoming slide before activating
  const inItems = $$('[data-animate]', incoming);
  inItems.forEach(el => el.classList.remove('is-visible'));

  // ARIA
  slides.forEach((slide, i) => {
    slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
  });

  // Outgoing: add leaving class
  if (outgoing && outgoing !== incoming) {
    outgoing.classList.add('is-leaving');
    outgoing.classList.remove('is-active');
  }

  // Incoming: activate
  incoming.classList.add('is-active');
  incoming.classList.remove('is-leaving');

  // Stagger animate content items in incoming slide
  const delay = animate ? 80 : 0;
  inItems.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('is-visible');
    }, (animate ? 400 : 50) + i * delay);
  });

  // Clean outgoing after transition
  if (outgoing && outgoing !== incoming) {
    setTimeout(() => {
      outgoing.classList.remove('is-leaving');
      // Reset outgoing content
      $$('[data-animate]', outgoing).forEach(el => el.classList.remove('is-visible'));
      state.isAnimating = false;
    }, 700);
  } else {
    state.isAnimating = false;
  }

  // Update dots
  if (dotsContainer) {
    $$('.hero-dot', dotsContainer).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });
  }

  // Update progress bar
  const progressBar = $('[data-slider-progress]');
  if (progressBar) {
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    if (animate || index === 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progressBar.style.transition = `width ${AUTOPLAY_DURATION}ms linear`;
          progressBar.style.width = '100%';
        });
      });
    }
  }

  state.current = index;
}

// ── Autoplay ──────────────────────────────────────────────────────────────────
function startAutoplay(slidesArg, dotsArg) {
  stopAutoplay();
  // Kick off progress bar
  const progressBar = $('[data-slider-progress]');
  if (progressBar) {
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressBar.style.transition = `width ${AUTOPLAY_DURATION}ms linear`;
        progressBar.style.width = '100%';
      });
    });
  }

  state.timer = setInterval(() => {
    const slides = slidesArg || $$('[data-slide]');
    const dots = dotsArg || $('[data-slider-dots]');
    const nextIndex = (state.current + 1) % state.total;
    goToSlide(slides, dots, nextIndex, true);
    // Reset progress bar for next cycle
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progressBar.style.transition = `width ${AUTOPLAY_DURATION}ms linear`;
          progressBar.style.width = '100%';
        });
      });
    }
  }, AUTOPLAY_DURATION);
}

function stopAutoplay() {
  clearInterval(state.timer);
}

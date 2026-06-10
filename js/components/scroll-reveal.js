/**
 * @module ScrollReveal
 * @description Scroll reveal: aplica .is-visible em elementos quando entram na viewport.
 */

import { $$ } from '../utils/dom.js';

export function initScrollReveal() {
  const elements = $$('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let delay = entry.target.dataset.revealDelay || 0;
        if (!delay && entry.target.dataset.reveal && entry.target.dataset.reveal.includes('delay:')) {
          delay = parseInt(entry.target.dataset.reveal.split(':')[1].trim(), 10) || 0;
        }
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, delay);
        observer.unobserve(entry.target); // dispara uma vez
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

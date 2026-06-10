/**
 * @module Main
 * @description Inicialização global do projeto Skyline Cleaning.
 */
import { initMobileNav } from './components/header.js';
import { initHeroSlider } from './components/hero-slider.js';
import { initBeforeAfterSliders } from './components/before-after.js';
import { initTestimonials } from './components/testimonials.js';
import { initScrollReveal } from './components/scroll-reveal.js';

function initHeaderHeight() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  const setHeight = () => {
    const height = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${height}px`);
  };

  setHeight();
  window.addEventListener('resize', setHeight);
}

function init() {
  initHeaderHeight();
  initMobileNav();
  initHeroSlider();
  initBeforeAfterSliders();
  initTestimonials();
  initScrollReveal();
}

document.addEventListener('DOMContentLoaded', init);

/**
 * @module AppointmentPage
 * @description Entry point for the appointment/booking page.
 */
import { initMobileNav } from './components/header.js';
import { initBookingForm } from './components/booking-form.js';
import { initScrollReveal } from './components/scroll-reveal.js';

function initHeaderHeight() {
  const header = document.querySelector('.main-header');
  if (!header) return;
  const setHeight = () => {
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  };
  setHeight();
  window.addEventListener('resize', setHeight);
}

function init() {
  initHeaderHeight();
  initMobileNav();
  initBookingForm();
  initScrollReveal();
}

document.addEventListener('DOMContentLoaded', init);

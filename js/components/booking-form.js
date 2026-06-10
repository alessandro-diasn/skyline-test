/**
 * @module BookingForm
 * @description Multi-step booking wizard with validation, sliders, and service cards.
 */

// ── Constantes ────────────────────────────────────────────────────────────────
const serviceIcons = {
  'Standard Cleaning':    '🧹',
  'Deep Cleaning':        '✨',
  'Vacation Rental':      '🏠',
  'Commercial Cleaning':  '🏢',
  'Move-In/Out':          '📦',
  'Post-Construction':    '🔨',
  'Additional: Oven':     '🔥',
  'Additional: Fridge':   '❄️',
};

// ── State ─────────────────────────────────────────────────────────────────────
let currentStep = 1;
const TOTAL_STEPS = 5;

// ── Selectors ─────────────────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Init ──────────────────────────────────────────────────────────────────────
export function initBookingForm() {
  const form = $('[data-booking-form]');
  if (!form) return;

  buildServiceCards();
  buildRadioBlocks();
  bindTabClicks();
  bindNextPrev();
  setupSliders();
  setupFormSubmit();
}

// ── Build service cards (replaces plain checkboxes) ───────────────────────────
function buildServiceCards() {
  const grid = $('[data-services-grid]');
  if (!grid) return;

  const services = Object.keys(serviceIcons);
  grid.innerHTML = '';

  services.forEach(name => {
    const id = `svc-${name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
    const card = document.createElement('label');
    card.className = 'service-check-card';
    card.setAttribute('for', id);
    card.innerHTML = `
      <input type="checkbox" id="${id}" name="extra-services" value="${name}">
      <div class="service-check-card__icon">${serviceIcons[name]}</div>
      <span class="service-check-card__label">${name}</span>
      <span class="service-check-card__check" aria-hidden="true">
        <svg viewBox="0 0 12 10"><polyline points="1,5 4,8 11,1" /></svg>
      </span>
    `;

    const checkbox = card.querySelector('input');
    checkbox.addEventListener('change', () => {
      card.classList.toggle('is-checked', checkbox.checked);
    });

    grid.appendChild(card);
  });
}

// ── Build radio blocks for "last cleaned" ─────────────────────────────────────
function buildRadioBlocks() {
  const container = $('[data-radio-last-cleaned]');
  if (!container) return;

  const options = [
    'A few days ago',
    'Less than a month ago',
    'Less than 3 months ago',
    'Less than 6 months ago',
    'More than 6 months ago or never',
  ];

  container.innerHTML = '';
  options.forEach((label, i) => {
    const id = `clean-${i}`;
    const block = document.createElement('label');
    block.className = 'radio-block';
    block.setAttribute('for', id);
    block.innerHTML = `
      <input type="radio" id="${id}" name="last-cleaning" value="${label}"${i === 0 ? ' checked' : ''}>
      <span>${label}</span>
    `;

    const radio = block.querySelector('input');
    // Mark initially selected
    if (radio.checked) block.classList.add('is-selected');

    radio.addEventListener('change', () => {
      // Remove all selected states
      $$('.radio-block').forEach(b => b.classList.remove('is-selected'));
      block.classList.add('is-selected');
    });

    container.appendChild(block);
  });
}

// ── Tab clicks ────────────────────────────────────────────────────────────────
function bindTabClicks() {
  $$('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      if (!tab.classList.contains('unlocked')) return;
      const target = parseInt(tab.dataset.target, 10);
      goToStep(target);
    });
  });
}

// ── Next / Prev buttons ───────────────────────────────────────────────────────
function bindNextPrev() {
  $$('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!validateStep(currentStep)) return;
      if (currentStep < TOTAL_STEPS) {
        goToStep(currentStep + 1);
      }
    });
  });

  $$('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
  });
}

// ── Navigate to step ──────────────────────────────────────────────────────────
function goToStep(n) {
  const steps = $$('.booking-step');
  const tabs = $$('.tab-btn');

  steps.forEach(s => s.classList.remove('active'));
  tabs.forEach(tab => {
    tab.classList.remove('active');
    if (parseInt(tab.dataset.target, 10) <= n) {
      tab.classList.add('unlocked');
    }
  });

  const targetStep = $(`.booking-step[data-step="${n}"]`);
  const targetTab  = $(`.tab-btn[data-target="${n}"]`);

  if (targetStep) targetStep.classList.add('active');
  if (targetTab) {
    targetTab.classList.add('active');
    targetTab.classList.add('unlocked');
  }

  currentStep = n;

  // Scroll exactly to the start of the form section.
  const scrollTarget = document.getElementById('booking-form-start');
  if (scrollTarget) {
    const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
    const top = scrollTarget.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// ── Validate step ─────────────────────────────────────────────────────────────
function validateStep(step) {
  clearErrors();
  let valid = true;

  if (step === 1) {
    const name  = $('[name="user-name"]');
    const email = $('[name="user-email"]');
    const phone = $('[name="user-phone"]');

    if (!name || !name.value.trim()) { showError(name, 'Full name is required.'); valid = false; }
    if (!email || !isValidEmail(email.value)) { showError(email, 'Please enter a valid email address.'); valid = false; }
    if (!phone || phone.value.trim().length < 7) { showError(phone, 'Please enter a valid phone number.'); valid = false; }
  }

  if (step === 2) {
    const addr1  = $('[name="address-1"]');
    const city   = $('[name="address-city"]');
    const state  = $('[name="address-state"]');
    const zip    = $('[name="address-zip"]');

    if (!addr1 || !addr1.value.trim()) { showError(addr1, 'Address is required.'); valid = false; }
    if (!city  || !city.value.trim())  { showError(city,  'City is required.');    valid = false; }
    if (!state || !state.value.trim()) { showError(state, 'State is required.');   valid = false; }
    if (!zip   || !zip.value.trim())   { showError(zip,   'ZIP code is required.'); valid = false; }
  }

  return valid;
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function showError(input, message) {
  if (!input) return;
  input.classList.add('is-error');
  const field = input.closest('.booking-field');
  if (field) {
    let errEl = field.querySelector('.field-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field-error';
      field.appendChild(errEl);
    }
    errEl.textContent = message;
    errEl.classList.add('is-visible');
  }
  // Focus first error
  if (!document.querySelector('.is-error:focus')) {
    input.focus();
  }
}

function clearErrors() {
  $$('.booking-field input.is-error, .booking-field textarea.is-error').forEach(el => {
    el.classList.remove('is-error');
  });
  $$('.field-error.is-visible').forEach(el => {
    el.classList.remove('is-visible');
  });
}

// Live validation — clear error on input
document.addEventListener('input', e => {
  if (e.target.matches('.booking-field input, .booking-field textarea')) {
    e.target.classList.remove('is-error');
    const errEl = e.target.closest('.booking-field')?.querySelector('.field-error');
    if (errEl) errEl.classList.remove('is-visible');
  }
});

// ── Sliders ───────────────────────────────────────────────────────────────────
function setupSliders() {
  setupSlider('range-beds', 'beds-count', 'tooltip-beds', val => {
    return `${val} Bedroom${val > 1 ? 's' : ''}`;
  });
  setupSlider('range-baths', 'baths-count', 'tooltip-baths', val => {
    return `${val} Bathroom${val > 1 ? 's' : ''}`;
  });
  setupSlider('range-size', 'size-count', 'tooltip-size', val => {
    return `~${Number(val).toLocaleString()} sqft`;
  });
}

function setupSlider(rangeId, hiddenName, tooltipId, formatFn) {
  const range   = document.getElementById(rangeId);
  const hidden  = $(`[name="${hiddenName}"]`);
  const tooltip = document.getElementById(tooltipId);
  if (!range) return;

  const update = () => {
    const val = range.value;
    const min = parseFloat(range.min);
    const max = parseFloat(range.max);
    const pct = (val - min) / (max - min) * 100;

    // Update fill gradient
    range.style.backgroundSize = `${pct}% 100%`;

    // Update tooltip
    if (tooltip) {
      tooltip.textContent = formatFn(val);
      // Clamp tooltip position to stay within bounds
      const thumbOffset = 11 * (1 - pct / 100); // 11 = half thumb width approx
      tooltip.style.left = `calc(${pct}% + ${thumbOffset}px)`;
    }

    // Sync hidden field
    if (hidden) hidden.value = val;
  };

  range.addEventListener('input', update);
  update(); // init
}

// ── Form submit ───────────────────────────────────────────────────────────────
function setupFormSubmit() {
  const form = $('[data-booking-form]');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    
    // If user hits Enter on steps 1-4, treat it as "Next Step"
    if (currentStep < TOTAL_STEPS) {
      if (validateStep(currentStep)) {
        goToStep(currentStep + 1);
      }
      return;
    }

    // Only allow actual submission on the final step
    if (!validateStep(currentStep)) return;

    const submitBtn = $('[data-submit-btn]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    // Collect form data
    const data = new FormData(form);

    // Simulate async submission (replace with real endpoint)
    setTimeout(() => {
      showSuccess();
    }, 1200);

    // === REAL SUBMISSION — uncomment and set your endpoint ===
    // fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: data })
    //   .then(r => r.json())
    //   .then(() => showSuccess())
    //   .catch(() => {
    //     if (submitBtn) {
    //       submitBtn.disabled = false;
    //       submitBtn.textContent = 'Confirm Booking';
    //     }
    //   });
  });
}

function showSuccess() {
  const panel = $('[data-booking-form]');
  const successEl = $('[data-booking-success]');
  if (!panel || !successEl) return;

  // Hide tabs + steps
  const tabsEl = panel.querySelector('.booking-tabs');
  if (tabsEl) tabsEl.style.display = 'none';
  $$('.booking-step').forEach(s => (s.style.display = 'none'));

  successEl.classList.add('is-visible');
}

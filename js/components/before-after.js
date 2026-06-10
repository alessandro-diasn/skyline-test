/**
 * @module BeforeAfterSlider
 * @description Logic for the interactive before/after image comparison sliders.
 *              Uses clip-path directly on .ba-after-img (flat DOM, no wrapper div)
 *              to avoid GPU composite layer issues that cause ghost corners.
 */

export function initBeforeAfterSliders() {
  const sliders = document.querySelectorAll('[data-ba]');

  sliders.forEach(el => {
    const afterImg  = el.querySelector('.ba-after-img');
    const divider   = el.querySelector('.ba-divider');
    if (!afterImg || !divider) return;

    let pct          = 50;
    let dragging     = false;
    let startX       = 0;
    let startY       = 0;
    let isHorizontal = null;

    function setPos(clientX) {
      const rect = el.getBoundingClientRect();
      const raw  = (clientX - rect.left) / rect.width * 100;
      pct = Math.min(95, Math.max(5, raw));
      afterImg.style.clipPath = `inset(0 0 0 ${pct}%)`;
      divider.style.left = `${pct}%`;
    }

    // Mouse Events
    el.addEventListener('mousedown', function(e) {
      dragging = true;
      setPos(e.clientX);
      e.preventDefault();
    });

    window.addEventListener('mousemove', function(e) {
      if (dragging) setPos(e.clientX);
    });

    window.addEventListener('mouseup', function() {
      dragging = false;
    });

    // Touch Events
    el.addEventListener('touchstart', function(e) {
      dragging     = true;
      startX       = e.touches[0].clientX;
      startY       = e.touches[0].clientY;
      isHorizontal = null;
    }, { passive: true });

    el.addEventListener('touchmove', function(e) {
      if (!dragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      if (isHorizontal === null) {
        isHorizontal = Math.abs(dx) > Math.abs(dy);
      }

      if (isHorizontal) {
        e.preventDefault();
        setPos(e.touches[0].clientX);
      }
    }, { passive: false });

    el.addEventListener('touchend', function() {
      dragging = false;
    });
  });
}

/**
 * @module InlineContactForm
 * @description Handle submission for simple inline contact forms (like Pool Care hero form).
 */

export function initInlineContactForm() {
  const forms = document.querySelectorAll('.hero-inline-form form, #hero-contact-form form, #pool-hero-form, .cta-form');
  if (!forms.length) return;

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn ? btn.innerHTML : 'Send Message';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      // Identify the source service if not specified
      if (!payload['your-service']) {
        payload['your-service'] = document.title.includes('Pool') ? 'Pool Care' : 'General Inquiry';
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const res = await response.json();

        if (response.ok && res.success) {
          form.innerHTML = `
            <div style="padding: 1.5rem; text-align: center; color: #28a745; background: #f8fff9; border: 1px solid #c3e6cb; border-radius: 8px;">
              <div style="font-size: 24px; margin-bottom: 8px;">🎉</div>
              <strong style="display: block; font-size: 16px; margin-bottom: 4px;">Message Sent!</strong>
              <span style="font-size: 14px; color: #555;">We will contact you shortly.</span>
            </div>
          `;
        } else {
          throw new Error(res.error || 'Failed to send message');
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('Something went wrong sending your message. Please call us at +1 (407) 861-6418.');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      }
    });
  });
}

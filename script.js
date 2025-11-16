/* 🌿 FloraPulse Unified Script - 2025
   Works for login.html, contact.html, and details.html
   Handles dark mode, validation, alerts, and background floaters.
*/

// === FLOATING BACKGROUND OBJECTS ===
const floatZone = document.getElementById('floatZone');
if (floatZone) {
  for (let i = 0; i < 15; i++) {
    const el = document.createElement('div');
    el.className = 'float-obj';
    el.style.left = Math.random() * 100 + '%';
    el.style.top = Math.random() * 100 + '%';
    const s = 10 + Math.random() * 25;
    el.style.width = el.style.height = s + 'px';
    el.style.animationDuration = 8 + Math.random() * 10 + 's';
    floatZone.appendChild(el);
  }
}

// === THEME TOGGLE ===
const toggle = document.getElementById('themeToggle');
if (toggle) {
  toggle.onclick = () => {
    document.body.classList.toggle('dark');
    toggle.classList.toggle('bi-brightness-high');
    toggle.classList.toggle('bi-moon-fill');
  };
}

// === ALERT SYSTEM ===
const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
function showAlert(message, type = 'success') {
  if (!alertPlaceholder) return;
  const wrapper = document.createElement('div');
  wrapper.className = `alert alert-${type} alert-dismissible fade show mt-2`;
  wrapper.role = 'alert';
  wrapper.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
  alertPlaceholder.innerHTML = '';
  alertPlaceholder.append(wrapper);
  setTimeout(() => wrapper.remove(), 5000);
}

// === EMAIL VALIDATION ===
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// === GENERIC FIELD VALIDATION ===
function validateField(field) {
  const val = (field.value || '').trim();
  const type = field.type;

  if (field.disabled || type === 'file') return null; // skip picture fields

  if (type === 'email') {
    if (val === '') return 'Email is required.';
    if (!isValidEmail(val)) return 'Please enter a valid email address.';
  } else if (type === 'password') {
    if (val === '') return 'Password is required.';
    if (val.length < 6) return 'Password must be at least 6 characters.';
  } else if (field.hasAttribute('required')) {
    if (val === '') return `${field.placeholder || 'This field'} is required.`;
  }

  return null;
}

// === VALIDATE WHOLE FORM ===
function validateForm(form) {
  const inputs = Array.from(form.querySelectorAll('[required]'));
  let firstError = null;
  inputs.forEach(fld => {
    const err = validateField(fld);
    if (err) {
      fld.classList.add('is-invalid');
      fld.classList.remove('is-valid');
      if (!firstError) firstError = err;
    } else {
      fld.classList.remove('is-invalid');
      fld.classList.add('is-valid');
    }
  });
  return !firstError;
}

// === FORM LOGIC ===
document.querySelectorAll('form[novalidate]').forEach(form => {
  const formName = document.title.toLowerCase();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = validateForm(form);
    if (!ok) return;

    // Page-specific success feedback
    if (formName.includes('login')) {
      showAlert('Login successful! Redirecting...', 'success');
    } else if (formName.includes('contact')) {
      showAlert('Your message has been sent successfully!', 'success');
      form.reset();
    } else if (formName.includes('details')) {
      showAlert('Your details have been saved successfully!', 'success');
      form.reset();
    } else {
      showAlert('Form submitted successfully!', 'success');
    }

    // Clear validation colors after reset
    setTimeout(() => {
      form.querySelectorAll('.is-valid, .is-invalid')
        .forEach(f => f.classList.remove('is-valid', 'is-invalid'));
    }, 2000);
  });

  // Live validation feedback
  form.addEventListener('input', e => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.type === 'file') return; // skip images

    const err = validateField(target);
    if (err) {
      target.classList.add('is-invalid');
      target.classList.remove('is-valid');
    } else {
      target.classList.remove('is-invalid');
      target.classList.add('is-valid');
    }
  });
});

// === TOOLTIP INIT ===
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
[...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));

// PROFILE PICTURE: click preview to open file picker, show selected image
(function initProfilePicker() {
  const picInput = document.getElementById('profilePicInput');
  const picPreview = document.getElementById('profilePicPreview');

  if (!picInput || !picPreview) return;

  // clicking the preview opens file picker
  picPreview.addEventListener('click', () => picInput.click());

  // when user selects a file, show preview
  picInput.addEventListener('change', () => {
    const file = picInput.files && picInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      // invalid file type
      picInput.classList.add('is-invalid');
      picPreview.classList.add('invalid');
      showAlert('Please select an image file for the profile picture.', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      picPreview.src = ev.target.result;
      picPreview.classList.add('has-image');
      picInput.classList.remove('is-invalid');
      picPreview.classList.remove('invalid');
    };
    reader.readAsDataURL(file);
  });

  // optional: remove invalid state when user focuses the picker (via change above or keyboard)
  picInput.addEventListener('focus', () => {
    picInput.classList.remove('is-invalid');
    picPreview.classList.remove('invalid');
  });
})();

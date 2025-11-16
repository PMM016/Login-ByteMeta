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

// === SwitchEye and SwitchForm (user requested API) ===
/*
  SwitchEye(EyeIcon, InputID)
    - EyeIcon: element reference or element id (string) or selector
    - InputID: id (string) of the password input (or selector string starting with #)
    Behaviour:
      - Adds a click listener to the EyeIcon that toggles the input type between 'password' and 'text'.
      - Toggles common icon classes (bi-eye / bi-eye-slash / bi-eye-fill) on the icon element inside EyeIcon (or EyeIcon itself).
      - Keeps aria-pressed in sync and returns the new visible state (true = visible/text).
*/
function SwitchEye(EyeIcon, InputID) {
  const btn = (typeof EyeIcon === 'string')
    ? (document.getElementById(EyeIcon) || document.querySelector(EyeIcon))
    : EyeIcon;

  if (!btn) {
    console.warn('SwitchEye: Eye icon element not found:', EyeIcon);
    return;
  }

  // resolve input: allow passing an ID or selector or element
  let input;
  if (typeof InputID === 'string') {
    input = document.getElementById(InputID) || document.querySelector(InputID);
  } else {
    input = InputID;
  }
  if (!input) {
    console.warn('SwitchEye: target input not found:', InputID);
    return;
  }

  // find the icon element inside the button (if present) for more precise toggling
  const icon = btn.querySelector('i') || btn;

  // ensure button won't submit a form accidentally
  if (btn.tagName === 'BUTTON' && btn.type === '') btn.type = 'button';

  const handler = (e) => {
    // don't let clicks on this control submit parent forms
    if (e) e.preventDefault();

    const wasPassword = input.type === 'password';
    input.type = wasPassword ? 'text' : 'password';

    // toggle common bootstrap-icon classes; be tolerant if not using bootstrap-icons
    if (icon) {
      icon.classList.toggle('bi-eye', !wasPassword);
      icon.classList.toggle('bi-eye-slash', wasPassword);
      icon.classList.toggle('bi-eye-fill', !wasPassword);
    }

    // update aria-pressed for accessibility (true = visible/text)
    const pressed = String(!wasPassword);
    try { btn.setAttribute('aria-pressed', pressed); } catch (err) {}

    // keep focus on input for better UX
    input.focus();

    return !wasPassword;
  };

  // avoid adding multiple listeners by storing a marker
  if (!btn._switchEyeBound) {
    btn.addEventListener('click', handler);
    btn._switchEyeBound = true;
    // set initial aria-pressed
    btn.setAttribute('aria-pressed', String(input.type !== 'password'));
  }
  // return the handler so caller could optionally remove it
  return handler;
}

/*
  SwitchForm(from, to)
    - from: id/selector/element to hide (optional). If omitted/null, will hide all .auth-form elements in same container.
    - to: id/selector/element to show (required)
    Behaviour:
      - Hides the 'from' form and shows the 'to' form (uses d-none / d-block classes).
      - Clears validation markers (.is-valid / .is-invalid) on hidden forms.
      - Sets aria-hidden appropriately and focuses the first focusable element in shown form.
*/
function SwitchForm(from, to) {
  // resolve target element
  const resolve = (v) => {
    if (!v) return null;
    if (typeof v === 'string') return document.getElementById(v) || document.querySelector(v);
    return v;
  };

  const target = resolve(to);
  if (!target) {
    console.warn('SwitchForm: target form not found:', to);
    return;
  }

  let fromEl = resolve(from);

  // determine container scope
  const container = target.closest('.auth-container') || document;

  // if from not provided, find currently visible .auth-form in container
  if (!fromEl) {
    fromEl = container.querySelector('.auth-form:not(.d-none)');
  }

  // hide all auth-forms in container except target
  container.querySelectorAll('.auth-form').forEach(f => {
    if (f === target) {
      f.classList.remove('d-none');
      f.classList.add('d-block');
      f.removeAttribute('aria-hidden');
    } else {
      f.classList.add('d-none');
      f.classList.remove('d-block');
      f.setAttribute('aria-hidden', 'true');
      // clear validation state when hiding
      f.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
    }
  });

  // update switch link active states (optional)
  container.querySelectorAll('[data-switch-to]').forEach(link => {
    const linkTarget = link.dataset.switchTo;
    // normalize both to selectors (leading # optional)
    const normalize = s => s ? (s.startsWith('#') ? s.slice(1) : s) : '';
    link.classList.toggle('active', normalize(linkTarget) === (target.id || ''));
  });

  // focus first input/select/textarea/button
  const focusable = target.querySelector('input, select, textarea, button, [tabindex]:not([tabindex="-1"])');
  if (focusable) focusable.focus();
  return true;
}

// === auto-bind based on data attributes on DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', () => {
  // bind all password toggle buttons with data-password-toggle
  document.querySelectorAll('[data-password-toggle]').forEach(btn => {
    const targetAttr = btn.dataset.target || btn.getAttribute('href') || btn.getAttribute('data-target');
    let targetId = null;
    if (targetAttr) {
      targetId = targetAttr.startsWith('#') ? targetAttr.slice(1) : targetAttr;
    } else {
      // fallback: find password input in same container
      const pwd = btn.closest('form')?.querySelector('input[type="password"]') || btn.parentElement?.querySelector('input[type="password"]');
      if (pwd) targetId = pwd.id || null;
    }
    if (targetId) SwitchEye(btn, targetId);
  });

  // bind all switch-to links/buttons
  document.querySelectorAll('[data-switch-to]').forEach(el => {
    // prefer data-switch-from to know which to hide; otherwise let SwitchForm infer
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const toAttr = el.dataset.switchTo;
      const fromAttr = el.dataset.switchFrom || null;
      const toId = toAttr && toAttr.startsWith('#') ? toAttr.slice(1) : toAttr;
      const fromId = fromAttr && fromAttr.startsWith('#') ? fromAttr.slice(1) : fromAttr;
      SwitchForm(fromId, toId);
    });
  });
});

// === TOOLTIP INIT ===
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
if (typeof bootstrap !== 'undefined' && tooltipTriggerList.length) {
  [...tooltipTriggerList].map(el => new bootstrap.Tooltip(el));
}

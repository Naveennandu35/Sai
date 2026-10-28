/* ============================================================
   Sunrise Mart — login page behaviour
   Front-end demo only: no credentials are sent anywhere.
   ============================================================ */

(function () {
  'use strict';

  const form        = document.getElementById('loginForm');
  const identifier  = document.getElementById('identifier');
  const password    = document.getElementById('password');
  const remember    = document.getElementById('remember');
  const toggleBtn   = document.getElementById('togglePassword');
  const submitBtn   = document.getElementById('submitBtn');
  const alertBox    = document.getElementById('alert');
  const demoBtn     = document.getElementById('demoBtn');
  const forgotLink  = document.getElementById('forgotLink');
  const capsHint    = document.getElementById('capsHint');

  const idField  = document.getElementById('identifierField');
  const pwField  = document.getElementById('passwordField');
  const idError  = document.getElementById('identifierError');
  const pwError  = document.getElementById('passwordError');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const PHONE_RE = /^\+?\d{7,15}$/;

  const DEMO = {
    identifier: 'demo@sunrisemart.com',
    password: 'sunrise123'
  };

  /* ── Alerts ─────────────────────────────────────────────── */

  function showAlert(message, type) {
    alertBox.className = 'alert alert--' + (type || 'info') + ' is-visible';
    alertBox.textContent = message;
  }

  function clearAlert() {
    alertBox.className = 'alert';
    alertBox.textContent = '';
  }

  /* ── Field errors ───────────────────────────────────────── */

  function setError(field, errorEl, message) {
    field.classList.toggle('has-error', Boolean(message));
    errorEl.textContent = message || '';
    return !message;
  }

  function validateIdentifier() {
    const value = identifier.value.trim();

    if (!value) {
      return setError(idField, idError, 'Enter your email address or mobile number.');
    }
    if (value.includes('@') && !EMAIL_RE.test(value)) {
      return setError(idField, idError, 'That email address doesn’t look right.');
    }
    if (!value.includes('@') && !PHONE_RE.test(value.replace(/[\s()-]/g, ''))) {
      return setError(idField, idError, 'Enter a valid email or a 7–15 digit mobile number.');
    }
    return setError(idField, idError, '');
  }

  function validatePassword() {
    const value = password.value;

    if (!value) {
      return setError(pwField, pwError, 'Enter your password.');
    }
    if (value.length < 6) {
      return setError(pwField, pwError, 'Passwords are at least 6 characters long.');
    }
    return setError(pwField, pwError, '');
  }

  /* ── Clear errors as the user types ─────────────────────── */

  identifier.addEventListener('input', function () {
    if (idField.classList.contains('has-error')) validateIdentifier();
    clearAlert();
  });

  password.addEventListener('input', function () {
    if (pwField.classList.contains('has-error')) validatePassword();
  });

  identifier.addEventListener('blur', function () {
    if (identifier.value.trim()) validateIdentifier();
  });

  password.addEventListener('blur', function () {
    if (password.value) validatePassword();
  });

  /* ── Password visibility ────────────────────────────────── */

  toggleBtn.addEventListener('click', function () {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    toggleBtn.setAttribute('aria-pressed', String(show));
    toggleBtn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    toggleBtn.title = show ? 'Hide password' : 'Show password';
    password.focus({ preventScroll: true });
  });

  /* ── Caps Lock hint ─────────────────────────────────────── */

  function updateCaps(event) {
    if (typeof event.getModifierState !== 'function') return;
    const on = event.getModifierState('CapsLock');
    capsHint.hidden = !(on && document.activeElement === password);
  }

  password.addEventListener('keydown', updateCaps);
  password.addEventListener('keyup', updateCaps);
  password.addEventListener('blur', function () { capsHint.hidden = true; });

  /* ── Demo account ───────────────────────────────────────── */

  demoBtn.addEventListener('click', function () {
    identifier.value = DEMO.identifier;
    password.value = DEMO.password;
    setError(idField, idError, '');
    setError(pwField, pwError, '');
    password.type = 'password';
    toggleBtn.setAttribute('aria-pressed', 'false');
    toggleBtn.setAttribute('aria-label', 'Show password');
    showAlert('Demo details filled in — press “Sign in” to continue.', 'info');
    submitBtn.focus({ preventScroll: true });
  });

  /* ── Forgot password ────────────────────────────────────── */

  forgotLink.addEventListener('click', function (event) {
    event.preventDefault();
    const value = identifier.value.trim();

    if (EMAIL_RE.test(value)) {
      showAlert('A password reset link is on its way to ' + value + '.', 'success');
      return;
    }

    clearAlert();
    setError(idField, idError, '');
    identifier.focus();
    showAlert('Enter your email address first, then choose “Forgot password?” again.', 'info');
  });

  /* ── Submit ─────────────────────────────────────────────── */

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearAlert();

    const idOk  = validateIdentifier();
    const pwOk  = validatePassword();

    if (!idOk || !pwOk) {
      form.classList.remove('shake');
      // restart the animation
      void form.offsetWidth;
      form.classList.add('shake');
      showAlert('Please fix the highlighted fields and try again.', 'error');
      (idOk ? password : identifier).focus();
      return;
    }

    setLoading(true);

    // Front-end demo: simulate a network round-trip.
    window.setTimeout(function () {
      setLoading(false);

      const who = identifier.value.trim();
      showAlert('Welcome back! You are signed in as ' + who + '.', 'success');
      persistHint();
    }, 1300);
  });

  function setLoading(loading) {
    submitBtn.classList.toggle('is-loading', loading);
    submitBtn.disabled = loading;
    submitBtn.setAttribute('aria-busy', String(loading));
    submitBtn.querySelector('.btn__label').textContent = loading ? 'Signing in…' : 'Sign in';
    form.setAttribute('aria-busy', String(loading));
  }

  function persistHint() {
    try {
      if (remember.checked) {
        window.localStorage.setItem('sunrise:lastUser', identifier.value.trim());
      } else {
        window.localStorage.removeItem('sunrise:lastUser');
      }
    } catch (err) {
      /* storage can be blocked — not critical */
    }
  }

  /* Restore the last remembered username */
  try {
    const lastUser = window.localStorage.getItem('sunrise:lastUser');
    if (lastUser) {
      identifier.value = lastUser;
      remember.checked = true;
    }
  } catch (err) { /* ignore */ }

  /* ── Social buttons (demo) ──────────────────────────────── */

  document.querySelectorAll('.btn--social').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showAlert(btn.dataset.provider + ' sign-in is not connected in this demo.', 'info');
    });
  });

  /* ── Footer year ────────────────────────────────────────── */

  document.getElementById('year').textContent = new Date().getFullYear();
})();

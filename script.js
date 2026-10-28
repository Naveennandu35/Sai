/* ============================================================
   LeelaPrasad Super Market — store front
   Front-end demo: no data is sent to a server.
   Views: login -> home -> cart drawer -> checkout -> confirmation
   ============================================================ */

(function () {
  'use strict';

  /* ── Demo products ──────────────────────────────────────── */

  const PRODUCTS = [
    { id: 'p1', name: 'Basmati Rice (5 kg)', cat: 'Grocery', price: 899, emoji: '🍚' },
    { id: 'p2', name: 'Wheat Flour (1 kg)', cat: 'Grains', price: 45, emoji: '🌾' },
    { id: 'p3', name: 'Sugar (1 kg)', cat: 'Grocery', price: 42, emoji: '🧂' },
    { id: 'p4', name: 'Tea Powder (250 g)', cat: 'Beverages', price: 110, emoji: '🍵' },
    { id: 'p5', name: 'Cooking Oil (1 L)', cat: 'Grocery', price: 179, emoji: '🛢️' },
    { id: 'p6', name: 'Milk (1 L)', cat: 'Dairy', price: 56, emoji: '🥛' },
    { id: 'p7', name: 'Brown Bread (400 g)', cat: 'Bakery', price: 35, emoji: '🍞' },
    { id: 'p8', name: 'Eggs (12 pcs)', cat: 'Dairy', price: 72, emoji: '🥚' },
    { id: 'p9', name: 'Apples (1 kg)', cat: 'Fruits', price: 180, emoji: '🍎' },
    { id: 'p10', name: 'Tomatoes (1 kg)', cat: 'Vegetables', price: 30, emoji: '🍅' },
    { id: 'p11', name: 'Onions (1 kg)', cat: 'Vegetables', price: 25, emoji: '🧅' },
    { id: 'p12', name: 'Potatoes (1 kg)', cat: 'Vegetables', price: 22, emoji: '🥔' },
  ];

  const DEMO = {
    identifier: 'demo@leelaprasadsupermarket.com',
    password: 'leelaprasad123'
  };

  /* ── Registered users (demo database) ───────────────────── */

  const USERS = [
    { name: 'Demo User', email: 'demo@leelaprasadsupermarket.com', phone: '9876543210', password: 'leelaprasad123' },
    { name: 'Leela Prasad', email: 'leela@leelaprasadsupermarket.com', phone: '9123456780', password: 'leela123' },
    { name: 'Prasad K', email: 'prasad.k@example.com', phone: '9988776655', password: 'prasad123' },
    { name: 'Sita R', email: 'sita.r@example.com', phone: '9001122334', password: 'sita123' }
  ];

  function findUserByIdentifier(value) {
    const normalized = value.replace(/[\s()-]/g, '');
    return USERS.find((u) =>
      u.email.toLowerCase() === value.toLowerCase() ||
      u.phone === normalized
    );
  }

  function validateEmail(email) {
    return EMAIL_RE.test(email);
  }

  function validatePhone(phone) {
    const digits = phone.replace(/[\s()-]/g, '');
    return PHONE_RE.test(digits);
  }

  /* ── App state ──────────────────────────────────────────── */

  const state = {
    page: 'login',            // login | home | checkout | confirmation
    user: null,
    cart: [],                 // { id, name, price, qty }
    order: null
  };

  /* ── DOM refs ───────────────────────────────────────────── */

  const views = {
    login: document.getElementById('view-login'),
    home: document.getElementById('view-home'),
    checkout: document.getElementById('view-checkout'),
    confirmation: document.getElementById('view-confirmation')
  };

  const form = document.getElementById('loginForm');
  const identifier = document.getElementById('identifier');
  const password = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePassword');
  const submitBtn = document.getElementById('submitBtn');
  const alertBox = document.getElementById('alert');
  const demoBtn = document.getElementById('demoBtn');
  const forgotLink = document.getElementById('forgotLink');
  const capsHint = document.getElementById('capsHint');
  const idField = document.getElementById('identifierField');
  const pwField = document.getElementById('passwordField');
  const idError = document.getElementById('identifierError');
  const pwError = document.getElementById('passwordError');

  /* Home */
  const userDisplayName = document.getElementById('userDisplayName');
  const productsGrid = document.getElementById('productsGrid');
  const headerCartCount = document.getElementById('headerCartCount');
  const signoutBtn = document.getElementById('signoutBtn');
  const openCart = document.getElementById('openCart');

  /* Cart drawer */
  const overlay = document.getElementById('overlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeCart = document.getElementById('closeCart');
  const cartBody = document.getElementById('cartBody');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartItems = document.getElementById('cartItems');
  const cartSummary = document.getElementById('cartSummary');
  const summaryItems = document.getElementById('summaryItems');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryTotal = document.getElementById('summaryTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  /* Checkout */
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutName = document.getElementById('checkoutName');
  const checkoutAddress = document.getElementById('checkoutAddress');
  const checkoutPhone = document.getElementById('checkoutPhone');
  const checkoutPincode = document.getElementById('checkoutPincode');
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const placeOrderTotal = document.getElementById('placeOrderTotal');
  const checkoutOrderItems = document.getElementById('checkoutOrderItems');
  const checkoutSubtotal = document.getElementById('checkoutSubtotal');
  const checkoutTotal = document.getElementById('checkoutTotal');
  const backToHomeFromCheckout = document.getElementById('backToHomeFromCheckout');

  /* Confirmation */
  const confirmOrderId = document.getElementById('confirmOrderId');
  const confirmDate = document.getElementById('confirmDate');
  const confirmTotal = document.getElementById('confirmTotal');
  const confirmItems = document.getElementById('confirmItems');
  const continueShopping = document.getElementById('continueShopping');
  const viewOrderBtn = document.getElementById('viewOrderBtn');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const PHONE_RE = /^\+?\d{7,15}$/;

  /* ── View routing ───────────────────────────────────────── */

  function showView(name) {
    state.page = name;
    Object.entries(views).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
    cartDrawer.classList.remove('open');
    overlay.hidden = true;

    if (name === 'home') renderProducts();
    if (name === 'checkout') renderCheckoutSummary();
    if (name === 'confirmation') renderConfirmation();
  }

  /* ── Alerts / field errors ──────────────────────────────── */

  function showAlert(message, type) {
    alertBox.className = 'alert alert--' + (type || 'info') + ' is-visible';
    alertBox.textContent = message;
  }

  function clearAlert() {
    alertBox.className = 'alert';
    alertBox.textContent = '';
  }

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

    const isEmail = value.includes('@');

    if (isEmail) {
      if (!validateEmail(value)) {
        return setError(idField, idError, 'Enter a valid email address (e.g. name@example.com).');
      }
    } else {
      if (!validatePhone(value)) {
        return setError(idField, idError, 'Enter a valid mobile number (7–15 digits).');
      }
    }

    // Check against registered users
    const user = findUserByIdentifier(value);
    if (!user) {
      return setError(idField, idError, 'No account found with this email or mobile number.');
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

  /* ── Password visibility / caps / demo / forgot ─────────── */

  toggleBtn.addEventListener('click', function () {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    toggleBtn.setAttribute('aria-pressed', String(show));
    toggleBtn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    password.focus({ preventScroll: true });
  });

  function updateCaps(event) {
    if (typeof event.getModifierState !== 'function') return;
    const on = event.getModifierState('CapsLock');
    capsHint.hidden = !(on && document.activeElement === password);
  }

  password.addEventListener('keydown', updateCaps);
  password.addEventListener('keyup', updateCaps);
  password.addEventListener('blur', function () { capsHint.hidden = true; });

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

  /* ── Login → Home ───────────────────────────────────────── */

  function setLoading(loading) {
    submitBtn.classList.toggle('is-loading', loading);
    submitBtn.disabled = loading;
    submitBtn.setAttribute('aria-busy', String(loading));
    submitBtn.querySelector('.btn__label').textContent = loading ? 'Signing in…' : 'Sign in';
    form.setAttribute('aria-busy', String(loading));
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearAlert();

    const idOk = validateIdentifier();
    const pwOk = validatePassword();

    if (!idOk || !pwOk) {
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      showAlert('Please fix the highlighted fields and try again.', 'error');
      (idOk ? password : identifier).focus();
      return;
    }

    setLoading(true);

    // Simulate network round-trip, then open the store.
    window.setTimeout(function () {
      setLoading(false);

      const user = findUserByIdentifier(identifier.value.trim());
      if (!user || user.password !== password.value) {
        showAlert('Invalid email/mobile or password. Try again.', 'error');
        password.focus();
        return;
      }

      state.user = { name: user.name, email: user.email, phone: user.phone };
      userDisplayName.textContent = user.name;
      localStorage.setItem('leelaprasad:lastUser', identifier.value.trim());
      showView('home');
    }, 900);
  });

  /* ── Products / cart ────────────────────────────────────── */

  function money(n) { return '₹' + n.toFixed(2); }

  function cartTotal() {
    return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function cartItemCount() {
    return state.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function renderProducts() {
    productsGrid.innerHTML = PRODUCTS.map(function (p) {
      const inCart = state.cart.find((i) => i.id === p.id);
      const added = Boolean(inCart);
      return `
        <article class="product-card">
          <div class="product-card__thumb" aria-hidden="true">${p.emoji}</div>
          <div class="product-card__body">
            <span class="product-card__cat">${p.cat}</span>
            <h3 class="product-card__name">${p.name}</h3>
            <div class="product-card__price">${money(p.price)}</div>
            <button class="product-card__add ${added ? 'added' : ''}"
                    data-id="${p.id}"
                    aria-pressed="${added}"
                    title="${added ? 'Added to cart' : 'Add to cart'}">
              ${added ? 'Added' : 'Add to cart'}
            </button>
          </div>
        </article>
      `;
    }).join('');

    productsGrid.querySelectorAll('.product-card__add').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.dataset.id;
        addToCart(id);
      });
    });

    headerCartCount.textContent = cartItemCount();
  }

  function findCartIndex(id) {
    return state.cart.findIndex((i) => i.id === id);
  }

  function addToCart(id) {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;

    const idx = findCartIndex(id);
    if (idx >= 0) {
      state.cart[idx].qty += 1;
    } else {
      state.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }

    renderProducts();
    renderCart();
    headerCartCount.textContent = cartItemCount();

    // Briefly highlight the button.
    const btn = productsGrid.querySelector('[data-id="' + id + '"]');
    if (btn) {
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('added');
      btn.textContent = 'Added';
    }

    openDrawer();
    showAlert(product.name + ' added to cart.', 'success');
  }

  function changeQty(id, delta) {
    const idx = findCartIndex(id);
    if (idx < 0) return;
    state.cart[idx].qty += delta;
    if (state.cart[idx].qty <= 0) {
      state.cart.splice(idx, 1);
    }
    renderProducts();
    renderCart();
    headerCartCount.textContent = cartItemCount();
  }

  function removeFromCart(id) {
    const idx = findCartIndex(id);
    if (idx < 0) return;
    state.cart.splice(idx, 1);
    renderProducts();
    renderCart();
    headerCartCount.textContent = cartItemCount();
  }

  /* ── Cart drawer ────────────────────────────────────────── */

  function openDrawer() {
    cartDrawer.classList.add('open');
    overlay.hidden = false;
  }

  function closeDrawer() {
    cartDrawer.classList.remove('open');
    overlay.hidden = true;
  }

  openCart.addEventListener('click', openDrawer);
  closeCart.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  function renderCart() {
    const hasItems = state.cart.length > 0;
    cartEmpty.hidden = hasItems;
    cartItems.hidden = !hasItems;
    cartSummary.hidden = !hasItems;
    checkoutBtn.disabled = !hasItems;

    if (!hasItems) return;

    cartItems.innerHTML = state.cart.map(function (item) {
      return `
        <div class="cart-item">
          <div class="cart-item__thumb" aria-hidden="true">${PRODUCTS.find((p) => p.id === item.id).emoji}</div>
          <div class="cart-item__info">
            <div class="cart-item__name">${item.name}</div>
            <div class="cart-item__price">${money(item.price)} each</div>
          </div>
          <div class="cart-item__controls">
            <button class="cart-item__qty" type="button" data-id="${item.id}" data-delta="-1" aria-label="Decrease ${item.name}">−</button>
            <span class="cart-item__qty" style="color:var(--ink); font-weight:700;">${item.qty}</span>
            <button class="cart-item__qty" type="button" data-id="${item.id}" data-delta="1" aria-label="Increase ${item.name}">+</button>
            <button class="cart-item__remove" type="button" data-id="${item.id}" aria-label="Remove ${item.name}">✕</button>
          </div>
        </div>
      `;
    }).join('');

    cartItems.querySelectorAll('.cart-item__qty').forEach(function (btn) {
      btn.addEventListener('click', function () {
        changeQty(btn.dataset.id, Number(btn.dataset.delta));
      });
    });

    cartItems.querySelectorAll('.cart-item__remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeFromCart(btn.dataset.id);
      });
    });

    const total = cartTotal();
    summaryItems.textContent = cartItemCount();
    summarySubtotal.textContent = money(total);
    summaryTotal.textContent = money(total);
  }

  checkoutBtn.addEventListener('click', function () {
    closeDrawer();
    showView('checkout');
  });

  /* ── Checkout ───────────────────────────────────────────── */

  function renderCheckoutSummary() {
    checkoutOrderItems.innerHTML = state.cart.map(function (item) {
      return `
        <div class="order-card__item">
          <span><span class="order-card__item-name">${item.name}</span> <span class="order-card__item-qty">× ${item.qty}</span></span>
          <span class="order-card__item-price">${money(item.price * item.qty)}</span>
        </div>
      `;
    }).join('');

    const total = cartTotal();
    checkoutSubtotal.textContent = money(total);
    checkoutTotal.textContent = money(total);
    placeOrderTotal.textContent = money(total);
  }

  function clearCheckoutErrors() {
    ['checkoutName', 'checkoutAddress', 'checkoutPhone', 'checkoutPincode'].forEach(function (id) {
      const el = document.getElementById(id);
      const err = document.getElementById(id + 'Error');
      el.parentElement.classList.remove('has-error');
      err.textContent = '';
    });
  }

  function validateCheckout() {
    let ok = true;
    clearCheckoutErrors();

    const checks = [
      { id: 'checkoutName', el: checkoutName, test: () => checkoutName.value.trim().length >= 2, msg: 'Enter your full name.' },
      { id: 'checkoutAddress', el: checkoutAddress, test: () => checkoutAddress.value.trim().length >= 5, msg: 'Enter a valid address.' },
      { id: 'checkoutPhone', el: checkoutPhone, test: () => PHONE_RE.test(checkoutPhone.value.replace(/[\s()-]/g, '')), msg: 'Enter a valid mobile number.' },
      { id: 'checkoutPincode', el: checkoutPincode, test: () => /^\d{6}$/.test(checkoutPincode.value.trim()), msg: 'Enter a valid 6-digit pincode.' }
    ];

    checks.forEach(function (c) {
      if (!c.test()) {
        c.el.parentElement.classList.add('has-error');
        document.getElementById(c.id + 'Error').textContent = c.msg;
        ok = false;
      }
    });

    return ok;
  }

  checkoutForm.addEventListener('submit', function (event) {
    event.preventDefault();
    clearAlert();

    if (!validateCheckout()) {
      checkoutForm.classList.remove('shake');
      void checkoutForm.offsetWidth;
      checkoutForm.classList.add('shake');
      showAlert('Please fix the highlighted fields and try again.', 'error');
      return;
    }

    const btn = placeOrderBtn;
    const label = btn.querySelector('.btn__label');
    btn.classList.add('is-loading');
    btn.disabled = true;
    label.textContent = 'Placing order…';

    window.setTimeout(function () {
      btn.classList.remove('is-loading');
      btn.disabled = false;
      label.textContent = 'Place order — ' + money(cartTotal());

      const id = 'LP' + String(Date.now()).slice(-6);
      const now = new Date();
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      state.order = {
        id: id,
        date: now.toLocaleString(undefined, options),
        total: cartTotal(),
        items: state.cart.slice()
      };

      // Clear cart after order.
      state.cart = [];
      headerCartCount.textContent = 0;
      renderProducts();
      renderCart();

      showView('confirmation');
    }, 1000);
  });

  backToHomeFromCheckout.addEventListener('click', function (event) {
    event.preventDefault();
    showView('home');
  });

  /* ── Confirmation ───────────────────────────────────────── */

  function renderConfirmation() {
    if (!state.order) return;
    confirmOrderId.textContent = state.order.id;
    confirmDate.textContent = state.order.date;
    confirmTotal.textContent = money(state.order.total);

    confirmItems.innerHTML = state.order.items.map(function (item) {
      return `
        <div class="confirmation__item">
          <span>${item.name} <span style="color:var(--muted); font-weight:500;">× ${item.qty}</span></span>
          <span>${money(item.price * item.qty)}</span>
        </div>
      `;
    }).join('');
  }

  continueShopping.addEventListener('click', function () {
    showView('home');
  });

  viewOrderBtn.addEventListener('click', function () {
    showAlert('Order details: ' + state.order.id + ' — total ' + money(state.order.total) + '.', 'info');
  });

  /* ── Sign out ───────────────────────────────────────────── */

  signoutBtn.addEventListener('click', function () {
    state.user = null;
    state.cart = [];
    headerCartCount.textContent = 0;
    renderProducts();
    renderCart();
    identifier.value = '';
    password.value = '';
    setError(idField, idError, '');
    setError(pwField, pwError, '');
    clearAlert();
    showView('login');
  });

  /* ── Social buttons (demo) ────────────────────────────── */

  document.querySelectorAll('.btn--social').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showAlert(btn.dataset.provider + ' sign-in is not connected in this demo.', 'info');
    });
  });

  /* ── Footer year ────────────────────────────────────────── */

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ── Remember last user ─────────────────────────────────── */

  try {
    const lastUser = localStorage.getItem('leelaprasad:lastUser');
    if (lastUser) identifier.value = lastUser;
  } catch (err) { /* ignore */ }

})();

/* ==============================================================
   ELYSIA · Premium Male Enhancement
   Interactions: animations, cart, scroll-reveal, tilt, etc.
   ============================================================== */
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* -----------------------------------------------------------
     STRIPE / CHECKOUT CONFIG  ← ADD YOUR INFO HERE
     -----------------------------------------------------------
     This site uses a small serverless backend (see /backend) so it can
     send invoices and push orders into ShipStation. The browser only ever
     talks to that backend — the Stripe SECRET key lives safely on the server.

     1. CHECKOUT_API_URL: after you deploy the /backend to Vercel, paste the
        full URL of the create-checkout-session endpoint here, e.g.
        'https://your-app.vercel.app/api/create-checkout-session'

     2. Price IDs: Stripe Dashboard → Product catalog → each product's price →
        copy the ID that starts with "price_...". Paste them into the
        data-price-id="..." attributes on the <article class="price-card">
        elements in index.html.
     ----------------------------------------------------------- */
  const CHECKOUT_API_URL = 'https://backend-chi-gray-dyc8ffok7c.vercel.app/api/create-checkout-session';

  /* -----------------------------------------------------------
     Google Analytics (GA4) e-commerce event helper
     ----------------------------------------------------------- */
  const track = (eventName, params) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  };


  /* -----------------------------------------------------------
     Generate background wave SVG (matches packaging silver waves)
     ----------------------------------------------------------- */
  function buildWaves() {
    const group = $('.bg-waves .wave-lines');
    if (group) {
      const W = 1440, H = 900;
      const lines = [];
      for (let i = 0; i < 40; i++) {
        const offset = i * 8;
        const amp = 60 + Math.random() * 80;
        const y1 = H * 0.15 + i * 10;
        const y2 = H * 0.55 + i * 6;
        const cx1 = W * 0.25;
        const cx2 = W * 0.75;
        const path = `M -100 ${y1 + offset} C ${cx1} ${y1 - amp + offset}, ${cx2} ${y2 + amp - offset}, ${W + 100} ${y2 + offset}`;
        lines.push(`<path d="${path}" />`);
      }
      group.innerHTML = lines.join('');
    }

    // Package internal waves — two crossing silver ribbons matching the packaging.
    // Top ribbon  = U-shape  (valley) that DIPS DOWN to the capsule.
    // Bottom ribbon = ∩-shape (arch)  that RISES UP   to the capsule.
    // They cross right at the capsule, forming the hourglass on the real product.
    const upper = $('.package-waves .wave-upper');
    const lower = $('.package-waves .wave-lower');
    if (upper && lower) {
      const W = 400;
      // ViewBox is 400×533 with preserveAspectRatio="none". Card is 3:4.
      // Capsule center renders at top: 60% → cy = 320.
      const cy = 320;
      // Wave field edges (where the ribbons meet the left/right card sides).
      const upperEndBase = 220;   // ~41% from top  → upper ribbon edges
      const lowerEndBase = 420;   // ~79% from top  → lower ribbon edges

      // Symmetric cubic bezier: midpoint Y = 0.25·endY + 0.75·cpY.
      // Solve for cpY so the curve passes through `cy` at its visual middle.
      const upperCpBase = (4 * cy - upperEndBase) / 3;  // ≈ 407
      const lowerCpBase = (4 * cy - lowerEndBase) / 3;  // ≈ 287

      // Control point X positions — closer to the center → tighter pinch.
      const cp1x = W * 0.30;
      const cp2x = W * 0.70;

      const N = 110;            // dense fiber bundle
      const spacing = 1.05;     // perpendicular spacing
      // 1.0 = parallel band (no pinch); 0 = lines meet at single point.
      // Lower value = stronger hourglass / pinch at the crossing.
      const convergence = 0.34;

      const buildRibbon = (endBase, cpBase) => {
        const out = [];
        const half = (N - 1) / 2;
        for (let i = 0; i < N; i++) {
          const t = (i - half) / half;            // -1 .. +1 across the band
          const off = t * half * spacing;         // perpendicular offset at edges
          // Outer fibers fan slightly more at the edges for that splayed look.
          const edgeFan = Math.sign(t) * Math.pow(Math.abs(t), 1.7) * 14;
          const endY = endBase + off + edgeFan;
          const cpY  = cpBase + off * convergence;

          // Brightness: peaks at the band's center fiber, fades to outer fibers.
          const fade = 1 - Math.abs(t);
          const opacity = (0.06 + Math.pow(fade, 1.3) * 0.86).toFixed(3);

          // Slightly randomize stroke width for an organic foil-printed feel.
          const sw = (0.35 + fade * 0.35).toFixed(2);

          const d =
            `M -20 ${endY.toFixed(1)} ` +
            `C ${cp1x.toFixed(0)} ${cpY.toFixed(1)}, ` +
            `${cp2x.toFixed(0)} ${cpY.toFixed(1)}, ` +
            `${(W + 20)} ${endY.toFixed(1)}`;
          out.push(`<path d="${d}" opacity="${opacity}" stroke-width="${sw}"/>`);
        }
        return out.join('');
      };

      upper.innerHTML = buildRibbon(upperEndBase, upperCpBase);
      lower.innerHTML = buildRibbon(lowerEndBase, lowerCpBase);
    }
  }

  /* -----------------------------------------------------------
     Sticky header shadow on scroll
     ----------------------------------------------------------- */
  const header = $('#siteHeader');
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -----------------------------------------------------------
     Mobile navigation toggle
     ----------------------------------------------------------- */
  const navToggle = $('#navToggle');
  const mobileNav = $('#mobileNav');
  if (navToggle && mobileNav && header) {
    const setMenu = (open) => {
      header.classList.toggle('menu-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    navToggle.addEventListener('click', () => {
      setMenu(!header.classList.contains('menu-open'));
    });
    // Close the menu after tapping any in-page link
    mobileNav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(false);
    });
    // Close on Escape and when growing past the mobile breakpoint
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) setMenu(false);
    }, { passive: true });
  }

  /* -----------------------------------------------------------
     Reveal on scroll
     ----------------------------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* -----------------------------------------------------------
     Subtle 3D tilt on the product package
     ----------------------------------------------------------- */
  const card = $('#packageCard');
  if (card) {
    const maxTiltX = 8; // deg
    const maxTiltY = 10; // deg
    let raf = null;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const onMove = (e) => {
      const rect = card.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const px = (cx / rect.width) - 0.5;
      const py = (cy / rect.height) - 0.5;
      targetY = px * maxTiltY * 2;   // rotateY based on x
      targetX = -py * maxTiltX * 2;  // rotateX based on y
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      targetX = 0; targetY = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      card.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    };
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  }

  /* -----------------------------------------------------------
     Cart logic
     ----------------------------------------------------------- */
  const cart = new Map(); // key -> {name, price, qty}
  const drawer = $('#cartDrawer');
  const cartCount = $('#cartCount');
  const cartItemsEl = $('#cartItems');
  const cartEmpty = $('#cartEmpty');
  const cartTotalEl = $('#cartTotal');
  const checkoutBtn = $('#checkoutBtn');
  const promoInput = $('#promoInput');
  const promoApply = $('#promoApply');
  const promoMsg = $('#promoMsg');
  let appliedPromo = ''; // validated promo code applied at checkout

  const fmt = (n) => `$${n.toFixed(2).replace(/\.00$/, '')}`;

  const openCart = () => {
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeCart = () => {
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  $('#openCart').addEventListener('click', openCart);
  $$('[data-close-cart]').forEach((el) => el.addEventListener('click', closeCart));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (drawer.getAttribute('aria-hidden') === 'false') closeCart();
      const modal = $('#checkoutModal');
      if (modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
    }
  });

  function renderCart() {
    cartItemsEl.innerHTML = '';
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach((item, key) => {
      totalItems += item.qty;
      totalPrice += item.qty * item.price;
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div class="cart-item-img" aria-hidden="true"></div>
        <div>
          <div class="cart-item-name">ELYSIA — ${item.name}</div>
          <div class="cart-item-meta">${fmt(item.price)} each</div>
        </div>
        <div>
          <div class="cart-item-row">
            <div class="cart-qty" data-key="${key}">
              <button type="button" data-action="dec" aria-label="Decrease">−</button>
              <span>${item.qty}</span>
              <button type="button" data-action="inc" aria-label="Increase">+</button>
            </div>
          </div>
          <div class="cart-item-price">${fmt(item.qty * item.price)}</div>
        </div>
      `;
      cartItemsEl.appendChild(li);
    });

    cartEmpty.style.display = cart.size ? 'none' : '';
    cartTotalEl.textContent = fmt(totalPrice);
    cartCount.textContent = String(totalItems);
    checkoutBtn.disabled = totalItems === 0;

    cartCount.classList.remove('bump');
    if (totalItems > 0) {
      // Trigger a tiny bump animation
      requestAnimationFrame(() => {
        cartCount.classList.add('bump');
        setTimeout(() => cartCount.classList.remove('bump'), 220);
      });
    }
  }

  // Qty +/-
  cartItemsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const key = btn.parentElement.dataset.key;
    const item = cart.get(key);
    if (!item) return;
    if (btn.dataset.action === 'inc') item.qty += 1;
    else item.qty -= 1;
    if (item.qty <= 0) cart.delete(key);
    renderCart();
  });

  // Add-to-cart buttons
  $$('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.price-card');
      const name = card.dataset.name;
      const price = parseFloat(card.dataset.price);
      const priceId = card.dataset.priceId;
      const key = name;
      if (cart.has(key)) cart.get(key).qty += 1;
      else cart.set(key, { name, price, priceId, qty: 1 });
      renderCart();
      track('add_to_cart', {
        currency: 'USD',
        value: price,
        items: [{ item_id: priceId, item_name: `ELYSIA — ${name}`, price, quantity: 1 }],
      });
      toast(`Added ${name} to cart`);
      openCart();
    });
  });

  /* -----------------------------------------------------------
     Toast
     ----------------------------------------------------------- */
  const toastEl = $('#toast');
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  /* -----------------------------------------------------------
     Checkout modal
     ----------------------------------------------------------- */
  const modal = $('#checkoutModal');
  const openModal = () => {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  $$('[data-close-modal]').forEach((el) => el.addEventListener('click', closeModal));

  /* -----------------------------------------------------------
     Promo code
     ----------------------------------------------------------- */
  function setPromoMsg(text, kind) {
    promoMsg.textContent = text || '';
    promoMsg.classList.remove('ok', 'err');
    if (kind) promoMsg.classList.add(kind);
  }

  function applyPromo() {
    const code = promoInput.value.trim().toUpperCase();
    if (!code) {
      appliedPromo = '';
      setPromoMsg('', null);
      return;
    }
    // We optimistically accept the code here; Stripe does the authoritative
    // validation when the checkout session is created (invalid codes are
    // rejected there and surfaced back to the buyer).
    appliedPromo = code;
    promoInput.value = code;
    setPromoMsg(`Code “${code}” will be applied at checkout.`, 'ok');
  }

  promoApply.addEventListener('click', applyPromo);
  promoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyPromo();
    }
  });

  checkoutBtn.addEventListener('click', async () => {
    if (!cart.size) return;

    // Build the item list to send to our backend.
    const items = [];
    let missingId = false;
    cart.forEach((item) => {
      if (!item.priceId || item.priceId.includes('REPLACE_WITH')) missingId = true;
      items.push({ priceId: item.priceId, quantity: item.qty });
    });

    const notConfigured =
      CHECKOUT_API_URL.includes('REPLACE_WITH') || missingId;

    // If the backend / price IDs aren't set up yet, show the demo confirmation.
    if (notConfigured) {
      console.warn(
        'Checkout not configured yet. Set CHECKOUT_API_URL in script.js and ' +
          'data-price-id values in index.html. Showing demo confirmation instead.'
      );
      closeCart();
      setTimeout(() => {
        openModal();
        cart.clear();
        renderCart();
      }, 250);
      return;
    }

    checkoutBtn.disabled = true;
    try {
      const resp = await fetch(CHECKOUT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, promotionCode: appliedPromo || undefined }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.url) {
        throw new Error(data.error || 'Unable to start checkout.');
      }
      // Report the checkout start to GA4.
      let checkoutValue = 0;
      const gaItems = [];
      cart.forEach((it) => {
        checkoutValue += it.price * it.qty;
        gaItems.push({
          item_id: it.priceId,
          item_name: `ELYSIA — ${it.name}`,
          price: it.price,
          quantity: it.qty,
        });
      });
      track('begin_checkout', {
        currency: 'USD',
        value: Number(checkoutValue.toFixed(2)),
        coupon: appliedPromo || undefined,
        items: gaItems,
      });
      // Send the buyer to Stripe's hosted checkout page.
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Something went wrong starting checkout.';
      // If the promo code was the problem, surface it on the promo box.
      if (appliedPromo && /promo|code/i.test(msg)) {
        appliedPromo = '';
        setPromoMsg(msg, 'err');
        openCart();
      } else {
        toast(msg);
      }
      checkoutBtn.disabled = false;
    }
  });

  /* -----------------------------------------------------------
     Smooth scroll for in-page links
     ----------------------------------------------------------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* -----------------------------------------------------------
     Handle return from Stripe Checkout
     ----------------------------------------------------------- */
  function handleCheckoutReturn() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('checkout');
    if (!status) return;

    if (status === 'success') {
      // Report the purchase to GA4. session_id is used as the transaction id
      // so refreshes don't double-count (GA4 dedupes on transaction_id).
      const sessionId = params.get('session_id');
      if (sessionId && !sessionStorage.getItem('ga_purchase_' + sessionId)) {
        track('purchase', { transaction_id: sessionId, currency: 'USD' });
        sessionStorage.setItem('ga_purchase_' + sessionId, '1');
      }
      cart.clear();
      renderCart();
      setTimeout(openModal, 300);
    } else if (status === 'cancel') {
      toast('Checkout canceled — your cart is saved.');
    }

    // Clean the URL so a refresh doesn't re-trigger.
    const clean = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, clean);
  }

  /* -----------------------------------------------------------
     Boot
     ----------------------------------------------------------- */
  buildWaves();
  renderCart();
  handleCheckoutReturn();
})();

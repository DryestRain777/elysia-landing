/* ==============================================================
   ELYSIA · Premium Male Enhancement
   Interactions: animations, cart, scroll-reveal, tilt, etc.
   ============================================================== */
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

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
      const key = name;
      if (cart.has(key)) cart.get(key).qty += 1;
      else cart.set(key, { name, price, qty: 1 });
      renderCart();
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
  checkoutBtn.addEventListener('click', () => {
    if (!cart.size) return;
    closeCart();
    setTimeout(() => {
      openModal();
      cart.clear();
      renderCart();
    }, 250);
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
     Boot
     ----------------------------------------------------------- */
  buildWaves();
  renderCart();
})();

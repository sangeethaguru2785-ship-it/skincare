/* ==========================================================================
   Stackly — Skincare Marketplace Theme
   GSAP animations, cart logic & interactions
   ========================================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsapAvailable = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  /* ------------------------------------------------------------------
     1. Navbar scroll state + progress bar + back to top
  ------------------------------------------------------------------ */
  const nav = document.getElementById("mainNav");
  const progressBar = document.getElementById("progressbar");
  const backToTop = document.getElementById("backToTop");

  const onScroll = () => {
    const y = window.scrollY;
    nav && nav.classList.toggle("scrolled", y > 40);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && max > 0) progressBar.style.width = (y / max) * 100 + "%";

    if (backToTop) backToTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop && backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* ------------------------------------------------------------------
     3. GSAP master timeline — hero entrance
  ------------------------------------------------------------------ */
  if (gsapAvailable && !prefersReduced) {
    gsap.registerPlugin(ScrollTrigger);

    /* Split the hero headline into per-letter spans for a refined reveal */
    function splitHeroTitle() {
      const title = document.querySelector(".hero-title");
      if (!title) return [];
      title.classList.add("split-heading");
      title.setAttribute("aria-label", String(title.textContent).replace(/\s+/g, " ").trim());
      const letters = [];
      title.querySelectorAll(".line-inner").forEach((el) => {
        if (el.dataset.splitDone) {
          letters.push(...el.querySelectorAll(".spl-ltr"));
          return;
        }
        el.dataset.splitDone = "1";
        const text = el.textContent;
        el.innerHTML = "";
        String(text).split(/(\s+)/).forEach((w) => {
          if (!w.length) return;
          if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(" ")); return; }
          const word = document.createElement("span");
          word.className = "spl-word";
          word.setAttribute("aria-hidden", "true");
          Array.from(w).forEach((ch) => {
            const s = document.createElement("span");
            s.className = "spl-ltr";
            s.textContent = ch;
            word.appendChild(s);
            letters.push(s);
          });
          el.appendChild(word);
        });
      });
      return letters;
    }

    const heroLetters = splitHeroTitle();
    const heroTL = gsap.timeline({ delay: 0.15 });
    heroTL.from(".hero-eyebrow", { y: 24, autoAlpha: 0, duration: 0.8, ease: "power3.out" });
    if (heroLetters.length) {
      heroTL.from(heroLetters, {
        yPercent: 40,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.025,
        ease: "power4.out",
      }, "-=0.35");
    } else {
      heroTL.from(".hero-title .line-inner", { yPercent: 110, duration: 1.05, stagger: 0.12, ease: "power4.out" }, "-=0.3");
    }
    heroTL
      .from(".hero-sub", { y: 26, autoAlpha: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
      .from(".hero-cta", { y: 26, autoAlpha: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
      .from(".hero-meta", { y: 26, autoAlpha: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
      .from(".hero-blob", { scale: 0, autoAlpha: 0, duration: 1, ease: "power2.out" }, 0.5)
      .from(".hero-badge", { y: 30, autoAlpha: 0, stagger: 0.15, duration: 0.7, ease: "back.out(1.6)" }, "-=0.6")
      .from(".hero-scroll", { autoAlpha: 0, duration: 0.6 }, "-=0.3");

    gsap.to(".hero-visual", {
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    /* Scroll reveals */
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.from(el, {
        y: 48,
        autoAlpha: 0,
        duration: 1,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      });
    });

    /* Hero title line reveals handled by .line classes */
    /* Image scale-in for category cards handled by reveal + hover */

    /* Counter animation */
    const counters = document.querySelectorAll(".stat-number");
    counters.forEach((counter) => {
      const target = +counter.dataset.target;
      gsap.fromTo(counter, { innerText: 0 }, {
        innerText: target,
        duration: 2,
        snap: { innerText: 1 },
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: counter,
          start: "top 85%",
          once: true,
        },
      });
    });

    /* Marquee subtle speed-up on hover */
    const marqueeTrack = document.querySelector(".marquee-track");
    if (marqueeTrack) {
      marqueeTrack.addEventListener("mouseenter", () => marqueeTrack.style.animationPlayState = "paused");
      marqueeTrack.addEventListener("mouseleave", () => marqueeTrack.style.animationPlayState = "running");
    }
  } else {
    /* Fallback: reveal everything when no GSAP / reduced motion */
    document.querySelectorAll(".reveal, .hero-reveal, .line-inner, .hero-img-wrap, .hero-badge, .hero-blob, .hero-scroll").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  /* ------------------------------------------------------------------
     4. Product filter
  ------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const productItems = document.querySelectorAll(".product-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      productItems.forEach((item) => {
        const show = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("hidden-filter", !show);
        if (gsapAvailable && !prefersReduced) {
          gsap.to(item, {
            autoAlpha: show ? 1 : 0,
            scale: show ? 1 : 0.92,
            duration: 0.4,
            ease: "power2.out",
            onStart: () => {
              if (show) item.style.display = "";
            },
            onComplete: () => {
              if (!show) item.style.display = "none";
              ScrollTrigger.refresh();
            },
          });
        }
      });
    });
  });

  /* ------------------------------------------------------------------
     5. Wishlist toggle — event delegation
  ------------------------------------------------------------------ */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".wishlist");
    if (!btn) return;
    e.preventDefault();
    btn.classList.toggle("liked");
    if (btn.classList.contains("liked")) {
      if (gsapAvailable && !prefersReduced) {
        gsap.fromTo(btn, { scale: 0.6 }, { scale: 1, duration: 0.45, ease: "back.out(2.5)" });
      }
      showToast("Added to wishlist ♥");
    } else {
      showToast("Removed from wishlist");
    }
  });

  /* ------------------------------------------------------------------
     6. Cart system
  ------------------------------------------------------------------ */
  const cart = {
    items: [],
    add(name, price) {
      const existing = this.items.find((i) => i.name === name);
      if (existing) existing.qty++;
      else this.items.push({ name, price, qty: 1 });
      this.save();
      this.render();
      showToast(name + " added to bag");
    },
    remove(name) {
      this.items = this.items.filter((i) => i.name !== name);
      this.save();
      this.render();
    },
    changeQty(name, delta) {
      const item = this.items.find((i) => i.name === name);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) this.remove(name);
      else { this.save(); this.render(); }
    },
    clear() {
      this.items = [];
      this.save();
      this.render();
    },
    save() {
      try { localStorage.setItem("eclat_cart", JSON.stringify(this.items)); } catch (e) {}
    },
    load() {
      try {
        const data = JSON.parse(localStorage.getItem("eclat_cart") || "[]");
        if (Array.isArray(data)) this.items = data;
      } catch (e) { this.items = []; }
    },
    count() {
      return this.items.reduce((sum, i) => sum + i.qty, 0);
    },
    subtotal() {
      return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    },
    render() {
      const countEl = document.getElementById("cartCount");
      const drawerCount = document.getElementById("drawerCount");
      const body = document.getElementById("cartBody");
      const foot = document.querySelector(".cart-foot");
      const empty = document.querySelector(".cart-empty");
      const itemsWrap = document.querySelector(".cart-items");

      const total = this.count();
      if (countEl) countEl.textContent = total;
      if (drawerCount) drawerCount.textContent = "(" + total + ")";

      if (!itemsWrap) return;

      if (this.items.length === 0) {
        empty.classList.remove("d-none");
        itemsWrap.classList.add("d-none");
        itemsWrap.innerHTML = "";
        foot.classList.add("d-none");
        return;
      }

      empty.classList.add("d-none");
      itemsWrap.classList.remove("d-none");
      foot.classList.remove("d-none");

      itemsWrap.innerHTML = this.items.map((item) => `
        <div class="cart-item">
          <div class="cart-item-body">
            <h6>${item.name}</h6>
            <small>$${(item.price).toFixed(2)}</small>
          </div>
          <div class="cart-item-controls">
            <button class="qty-btn" data-action="dec" data-name="${item.name}" aria-label="Decrease">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-name="${item.name}" aria-label="Increase">+</button>
            <button class="cart-item-remove" data-action="del" data-name="${item.name}" aria-label="Remove"><i class="bi bi-trash3"></i></button>
          </div>
        </div>
      `).join("");

      document.getElementById("cartSubtotal").textContent = "$" + this.subtotal().toFixed(2);
    },
  };

  cart.load();
  cart.render();

  /* Add to cart — event delegation (works for dynamically rendered cards) */
  document.addEventListener("click", (e) => {
    const checkoutBtn = e.target.closest(".cart-foot .btn");
    if (checkoutBtn) {
      e.preventDefault();
      window.location.href = "404.html";
      return;
    }
    const btn = e.target.closest(".add-cart");
    if (!btn) return;
    e.preventDefault();
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price) || 0;
    cart.add(name, price);

    const imgWrap = btn.closest(".product-card");
    if (gsapAvailable && !prefersReduced && imgWrap) {
      const tl = gsap.timeline();
      tl.to(imgWrap, { y: -10, duration: 0.12, ease: "power2.in" })
        .to(imgWrap, { y: 0, duration: 0.2, ease: "power2.out" });
    }
  });

  /* Buy now — add to cart and head straight to checkout */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".buy-now");
    if (!btn) return;
    e.preventDefault();
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price) || 0;
    cart.add(name, price);
    showToast(name + " added — taking you to checkout");
    setTimeout(() => { window.location.href = "checkout.html"; }, 900);
  });

  /* Cart item interactions (event delegation) */
  const cartBodyEl = document.getElementById("cartBody");
  cartBodyEl && cartBodyEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".qty-btn, .cart-item-remove");
    if (!btn) return;
    const name = btn.dataset.name;
    const action = btn.dataset.action;
    if (action === "inc") cart.changeQty(name, 1);
    else if (action === "dec") cart.changeQty(name, -1);
    else if (action === "del") cart.remove(name);
  });

  /* Drawer open / close */
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  const cartToggle = document.getElementById("cartToggle");
  const cartClose = document.getElementById("cartClose");
  const cartContinue = document.querySelector(".cart-continue");

  const openDrawer = () => {
    drawer.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  };
  const closeDrawer = () => {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  };

  cartToggle && cartToggle.addEventListener("click", openDrawer);
  cartClose && cartClose.addEventListener("click", closeDrawer);
  overlay && overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  /* Close cart from "Start Shopping" link */
  cartContinue && cartContinue.addEventListener("click", closeDrawer);

  /* ------------------------------------------------------------------
     7. Newsletter form
  ------------------------------------------------------------------ */
  const newsForm = document.getElementById("newsletterForm");
  let newsletterMsgTimer;
  newsForm && newsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let success = newsForm.nextElementSibling;
    if (!success || !success.classList.contains("newsletter-success")) {
      success = document.createElement("p");
      success.className = "newsletter-success";
      newsForm.after(success);
    }
    success.textContent = "Welcome to the Inner Glow Club! Check your inbox for your 15% off.";
    newsForm.reset();
    clearTimeout(newsletterMsgTimer);
    newsletterMsgTimer = setTimeout(() => {
      success.classList.add("hide");
      setTimeout(() => success.remove(), 300);
    }, 4000);
  });

  /* ------------------------------------------------------------------
     8. Toast
  ------------------------------------------------------------------ */
  let toastTimer;
  function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    const msgEl = document.getElementById("toastMsg");
    if (msgEl) msgEl.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  /* Expose shared APIs for other pages/scripts */
  window.StacklyCart = cart;
  window.StacklyToast = showToast;

  /* ------------------------------------------------------------------
     9. Smooth scroll for same-page anchor links
  ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (nav ? nav.offsetHeight : 0) - 10;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ------------------------------------------------------------------
     10. Email fields — allow only letters, numbers, @ and .
  ------------------------------------------------------------------ */
  document.querySelectorAll('input[type="email"]').forEach((input) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/[^A-Za-z0-9@.]/g, "");
    });
  });

})();

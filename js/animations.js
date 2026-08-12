/* ==========================================================================
   Stackly — Site-wide GSAP animation layer
   Navbar / footer entrances, page-hero entrances, section-head staggers,
   card-grid reveals, feature-image reveals, hover micro-motions and
   dashboard entrances. Loaded on every page after main.js / pages.js.
   No-op when GSAP is unavailable or motion is reduced.
   ========================================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ok = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (!ok || prefersReduced) return;

  gsap.registerPlugin(ScrollTrigger);

  const qsa = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  /* ------------------------------------------------------------------
     Heading letter-by-letter splitter + reveal
  ------------------------------------------------------------------ */
  function splitHeading(el) {
    if (!el || el.dataset.splitDone) return [];
    el.dataset.splitDone = "1";
    el.setAttribute("aria-label", String(el.textContent).replace(/\s+/g, " ").trim());
    el.classList.add("split-heading");

    const letters = [];
    const frag = document.createDocumentFragment();

    const splitText = (text, parent) => {
      String(text).split(/(\s+)/).forEach((w) => {
        if (!w.length) return;
        if (/^\s+$/.test(w)) { parent.appendChild(document.createTextNode(" ")); return; }
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
        parent.appendChild(word);
      });
    };

    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === 3) {
        splitText(node.data, frag);
      } else if (node.nodeType === 1) {
        if (node.tagName === "EM") {
          const em = document.createElement("em");
          Array.from(node.childNodes).forEach((n) => {
            if (n.nodeType === 3) splitText(n.data, em);
            else if (n.nodeType === 1) em.appendChild(n.cloneNode(true));
          });
          frag.appendChild(em);
        } else if (node.tagName === "BR") {
          frag.appendChild(document.createElement("br"));
        } else {
          frag.appendChild(node.cloneNode(true));
        }
      }
    });

    el.innerHTML = "";
    el.appendChild(frag);
    return letters;
  }

  function revealHeading(el) {
    const letters = splitHeading(el);
    if (!letters.length) return;
    const stagger = Math.min(0.03, 0.5 / letters.length);
    gsap.set(letters, { yPercent: 45, autoAlpha: 0 });
    gsap.to(letters, {
      yPercent: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  }

  const headingSelectors = [
    ".section-title", ".page-hero-title", ".pd-title", ".dash-head h2", ".dash-hero-title",
    ".navbar-nav .nav-link", ".footer h5",
  ];

  /* ------------------------------------------------------------------
     1. Navbar entrance
  ------------------------------------------------------------------ */
  const nav = document.getElementById("mainNav");
  if (nav) gsap.from(nav, { y: -56, autoAlpha: 0, duration: 0.7, ease: "power3.out", delay: 0.05 });

  /* ------------------------------------------------------------------
     2. Footer entrance
  ------------------------------------------------------------------ */
  const footer = document.querySelector(".footer");
  if (footer) {
    gsap.from(footer, {
      y: 40, autoAlpha: 0, duration: 0.8, ease: "power3.out",
      clearProps: "transform,opacity,visibility",
      scrollTrigger: { trigger: footer, start: "top 97%", once: true },
    });
  }

  /* ------------------------------------------------------------------
     3. Page-hero entrance (inner pages)
  ------------------------------------------------------------------ */
  const pageHero = document.querySelector(".page-hero");
  if (pageHero) {
    const heroKids = qsa(".container > .breadcrumb-bar, .container > p", pageHero)
      .filter((el) => !el.classList.contains("reveal") && !el.classList.contains("page-reveal"));
    if (heroKids.length) {
      gsap.from(heroKids, {
        y: 26, autoAlpha: 0, duration: 0.6, stagger: 0.09, ease: "power3.out", delay: 0.12,
        clearProps: "transform,opacity,visibility",
      });
    }
  }

  /* ------------------------------------------------------------------
     4. Section-head staggered text (heads without their own reveal)
  ------------------------------------------------------------------ */
  qsa(".section-head").forEach((head) => {
    if (head.dataset.headAnimated) return;
    if (head.classList.contains("reveal") || head.classList.contains("page-reveal")) return;
    head.dataset.headAnimated = "1";
    const parts = qsa(":scope > .eyebrow, :scope > .section-title, :scope > .section-sub", head)
      .filter((p) => !(p.classList.contains("section-title") && p.dataset.splitDone));
    if (!parts.length) return;
    gsap.from(parts, {
      y: 30, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: "power3.out",
      clearProps: "transform,opacity,visibility",
      scrollTrigger: { trigger: head, start: "top 88%", once: true },
    });
  });

  /* ------------------------------------------------------------------
     5. Card-grid reveals (cards without their own reveal class)
  ------------------------------------------------------------------ */
  const gridSelectors = [
    ".why-card", ".social-card", ".skin-type-card", ".tip-card",
    ".ingredient-card", ".brand-chip", ".newsletter-box",
  ];

  gridSelectors.forEach((sel) => {
    const items = qsa(sel).filter((el) =>
      !el.classList.contains("reveal") && !el.classList.contains("page-reveal") && !el.dataset.revealed);
    if (!items.length) return;

    const groups = {};
    items.forEach((el) => {
      const sec = el.closest("section") || el.closest("main") || el.parentElement;
      const key = (sec.id || "") + "|" + (sec.className || "");
      (groups[key] = groups[key] || []).push(el);
    });

    Object.keys(groups).forEach((key) => {
      const group = groups[key];
      const trigger = group[0].closest("section") || group[0].closest("main") || group[0].parentElement;
      group.forEach((el) => { el.dataset.revealed = "1"; });
      gsap.from(group, {
        y: 36, autoAlpha: 0, duration: 0.7, stagger: 0.09, ease: "power3.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: { trigger, start: "top 88%", once: true },
      });
    });
  });

  /* ------------------------------------------------------------------
     6. Feature image subtle reveal
  ------------------------------------------------------------------ */
  qsa(".story-img-main img, .story-img-float img").forEach((img) => {
    if (img.dataset.revealed) return;
    img.dataset.revealed = "1";
    gsap.from(img, {
      scale: 1.06, autoAlpha: 0.6, duration: 1.1, ease: "power2.out",
      clearProps: "transform,opacity,visibility",
      scrollTrigger: { trigger: img, start: "top 90%", once: true },
    });
  });

  /* ------------------------------------------------------------------
     7. Product page — animate rendered layout
  ------------------------------------------------------------------ */
  function animateProductLayout() {
    const wrap = document.getElementById("productWrap");
    if (!wrap || wrap.dataset.animated || !wrap.children.length) return;
    wrap.dataset.animated = "1";
    const cols = qsa(".row > .col-lg-6, .pd-tabs", wrap);
    const pdTitle = wrap.querySelector(".pd-title");
    if (pdTitle) revealHeading(pdTitle);
    if (cols.length) {
      gsap.from(cols, {
        y: 34, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: "power3.out", delay: 0.05,
        clearProps: "transform,opacity,visibility",
      });
    }
    const related = document.getElementById("relatedGrid");
    if (related && related.children.length && !related.dataset.animated) {
      related.dataset.animated = "1";
      gsap.from(Array.prototype.slice.call(related.children), {
        y: 26, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.2,
        clearProps: "transform,opacity,visibility",
      });
    }
  }
  const productWrap = document.getElementById("productWrap");
  if (productWrap) {
    animateProductLayout();
    const mo = new MutationObserver(() => {
      animateProductLayout();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
    mo.observe(productWrap, { childList: true });
    const relatedGrid = document.getElementById("relatedGrid");
    if (relatedGrid) mo.observe(relatedGrid, { childList: true });
  }

  /* ------------------------------------------------------------------
     8. Checkout — animate order confirmation when it appears
  ------------------------------------------------------------------ */
  const orderSuccess = document.getElementById("orderSuccess");
  if (orderSuccess) {
    new MutationObserver(() => {
      if (orderSuccess.style.display !== "none") {
        gsap.from(orderSuccess, {
          y: 30, autoAlpha: 0, duration: 0.6, ease: "power3.out",
          clearProps: "transform,opacity,visibility",
        });
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }
    }).observe(orderSuccess, { attributes: true, attributeFilter: ["style"] });
  }

  /* ------------------------------------------------------------------
     9. Hover micro-interactions
  ------------------------------------------------------------------ */
  qsa(".btn").forEach((btn) => {
    const ic = btn.querySelector("i.bi-arrow-up-right, i.bi-arrow-right, i.bi-arrow-up, i.bi-box-arrow-up-right");
    if (!ic) return;
    btn.addEventListener("mouseenter", () => gsap.to(ic, { x: 4, duration: 0.3, ease: "power2.out", overwrite: "auto" }));
    btn.addEventListener("mouseleave", () => gsap.to(ic, { x: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" }));
  });

  qsa(".footer-social a").forEach((a) => {
    const ic = a.querySelector("i");
    if (!ic) return;
    a.addEventListener("mouseenter", () => gsap.to(ic, { y: -3, rotate: -10, duration: 0.3, ease: "back.out(1.6)", overwrite: "auto" }));
    a.addEventListener("mouseleave", () => gsap.to(ic, { y: 0, rotate: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" }));
  });

  document.addEventListener("click", (e) => {
    const size = e.target.closest(".size-btn");
    if (size) gsap.fromTo(size, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "back.out(3)", clearProps: "transform" });
    const thumb = e.target.closest(".pd-thumb");
    if (thumb) gsap.fromTo(thumb, { scale: 0.94 }, { scale: 1, duration: 0.3, ease: "back.out(3)", clearProps: "transform" });
  });

  /* ------------------------------------------------------------------
     10. Heading letter-by-letter reveal
  ------------------------------------------------------------------ */
  headingSelectors.forEach((sel) => qsa(sel).forEach(revealHeading));

  /* ------------------------------------------------------------------
     11. Dashboard entrances & hovers (admin / customer)
  ------------------------------------------------------------------ */
  if (document.body.classList.contains("dash-body")) {
    const sidebarKids = qsa(".dash-sidebar > *");
    if (sidebarKids.length) {
      gsap.from(sidebarKids, { y: 18, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: "power3.out", delay: 0.05 });
    }
    const topbar = document.querySelector(".dash-topbar");
    if (topbar) gsap.from(topbar, { y: -24, autoAlpha: 0, duration: 0.6, ease: "power3.out", delay: 0.15 });

    qsa(".dash-icon-btn").forEach((btn) => {
      btn.addEventListener("mouseenter", () => gsap.to(btn, { scale: 1.1, duration: 0.25, ease: "power2.out", overwrite: "auto" }));
      btn.addEventListener("mouseleave", () => gsap.to(btn, { scale: 1, duration: 0.3, ease: "power2.out", overwrite: "auto", clearProps: "transform" }));
    });
    qsa(".dash-nav-link").forEach((link) => {
      const ic = link.querySelector("i");
      if (!ic) return;
      link.addEventListener("mouseenter", () => gsap.to(ic, { x: 3, duration: 0.3, ease: "power2.out", overwrite: "auto" }));
      link.addEventListener("mouseleave", () => gsap.to(ic, { x: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" }));
    });
  }
})();

/* ==========================================================================
   Stackly — Third-party animation libraries
   Lenis (buttery smooth scrolling) · AOS (scroll reveals) · Lottie (vector)
   Loads from CDNs asynchronously and initializes with GSAP ScrollTrigger
   sync. Respects prefers-reduced-motion and degrades gracefully if a CDN
   fails. Must load before main.js / pages.js (sets global capability flags).
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isDash = document.body && document.body.classList.contains("dash-body");

  /* Public pages hand their block reveals over to AOS; dashboards keep their
     own CSS view animations. Lenis (smooth scroll) applies everywhere. */
  window.STACKLY_AOS = !isDash;
  window.STACKLY_LENIS = true;
  window.STACKLY_LOTTIE = !isDash;

  if (reduced) {
    window.STACKLY_AOS = window.STACKLY_LENIS = window.STACKLY_LOTTIE = false;
    return;
  }

  function loadCss(href) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = cb;
    s.onerror = cb; /* continue even if a CDN fails */
    document.body.appendChild(s);
  }

  var pending = 0;
  function finished() {
    pending -= 1;
    if (pending <= 0) initAll();
  }

  if (window.STACKLY_LENIS) {
    loadCss("https://unpkg.com/lenis@1.3.26/dist/lenis.css");
    pending += 1;
    loadScript("https://unpkg.com/lenis@1.3.26/dist/lenis.min.js", finished);
  }
  if (window.STACKLY_AOS) {
    loadCss("https://unpkg.com/aos@2.3.4/dist/aos.css");
    pending += 1;
    loadScript("https://unpkg.com/aos@2.3.4/dist/aos.js", finished);
  }
  if (window.STACKLY_LOTTIE && document.querySelector("[data-lottie]")) {
    pending += 1;
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js", finished);
  }

  if (!pending) return;

  function initAll() {
    initLenis();
    initAos();
    initLottie();
  }

  /* ------------------------------------------------------------------
     Lenis — smooth scrolling, synced with GSAP ScrollTrigger
  ------------------------------------------------------------------ */
  function initLenis() {
    if (typeof Lenis === "undefined") return;

    var options = {
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      wheelMultiplier: 1,
      allowNestedScroll: true,
    };

    var lenis;
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      options.autoRaf = false;
      lenis = new Lenis(options);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      options.autoRaf = true;
      lenis = new Lenis(options);
    }
    window.StacklyLenis = lenis;

    /* Route programmatic smooth-scroll calls through Lenis */
    var native = window.scrollTo.bind(window);
    window.scrollTo = function (a, b) {
      if (typeof a === "number") { native(a, b); return; } /* Lenis' internal calls stay native */
      if (a && typeof a === "object") { lenis.scrollTo(a.top || 0, { duration: 1.1, easing: options.easing }); return; }
      native(a, b);
    };

    /* Smooth in-page anchor links (public pages only) */
    if (!isDash) {
      document.addEventListener("click", function (e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link) return;
        var href = link.getAttribute("href") || "#";
        if (href === "#") {
          e.preventDefault();
          lenis.scrollTo(0, { duration: 1.1, easing: options.easing });
          return;
        }
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -90, duration: 1.1, easing: options.easing });
      });
    }
  }

  /* ------------------------------------------------------------------
     AOS — scroll reveal for existing .reveal / .page-reveal elements
  ------------------------------------------------------------------ */
  function initAos() {
    if (typeof AOS === "undefined") return;

    document.querySelectorAll(".reveal, .page-reveal").forEach(function (el) {
      if (el.getAttribute("data-aos")) return;
      if (el.classList.contains("page-hero-title")) return; /* GSAP letter reveal handles these */
      if (el.closest("#orderSuccess")) return;              /* animated when the confirmation appears */
      el.setAttribute("data-aos", "fade-up");
      el.setAttribute("data-aos-duration", "800");
      var parent = el.parentElement;
      if (parent) {
        var peers = Array.prototype.slice.call(parent.children)
          .filter(function (c) { return c.getAttribute && c.getAttribute("data-aos"); });
        var idx = peers.indexOf(el);
        if (idx > 0) el.setAttribute("data-aos-delay", String(Math.min(idx, 5) * 60));
      }
    });

    AOS.init({
      once: true,
      duration: 800,
      easing: "ease-out-cubic",
      offset: 80,
    });
  }

  /* ------------------------------------------------------------------
     Lottie — lightweight vector animations
  ------------------------------------------------------------------ */
  function initLottie() {
    if (typeof lottie === "undefined") return;
    document.querySelectorAll("[data-lottie]").forEach(function (el) {
      var path = el.getAttribute("data-lottie");
      if (!path) return;
      lottie.loadAnimation({
        container: el,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: path,
      });
    });
  }
})();

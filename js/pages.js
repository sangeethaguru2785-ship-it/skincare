/* ==========================================================================
   Éclat — Inner page logic (shop, product, journal, contact, checkout, 404)
   ========================================================================== */
(function () {
  "use strict";

  var E = window.ECLAT || {};
  var PRODUCTS = E.PRODUCTS || [];
  var CATEGORIES = E.CATEGORIES || [];
  var money = E.money || function (n) { return "$" + Number(n).toFixed(2); };
  var productCard = E.productCard || function () { return ""; };
  var cart = window.EclatCart || null;
  var toast = window.EclatToast || function () {};
  var gsapOk = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------
     0. Scroll reveal for .page-reveal elements
  ------------------------------------------------------------------ */
  function reveal(scope) {
    if (!gsapOk || reduced) return;
    var els = qsa(".page-reveal", scope);
    els.forEach(function (el) {
      if (el.dataset.revealed) return;
      el.dataset.revealed = "1";
      gsap.from(el, {
        y: 44, autoAlpha: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
    if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 120);
  }

  /* ==================================================================
     SHOP PAGE
  ================================================================== */
  function initShop() {
    var grid = qs("#shopGrid");
    var catList = qs("#catList");
    var concernBoxes = qsa("#concernList input");
    var search = qs("#shopSearch");
    var sortSel = qs("#shopSort");
    var results = qs("#resultsCount");
    if (!grid) return;

    var params = new URLSearchParams(window.location.search);
    var state = {
      cat: (params.get("cat") || "all").toLowerCase(),
      concerns: [],
      query: (params.get("q") || "").toLowerCase(),
      sort: "featured",
    };

    if (search && state.query) search.value = params.get("q");

    /* Category sidebar */
    function catCount(key) {
      return key === "all" ? PRODUCTS.length : PRODUCTS.filter(function (p) { return p.category === key; }).length;
    }
    if (catList) {
      catList.innerHTML = CATEGORIES.map(function (c) {
        return '<li><button type="button" data-cat="' + c.key + '" class="' +
          (c.key === state.cat ? "active" : "") + '">' + c.label +
          " <span>" + catCount(c.key) + "</span></button></li>";
      }).join("");
    }
    catList && catList.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-cat]");
      if (!btn) return;
      state.cat = btn.dataset.cat;
      qsa("button[data-cat]", catList).forEach(function (b) { b.classList.toggle("active", b === btn); });
      renderGrid();
    });

    /* Concerns */
    concernBoxes.forEach(function (cb) {
      cb.addEventListener("change", function () {
        state.concerns = concernBoxes.filter(function (x) { return x.checked; }).map(function (x) { return x.value; });
        renderGrid();
      });
    });

    /* Search */
    search && search.addEventListener("input", function () { state.query = this.value.toLowerCase(); renderGrid(); });

    /* Sort */
    sortSel && sortSel.addEventListener("change", function () { state.sort = this.value; renderGrid(); });

    function filterAndSort() {
      var list = PRODUCTS.filter(function (p) {
        if (state.cat !== "all" && p.category !== state.cat) return false;
        if (state.concerns.length && state.concerns.indexOf(p.concern) === -1) return false;
        if (state.query) {
          var hay = (p.name + " " + p.catLabel + " " + p.short + " " + p.long).toLowerCase();
          if (hay.indexOf(state.query) === -1) return false;
        }
        return true;
      });
      if (state.sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
      else if (state.sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
      else if (state.sort === "rating") list.sort(function (a, b) { return b.rating - a.rating; });
      return list;
    }

    function renderGrid() {
      var list = filterAndSort();
      if (results) results.innerHTML = "<strong>" + list.length + "</strong> " + (list.length === 1 ? "product" : "products");

      if (!list.length) {
        grid.innerHTML =
          '<div class="shop-empty">' +
          '<i class="bi bi-search-heart"></i>' +
          "<h4>No matches in this edit</h4>" +
          "<p>Try clearing your filters, or explore our full clean-beauty range.</p>" +
          '<button type="button" class="btn btn-outline-dark rounded-pill px-4" id="resetShop">Show all products</button>' +
          "</div>";
        var reset = qs("#resetShop", grid);
        reset && reset.addEventListener("click", function () {
          state.cat = "all"; state.concerns = []; state.query = ""; state.sort = "featured";
          concernBoxes.forEach(function (cb) { cb.checked = false; });
          if (search) search.value = "";
          if (sortSel) sortSel.value = "featured";
          qsa("button[data-cat]", catList).forEach(function (b) { b.classList.toggle("active", b.dataset.cat === "all"); });
          renderGrid();
        });
      } else {
        grid.innerHTML = list.map(function (p) { return productCard(p); }).join("");
        if (gsapOk && !reduced) {
          gsap.fromTo(qsa(".product-card", grid),
            { y: 28, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: "power3.out",
              scrollTrigger: { trigger: grid, start: "top 88%", once: true } });
        }
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

    renderGrid();
    reveal();
  }

  /* ==================================================================
     PRODUCT DETAIL PAGE
  ================================================================== */
  function initProduct() {
    var wrap = qs("#productWrap");
    if (!wrap) return;
    var crumb = qs("#crumbName");
    var relatedGrid = qs("#relatedGrid");
    var relatedSection = qs("#relatedSection");

    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get("id"), 10);
    var p = PRODUCTS.filter(function (x) { return x.id === id; })[0] || PRODUCTS[0];

    if (document.title.indexOf("Éclat") === -1) document.title = p.name + " — Éclat Skincare";
    if (crumb) crumb.textContent = p.name;

    var badgeRow = "";
    if (p.badge === "new") badgeRow = '<span class="badge badge-new">New</span>';
    else if (p.badge === "hot") badgeRow = '<span class="badge badge-hot">Bestseller</span>';
    else if (p.badge === "sale") badgeRow = '<span class="badge badge-sale">-' +
      Math.round((1 - p.price / p.oldPrice) * 100) + "%</span>";

    var save = p.oldPrice
      ? '<span class="pd-save">Save $' + (p.oldPrice - p.price).toFixed(2) + "</span>" : "";

    /* Gallery: main image + 3 pool images from the catalogue */
    var pool = [p.img];
    for (var i = 0; i < 3; i++) {
      var other = PRODUCTS[(p.id + i) % PRODUCTS.length];
      if (pool.indexOf(other.img) === -1) pool.push(other.img);
    }
    while (pool.length < 4) pool.push(p.img);

    var thumbs = pool.map(function (src, idx) {
      return '<button type="button" class="pd-thumb' + (idx === 0 ? " active" : "") + '" data-src="' + src + '" aria-label="View image ' + (idx + 1) + '"><img src="' + src + '" alt="" loading="lazy" /></button>';
    }).join("");

    var sizeBtns = (p.sizes || ["Default"]).map(function (s, idx) {
      return '<button type="button" class="size-btn' + (idx === 0 ? " active" : "") + '" data-size="' + s + '">' + s + "</button>";
    }).join("");

    var ingredients = p.ingredients.map(function (i) {
      return "<li><i class='bi bi-check-circle-fill'></i> " + i + "</li>";
    }).join("");

    var reviews = [
      { name: "Sophie M.", date: "2 weeks ago", rating: 5, text: "Absolutely love this — my skin has never looked calmer or more even. The texture is beautiful and it layers perfectly." },
      { name: "Aisha R.", date: "1 month ago", rating: 5, text: "After years of trial and error, this is the one I keep repurchasing. Noticeable difference within a week." },
      { name: "Dana K.", date: "2 months ago", rating: 4, text: "Great product, lovely packaging and fast shipping. Knocked off a star only because I wish it came in a bigger size." },
    ];
    var reviewHtml = reviews.map(function (r) {
      var stars = "";
      for (var s = 0; s < r.rating; s++) stars += '<i class="bi bi-star-fill"></i>';
      return '<div class="review-item">' +
        '<div class="review-head"><strong>' + r.name + '</strong><span>Verified buyer · ' + r.date + "</span>" +
        '<span class="r-stars">' + stars + "</span></div>" +
        "<p>" + r.text + "</p></div>";
    }).join("");

    wrap.innerHTML =
      '<div class="row g-4 g-lg-5">' +
        '<div class="col-lg-6">' +
          '<div class="pd-gallery">' +
            '<div class="pd-main-img"><img src="' + p.img + '" id="pdMainImg" alt="' + p.name + '" /></div>' +
            '<div class="pd-thumbs">' + thumbs + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="col-lg-6">' +
          '<div class="pd-badge-row">' + badgeRow + save + "</div>" +
          '<span class="eyebrow">' + p.catLabel + "</span>" +
          '<h1 class="pd-title">' + p.name + "</h1>" +
          '<div class="pd-rating">' +
            '<span class="pd-rating-stars"><i class="bi bi-star-fill"></i></span>' +
            '<strong>' + p.rating.toFixed(1) + '</strong> <span>·</span> <a href="#reviews">' + p.reviews + " reviews</a>" +
          "</div>" +
          '<div class="pd-price"><span class="price">' + money(p.price) + "</span>" +
            (p.oldPrice ? '<span class="price-old">' + money(p.oldPrice) + "</span>" : "") + "</div>" +
          '<p class="pd-desc">' + p.long + "</p>" +
          '<div class="pd-options">' +
            '<span class="pd-option-label">Size <span>(select)</span></span>' +
            '<div class="size-options">' + sizeBtns + "</div>" +
          "</div>" +
          '<div class="pd-buy-row">' +
            '<div class="qty-stepper">' +
              '<button type="button" id="qtyDec" aria-label="Decrease quantity">−</button>' +
              '<input id="qtyInput" type="text" value="1" inputmode="numeric" aria-label="Quantity" />' +
              '<button type="button" id="qtyInc" aria-label="Increase quantity">+</button>' +
            "</div>" +
            '<button type="button" class="btn btn-dark btn-lg rounded-pill px-4 pd-add-btn" data-name="' + p.name + '" data-price="' + p.price + '">' +
              '<i class="bi bi-bag-plus me-1"></i> Add to Bag</button>' +
            '<button type="button" class="wishlist pd-wishlist" aria-label="Add to wishlist"><i class="bi bi-heart"></i></button>' +
          "</div>" +
          '<div class="pd-meta">' +
            '<div class="pd-meta-row"><i class="bi bi-truck"></i> <span><strong>Free shipping</strong> on orders over $60 — carbon balanced.</span></div>' +
            '<div class="pd-meta-row"><i class="bi bi-arrow-repeat"></i> <span><strong>30-day glow guarantee.</strong> Love it or your money back.</span></div>' +
            '<div class="pd-meta-row"><i class="bi bi-heart"></i> <span><strong>Vegan &amp; cruelty-free</strong> — dermatologist tested.</span></div>' +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="pd-tabs mt-5 pt-4" id="reviews">' +
        '<ul class="nav nav-pills tab-pills" id="pdTabs" role="tablist">' +
          '<li class="nav-item" role="presentation"><button class="nav-link active" data-bs-toggle="pill" data-bs-target="#tabDesc" type="button" role="tab">Description</button></li>' +
          '<li class="nav-item" role="presentation"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tabIng" type="button" role="tab">Ingredients</button></li>' +
          '<li class="nav-item" role="presentation"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tabRev" type="button" role="tab">Reviews (' + p.reviews + ")</button></li>" +
        "</ul>" +
        '<div class="tab-content">' +
          '<div class="tab-pane fade show active tab-pane-body" id="tabDesc" role="tabpanel">' +
            "<h5>Why you'll love it</h5><p>" + p.long + "</p><p>" + p.short + "</p>" +
          "</div>" +
          '<div class="tab-pane fade tab-pane-body" id="tabIng" role="tabpanel">' +
            "<h5>Key ingredients</h5><ul class='ingredient-list'>" + ingredients + "</ul>" +
          "</div>" +
          '<div class="tab-pane fade tab-pane-body" id="tabRev" role="tabpanel">' +
            "<h5>Customer reviews</h5>" + reviewHtml +
          "</div>" +
        "</div>" +
      "</div>";

    /* Thumb swap */
    qsa(".pd-thumb", wrap).forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        qsa(".pd-thumb", wrap).forEach(function (t) { t.classList.remove("active"); });
        thumb.classList.add("active");
        var main = qs("#pdMainImg");
        if (main) main.src = thumb.dataset.src;
      });
    });

    /* Size select */
    qsa(".size-btn", wrap).forEach(function (btn) {
      btn.addEventListener("click", function () {
        qsa(".size-btn", wrap).forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
      });
    });

    /* Qty stepper */
    var qtyInput = qs("#qtyInput", wrap);
    function setQty(v) {
      v = Math.max(1, Math.min(99, parseInt(v, 10) || 1));
      if (qtyInput) qtyInput.value = v;
    }
    qs("#qtyDec", wrap).addEventListener("click", function () { setQty((parseInt(qtyInput.value, 10) || 1) - 1); });
    qs("#qtyInc", wrap).addEventListener("click", function () { setQty((parseInt(qtyInput.value, 10) || 1) + 1); });
    qtyInput.addEventListener("change", function () { setQty(this.value); });

    /* Add to bag with quantity */
    var addBtn = qs(".pd-add-btn", wrap);
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        if (!cart) return;
        var qty = parseInt(qtyInput.value, 10) || 1;
        cart.add(p.name, p.price);
        if (qty > 1) cart.changeQty(p.name, qty - 1);
      });
    }

    /* Related products */
    if (relatedGrid) {
      var related = PRODUCTS.filter(function (x) { return x.id !== p.id && x.category === p.category; });
      if (related.length < 4) {
        PRODUCTS.filter(function (x) { return x.id !== p.id; }).forEach(function (x) {
          if (related.length >= 4) return;
          if (related.indexOf(x) === -1) related.push(x);
        });
      }
      related = related.slice(0, 4);
      if (related.length) {
        if (relatedSection) relatedSection.style.display = "";
        relatedGrid.innerHTML = related.map(function (r) { return productCard(r); }).join("");
      }
    }

    reveal(wrap);
    reveal(relatedGrid);
  }

  /* ==================================================================
     JOURNAL FILTER
  ================================================================== */
  function initJournal() {
    var filters = qs("#journalFilters");
    if (!filters) return;
    var cards = qsa(".journal-card");
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest(".jf-pill");
      if (!btn) return;
      qsa(".jf-pill", filters).forEach(function (b) { b.classList.toggle("active", b === btn); });
      var cat = btn.dataset.cat;
      cards.forEach(function (card) {
        var show = cat === "all" || card.dataset.cat === cat;
        card.style.display = show ? "" : "none";
        if (gsapOk && !reduced && show) gsap.from(card, { y: 30, autoAlpha: 0, duration: 0.5, ease: "power3.out" });
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  /* ==================================================================
     CONTACT FORM
  ================================================================== */
  function initContact() {
    var form = qs("#contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }
      form.classList.remove("was-validated");
      toast("Message sent — we'll reply within 24h");
      form.reset();
    });
  }

  /* ==================================================================
     CHECKOUT
  ================================================================== */
  function initCheckout() {
    var form = qs("#checkoutForm");
    if (!form) return;
    var osItems = qs("#osItems");
    var osCount = qs("#osCount");
    var osSubtotal = qs("#osSubtotal");
    var osShipping = qs("#osShipping");
    var osTax = qs("#osTax");
    var osTotal = qs("#osTotal");
    var placeTotal = qs("#placeOrderTotal");
    var success = qs("#orderSuccess");
    var checkoutSec = qs(".checkout-page");

    function productByName(name) {
      return PRODUCTS.filter(function (p) { return p.name === name; })[0] || null;
    }

    function renderSummary() {
      if (!cart) return;
      var items = cart.items || [];
      if (osCount) osCount.textContent = "(" + items.reduce(function (s, i) { return s + i.qty; }, 0) + " items)";

      if (osItems) {
        if (!items.length) {
          osItems.innerHTML = '<p class="os-empty">Your bag is empty. <a href="shop.html">Browse the shop</a>.</p>';
        } else {
          osItems.innerHTML = items.map(function (it) {
            var prod = productByName(it.name);
            var img = prod ? prod.img : "";
            var cat = prod ? prod.catLabel : "";
            var imgHtml = img ? '<img src="' + img + '" alt="' + it.name + '" />' : "";
            return '<div class="checkout-line">' + imgHtml +
              '<div class="cl-body"><h6>' + it.name + "</h6><small>" + cat + "</small></div>" +
              '<div class="cl-right"><strong>' + money(it.price * it.qty) + "</strong>" +
              '<span class="qty-val">Qty ' + it.qty + "</span></div></div>";
          }).join("");
        }
      }

      var subtotal = cart.subtotal();
      var shipping = subtotal === 0 || subtotal >= 60 ? 0 : 6;
      var tax = subtotal * 0.08;
      var total = subtotal + shipping + tax;
      if (osSubtotal) osSubtotal.textContent = money(subtotal);
      if (osShipping) osShipping.textContent = shipping === 0 ? (subtotal === 0 ? "—" : "Free") : money(shipping);
      if (osTax) osTax.textContent = money(tax);
      if (osTotal) osTotal.textContent = money(total);
      if (placeTotal) placeTotal.textContent = money(total);
    }

    renderSummary();
    if (cart) cart.render(); /* keep drawer in sync */

    /* Card formatting */
    var cardInput = qs("#coCard");
    cardInput && cardInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
    });
    var expInput = qs("#coExp");
    expInput && expInput.addEventListener("input", function () {
      var v = this.value.replace(/\D/g, "").slice(0, 4);
      this.value = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v;
    });
    var cvcInput = qs("#coCvc");
    cvcInput && cvcInput.addEventListener("input", function () { this.value = this.value.replace(/\D/g, "").slice(0, 4); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
      form.classList.remove("was-validated");
      if (cart) cart.clear();

      var orderNo = "EC-" + Math.floor(100000 + Math.random() * 900000);
      var orderTotal = osTotal ? osTotal.textContent : "$0.00";
      if (qs("#orderNo")) qs("#orderNo").textContent = orderNo;
      if (qs("#orderEta")) qs("#orderEta").textContent = "5–7 business days";
      if (qs("#orderTotal")) qs("#orderTotal").textContent = orderTotal;

      if (checkoutSec) checkoutSec.style.display = "none";
      if (success) success.style.display = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast("Order " + orderNo + " confirmed!");
    });
  }

  /* ==================================================================
     404 SEARCH
  ================================================================== */
  function init404() {
    var input = qs("#errorSearch");
    var btn = qs("#errorSearchBtn");
    function go() {
      var q = (input && input.value || "").trim();
      window.location.href = "shop.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    }
    if (btn) btn.addEventListener("click", go);
    if (input) input.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
  }

  /* ==================================================================
     BOOT
  ================================================================== */
  function boot() {
    initShop();
    initProduct();
    initJournal();
    initContact();
    initCheckout();
    init404();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

})();

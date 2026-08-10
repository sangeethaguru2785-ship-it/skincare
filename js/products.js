/* ==========================================================================
   Éclat — Shared product catalog & render helpers
   Used by shop.html, product.html and index.html
   ========================================================================== */
(function () {
  "use strict";

  const U = "https://images.unsplash.com/photo-";
  const Q = "q=80&w=600&auto=format&fit=crop";
  const S = "&auto=format&fit=crop";

  const PRODUCTS = [
    {
      id: 1,
      name: "Glow Renewal Serum",
      category: "serum",
      catLabel: "Serum",
      price: 42,
      oldPrice: 52,
      rating: 4.9,
      reviews: 214,
      badge: "new",
      concern: "brightening",
      img: U + "1679394270597-e90694d70350?" + Q + "&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2tpbmNhcmUlMjBzZXJ1bXxlbnwwfHwwfHx8MA%3D%3D",
      short: "A weightless glow-boosting serum with vitamin B3 and bakuchiol.",
      long: "Our cult-favourite Glow Renewal Serum pairs 5% niacinamide with antioxidant-rich bakuchiol to visibly even tone, smooth texture and restore a lit-from-within radiance. Absorbs in seconds — zero stickiness, zero fragrance overload.",
      ingredients: ["Niacinamide 5%", "Bakuchiol", "Hyaluronic Acid", "Green Tea Extract", "Squalane"],
      sizes: ["30ml", "50ml"],
    },
    {
      id: 2,
      name: "Hydra-Dew Cream",
      category: "moisturizer",
      catLabel: "Moisturizer",
      price: 36,
      oldPrice: null,
      rating: 4.8,
      reviews: 167,
      badge: "hot",
      concern: "hydration",
      img: U + "1665763630810-e6251bdd392d?" + Q + "&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2tpbmNhcmUlMjBzZXJ1bXxlbnwwfHwwfHx8MA%3D%3D",
      short: "A cloud-light gel-cream that floods skin with 72h hydration.",
      long: "Hydra-Dew Cream delivers multi-weight hyaluronic acid and ceramides in a whipped, cloud-like texture. It melts into skin to plump, soothe and lock in moisture for up to 72 hours — day or night.",
      ingredients: ["Ceramides NP", "Pentavitin", "Hyaluronic Acid", "Glycerin", "Aloe Vera"],
      sizes: ["50ml", "100ml"],
    },
    {
      id: 3,
      name: "Botanic Repair Oil",
      category: "oil",
      catLabel: "Facial Oil",
      price: 48,
      oldPrice: 60,
      rating: 5.0,
      reviews: 98,
      badge: "sale",
      concern: "repair",
      img: U + "1767102125499-0ce314436f67?" + Q + "&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2VydW0lMjBkcm9wcGVyfGVufDB8fDB8fHww",
      short: "A nourishing botanical blend that repairs the moisture barrier overnight.",
      long: "Botanic Repair Oil is a dry-touch blend of rosehip, marula and camellia oils that works while you sleep. It seals in actives, calms irritation and leaves a soft, dewy finish — never greasy.",
      ingredients: ["Rosehip Oil", "Marula Oil", "Camellia Oil", "Squalane", "Vitamin E"],
      sizes: ["30ml"],
    },
    {
      id: 4,
      name: "Velvet Sun Shield SPF50",
      category: "sun",
      catLabel: "Sun Care",
      price: 29,
      oldPrice: null,
      rating: 4.7,
      reviews: 132,
      badge: null,
      concern: "protection",
      img: U + "1775989982439-610be22c8c7b?" + Q + "&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHNraW5jYXJlJTIwc2VydW18ZW58MHx8MHx8fDA%3D",
      short: "An invisible, velvety SPF50 that doubles as a makeup-perfecting primer.",
      long: "Velvet Sun Shield delivers broad-spectrum SPF50 with a silky, blurring finish that sits beautifully under makeup. Fragrance-free, non-greasy and reef-safe.",
      ingredients: ["Zinc Oxide 18%", "Ceramide NP", "Glycerin", "Vitamin E"],
      sizes: ["40ml"],
    },
    {
      id: 5,
      name: "Vitamin C Brighten Serum",
      category: "serum",
      catLabel: "Serum",
      price: 39,
      oldPrice: null,
      rating: 4.9,
      reviews: 256,
      badge: "hot",
      concern: "brightening",
      img: U + "1723951174326-2a97221d3b7f?" + Q + "&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dml0YW1pbiUyMGMlMjBzZXJ1bXxlbnwwfHwwfHx8MA%3D%3D",
      short: "Stable 15% vitamin C to fade dark spots and boost antioxidant defence.",
      long: "Stabilised 15% ascorbyl glucoside brightens dullness and fades post-acne marks without irritation. Our slow-release encapsulation keeps it active — and kind — even on sensitive skin.",
      ingredients: ["15% Vitamin C", "Ferulic Acid", "Tranexamic Acid", "Hyaluronic Acid"],
      sizes: ["30ml"],
    },
    {
      id: 6,
      name: "Cloud Quench Gel",
      category: "moisturizer",
      catLabel: "Moisturizer",
      price: 32,
      oldPrice: null,
      rating: 4.6,
      reviews: 89,
      badge: null,
      concern: "hydration",
      img: U + "1640625696922-1fd63c0b97c9?" + Q + "&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHZpdGFtaW4lMjBjJTIwc2VydW18ZW58MHx8MHx8fDA%3D",
      short: "A featherlight gel moisturiser for oily and combination skin.",
      long: "Cloud Quench Gel swaps heavy butters for a breathable, water-gel formula. Green tea and niacinamide control shine while polyglutamic acid keeps skin plump without clogging pores.",
      ingredients: ["Polyglutamic Acid", "Niacinamide", "Green Tea Extract", "Hyaluronic Acid"],
      sizes: ["50ml"],
    },
    {
      id: 7,
      name: "Midnight Recovery Drops",
      category: "oil",
      catLabel: "Facial Oil",
      price: 44,
      oldPrice: null,
      rating: 4.8,
      reviews: 76,
      badge: "new",
      concern: "repair",
      img: U + "1702475139570-b90434243af2?" + Q + "&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHNlcnVtJTIwZHJvcHBlcnxlbnwwfHwwfHx8MA%3D%3D",
      short: "An overnight retinoid alternative that renews while you rest.",
      long: "Midnight Recovery Drops combine plant-derived bakuchiol, sea buckthorn and squalane to resurface and renew overnight. Wake up to smoother, brighter, calmer skin — no irritation, no sun sensitivity.",
      ingredients: ["Bakuchiol", "Sea Buckthorn", "Squalane", "Grape Seed Oil"],
      sizes: ["30ml"],
    },
    {
      id: 8,
      name: "Mineral Glow Tint SPF30",
      category: "sun",
      catLabel: "Sun Care",
      price: 34,
      oldPrice: null,
      rating: 4.5,
      reviews: 58,
      badge: null,
      concern: "protection",
      img: U + "1745159338135-39f6b462b382?" + Q + "&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dml0YW1pbiUyMGMlMjBzZXJ1bXxlbnwwfHwwfHx8MA%3D%3D",
      short: "A sheer mineral tint with SPF30 that gives skin a healthy glow.",
      long: "One product, three jobs: sun protection, light coverage and glow. Mineral Glow Tint evens tone with a soft-focus finish while mineral filters defend against UVA/UVB.",
      ingredients: ["Zinc Oxide 12%", "Iron Oxides", "Hyaluronic Acid", "Vitamin E"],
      sizes: ["35ml"],
    },
    {
      id: 9,
      name: "Barrier Repair Essence",
      category: "serum",
      catLabel: "Serum",
      price: 46,
      oldPrice: null,
      rating: 4.9,
      reviews: 121,
      badge: null,
      concern: "repair",
      img: U + "1596462502278-27bfdc403348?" + Q,
      short: "A hydrating essence that rebuilds a compromised skin barrier.",
      long: "Barrier Repair Essence is the first step after cleansing — a fermented rice-and-peptide essence that rebalances pH, calms redness and preps skin to absorb everything that follows.",
      ingredients: ["Fermented Rice Water", "Peptides", "Panthenol", "Beta-Glucan"],
      sizes: ["120ml"],
    },
    {
      id: 10,
      name: "Ceramide Soufflé Cream",
      category: "moisturizer",
      catLabel: "Moisturizer",
      price: 38,
      oldPrice: null,
      rating: 4.7,
      reviews: 143,
      badge: "hot",
      concern: "hydration",
      img: U + "1772023042063-ef4ae9bc6d39?" + Q + "&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHZpdGFtaW4lMjBjJTIwc2VydW18ZW58MHx8MHx8fDA%3D",
      short: "A whipped ceramide cream for very dry, sensitive skin.",
      long: "A fluffy soufflé of five ceramides, shea butter and colloidal oat that calms itching, flakiness and sensitivity. Dermatologist-approved for eczema-prone skin.",
      ingredients: ["5-Ceramide Complex", "Colloidal Oat", "Shea Butter", "Centella Asiatica"],
      sizes: ["50ml", "100ml"],
    },
    {
      id: 11,
      name: "Rosehip Glow Oil",
      category: "oil",
      catLabel: "Facial Oil",
      price: 41,
      oldPrice: null,
      rating: 4.6,
      reviews: 64,
      badge: null,
      concern: "brightening",
      img: U + "1643379850274-77d2e3703ef9?" + Q + "&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHNraW5jYXJlJTIwc2VydW18ZW58MHx8MHx8fDA%3D",
      short: "Cold-pressed rosehip oil that softens scars and revives dull skin.",
      long: "Single-ingredient, cold-pressed, organic rosehip oil — rich in vitamin A and omega-3s to fade scars, smooth fine lines and restore a dewy, healthy glow.",
      ingredients: ["Organic Rosehip Seed Oil 100%"],
      sizes: ["30ml"],
    },
    {
      id: 12,
      name: "Every-Skin Daily SPF",
      category: "sun",
      catLabel: "Sun Care",
      price: 27,
      oldPrice: null,
      rating: 4.6,
      reviews: 205,
      badge: null,
      concern: "protection",
      img: U + "1767256046031-743d33937c4e?" + Q + "&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNlcnVtJTIwZHJvcHBlcnxlbnwwfHwwfHx8MA%3D%3D",
      short: "The everyday SPF30 that works for every skin tone, minus white cast.",
      long: "A transparent, fast-absorbing SPF30 for all skin types and tones. No white cast, no pilling — just reliable daily defence that makes SPF a habit you'll actually keep.",
      ingredients: ["Zinc Oxide 10%", "Niacinamide", "Glycerin"],
      sizes: ["50ml"],
    },
  ];

  const CATEGORIES = [
    { key: "all", label: "All Products" },
    { key: "serum", label: "Serums" },
    { key: "moisturizer", label: "Moisturizers" },
    { key: "oil", label: "Facial Oils" },
    { key: "sun", label: "Sun Care" },
  ];

  function money(n) {
    return "$" + n.toFixed(2);
  }

  function stars(rating) {
    return '<i class="bi bi-star-fill"></i> ' + rating.toFixed(1);
  }

  function badgeHtml(p) {
    if (!p.badge) return "";
    const map = { new: "New", hot: "Bestseller", sale: "-" + Math.round((1 - p.price / p.oldPrice) * 100) + "%" };
    const cls = { new: "badge-new", hot: "badge-hot", sale: "badge-sale" }[p.badge];
    return '<span class="badge ' + cls + '">' + map[p.badge] + "</span>";
  }

  function productCard(p) {
    return (
      '<article class="product-card" data-id="' + p.id + '">' +
        '<div class="product-media">' +
          '<a href="product.html?id=' + p.id + '" aria-label="View ' + p.name + '">' +
            '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" />' +
          "</a>" +
          badgeHtml(p) +
          '<button class="wishlist" aria-label="Add to wishlist"><i class="bi bi-heart"></i></button>' +
          '<div class="product-actions">' +
            '<button class="add-cart" data-name="' + p.name + '" data-price="' + p.price + '"><i class="bi bi-bag-plus"></i> Add to Bag</button>' +
          "</div>" +
        "</div>" +
        '<div class="product-info">' +
          '<span class="product-cat">' + p.catLabel + "</span>" +
          '<h3><a class="product-title" href="product.html?id=' + p.id + '">' + p.name + "</a></h3>" +
          '<div class="product-rating">' + stars(p.rating) + " <span>(" + p.reviews + ")</span></div>" +
          '<div class="product-foot">' +
            '<strong class="price">' + money(p.price) + "</strong>" +
            (p.oldPrice ? '<span class="price-old">' + money(p.oldPrice) + "</span>" : "") +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  window.ECLAT = window.ECLAT || {};
  window.ECLAT.PRODUCTS = PRODUCTS;
  window.ECLAT.CATEGORIES = CATEGORIES;
  window.ECLAT.money = money;
  window.ECLAT.productCard = productCard;

})();

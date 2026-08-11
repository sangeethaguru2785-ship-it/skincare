/* ==========================================================================
   Stackly — Admin & Customer Dashboard logic
   Sidebar, view navigation, charts, table search, toasts, counters, dropdowns
   ========================================================================== */
(function () {
  "use strict";

  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var body = document.body;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Toast
  ------------------------------------------------------------------ */
  var toastEl = null;
  var toastTimer = null;

  function toast(message, type) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "dash-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.className = "dash-toast " + (type || "");
    toastEl.innerHTML = '<i class="bi bi-check-circle-fill"></i><span>' + message + "</span>";
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2800);
  }

  /* ------------------------------------------------------------------
     Sidebar toggle
  ------------------------------------------------------------------ */
  var toggleBtn = qs("#sidebarToggle");
  var overlay = document.createElement("div");
  overlay.className = "dash-overlay";
  document.body.appendChild(overlay);

  function isMobile() { return window.matchMedia("(max-width: 991.98px)").matches; }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      if (isMobile()) {
        body.classList.toggle("mobile-open");
        overlay.classList.toggle("show", body.classList.contains("mobile-open"));
        toggleBtn.innerHTML = body.classList.contains("mobile-open")
          ? '<i class="bi bi-x-lg"></i>'
          : '<i class="bi bi-list"></i>';
      } else {
        body.classList.toggle("sidebar-collapsed");
      }
    });
  }

  overlay.addEventListener("click", function () {
    body.classList.remove("mobile-open");
    overlay.classList.remove("show");
    if (toggleBtn) toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
  });

  window.addEventListener("resize", function () {
    if (!isMobile() && body.classList.contains("mobile-open")) {
      body.classList.remove("mobile-open");
      overlay.classList.remove("show");
      if (toggleBtn) toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
    }
    debouncedDraw();
  });

  /* ------------------------------------------------------------------
     Dropdowns (user + notifications)
  ------------------------------------------------------------------ */
  qsa(".dash-dd").forEach(function (dd) {
    var btn = qs(".dash-dd-toggle", dd);
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      qsa(".dash-dd.open").forEach(function (o) { if (o !== dd) o.classList.remove("open"); });
      dd.classList.toggle("open");
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".dash-dd")) qsa(".dash-dd.open").forEach(function (o) { o.classList.remove("open"); });
  });

  qsa("[data-mark-read]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      qsa(".dash-notify-item.unread").forEach(function (it) {
        it.classList.remove("unread");
      });
      var badge = qs("[data-notif-badge]");
      if (badge) badge.remove();
      var dot = qs(".dash-top-actions .dash-dot");
      if (dot) dot.remove();
      toast("All notifications marked as read");
    });
  });

  qsa(".dash-notify-item").forEach(function (it) {
    it.addEventListener("click", function () {
      it.classList.remove("unread");
      var count = qsa(".dash-notify-item.unread").length;
      var badge = qs("[data-notif-badge]");
      if (badge) { if (count === 0) badge.remove(); else badge.textContent = count; }
    });
  });

  /* ------------------------------------------------------------------
     View navigation
  ------------------------------------------------------------------ */
  var views = qsa(".dash-view");
  var navLinks = qsa("[data-view]");
  var pageTitle = qs("#dashPageTitle");

  function showView(name, push) {
    var view = qs("#view-" + name);
    if (!view) return;

    qsa(".dash-view.active").forEach(function (v) { v.classList.remove("active"); });
    view.classList.add("active");

    qsa(".dash-nav-link.active").forEach(function (n) { n.classList.remove("active"); });
    var link = qs('.dash-nav-link[data-view="' + name + '"]');
    if (link) link.classList.add("active");

    var title = view.getAttribute("data-title");
    if (pageTitle && title) pageTitle.textContent = title;

    if (isMobile()) {
      body.classList.remove("mobile-open");
      overlay.classList.remove("show");
      if (toggleBtn) toggleBtn.innerHTML = '<i class="bi bi-list"></i>';
    }

    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });

    if (push && window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + name);
    }

    animateCounters(view);
    drawCharts(view);

    qsa(".dash-dd.open").forEach(function (o) { o.classList.remove("open"); });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var name = link.getAttribute("data-view");
      if (!name) return;
      e.preventDefault();
      showView(name, true);
    });
  });

  qsa(".dash-nav-link[data-logout]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("Logging you out…");
      setTimeout(function () { window.location.href = "index.html"; }, 900);
    });
  });

  qsa("[data-logout]").forEach(function (btn) {
    if (btn.classList.contains("dash-nav-link")) return;
    btn.addEventListener("click", function () {
      toast("Logging you out…");
      setTimeout(function () { window.location.href = "index.html"; }, 900);
    });
  });

  var hash = (window.location.hash || "").replace("#", "");
  if (hash && qs("#view-" + hash)) showView(hash, false);
  else if (views.length) showView(views[0].getAttribute("data-title") ? views[0].id.replace("view-", "") : "overview", false);

  /* ------------------------------------------------------------------
     Count-up counters
  ------------------------------------------------------------------ */
  var counted = {};

  function animateCounters(scope) {
    qsa("[data-count]", scope).forEach(function (el) {
      var key = el.getAttribute("data-count") + "-" + el.className;
      if (counted[key]) return;
      counted[key] = true;

      var target = parseFloat(el.getAttribute("data-count"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var dec = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
      var dur = reduced ? 0 : 1100;
      var start = performance.now();

      function frame(now) {
        var p = Math.min((now - start) / dur, 1);
        p = 1 - Math.pow(1 - p, 3);
        var val = target * p;
        var out = prefix + val.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
        el.textContent = out;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  /* ------------------------------------------------------------------
     Canvas charts (no external library)
  ------------------------------------------------------------------ */
  var debounceTimer = null;

  function setupCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 200;
    var h = canvas.clientHeight || 200;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    if (h <= 0) return;
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBars(canvas, cfg, p) {
    p = p == null ? 1 : p;
    var d = setupCanvas(canvas);
    var ctx = d.ctx, w = d.w, h = d.h;
    var labels = cfg.labels || [], values = cfg.values || [], colors = cfg.colors || [];
    var pad = { l: 34, r: 10, t: 18, b: 30 };
    var max = Math.max.apply(null, values.concat([1]));
    var bw = (w - pad.l - pad.r) / values.length;
    var barW = Math.min(bw * 0.56, 46);

    ctx.font = "10px Jost, sans-serif";
    ctx.textAlign = "center";

    values.forEach(function (v, i) {
      var bh = Math.max(((v / max) * (h - pad.t - pad.b)) * p, p > 0 ? 2 : 0);
      var x = pad.l + bw * i + (bw - barW) / 2;
      var y = h - pad.b - bh;

      var grad = ctx.createLinearGradient(0, y, 0, h - pad.b);
      grad.addColorStop(0, colors[i] || "#C18A4F");
      grad.addColorStop(1, (colors[i] || "#C18A4F") + "55");
      ctx.fillStyle = grad;
      roundRectPath(ctx, x, y, barW, bh, 6);
      ctx.fill();

      ctx.fillStyle = "#8A8177";
      ctx.fillText(labels[i] || "", pad.l + bw * i + bw / 2, h - 8);

      var shown = Math.round(v * p);
      ctx.fillStyle = "#23201A";
      ctx.font = "600 10px Jost, sans-serif";
      ctx.fillText(cfg.prefix === false ? String(shown) : (cfg.prefix || "") + shown, pad.l + bw * i + bw / 2, y - 6);
      ctx.font = "10px Jost, sans-serif";
    });
  }

  function drawLine(canvas, cfg, p) {
    p = p == null ? 1 : p;
    var d = setupCanvas(canvas);
    var ctx = d.ctx, w = d.w, h = d.h;
    var labels = cfg.labels || [], values = cfg.values || [];
    var pad = { l: 40, r: 14, t: 18, b: 30 };
    var max = Math.max.apply(null, values.concat([1]));
    var min = Math.min.apply(null, values.concat([0]));
    var range = (max - min) || 1;
    var stepX = (w - pad.l - pad.r) / Math.max(values.length - 1, 1);
    var color = cfg.color || "#C18A4F";
    var n = Math.max(2, Math.round(values.length * p));

    function pt(i) {
      return {
        x: pad.l + stepX * i,
        y: h - pad.b - ((values[i] - min) / range) * (h - pad.t - pad.b)
      };
    }

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var q = pt(i);
      if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();

    ctx.lineTo(pt(n - 1).x, h - pad.b);
    ctx.lineTo(pt(0).x, h - pad.b);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
    grad.addColorStop(0, color + "33");
    grad.addColorStop(1, color + "00");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.fillStyle = color;
    for (var j = 0; j < n; j++) {
      var r = pt(j);
      ctx.beginPath();
      ctx.arc(r.x, r.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = "10px Jost, sans-serif";
    ctx.fillStyle = "#8A8177";
    ctx.textAlign = "center";
    labels.forEach(function (l, i) {
      ctx.fillText(l, pad.l + stepX * i, h - 8);
    });
  }

  function drawDoughnut(canvas, cfg, p) {
    p = p == null ? 1 : p;
    var d = setupCanvas(canvas);
    var ctx = d.ctx, w = d.w, h = d.h;
    var values = cfg.values || [], colors = cfg.colors || [], labels = cfg.labels || [];
    var total = values.reduce(function (a, b) { return a + b; }, 0) || 1;
    var cx = w / 2, cy = h / 2;
    var radius = Math.min(w, h) / 2 - 12;
    var inner = radius * 0.62;
    var start = -Math.PI / 2;

    values.forEach(function (v, i) {
      var sweep = ((v / total) * Math.PI * 2) * p;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, start + sweep);
      ctx.arc(cx, cy, inner, start + sweep, start, true);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      start += sweep;
    });

    ctx.fillStyle = "#23201A";
    ctx.textAlign = "center";
    ctx.font = "500 15px Fraunces, Georgia, serif";
    ctx.fillText(cfg.total || (cfg.prefix || "") + total, cx, cy - 2);
    ctx.font = "9px Jost, sans-serif";
    ctx.fillStyle = "#8A8177";
    ctx.fillText(cfg.sub || "Total", cx, cy + 14);

    if (cfg.legend && p >= 1) {
      var legend = document.createElement("div");
      legend.className = "chart-legend";
      cfg.labels.forEach(function (l, i) {
        var s = document.createElement("span");
        s.innerHTML = "<i style='background:" + colors[i % colors.length] + "'></i>" + l;
        legend.appendChild(s);
      });
      var slot = canvas.parentElement.querySelector(".chart-legend");
      if (slot) slot.replaceWith(legend);
      else canvas.parentElement.appendChild(legend);
    }
  }

  function drawMultiLine(canvas, cfg, p) {
    p = p == null ? 1 : p;
    var d = setupCanvas(canvas);
    var ctx = d.ctx, w = d.w, h = d.h;
    var labels = cfg.labels || [], series = cfg.series || [];
    var pad = { l: 40, r: 14, t: 18, b: 30 };
    var all = [];
    series.forEach(function (s) { all = all.concat(s.values || []); });
    var max = Math.max.apply(null, all.concat([1]));
    var min = Math.min.apply(null, all.concat([0]));
    var range = (max - min) || 1;
    var stepX = (w - pad.l - pad.r) / Math.max(labels.length - 1, 1);

    function pt(s, i) {
      return {
        x: pad.l + stepX * i,
        y: h - pad.b - ((s.values[i] - min) / range) * (h - pad.t - pad.b)
      };
    }

    series.forEach(function (s) {
      var color = s.color || "#C18A4F";
      var n = Math.max(2, Math.round(s.values.length * p));

      ctx.lineWidth = 2.4;
      ctx.strokeStyle = color;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var q = pt(s, i);
        if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
      }
      ctx.stroke();

      ctx.fillStyle = color;
      for (var j = 0; j < n; j++) {
        var r = pt(s, j);
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.font = "10px Jost, sans-serif";
    ctx.fillStyle = "#8A8177";
    ctx.textAlign = "center";
    labels.forEach(function (l, i) {
      ctx.fillText(l, pad.l + stepX * i, h - 8);
    });

    if (cfg.legend && p >= 1) {
      var legend = document.createElement("div");
      legend.className = "chart-legend";
      series.forEach(function (s) {
        var sp = document.createElement("span");
        sp.innerHTML = "<i style='background:" + s.color + "'></i>" + s.name;
        legend.appendChild(sp);
      });
      var slot = canvas.parentElement.querySelector(".chart-legend");
      if (slot) slot.replaceWith(legend);
      else canvas.parentElement.appendChild(legend);
    }
  }

  function drawGauge(canvas, cfg, p) {
    p = p == null ? 1 : p;
    var d = setupCanvas(canvas);
    var ctx = d.ctx, w = d.w, h = d.h;
    var value = (cfg.value || 0) * p;
    var color = cfg.color || "#7A8B6F";
    var track = cfg.track || "rgba(35,32,26,.08)";
    var textColor = cfg.textColor || "#23201A";
    var subColor = cfg.subColor || "#8A8177";
    var cx = w / 2;
    var cy = h - 10;
    var radius = Math.min(w / 2 - 14, h - 22);
    var frac = Math.max(0, Math.min(value / 100, 1));

    ctx.lineWidth = 11;
    ctx.lineCap = "round";
    ctx.strokeStyle = track;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, Math.PI * 2, false);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, Math.PI + frac * Math.PI, false);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = textColor;
    ctx.font = "600 27px Fraunces, Georgia, serif";
    ctx.fillText(Math.round(value) + "%", cx, cy - 20);
    ctx.font = "10px Jost, sans-serif";
    ctx.fillStyle = subColor;
    ctx.fillText(cfg.sub || "", cx, cy + 2);
  }

  function drawSpark(canvas, cfg, p) {
    p = p == null ? 1 : p;
    var d = setupCanvas(canvas);
    var ctx = d.ctx, w = d.w, h = d.h;
    var values = cfg.values || [];
    if (values.length < 2) return;
    var color = cfg.color || "#C18A4F";
    var pad = 3;
    var max = Math.max.apply(null, values.concat([1]));
    var min = Math.min.apply(null, values.concat([0]));
    var range = (max - min) || 1;
    var stepX = (w - pad * 2) / (values.length - 1);
    var n = Math.max(2, Math.round(values.length * p));

    function pt(i) {
      return {
        x: pad + stepX * i,
        y: h - pad - ((values[i] - min) / range) * (h - pad * 2)
      };
    }

    ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var q = pt(i);
      if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    if (cfg.fill !== false && n > 1) {
      ctx.lineTo(pt(n - 1).x, h - pad);
      ctx.lineTo(pt(0).x, h - pad);
      ctx.closePath();
      var grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, color + "38");
      grad.addColorStop(1, color + "00");
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  function parseChart(canvas) {
    var raw = canvas.getAttribute("data-chart");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function drawChart(canvas, cfg, p) {
    var t = canvas.getAttribute("data-type");
    if (t === "line") drawLine(canvas, cfg, p);
    else if (t === "doughnut") drawDoughnut(canvas, cfg, p);
    else if (t === "multi-line") drawMultiLine(canvas, cfg, p);
    else if (t === "gauge") drawGauge(canvas, cfg, p);
    else if (t === "spark") drawSpark(canvas, cfg, p);
    else drawBars(canvas, cfg, p);
  }

  function animateChart(canvas, cfg) {
    var duration = reduced ? 0 : 850;
    var start = performance.now();
    function frame(now) {
      var p = Math.min((now - start) / duration, 1);
      p = 1 - Math.pow(1 - p, 3);
      drawChart(canvas, cfg, p);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function drawCharts(scope) {
    qsa("canvas[data-chart]", scope).forEach(function (canvas) {
      var view = canvas.closest(".dash-view");
      if (view && !view.classList.contains("active")) return;
      var cfg = parseChart(canvas);
      if (!cfg) return;
      var t = canvas.getAttribute("data-type");
      if (t === "spark" || reduced) { drawChart(canvas, cfg, 1); return; }
      animateChart(canvas, cfg);
    });
  }

  function debouncedDraw() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      drawCharts(document);
    }, 220);
  }

  /* ------------------------------------------------------------------
     Table search + row actions
  ------------------------------------------------------------------ */
  qsa(".tbl-search input").forEach(function (input) {
    input.addEventListener("input", function () {
      var term = input.value.toLowerCase().trim();
      var table = input.closest(".dash-table-wrap").querySelector("table");
      if (!table) return;
      var rows = qsa("tbody tr", table);
      var shown = 0;
      rows.forEach(function (row) {
        var match = row.textContent.toLowerCase().indexOf(term) !== -1;
        row.style.display = match ? "" : "none";
        if (match) shown++;
      });
      var count = qs(".tbl-count", table.closest(".dash-table-wrap"));
      if (count) count.textContent = shown + " entries";
    });
  });

  qsa("[data-del]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var row = btn.closest("tr") || btn.closest(".dash-list-item");
      if (row) row.remove();
      toast("Item removed", "danger");
      var table = btn.closest("table");
      var wrap = table ? table.closest(".dash-table-wrap") : null;
      var count = wrap ? qs(".tbl-count", wrap) : null;
      if (count && table) count.textContent = qsa("tbody tr", table).filter(function (r) { return r.style.display !== "none"; }).length + " entries";
    });
  });

  qsa("[data-action]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var label = btn.getAttribute("data-action") || "Action";
      toast(label + " — demo action");
    });
  });

  qsa("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var code = btn.getAttribute("data-copy") || "";
      if (navigator.clipboard) navigator.clipboard.writeText(code);
      toast("Coupon " + code + " copied");
    });
  });

  qsa(".dash-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      toast("Changes saved successfully", "success");
    });
  });

  qsa("[data-add-cart]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("Added to cart", "success");
    });
  });

  /* ------------------------------------------------------------------
     Init
  ------------------------------------------------------------------ */
  qsa(".tbl-count").forEach(function (c) {
    var table = c.closest(".dash-table-wrap").querySelector("table");
    if (table) c.textContent = qsa("tbody tr", table).length + " entries";
  });

  if (reduced) {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
})();

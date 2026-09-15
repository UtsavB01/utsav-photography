/* Utsav Biswas — Photography. Vanilla JS, no build step, no dependencies. */
(function () {
  "use strict";

  /* ---------------- Nav: solid on scroll ---------------- */
  var nav = document.querySelector(".site-nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("is-solid", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Mobile nav toggle ---------------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".site-nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------------- Portfolio: category filter ---------------- */
  var filterBar = document.querySelector(".filter-bar");
  var masonry = document.querySelector(".masonry");
  if (filterBar && masonry) {
    var items = Array.prototype.slice.call(masonry.querySelectorAll("figure"));
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      filterBar.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      var f = btn.getAttribute("data-filter");
      items.forEach(function (fig) {
        var match = f === "all" || fig.getAttribute("data-category") === f;
        fig.hidden = !match;
      });
    });

    /* Pre-select a category via ?cat=birds links from the home page */
    var params = new URLSearchParams(window.location.search);
    var cat = params.get("cat");
    if (cat) {
      var target = filterBar.querySelector('button[data-filter="' + cat + '"]');
      if (target) target.click();
    }
  }

  /* ---------------- Lightbox ---------------- */
  var lb = document.querySelector(".lightbox");
  if (lb && masonry) {
    var lbImg = lb.querySelector(".lightbox__img-wrap img");
    var lbCommon = lb.querySelector('[data-field="common"]');
    var lbSci = lb.querySelector('[data-field="sci"]');
    var lbNote = lb.querySelector('[data-field="note"]');
    var lbLoc = lb.querySelector('[data-field="location"]');
    var lbDate = lb.querySelector('[data-field="date"]');
    var lbCamera = lb.querySelector('[data-field="camera"]');
    var lbLens = lb.querySelector('[data-field="lens"]');
    var lbIso = lb.querySelector('[data-field="iso"]');
    var lbExposure = lb.querySelector('[data-field="exposure"]');
    var closeBtn = lb.querySelector(".lightbox__close");
    var prevBtn = lb.querySelector(".lightbox__nav--prev");
    var nextBtn = lb.querySelector(".lightbox__nav--next");
    var lastFocused = null;
    var currentIndex = -1;

    function visibleFigures() {
      return Array.prototype.slice.call(masonry.querySelectorAll("figure")).filter(function (f) {
        return !f.hidden;
      });
    }

    function openAt(index) {
      var figs = visibleFigures();
      if (!figs.length) return;
      currentIndex = (index + figs.length) % figs.length;
      var fig = figs[currentIndex];
      var img = fig.querySelector("img");
      var d = fig.dataset;
      lbImg.src = img.getAttribute("data-full") || img.src;
      lbImg.alt = img.alt || "";
      lbCommon.textContent = d.common || "Untitled";
      lbSci.textContent = d.sci || "";
      lbSci.hidden = !d.sci;
      lbNote.textContent = d.note || "";
      lbLoc.textContent = d.location || "—";
      lbDate.textContent = d.date || "—";
      lbCamera.textContent = d.camera || "—";
      lbLens.textContent = d.lens || "—";
      lbIso.textContent = d.iso || "—";
      lbExposure.textContent = d.exposure || "—";
      lastFocused = document.activeElement;
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    masonry.addEventListener("click", function (e) {
      var img = e.target.closest("img");
      if (!img) return;
      var fig = img.closest("figure");
      var figs = visibleFigures();
      openAt(figs.indexOf(fig));
    });

    closeBtn.addEventListener("click", close);
    lb.addEventListener("click", function (e) {
      if (e.target === lb) close();
    });
    prevBtn.addEventListener("click", function () { openAt(currentIndex - 1); });
    nextBtn.addEventListener("click", function () { openAt(currentIndex + 1); });

    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") openAt(currentIndex - 1);
      if (e.key === "ArrowRight") openAt(currentIndex + 1);
    });
  }
})();

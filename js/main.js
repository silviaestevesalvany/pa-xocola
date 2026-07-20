/* ==========================================================================
   Pa & Xocolà — comportament i moviment de la web
   Reemplaça el runtime de Claude Design (support.js) amb JS natiu i lleuger.
   Inclou: menú mòbil, hover/focus inline, aparició (reveal), masonry,
   vídeo hero ping-pong i parallax.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Menú mòbil ---- */
  (function () {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("menu-mobil");
    if (!toggle || !menu) return;

    function close() {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    window.addEventListener(
      "resize",
      function () {
        if (window.innerWidth >= 768) close();
      },
      { passive: true }
    );
  })();

  /* ---- Estils inline en hover / focus (equivalent a style-hover/style-focus) ---- */
  (function () {
    function bind(attr, onEvt, offEvt) {
      var els = document.querySelectorAll("[" + attr + "]");
      Array.prototype.forEach.call(els, function (el) {
        var extra = el.getAttribute(attr);
        el.addEventListener(onEvt, function () {
          var base = el.getAttribute("style") || "";
          el.setAttribute("data-style-base", base);
          el.setAttribute("style", base + ";" + extra);
        });
        el.addEventListener(offEvt, function () {
          var base = el.getAttribute("data-style-base");
          if (base !== null) el.setAttribute("style", base);
        });
      });
    }
    bind("style-hover", "mouseenter", "mouseleave");
    bind("style-focus", "focus", "blur");
  })();

  /* ---- Aparició en scroll (reveal) ---- */
  (function () {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) {
        e.style.opacity = "1";
        e.style.transform = "none";
      });
      return;
    }
    els.forEach(function (e) {
      e.style.opacity = "0";
      e.style.transform = "translateY(14px)";
      e.style.transition =
        "opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1)";
      e.style.willChange = "opacity, transform";
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (ent) {
          if (!ent.isIntersecting) return;
          var el = ent.target;
          var d = parseInt(el.getAttribute("data-delay") || "0", 10);
          setTimeout(function () {
            el.style.opacity = "1";
            el.style.transform = "none";
          }, d);
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );
    els.forEach(function (e) {
      io.observe(e);
    });
  })();

  /* ---- Galeria masonry (nombre de columnes segons amplada) ---- */
  (function () {
    var grid = document.getElementById("galeria-grid");
    if (!grid) return;
    function set() {
      var w = window.innerWidth;
      grid.style.columnCount = w >= 1000 ? "3" : w >= 620 ? "2" : "1";
    }
    set();
    window.addEventListener("resize", set, { passive: true });
  })();

  /* ---- Sliders (marquee): pausa mentre es manté premut en mòbil ---- */
  (function () {
    var masks = document.querySelectorAll(".marquee-mask");
    Array.prototype.forEach.call(masks, function (mask) {
      var track = mask.querySelector(".marquee-track");
      if (!track) return;
      var pause = function () {
        track.style.animationPlayState = "paused";
      };
      var resume = function () {
        track.style.animationPlayState = "running";
      };
      mask.addEventListener("touchstart", pause, { passive: true });
      mask.addEventListener("touchend", resume, { passive: true });
      mask.addEventListener("touchcancel", resume, { passive: true });
    });
  })();

  /* ---- Vídeo hero: moviment ping-pong (endavant i enrere) ---- */
  (function () {
    var v = document.getElementById("heroVideo");
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    // Mòbil / tàctil: bucle simple (el seek invers del ping-pong no és fiable en mòbil)
    if (window.matchMedia("(hover:none), (max-width:767px)").matches) {
      v.loop = true;
      var play = function () {
        v.play().catch(function () {});
      };
      v.addEventListener("loadeddata", play);
      play();
      // reintenta a la primera interacció per si l'autoplay estava bloquejat
      document.addEventListener("touchstart", play, { passive: true, once: true });
      return;
    }
    var dir = 1;
    var raf;
    function playForward() {
      dir = 1;
      v.playbackRate = 1;
      v.play().catch(function () {});
    }
    function startReverse() {
      dir = -1;
      v.pause();
      var last = performance.now();
      function step(now) {
        if (dir !== -1) return;
        var dt = (now - last) / 1000;
        last = now;
        v.currentTime = Math.max(0, v.currentTime - dt);
        if (v.currentTime <= 0.03) {
          playForward();
          return;
        }
        raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }
    v.addEventListener("timeupdate", function () {
      if (dir === 1 && v.duration && v.currentTime >= v.duration - 0.06) startReverse();
    });
    v.addEventListener("loadeddata", playForward);
    playForward();
  })();

  /* ---- Parallax: fos del hero i desplaçament de la galeria ---- */
  (function () {
    var bg = document.getElementById("heroBg");
    var figs = Array.prototype.slice.call(document.querySelectorAll(".gallery-fig"));
    if (!bg && !figs.length) return;
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var vh = window.innerHeight;
        if (bg) bg.style.opacity = Math.max(0, 1 - y / (vh * 0.85));
        figs.forEach(function (f, i) {
          var r = f.getBoundingClientRect();
          if (r.bottom > -80 && r.top < vh + 80) {
            var off = (r.top + r.height / 2 - vh / 2) / vh;
            var amp = i % 2 === 0 ? -22 : -12;
            f.style.transform = "translateY(" + off * amp + "px)";
          }
        });
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ---- Estat "Obert ara / Tancat" segons l'horari (Europe/Madrid) ---- */
  (function () {
    var nodes = document.querySelectorAll(".open-pill");
    if (!nodes.length) return;

    // Horari en minuts des de mitjanit, indexat pel dia JS (0=diumenge ... 6=dissabte)
    var schedule = {
      0: [480, 840], // diumenge 8:00–14:00
      1: [420, 1230], // dilluns 7:00–20:30
      2: [420, 1230],
      3: [420, 1230],
      4: [420, 1230],
      5: [420, 1230],
      6: [480, 1230] // dissabte 8:00–20:30
    };
    var dayNames = ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"];

    function madridNow() {
      try {
        var f = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/Madrid",
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
        var map = {};
        f.formatToParts(new Date()).forEach(function (p) {
          map[p.type] = p.value;
        });
        var wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        var day = wd[map.weekday];
        var hour = parseInt(map.hour, 10) % 24; // "24" a mitjanit en alguns entorns
        var min = parseInt(map.minute, 10);
        if (day == null || isNaN(hour) || isNaN(min)) return null;
        return { day: day, minutes: hour * 60 + min };
      } catch (e) {
        return null;
      }
    }

    function fmt(mins) {
      var h = Math.floor(mins / 60);
      var m = mins % 60;
      return h + ":" + (m < 10 ? "0" + m : m);
    }

    function nextOpening(day, minutes) {
      var today = schedule[day];
      if (today && minutes < today[0]) return { label: "avui", opens: today[0] };
      for (var i = 1; i <= 7; i++) {
        var d = (day + i) % 7;
        if (schedule[d]) return { label: i === 1 ? "demà" : dayNames[d], opens: schedule[d][0] };
      }
      return null;
    }

    function render() {
      var now = madridNow();
      var isOpen = false;
      var text;
      if (now) {
        var s = schedule[now.day];
        if (s && now.minutes >= s[0] && now.minutes < s[1]) {
          isOpen = true;
          text = "Obert ara · tanquem a les " + fmt(s[1]);
        } else {
          var nx = nextOpening(now.day, now.minutes);
          text = nx ? "Tancat ara · obrim " + nx.label + " a les " + fmt(nx.opens) : "Tancat ara";
        }
      } else {
        text = "Obert de dilluns a diumenge";
      }
      Array.prototype.forEach.call(nodes, function (el) {
        var t = el.querySelector(".txt");
        if (t) t.textContent = text;
        el.classList.toggle("is-open", isOpen);
        el.classList.add("is-visible");
      });
    }

    render();
    setInterval(render, 60000);
  })();
})();

(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var tilt = fine && !reduce;

  /* ---------- 1. Theme toggle (dark by default, remembers the choice) ---------- */
  function currentTheme() {
    return root.dataset.theme || "dark";
  }

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "theme-toggle";

  function updateToggle() {
    var dark = currentTheme() === "dark";
    toggle.textContent = dark ? "Light mode" : "Dark mode";
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }

  toggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    updateToggle();
  });

  var links = document.querySelector(".nav__links");
  if (links) {
    var item = document.createElement("li");
    item.className = "nav__theme";
    item.appendChild(toggle);
    links.appendChild(item);
  }
  updateToggle();

  /* ---------- 2. Project filter (built from the tags already in the HTML) ---------- */
  var grid = document.querySelector("#projects .grid");
  var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".card")) : [];

  if (cards.length) {
    var tags = [];
    cards.forEach(function (card) {
      var list = card.querySelector(".card__tag").textContent.split(",").map(function (t) {
        return t.trim();
      });
      card.dataset.tags = list.join("|");
      list.forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
    });

    var bar = document.createElement("div");
    bar.className = "filters";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Filter projects by technology");

    var status = document.createElement("p");
    status.setAttribute("aria-live", "polite");
    status.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);margin:0;";

    var applyFilter = function (tag, announce) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = tag === "All" || card.dataset.tags.split("|").indexOf(tag) !== -1;
        card.hidden = !match;
        if (match) shown++;
      });
      Array.prototype.forEach.call(bar.children, function (chip) {
        chip.setAttribute("aria-pressed", String(chip.textContent === tag));
      });
      status.textContent = announce
        ? "Showing " + shown + (shown === 1 ? " project" : " projects") + (tag === "All" ? "" : " tagged " + tag)
        : "";
    };

    ["All"].concat(tags).forEach(function (tag) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = tag;
      chip.addEventListener("click", function () { applyFilter(tag, true); });
      bar.appendChild(chip);
    });

    grid.parentNode.insertBefore(bar, grid);
    grid.parentNode.insertBefore(status, grid);
    applyFilter("All", false);
  }

  /* ---------- 3. Copy email button ---------- */
  var mail = document.querySelector('.contact a[href^="mailto:"]');
  if (mail && navigator.clipboard) {
    var copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-btn";
    copy.textContent = "Copy email";
    copy.setAttribute("aria-live", "polite");
    var timer;

    copy.addEventListener("click", function () {
      var address = mail.getAttribute("href").replace("mailto:", "");
      navigator.clipboard.writeText(address).then(function () {
        copy.textContent = "Copied";
      }, function () {
        copy.textContent = "Copy failed";
      });
      clearTimeout(timer);
      timer = setTimeout(function () { copy.textContent = "Copy email"; }, 2000);
    });

    mail.parentNode.appendChild(copy);
  }

  /* ---------- 4. Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 5. Navigation: hamburger, frosted bar on scroll, active section ---------- */
  var topbar = document.querySelector(".topbar");
  var burger = document.querySelector(".nav__burger");
  var menu = document.getElementById("menu");

  if (topbar && menu) {
    var markScrolled = function () {
      topbar.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", markScrolled, { passive: true });
    markScrolled();

    if (burger) {
      root.classList.add("nav-ready");

      var setMenu = function (open, returnFocus) {
        topbar.classList.toggle("open", open);
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        if (!open && returnFocus) burger.focus();
      };

      burger.addEventListener("click", function () {
        setMenu(!topbar.classList.contains("open"));
      });
      menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) setMenu(false);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && topbar.classList.contains("open")) setMenu(false, true);
      });
      document.addEventListener("click", function (e) {
        if (!topbar.contains(e.target)) setMenu(false);
      });
      window.matchMedia("(max-width: 44em)").addEventListener("change", function () {
        setMenu(false);
      });
    }

    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var link = menu.querySelector('a[href="#' + entry.target.id + '"]');
          if (!link) return;
          if (entry.isIntersecting) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });
    }
  }

  /* ---------- 6. Contact form: builds the email with proper encoding ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var hint = form.querySelector(".form__hint");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var to = form.getAttribute("action").replace("mailto:", "");
      var body = data.get("body") + "\n\nBest,\n" + data.get("name");
      window.location.href = "mailto:" + to +
        "?subject=" + encodeURIComponent(data.get("subject")) +
        "&body=" + encodeURIComponent(body);
      if (hint) hint.textContent = "Check your email app to finish sending.";
    });
  }

  /* ---------- 7. Motion: scroll progress, reveal on scroll, cursor spotlight ---------- */
  if (!reduce) {
    var line = document.createElement("div");
    line.className = "progress";
    line.setAttribute("aria-hidden", "true");
    document.body.appendChild(line);

    var ticking = false;
    var updateProgress = function () {
      var max = root.scrollHeight - window.innerHeight;
      line.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
    updateProgress();

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var target = entry.target;
            var delay = parseFloat(target.style.transitionDelay) || 0;
            target.classList.add("in");
            io.unobserve(target);
            /* Tiles hand their transform back to the tilt effect once revealed */
            if (target.matches(".card, .skill")) {
              setTimeout(function () {
                target.classList.remove("reveal", "in");
                target.style.transitionDelay = "";
              }, 500 + delay);
            }
          }
        });
      }, { threshold: 0.12 });

      document.querySelectorAll(
        ".section .wrap > h2, .section .wrap > p, .section .wrap > .filters, " +
        ".section .wrap > .contact-layout, .card, .skill"
      ).forEach(function (el) {
        el.classList.add("reveal");
        if (el.matches(".card, .skill")) {
          el.style.transitionDelay = (Array.prototype.indexOf.call(el.parentNode.children, el) * 60) + "ms";
        }
        io.observe(el);
      });
    }
  }

  /* Spotlight follows the cursor; tiles tilt toward it */
  document.querySelectorAll(".card, .skill").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty("--mx", x + "px");
      el.style.setProperty("--my", y + "px");
      if (tilt) {
        el.style.setProperty("--ry", ((x / r.width - 0.5) * 8) + "deg");
        el.style.setProperty("--rx", ((0.5 - y / r.height) * 8) + "deg");
      }
    });
    el.addEventListener("pointerleave", function () {
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
    });
  });

  /* ---------- 8. Magnetic buttons ---------- */
  if (tilt) {
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.setProperty("--tx", ((e.clientX - r.left - r.width / 2) * 0.2) + "px");
        btn.style.setProperty("--ty", ((e.clientY - r.top - r.height / 2) * 0.3) + "px");
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.removeProperty("--tx");
        btn.style.removeProperty("--ty");
      });
    });
  }

  /* ---------- 9. Hero: decoded headline, rotating word, particle network ---------- */
  var h1 = document.querySelector(".hero h1");
  if (h1 && !reduce) {
    var finalText = h1.textContent;
    var glyphs = "01<>/{}[]#$%&*+=";
    var t0 = performance.now();
    h1.setAttribute("aria-label", finalText);
    var decode = function (now) {
      var p = Math.min((now - t0) / 900, 1);
      var out = "";
      for (var i = 0; i < finalText.length; i++) {
        var ch = finalText.charAt(i);
        out += (ch === " " || i < p * finalText.length * 1.15) ? ch : glyphs.charAt(Math.floor(Math.random() * glyphs.length));
      }
      h1.textContent = p < 1 ? out : finalText;
      if (p < 1) requestAnimationFrame(decode);
    };
    requestAnimationFrame(decode);
  }

  var roleEl = document.querySelector(".hero__roles-text");
  if (roleEl && !reduce) {
    var words = [roleEl.textContent, "JavaScript", "Java", "Python", "curiosity"];
    var wi = 0, ci = words[0].length, erasing = true;
    var type = function () {
      var w = words[wi];
      ci += erasing ? -1 : 1;
      roleEl.textContent = w.slice(0, ci);
      var wait = erasing ? 35 : 80;
      if (!erasing && ci === w.length) { erasing = true; wait = 1500; }
      else if (erasing && ci === 0) { erasing = false; wi = (wi + 1) % words.length; wait = 250; }
      setTimeout(type, wait);
    };
    setTimeout(type, 1800);
  }

  var header = document.querySelector(".header");
  if (header && !reduce) {
    var cv = document.createElement("canvas");
    cv.className = "hero-canvas";
    cv.setAttribute("aria-hidden", "true");
    header.insertBefore(cv, header.firstChild);

    var g = cv.getContext("2d");
    var W = 0, H = 0, pts = [], mouse = { x: -999, y: -999 }, running = false, inView = true;
    var stops = [[79, 140, 255], [160, 107, 255], [255, 92, 200]];

    var tint = function (t, a) {
      var s = Math.max(0, Math.min(t, 1)) * 2, i = Math.min(Math.floor(s), 1), f = s - i;
      var c0 = stops[i], c1 = stops[i + 1];
      return "rgba(" + Math.round(c0[0] + (c1[0] - c0[0]) * f) + "," +
        Math.round(c0[1] + (c1[1] - c0[1]) * f) + "," +
        Math.round(c0[2] + (c1[2] - c0[2]) * f) + "," + a + ")";
    };

    var resize = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = header.clientWidth;
      H = header.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.max(16, Math.min(W * H / 16000, 56)));
      while (pts.length < n) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 });
      pts.length = n;
    };

    var frame = function () {
      if (!running) return;
      g.clearRect(0, 0, W, H);
      var i, j, p, q, dx, dy, d;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        dx = p.x - mouse.x; dy = p.y - mouse.y;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120 && d > 0) { p.x += (dx / d) * 0.8; p.y += (dy / d) * 0.8; }
      }
      g.lineWidth = 1;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j];
          dx = p.x - q.x; dy = p.y - q.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            g.strokeStyle = tint((p.x + q.x) / (2 * W), (1 - d / 110) * 0.35);
            g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
          }
        }
        dx = p.x - mouse.x; dy = p.y - mouse.y;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150) {
          g.strokeStyle = tint(p.x / W, (1 - d / 150) * 0.6);
          g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(mouse.x, mouse.y); g.stroke();
        }
        g.fillStyle = tint(p.x / W, 0.8);
        g.beginPath(); g.arc(p.x, p.y, 1.6, 0, 6.2832); g.fill();
      }
      requestAnimationFrame(frame);
    };

    var setRunning = function () {
      var should = inView && !document.hidden;
      if (should && !running) { running = true; requestAnimationFrame(frame); }
      else if (!should) running = false;
    };

    resize();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(header);
    else window.addEventListener("resize", resize);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        setRunning();
      }).observe(header);
    }
    document.addEventListener("visibilitychange", setRunning);
    if (fine) {
      header.addEventListener("pointermove", function (e) {
        var r = header.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });
      header.addEventListener("pointerleave", function () { mouse.x = mouse.y = -999; });
    }
    setRunning();
  }

  /* ---------- 10. Live Jakarta time ---------- */
  var clock = document.getElementById("clock");
  if (clock) {
    try {
      var fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false });
      var tick = function () { clock.textContent = fmt.format(new Date()) + " WIB"; };
      tick();
      setInterval(tick, 15000);
    } catch (e) {}
  }

  /* ---------- 11. Command palette (Ctrl/Cmd + K, or press /) ---------- */
  var commands = [];
  var addCmd = function (label, hint, run) { commands.push({ label: label, hint: hint, run: run }); };

  ["about", "projects", "skills", "contact"].forEach(function (id) {
    addCmd("Go to " + id.charAt(0).toUpperCase() + id.slice(1), "Section", function () {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });
  if (cards.length) {
    ["All"].concat(tags).forEach(function (tag) {
      addCmd(tag === "All" ? "Show all projects" : "Show " + tag + " projects", "Filter", function () {
        applyFilter(tag, true);
        document.getElementById("projects").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      });
    });
  }
  if (mail) {
    addCmd("Send an email", "Link", function () { window.location.href = mail.href; });
    if (typeof copy !== "undefined" && copy) addCmd("Copy email address", "Action", function () { copy.click(); });
  }
  var gh = document.querySelector('.contact a[href*="github.com"]');
  if (gh) addCmd("Open GitHub", "Link", function () { window.open(gh.href, "_blank", "noopener"); });
  addCmd("Switch theme", "Action", function () { toggle.click(); });

  var pal = document.createElement("div");
  pal.className = "palette";
  pal.innerHTML =
    '<div class="palette__box" role="dialog" aria-modal="true" aria-label="Quick jump">' +
    '<input class="palette__input" type="text" placeholder="Type a command or section" role="combobox" ' +
    'aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list" autocomplete="off" spellcheck="false">' +
    '<ul class="palette__list" id="palette-list" role="listbox"></ul></div>';
  document.body.appendChild(pal);

  var input = pal.querySelector("input");
  var list = pal.querySelector("ul");
  var shown = [], idx = 0, lastFocus = null;

  var select = function (n) {
    idx = shown.length ? (n + shown.length) % shown.length : 0;
    Array.prototype.forEach.call(list.children, function (li, k) {
      li.setAttribute("aria-selected", String(k === idx));
      if (k === idx) {
        input.setAttribute("aria-activedescendant", li.id);
        li.scrollIntoView({ block: "nearest" });
      }
    });
  };

  var render = function (q) {
    q = q.trim().toLowerCase();
    shown = commands.filter(function (c) { return c.label.toLowerCase().indexOf(q) !== -1; });
    list.textContent = "";
    if (!shown.length) {
      var none = document.createElement("li");
      none.className = "palette__empty";
      none.setAttribute("role", "presentation");
      none.textContent = "No matches";
      list.appendChild(none);
      return;
    }
    shown.forEach(function (c, k) {
      var li = document.createElement("li");
      li.id = "cmd-" + k;
      li.className = "palette__item";
      li.setAttribute("role", "option");
      var name = document.createElement("span");
      name.textContent = c.label;
      var hint = document.createElement("small");
      hint.textContent = c.hint;
      li.appendChild(name);
      li.appendChild(hint);
      li.addEventListener("click", function () { run(c); });
      li.addEventListener("pointermove", function () { if (idx !== k) select(k); });
      list.appendChild(li);
    });
    select(0);
  };

  var openPalette = function () {
    if (pal.classList.contains("open")) return;
    lastFocus = document.activeElement;
    if (typeof setMenu === "function") setMenu(false);
    pal.classList.add("open");
    document.body.classList.add("no-scroll");
    input.value = "";
    render("");
    input.focus();
  };
  var closePalette = function (restore) {
    pal.classList.remove("open");
    document.body.classList.remove("no-scroll");
    if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus();
  };
  var run = function (c) { closePalette(false); c.run(); };

  input.addEventListener("input", function () { render(input.value); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); select(idx + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); select(idx - 1); }
    else if (e.key === "Enter") { e.preventDefault(); if (shown[idx]) run(shown[idx]); }
    else if (e.key === "Escape") { e.preventDefault(); closePalette(); }
    else if (e.key === "Tab") { e.preventDefault(); }
  });
  pal.addEventListener("click", function (e) { if (e.target === pal) closePalette(); });

  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    var typing = tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (pal.classList.contains("open")) closePalette(); else openPalette();
    } else if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      openPalette();
    }
  });

  if (links) {
    var cmdItem = document.createElement("li");
    cmdItem.className = "nav__cmd";
    var cmdBtn = document.createElement("button");
    cmdBtn.type = "button";
    cmdBtn.className = "theme-toggle";
    cmdBtn.setAttribute("aria-haspopup", "dialog");
    cmdBtn.appendChild(document.createTextNode("Quick jump"));
    var key = document.createElement("kbd");
    key.textContent = /Mac|iPhone|iPad/.test(navigator.platform || "") ? "\u2318K" : "Ctrl K";
    cmdBtn.appendChild(key);
    cmdBtn.addEventListener("click", openPalette);
    cmdItem.appendChild(cmdBtn);
    links.insertBefore(cmdItem, links.querySelector(".nav__theme"));
  }
})();

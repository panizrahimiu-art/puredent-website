/* =========================================================
   دکتر شعله نعمتی — main.js
   Reads window.SITE_CONFIG (js/config.js). Empty config values
   never render anything — no invented data.
   ========================================================= */
(() => {
  "use strict";

  const SITE = window.SITE_CONFIG || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior = reduce ? "auto" : "smooth";

  /* ---------- Year (Persian calendar) ---------- */
  const yearEl = $("#year");
  if (yearEl) {
    try { yearEl.textContent = new Date().toLocaleDateString("fa-IR", { year: "numeric" }); }
    catch (e) { yearEl.textContent = new Date().getFullYear(); }
  }

  /* ---------- Header + chat button on scroll ---------- */
  const header = $("#siteHeader");
  const chatFab = $("#chatFab");
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 40);
    if (chatFab) chatFab.classList.toggle("show", y > window.innerHeight * 0.6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const nav = $("#nav");
  const menuBtn = $("#menuBtn");
  const setMenu = (open) => {
    if (!nav || !menuBtn) return;
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "بستن منو" : "باز کردن منو");
    const icon = $("use", menuBtn);
    if (icon) icon.setAttribute("href", open ? "#i-close" : "#i-menu");
  };
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    $$("a, button", nav).forEach((el) => el.addEventListener("click", () => setMenu(false)));
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- Active nav link ---------- */
  const navLinks = $$('#nav a[href^="#"]');
  if ("IntersectionObserver" in window && navLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => {
          const on = a.getAttribute("href") === `#${en.target.id}`;
          a.classList.toggle("is-active", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    $$("main section[id]").forEach((s) => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Hero: view toggle + soft parallax ---------- */
  const stage = $("#heroStage");
  if (stage) {
    const btns = $$("[data-hero-view]", stage);
    let timer = null;
    const setView = (view) => {
      stage.classList.toggle("is-anatomy", view === "anatomy");
      btns.forEach((b) => {
        const on = b.dataset.heroView === view;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
    };
    btns.forEach((b) => b.addEventListener("click", () => { clearInterval(timer); setView(b.dataset.heroView); }));
    if (!reduce) {
      timer = setInterval(() => setView(stage.classList.contains("is-anatomy") ? "solid" : "anatomy"), 5200);
      if (window.matchMedia("(pointer: fine)").matches) {
        stage.addEventListener("pointermove", (e) => {
          const r = stage.getBoundingClientRect();
          stage.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
          stage.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        });
        stage.addEventListener("pointerleave", () => { stage.style.setProperty("--mx", 0); stage.style.setProperty("--my", 0); });
      }
    }
  }

  /* ---------- Tabs (treatments + technology) ---------- */
  const activateTab = (tab, focus) => {
    const list = tab.closest('[role="tablist"]');
    $$('[role="tab"]', list).forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) { panel.hidden = !on; panel.classList.toggle("is-active", on); }
    });
    if (focus) tab.focus();
  };
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activateTab(tab));
      tab.addEventListener("keydown", (e) => {
        const next = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 }[e.key]; // RTL: left = next
        let target = null;
        if (next) target = tabs[(i + next + tabs.length) % tabs.length];
        else if (e.key === "Home") target = tabs[0];
        else if (e.key === "End") target = tabs[tabs.length - 1];
        if (target) { e.preventDefault(); activateTab(target, true); }
      });
    });
  });

  /* ---------- Generated graphics (original, not real results) ---------- */
  const teethRow = (fill, stroke, opts) => {
    let out = "";
    for (let i = 0; i < 5; i++) {
      const x = 70 + i * 100, y = 120 - Math.abs(i - 2) * -6;
      const rot = (i - 2) * opts.tilt;
      out += `<g transform="translate(${x} ${y}) scale(.5) rotate(${rot} 100 120)"><use href="#toothPath" fill="${fill}" stroke="${stroke}" stroke-width="3"/></g>`;
    }
    return out;
  };
  const demoLayer = (bg, fill, stroke, tilt) =>
    `<svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="600" height="400" fill="${bg}"/>` +
    `<path d="M0 300Q300 220 600 300V400H0Z" fill="${bg === "#8a5b4e" ? "#6e463c" : "#b98374"}" opacity=".55"/>${teethRow(fill, stroke, { tilt })}</svg>`;

  /* ---------- Technology: smile analysis graphic ---------- */
  const smileSlot = $("[data-smile]");
  if (smileSlot) {
    let teeth = "";
    for (let i = 0; i < 6; i++) {
      const x = 96 + i * 84, y = 130 - Math.pow(i - 2.5, 2) * 6, r = (i - 2.5) * 4;
      teeth += `<g transform="translate(${x} ${y}) scale(.4) rotate(${r} 100 120)"><use href="#toothPath"/></g>`;
    }
    smileSlot.innerHTML =
      `<svg viewBox="0 0 640 420" aria-hidden="true">` +
      `<g stroke="#d8c398" stroke-opacity=".12" fill="none"><path d="M0 105H640M0 210H640M0 315H640M107 0V420M213 0V420M320 0V420M427 0V420M533 0V420"/></g>` +
      `<g fill="#fff" fill-opacity=".07" stroke="#f4e8c8" stroke-opacity=".85" stroke-width="2.2">${teeth}</g>` +
      `<path d="M70 190Q320 270 570 190" fill="none" stroke="#d8c398" stroke-width="1.6" stroke-dasharray="4 6"/>` +
      `<path d="M320 70V340M60 150H580" fill="none" stroke="#d8c398" stroke-opacity=".45" stroke-dasharray="2 7"/>` +
      `<circle cx="320" cy="150" r="5" fill="#d8c398"/>` +
      `<rect class="scan-v" x="60" y="60" width="3" height="270" fill="url(#gScan)"/></svg>`;
  }

  /* ---------- Doctor section (only what config provides) ---------- */
  const doc = SITE.doctor || {};
  const photo = $("#doctorPhoto");
  if (photo && doc.photo) {
    photo.src = doc.photo;
    photo.hidden = false;
    const art = $(".portrait-art");
    if (art) art.hidden = true;
  }
  const bioEl = $("#doctorBio");
  if (bioEl && doc.bio) bioEl.textContent = doc.bio;
  const credEl = $("#doctorCredentials");
  if (credEl && Array.isArray(doc.credentials) && doc.credentials.length) {
    credEl.innerHTML = "";
    doc.credentials.forEach((c) => {
      const li = document.createElement("li");
      li.textContent = c;
      credEl.appendChild(li);
    });
    credEl.hidden = false;
  }

  /* ---------- Before / After slider ---------- */
  const ba = $("#ba");
  if (ba) {
    const before = $("#baBefore"), after = $("#baAfter"), handle = $("#baHandle");
    const cases = Array.isArray(SITE.cases) ? SITE.cases.filter((c) => c && c.before && c.after) : [];
    const casesBox = $("#baCases"), note = $("#baNote");
    let pos = 50;

    const setPos = (v) => {
      pos = Math.max(0, Math.min(100, v));
      ba.style.setProperty("--pos", pos.toFixed(1));
      handle.setAttribute("aria-valuenow", String(Math.round(pos)));
      handle.setAttribute("aria-valuetext", `${Math.round(pos)} درصد تصویر «قبل»`);
    };
    const fromPointer = (e) => { const r = ba.getBoundingClientRect(); setPos(((r.right - e.clientX) / r.width) * 100); };

    const showDemo = () => {
      before.style.backgroundImage = after.style.backgroundImage = "";
      before.innerHTML = demoLayer("#8a5b4e", "#d8c78e", "#a89050", 4);
      after.innerHTML = demoLayer("#8a5b4e", "url(#gEnamel)", "#fff", 0);
    };
    const showCase = (c) => {
      const css = (u) => `url("${String(u).replace(/"/g, "%22")}")`;
      before.innerHTML = after.innerHTML = "";
      before.style.backgroundImage = css(c.before);
      after.style.backgroundImage = css(c.after);
      handle.setAttribute("aria-label", c.alt || "مقایسه‌ی قبل و بعد");
      if (note) note.textContent = "نتیجه‌ی هر درمان به شرایط فرد بستگی دارد.";
    };

    if (cases.length) {
      showCase(cases[0]);
      if (cases.length > 1 && casesBox) {
        cases.forEach((c, i) => {
          const b = document.createElement("button");
          b.type = "button";
          b.textContent = c.label || `نمونه ${i + 1}`;
          b.classList.toggle("is-active", i === 0);
          b.addEventListener("click", () => {
            $$("button", casesBox).forEach((x) => x.classList.toggle("is-active", x === b));
            showCase(c);
            setPos(50);
          });
          casesBox.appendChild(b);
        });
        casesBox.hidden = false;
      }
    } else {
      showDemo();
    }

    let dragging = false;
    ba.addEventListener("pointerdown", (e) => { dragging = true; ba.setPointerCapture(e.pointerId); fromPointer(e); });
    ba.addEventListener("pointermove", (e) => { if (dragging) fromPointer(e); });
    ["pointerup", "pointercancel"].forEach((t) => ba.addEventListener(t, () => { dragging = false; }));
    handle.addEventListener("keydown", (e) => {
      const step = { ArrowLeft: 5, ArrowRight: -5 }[e.key];
      if (step) { e.preventDefault(); setPos(pos + step); }
      else if (e.key === "Home") { e.preventDefault(); setPos(0); }
      else if (e.key === "End") { e.preventDefault(); setPos(100); }
    });
    setPos(50);
  }

  /* ---------- Contact information ---------- */
  const digits = (s) => String(s || "").replace(/\D/g, "");
  const has = {
    phone: !!SITE.phone, email: !!SITE.email, address: !!SITE.address, hours: !!SITE.hours,
    whatsapp: !!digits(SITE.whatsapp), instagram: !!SITE.instagram
  };

  ["phone", "email", "address", "hours"].forEach((k) => {
    $$(`[data-site="${k}"]`).forEach((el) => { if (has[k]) el.textContent = SITE[k]; });
  });
  $$('[data-site-link="tel"]').forEach((a) => { if (has.phone) a.href = "tel:" + String(SITE.phone).replace(/[^\d+]/g, ""); });
  $$('[data-site-link="mailto"]').forEach((a) => { if (has.email) a.href = "mailto:" + SITE.email; });

  const mapLink = $("#mapLink");
  if (mapLink) {
    if (has.address) mapLink.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(SITE.address);
    else mapLink.hidden = true;
  }
  const waLink = $("#waLink");
  if (waLink && has.whatsapp) waLink.href = "https://wa.me/" + digits(SITE.whatsapp);
  const igLink = $("#igLink");
  if (igLink && has.instagram) igLink.href = SITE.instagram;

  $$("[data-site-row]").forEach((row) => { row.hidden = !has[row.dataset.siteRow]; });
  const empty = $("#contactEmpty");
  if (empty) empty.hidden = Object.values(has).some(Boolean);

  /* ---------- Booking ---------- */
  const form = $("#bookingForm");
  const note = $("#formNote");
  const copyBtn = $("#copyRequest");
  const submitBtn = $("#bookingSubmit");
  const faDigits = (s) => String(s).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

  const say = (msg, isError) => {
    if (!note) return;
    note.textContent = msg;
    note.classList.toggle("is-error", !!isError);
  };
  const setErr = (id, msg) => {
    const input = $("#" + id), err = $("#" + id + "-err");
    if (err) err.textContent = msg;
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  };
  const buildMessage = (d) => [
    "درخواست رزرو نوبت",
    `نام: ${d.name}`,
    `شماره تماس: ${d.phone}`,
    `نوع درمان: ${d.service}`,
    `روز دلخواه: ${d.date || "مشخص نشده"}`,
    `زمان دلخواه: ${d.slot || "مشخص نشده"}`,
    `پیام: ${d.message || "ندارد"}`
  ].join("\n");

  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { /* ignore */ }
      ta.remove();
      return ok;
    }
  };

  const bookingSection = $("#booking");
  const goBooking = (service) => {
    if (!bookingSection) return;
    if (service && form) {
      const opt = $$("#bk-service option").find((o) => o.textContent.trim() === service);
      if (opt) $("#bk-service").value = opt.value || opt.textContent;
    }
    bookingSection.scrollIntoView({ behavior, block: "start" });
    setTimeout(() => { const n = $("#bk-name"); if (n) n.focus({ preventScroll: true }); }, reduce ? 0 : 600);
  };
  $$("[data-open-booking]").forEach((b) => b.addEventListener("click", () => goBooking()));
  $$("[data-book-service]").forEach((b) => b.addEventListener("click", () => goBooking(b.dataset.bookService)));

  if (form) {
    let lastMessage = "";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (copyBtn) copyBtn.hidden = true;

      const fd = new FormData(form);
      const d = {
        name: String(fd.get("name") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        service: String(fd.get("service") || "").trim(),
        date: String(fd.get("date") || "").trim(),
        slot: String(fd.get("slot") || "").trim(),
        message: String(fd.get("message") || "").trim()
      };

      const phoneOk = /^\+?[\d\s\-()]{8,20}$/.test(faDigits(d.phone));
      const okName = setErr("bk-name", d.name.length < 2 ? "لطفاً نام خود را وارد کنید." : "");
      const okPhone = setErr("bk-phone", phoneOk ? "" : "شماره‌ی تماس معتبر وارد کنید.");
      if (!okName || !okPhone) { say("لطفاً موارد مشخص‌شده را اصلاح کنید.", true); return; }

      lastMessage = buildMessage(d);
      const label = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "در حال ارسال…";
      say("");

      try {
        if (SITE.formEndpoint) {
          const res = await fetch(SITE.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
          if (!res.ok) throw new Error("HTTP " + res.status);
          say("درخواست شما ارسال شد. مطب برای هماهنگی با شما تماس می‌گیرد.");
          form.reset();
        } else if (has.whatsapp) {
          window.open(`https://wa.me/${digits(SITE.whatsapp)}?text=${encodeURIComponent(lastMessage)}`, "_blank", "noopener,noreferrer");
          say("پیام رزرو در واتساپ آماده‌ی ارسال است؛ آن را ارسال کنید تا درخواست ثبت شود.");
        } else if (has.email) {
          window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent("درخواست رزرو نوبت")}&body=${encodeURIComponent(lastMessage)}`;
          say("برنامه‌ی ایمیل شما باز شد؛ ایمیل را ارسال کنید تا درخواست ثبت شود.");
        } else {
          say("هنوز راه دریافت آنلاین درخواست تنظیم نشده است. متن درخواست را کپی کنید و از طریق مطب ارسال کنید.", true);
          if (copyBtn) copyBtn.hidden = false;
        }
      } catch (err) {
        console.error(err);
        say("ارسال انجام نشد. لطفاً دوباره تلاش کنید.", true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = label;
      }
    });

    if (copyBtn) copyBtn.addEventListener("click", async () => {
      const ok = await copyText(lastMessage);
      say(ok ? "متن درخواست کپی شد." : "کپی انجام نشد؛ لطفاً متن را دستی وارد کنید.", !ok);
    });
    $$("input, textarea", form).forEach((el) => el.addEventListener("input", () => {
      if (el.id === "bk-name" || el.id === "bk-phone") setErr(el.id, "");
    }));
  }

  /* ---------- Search ---------- */
  const searchBtn = $("#searchBtn"), searchPanel = $("#searchPanel");
  const searchInput = $("#searchInput"), searchForm = $("#searchForm"), searchResults = $("#searchResults");
  const items = [
    { t: "دندان‌پزشکی زیبایی", k: "لمینت بندینگ طراحی لبخند زیبایی", to: "#treatments", tab: 0 },
    { t: "ایمپلنت دندان", k: "کاشت دندان ایمپلنت implant", to: "#treatments", tab: 1 },
    { t: "سفید کردن دندان", k: "بلیچینگ سفیدکردن", to: "#treatments", tab: 2 },
    { t: "مراقبت‌های پیشگیرانه", k: "جرم‌گیری معاینه پیشگیری", to: "#treatments", tab: 3 },
    { t: "ارتودنسی", k: "الاینر نگهدارنده ارتودنسی ثابت", to: "#treatments", tab: 4 },
    { t: "درمان ریشه (عصب‌کشی)", k: "عصب کشی ریشه", to: "#treatments", tab: 5 },
    { t: "درباره‌ی پزشک", k: "دکتر نعمتی معرفی", to: "#about" },
    { t: "قبل و بعد", k: "نمونه کار تحول لبخند", to: "#results" },
    { t: "فناوری", k: "اسکن سه بعدی رادیوگرافی تحلیل لبخند", to: "#technology" },
    { t: "رزرو نوبت", k: "وقت مشاوره نوبت", to: "#booking" },
    { t: "تماس", k: "تلفن آدرس ارتباط", to: "#contact" }
  ];
  const norm = (s) => faDigits(s).toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\u200c\s]/g, "");
  const sectionName = { "#treatments": "خدمات", "#about": "", "#results": "", "#technology": "", "#booking": "", "#contact": "" };

  const setSearch = (open) => {
    if (!searchPanel || !searchBtn) return;
    searchPanel.hidden = !open;
    searchBtn.setAttribute("aria-expanded", String(open));
    if (open) { renderSearch(""); setTimeout(() => searchInput && searchInput.focus(), 50); }
  };
  function renderSearch(q) {
    const nq = norm(q);
    const list = items.filter((i) => !nq || norm(i.t + i.k).includes(nq));
    searchResults.innerHTML = "";
    if (!list.length) {
      const li = document.createElement("li");
      li.className = "search-empty";
      li.textContent = "موردی پیدا نشد. عبارت دیگری را امتحان کنید.";
      searchResults.appendChild(li);
      return;
    }
    list.forEach((i) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = i.to;
      a.textContent = i.t;
      if (sectionName[i.to]) { const s = document.createElement("small"); s.textContent = sectionName[i.to]; a.appendChild(s); }
      a.addEventListener("click", () => {
        setSearch(false);
        if (typeof i.tab === "number") { const t = $(`#tr-tab-${i.tab}`); if (t) activateTab(t); }
      });
      li.appendChild(a);
      searchResults.appendChild(li);
    });
  }
  if (searchBtn && searchPanel) {
    searchBtn.addEventListener("click", () => setSearch(searchPanel.hidden));
    if (searchInput) searchInput.addEventListener("input", () => renderSearch(searchInput.value));
    if (searchForm) searchForm.addEventListener("submit", (e) => { e.preventDefault(); const a = $("a", searchResults); if (a) a.click(); });
    document.addEventListener("click", (e) => {
      if (!searchPanel.hidden && !searchPanel.contains(e.target) && !searchBtn.contains(e.target)) setSearch(false);
    });
  }

  /* ---------- Escape closes menu + search ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    setMenu(false);
    if (searchPanel && !searchPanel.hidden) { setSearch(false); if (searchBtn) searchBtn.focus(); }
  });

  /* ---------- Chat button ---------- */
  if (chatFab) {
    chatFab.addEventListener("click", () => {
      if (has.whatsapp) window.open("https://wa.me/" + digits(SITE.whatsapp), "_blank", "noopener,noreferrer");
      else if (has.phone) window.location.href = "tel:" + String(SITE.phone).replace(/[^\d+]/g, "");
      else goBooking();
    });
  }
})();

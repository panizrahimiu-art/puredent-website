v/* =========================================
   Dr. Sholeh Nemati — Main JavaScript
   ========================================= */

(() => {
  "use strict";

  const SITE = window.SITE_CONFIG || {};

  const $ = (selector, context = document) =>
    context.querySelector(selector);

  const $$ = (selector, context = document) =>
    Array.from(context.querySelectorAll(selector));

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Current year ---------- */

  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* ---------- Header ---------- */

  const header = $("#siteHeader");
  const chatFab = $("#chatFab");

  const onScroll = () => {
    const y = window.scrollY;

    if (header) {
      header.classList.toggle("is-scrolled", y > 40);
    }

    if (chatFab) {
      chatFab.classList.toggle(
        "show",
        y > window.innerHeight * 0.6
      );
    }
  };

  window.addEventListener("scroll", onScroll, {
    passive: true
  });

  onScroll();

  /* ---------- Mobile menu ---------- */

  const nav = $("#nav");
  const menuBtn = $("#menuBtn");

  const setMenu = (open) => {
    if (!nav || !menuBtn) return;

    nav.classList.toggle("open", open);

    menuBtn.setAttribute(
      "aria-expanded",
      String(open)
    );

    menuBtn.setAttribute(
      "aria-label",
      open ? "بستن منو" : "باز کردن منو"
    );

    const icon = $("use", menuBtn);

    if (icon) {
      icon.setAttribute(
        "href",
        open ? "#i-close" : "#i-menu"
      );
    }
  };

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      setMenu(!nav.classList.contains("open"));
    });

    $$("a", nav).forEach((link) => {
      link.addEventListener("click", () => {
        setMenu(false);
      });
    });

    const navCta = $(".nav-cta");

    if (navCta) {
      navCta.addEventListener("click", () => {
        setMenu(false);
      });
    }
  }
     /* ---------- Active navigation ---------- */

  const sections = $$("section[id]");
  const navLinks = $$(
    '#nav a[href^="#"]'
  );

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const activeId = `#${entry.target.id}`;

          navLinks.forEach((link) => {
            const isActive =
              link.getAttribute("href") === activeId;

            link.classList.toggle("active", isActive);
          });
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  /* ---------- Reveal animations ---------- */

  const revealItems = $$(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => {
      item.classList.add("visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    revealItems.forEach((item) => {
      revealObserver.observe(item);
    });
  }

  /* ---------- Hero animation ---------- */

  const heroStage = $("#heroStage");

  if (heroStage && !reduceMotion) {
    let heroTimer;

    const startHeroAnimation = () => {
      clearInterval(heroTimer);

      heroTimer = setInterval(() => {
        heroStage.classList.toggle("is-anatomy");
      }, 4800);
    };

    startHeroAnimation();

    window.addEventListener("pagehide", () => {
      clearInterval(heroTimer);
    });
  }

  /* ---------- Services carousel ---------- */

  $$("[data-carousel]").forEach((carousel) => {
    const track = $(".car-track", carousel);
    const prevBtn = $(".car-btn.left", carousel);
    const nextBtn = $(".car-btn.right", carousel);

    if (!track) return;

    const getStep = () => {
      const card = track.querySelector(
        ".service-card, .card"
      );

      if (!card) {
        return track.clientWidth * 0.8;
      }

      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap) || 0;

      return card.getBoundingClientRect().width + gap;
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        track.scrollBy({
          left: -getStep(),
          behavior: reduceMotion ? "auto" : "smooth"
        });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        track.scrollBy({
          left: getStep(),
          behavior: reduceMotion ? "auto" : "smooth"
        });
      });
    }
  });
     /* ---------- Technology slider ---------- */

  $$("[data-slider]").forEach((slider) => {
    const slides = $$(".slide", slider);
    const dots = $$(".tech-dots button");

    if (!slides.length) return;

    let currentSlide = 0;

    const showSlide = (index) => {
      currentSlide = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        slide.classList.toggle(
          "active",
          i === currentSlide
        );

        slide.setAttribute(
          "aria-hidden",
          String(i !== currentSlide)
        );
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle(
          "active",
          i === currentSlide
        );

        dot.setAttribute(
          "aria-current",
          i === currentSlide ? "true" : "false"
        );
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
      });
    });

    showSlide(0);
  });

  /* ---------- 3D card tilt ---------- */

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY =
          ((x / rect.width) - 0.5) * 8;

        const rotateX =
          (0.5 - (y / rect.height)) * 8;

        card.style.transform =
          `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Contact information ---------- */

  const contactValues = {
    phone: SITE.phone || "",
    email: SITE.email || "",
    address: SITE.address || "",
    hours: SITE.hours || ""
  };

  Object.entries(contactValues).forEach(([key, value]) => {
    $$(`[data-site="${key}"]`).forEach((element) => {
      if (value) {
        element.textContent = value;
      }
    });

    $$(`[data-site-row="${key}"]`).forEach((row) => {
      row.hidden = !value;
    });
  });

  /* ---------- Booking modal ---------- */

  const bookingModal = $("#booking");
  const bookingForm = $("#bookingForm");
  const formNote = $("#formNote");

  const openBooking = () => {
    if (!bookingModal) return;

    bookingModal.classList.add("open");
    bookingModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    const firstInput = $("input", bookingModal);

    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  };

  const closeBooking = () => {
    if (!bookingModal) return;

    bookingModal.classList.remove("open");
    bookingModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  $$("[data-open-booking]").forEach((button) => {
    button.addEventListener("click", openBooking);
  });

  if (bookingModal) {
    $$("[data-close]", bookingModal).forEach((button) => {
      button.addEventListener("click", closeBooking);
    });

    bookingModal.addEventListener("click", (event) => {
      if (event.target === bookingModal) {
        closeBooking();
      }
    });
  }
     /* ---------- Booking form ---------- */

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!bookingForm.reportValidity()) return;

      const formData = new FormData(bookingForm);

      const data = {
        name: String(formData.get("name") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        service: String(formData.get("service") || "").trim(),
        date: String(formData.get("date") || "").trim(),
        message: String(formData.get("message") || "").trim()
      };

      if (!data.name || !data.phone) {
        if (formNote) {
          formNote.textContent =
            "لطفاً نام و شماره تماس را وارد کنید.";
        }
        return;
      }

      const submitButton = $('button[type="submit"]', bookingForm);

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "در حال ثبت...";
      }

      const endpoint = SITE.formEndpoint || "";
      const whatsapp = String(SITE.whatsapp || "").replace(/\D/g, "");

      const message = [
        "درخواست رزرو نوبت",
        `نام: ${data.name}`,
        `شماره تماس: ${data.phone}`,
        `خدمت موردنظر: ${data.service || "مشخص نشده"}`,
        `تاریخ پیشنهادی: ${data.date || "مشخص نشده"}`,
        `توضیحات: ${data.message || "ندارد"}`
      ].join("\n");

      try {
        if (endpoint) {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            throw new Error("خطا در ارسال فرم");
          }

          if (formNote) {
            formNote.textContent =
              "درخواست شما با موفقیت ارسال شد.";
          }

          bookingForm.reset();
        } else if (whatsapp) {
          const url =
            `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

          window.open(url, "_blank", "noopener,noreferrer");

          if (formNote) {
            formNote.textContent =
              "پیام رزرو در واتساپ آماده ارسال است.";
          }
        } else {
          if (formNote) {
            formNote.textContent =
              "هنوز راه ارتباطی رزرو تنظیم نشده است. لطفاً با مطب تماس بگیرید.";
          }
        }
      } catch (error) {
        console.error(error);

        if (formNote) {
          formNote.textContent =
            "ارسال درخواست انجام نشد. لطفاً دوباره تلاش کنید.";
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "ثبت درخواست";
        }
      }
    });
  }

  /* ---------- Search panel ---------- */

  const searchBtn = $("#searchBtn");
  const searchPanel = $("#searchPanel");
  const searchInput = $("#searchInput");
  const searchForm = $("#searchForm");
  const searchResults = $("#searchResults");

  const searchItems = [
    {
      title: "خدمات دندانپزشکی",
      keywords: "خدمات درمان دندانپزشکی service",
      url: "#services"
    },
    {
      title: "ایمپلنت دندان",
      keywords: "ایمپلنت کاشت دندان implant",
      url: "#services"
    },
    {
      title: "لمینت و زیبایی دندان",
      keywords: "لمینت زیبایی لبخند veneer cosmetic",
      url: "#services"
    },
    {
      title: "درباره پزشک",
      keywords: "دکتر شعله نعمتی درباره معرفی doctor about",
      url: "#about"
    },
    {
      title: "تجهیزات و تکنولوژی",
      keywords: "تجهیزات فناوری تکنولوژی technology",
      url: "#technology"
    },
    {
      title: "رزرو نوبت",
      keywords: "رزرو نوبت وقت booking appointment",
      url: "#booking"
    },
    {
      title: "تماس با مطب",
      keywords: "تماس آدرس تلفن ارتباط contact",
      url: "#contact"
    }
  ];

  const closeSearch = () => {
    if (!searchPanel) return;

    searchPanel.classList.remove("open");
    searchPanel.setAttribute("aria-hidden", "true");
  };

  if (searchBtn && searchPanel) {
    searchBtn.addEventListener("click", () => {
      const isOpen = searchPanel.classList.contains("open");

      searchPanel.classList.toggle("open", !isOpen);
      searchPanel.setAttribute(
        "aria-hidden",
        String(isOpen)
      );

      if (!isOpen && searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    });
  }

  const runSearch = (query) => {
    if (!searchResults) return;

    const normalizedQuery = query.trim().toLowerCase();

    searchResults.innerHTML = "";

    if (!normalizedQuery) {
      searchResults.textContent =
        "عبارت موردنظر را جست‌وجو کنید.";
      return;
    }

    const matches = searchItems.filter((item) => {
      const text =
        `${item.title} ${item.keywords}`.toLowerCase();

      return text.includes(normalizedQuery);
    });

    if (!matches.length) {
      searchResults.textContent =
        "موردی پیدا نشد. عبارت دیگری را امتحان کنید.";
      return;
    }

    matches.forEach((item) => {
      const link = document.createElement("a");

      link.href = item.url;
      link.textContent = item.title;

      link.addEventListener("click", closeSearch);

      searchResults.appendChild(link);
    });
  };

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      runSearch(searchInput.value);
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (searchInput) {
        runSearch(searchInput.value);
      }
    });
  }
     /* ---------- Escape key ---------- */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeBooking();
      closeSearch();
      setMenu(false);
    }
  });

  /* ---------- Smooth anchor navigation ---------- */

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = $(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });

      setMenu(false);
      closeSearch();
    });
  });

  /* ---------- Chat button ---------- */

  if (chatFab) {
    chatFab.addEventListener("click", () => {
      if (SITE.whatsapp) {
        const phone = String(SITE.whatsapp).replace(/\D/g, "");

        window.open(
          `https://wa.me/${phone}`,
          "_blank",
          "noopener,noreferrer"
        );
      } else if (SITE.phone) {
        window.location.href = `tel:${SITE.phone}`;
      } else {
        document.querySelector("#contact")?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth"
        });
      }
    });
  }

})();

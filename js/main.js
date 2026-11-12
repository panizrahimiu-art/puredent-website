/* =====================================================
   PURE DENTAL
   Main JavaScript
   Dr. Sholeh Nemati
===================================================== */

(() => {
  "use strict";

  /* ---------- Helpers ---------- */

  const $ = (selector, context = document) =>
    context.querySelector(selector);

  const $$ = (selector, context = document) =>
    Array.from(context.querySelectorAll(selector));

  const SITE = window.SITE_CONFIG || {};

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  /* ---------- Footer & Contact Information ---------- */

  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  ["phone", "email", "address", "hours"].forEach((key) => {

    const value = String(SITE[key] || "").trim();

    const row = $(`[data-site-row="${key}"]`);

    if (!row || !value) return;

    const content = $(`[data-site="${key}"]`, row);

    if (content) {
      content.textContent = value;
    }

    const link = $("[data-site-link]", row);

    if (link) {

      if (link.dataset.siteLink === "tel") {

        link.href =
          "tel:" + value.replace(/[^\d+]/g, "");

      } else if (link.dataset.siteLink === "mailto") {

        link.href = "mailto:" + value;

      }

    }

    row.hidden = false;

  });


  /* ---------- Header Scroll Effect ---------- */

  const header = $("#siteHeader");
  const chatFab = $("#chatFab");

  const handleScroll = () => {

    const scrollPosition = window.scrollY;

    if (header) {
      header.classList.toggle(
        "is-scrolled",
        scrollPosition > 40
      );
    }

    if (chatFab) {
      chatFab.classList.toggle(
        "show",
        scrollPosition > window.innerHeight * 0.6
      );
    }

  };

  window.addEventListener(
    "scroll",
    handleScroll,
    { passive: true }
  );

  handleScroll();


  /* ---------- Mobile Navigation ---------- */

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

    const navCTA = $(".nav-cta");

    if (navCTA) {
      navCTA.addEventListener("click", () => {
        setMenu(false);
      });
    }

  }


  /* ---------- Active Navigation ---------- */

  const navLinks = $$("[data-nav]");
  const sections = $$("[data-section]");

  if (
    "IntersectionObserver" in window &&
    sections.length
  ) {

    const sectionObserver = new IntersectionObserver(

      (entries) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) return;

          const activeID = entry.target.id;

          navLinks.forEach((link) => {

            const active =
              link.dataset.nav === activeID;

            link.classList.toggle(
              "is-active",
              active
            );

            link.classList.toggle(
              "active",
              active
            );

          });

        });

      },

      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: 0
      }

    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });

  }


  /* ---------- Reveal Animations ---------- */

  const revealElements = $$(".reveal");

  const showElement = (element) => {

    element.classList.add("in");
    element.classList.add("visible");

  };

  if (
    reduceMotion ||
    !("IntersectionObserver" in window)
  ) {

    revealElements.forEach(showElement);

  } else {

    const revealObserver = new IntersectionObserver(

      (entries, observer) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            showElement(entry.target);

            observer.unobserve(entry.target);

          }

        });

      },

      {
        threshold: 0.12,
        rootMargin: "0px 0px -5% 0px"
      }

    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

  }


  /* ---------- Hero Tooth Animation ---------- */

  const heroStage = $("#heroStage");

  if (heroStage && !reduceMotion) {

    const heroTimer = setInterval(() => {

      heroStage.classList.toggle("is-anatomy");

    }, 4800);

    window.addEventListener("pagehide", () => {
      clearInterval(heroTimer);
    });

    const hero = $("#home");

    if (hero) {

      hero.addEventListener("pointermove", (event) => {

        const rect = hero.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) / rect.width - 0.5;

        const y =
          (event.clientY - rect.top) / rect.height - 0.5;

        hero.style.setProperty(
          "--mx",
          x.toFixed(3)
        );

        hero.style.setProperty(
          "--my",
          y.toFixed(3)
        );

      });

      hero.addEventListener("pointerleave", () => {

        hero.style.setProperty("--mx", "0");
        hero.style.setProperty("--my", "0");

      });

    }

  }


  /* ---------- Services Carousel ---------- */

  $$("[data-carousel]").forEach((carousel) => {

    const track = $(".car-track", carousel);

    const prevBtn = $(".car-btn.left", carousel);

    const nextBtn = $(".car-btn.right", carousel);

    if (!track) return;

    const getStep = () => {

      const card = $(".svc-card", track);

      if (!card) {
        return track.clientWidth * 0.8;
      }

      const styles = getComputedStyle(track);

      const gap =
        parseFloat(styles.columnGap) || 22;

      return (
        card.getBoundingClientRect().width + gap
      );

    };

    const updateButtons = () => {

      if (prevBtn) {

        prevBtn.disabled =
          track.scrollLeft >= -2;

      }

      if (nextBtn) {

        nextBtn.disabled =
          Math.abs(
            track.scrollLeft +
            track.clientWidth -
            track.scrollWidth
          ) < 3;

      }

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

    track.addEventListener(
      "scroll",
      updateButtons,
      { passive: true }
    );

    track.addEventListener("keydown", (event) => {

      if (event.key === "ArrowRight" && nextBtn) {
        event.preventDefault();
        nextBtn.click();
      }

      if (event.key === "ArrowLeft" && prevBtn) {
        event.preventDefault();
        prevBtn.click();
      }

    });

    window.addEventListener(
      "resize",
      updateButtons
    );

    updateButtons();

  });


  /* ---------- Technology Slider ---------- */

  const slider = $("[data-slider]");

  if (slider) {

    const slides = $$(".slide", slider);

    const dots = $$(".tech-dots button");

    let currentIndex = 0;

    let sliderTimer = null;

    const goToSlide = (index) => {

      if (!slides.length) return;

      currentIndex =
        (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {

        const active = i === currentIndex;

        slide.classList.toggle(
          "is-active",
          active
        );

        slide.classList.toggle(
          "active",
          active
        );

      });

      dots.forEach((dot, i) => {

        const active = i === currentIndex;

        dot.classList.toggle(
          "is-active",
          active
        );

        dot.classList.toggle(
          "active",
          active
        );

        dot.setAttribute(
          "aria-selected",
          String(active)
        );

      });

    };

    const stopSlider = () => {

      clearInterval(sliderTimer);

      sliderTimer = null;

    };

    const startSlider = () => {

      stopSlider();

      if (reduceMotion || slides.length < 2) return;

      sliderTimer = setInterval(() => {

        goToSlide(currentIndex + 1);

      }, 5500);

    };

    dots.forEach((dot, index) => {

      dot.addEventListener("click", () => {

        goToSlide(index);

        startSlider();

      });

    });

    slider.addEventListener(
      "pointerenter",
      stopSlider
    );

    slider.addEventListener(
      "pointerleave",
      startSlider
    );

    goToSlide(0);

    startSlider();

  }


  /* ---------- 3D Glass Cards ---------- */

  if (
    !reduceMotion &&
    window.matchMedia("(hover: hover)").matches
  ) {

    $$("[data-tilt]").forEach((card) => {

      card.addEventListener("pointermove", (event) => {

        const rect = card.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) / rect.width - 0.5;

        const y =
          (event.clientY - rect.top) / rect.height - 0.5;

        card.style.setProperty(
          "--ry",
          (x * 10).toFixed(2) + "deg"
        );

        card.style.setProperty(
          "--rx",
          (-y * 10).toFixed(2) + "deg"
        );

      });

      card.addEventListener("pointerleave", () => {

        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");

      });

    });

  }


  /* ---------- Booking Modal ---------- */

  const modal = $("#booking");

  const bookingForm = $("#bookingForm");

  const formNote = $("#formNote");

  let lastFocusedElement = null;

  const openModal = () => {

    if (!modal) return;

    lastFocusedElement = document.activeElement;

    if (formNote) {

      formNote.textContent = "";

      formNote.classList.remove("error");

    }

    modal.hidden = false;

    modal.classList.add("open");

    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    document.body.classList.add("is-locked");

    setTimeout(() => {

      const nameInput =
        $('input[name="name"]', modal);

      if (nameInput) nameInput.focus();

    }, 50);

  };

  const closeModal = () => {

    if (!modal) return;

    modal.hidden = true;

    modal.classList.remove("open");

    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    document.body.classList.remove("is-locked");

    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {

      lastFocusedElement.focus();

    }

  };


  /* Open & Close Buttons */

  document.addEventListener("click", (event) => {

    const opener =
      event.target.closest("[data-open-booking]");

    const closer =
      event.target.closest("[data-close]");

    if (opener) {

      event.preventDefault();

      openModal();

    }

    if (closer) {

      closeModal();

    }

  });


  /* Keyboard Accessibility */

  if (modal) {

    modal.addEventListener("keydown", (event) => {

      if (event.key !== "Tab") return;

      const focusable = $$(
        'button, input, select, textarea, a[href]',
        modal
      ).filter((element) => {

        return (
          !element.disabled &&
          element.offsetParent !== null
        );

      });

      if (!focusable.length) return;

      const first = focusable[0];

      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {

        event.preventDefault();

        last.focus();

      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {

        event.preventDefault();

        first.focus();

      }

    });

  }


  /* ---------- WhatsApp Floating Button ---------- */

  if (chatFab) {

    chatFab.addEventListener("click", () => {

      const whatsapp =
        String(SITE.whatsapp || "").replace(/\D/g, "");

      if (whatsapp) {

        window.open(
          "https://wa.me/" + whatsapp,
          "_blank",
          "noopener,noreferrer"
        );

      } else {

        openModal();

      }

    });

  }


  /* ---------- Booking Form Validation ---------- */

  if (bookingForm) {

    const requiredFields = ["name", "phone"];

    requiredFields.forEach((fieldName) => {

      const field = bookingForm.elements[fieldName];

      if (!field) return;

      field.addEventListener("input", () => {

        field.classList.remove("invalid");

      });

    });


    bookingForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        if (!formNote) return;

        formNote.textContent = "";

        formNote.classList.remove("error");

        const formData = Object.fromEntries(
          new FormData(bookingForm).entries()
        );

        let valid = true;

        requiredFields.forEach((fieldName) => {

          const field =
            bookingForm.elements[fieldName];

          if (!field) return;

          const empty =
            !String(formData[fieldName] || "").trim();

          field.classList.toggle(
            "invalid",
            empty
          );

          if (empty) {
            valid = false;
          }

        });

        if (!valid) {

          formNote.classList.add("error");

          formNote.textContent =
            "لطفاً نام و شماره تماس خود را وارد کنید.";

          return;

        }


        const messageLines = [

          "درخواست رزرو مشاوره",

          "نام: " + formData.name,

          "شماره تماس: " + formData.phone,

          "نوع درمان: " + (formData.service || "مشاوره عمومی"),

          formData.date
            ? "زمان دلخواه: " + formData.date
            : "",

          formData.message
            ? "پیام: " + formData.message
            : ""

        ].filter(Boolean);

        const message = messageLines.join("\n");

        const endpoint =
          String(SITE.formEndpoint || "").trim();

        const whatsapp =
          String(SITE.whatsapp || "").replace(/\D/g, "");

        const email =
          String(SITE.email || "").trim();


        try {

          /* Send to configured form service */

          if (endpoint) {

            const submitButton =
              $('button[type="submit"]', bookingForm);

            if (submitButton) {
              submitButton.disabled = true;
            }

            formNote.textContent =
              "در حال ارسال درخواست...";

            const response = await fetch(endpoint, {

              method: "POST",

              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },

              body: JSON.stringify(formData)

            });

            if (!response.ok) {
              throw new Error("Request failed");
            }

            formNote.textContent =
              "درخواست شما با موفقیت ارسال شد.";

            bookingForm.reset();

            if (submitButton) {
              submitButton.disabled = false;
            }

          }

          /* WhatsApp */

          else if (whatsapp) {

            const whatsappURL =
              "https://wa.me/" +
              whatsapp +
              "?text=" +
              encodeURIComponent(message);

            window.open(
              whatsappURL,
              "_blank",
              "noopener,noreferrer"
            );

            formNote.textContent =
              "درخواست شما برای ارسال در واتساپ آماده شد.";

          }

          /* Email */

          else if (email) {

            const mailURL =
              "mailto:" +
              email +
              "?subject=" +
              encodeURIComponent("درخواست رزرو مشاوره") +
              "&body=" +
              encodeURIComponent(message);

            window.location.href = mailURL;

            formNote.textContent =
              "برنامه ایمیل شما در حال باز شدن است.";

          }

          /* Not configured */

          else {

            formNote.classList.add("error");

            formNote.textContent =
              "اطلاعات تماس مطب هنوز در فایل config.js تنظیم نشده است.";

          }

        } catch (error) {

          formNote.classList.add("error");

          formNote.textContent =
            "ارسال درخواست انجام نشد. لطفاً دوباره تلاش کنید.";

          const submitButton =
            $('button[type="submit"]', bookingForm);

          if (submitButton) {
            submitButton.disabled = false;
          }

        }

      }

    );

  }


  /* ---------- Search System ---------- */

  const searchBtn = $("#searchBtn");

  const searchPanel = $("#searchPanel");

  const searchInput = $("#searchInput");

  const searchResults = $("#searchResults");

  const searchForm = $("#searchForm");


  const searchIndex = [

    {
      title: "خانه",
      link: "#home",
      keywords: "خانه شروع لبخند دندان"
    },

    {
      title: "دندان‌پزشکی زیبایی",
      link: "#treatments",
      keywords: "زیبایی لمینت کامپوزیت طراحی لبخند"
    },

    {
      title: "ایمپلنت دندان",
      link: "#treatments",
      keywords: "ایمپلنت کاشت دندان جایگزینی دندان"
    },

    {
      title: "سفید کردن دندان",
      link: "#treatments",
      keywords: "بلیچینگ سفید کردن زیبایی"
    },

    {
      title: "مراقبت‌های پیشگیرانه",
      link: "#treatments",
      keywords: "بهداشت دهان جرم گیری مراقبت"
    },

    {
      title: "ارتودنسی",
      link: "#treatments",
      keywords: "ارتودنسی مرتب کردن دندان"
    },

    {
      title: "درمان ریشه",
      link: "#treatments",
      keywords: "عصب کشی ریشه دندان"
    },

    {
      title: "فناوری و تجهیزات",
      link: "#technology",
      keywords: "فناوری اسکن دیجیتال تصویربرداری"
    },

    {
      title: "درباره ما",
      link: "#about",
      keywords: "درباره کلینیک تجربه مراقبت"
    },

    {
      title: "تماس و رزرو مشاوره",
      link: "#contact",
      keywords: "تماس تلفن آدرس رزرو نوبت"
    }

  ];


  const renderSearchResults = (query = "") => {

    if (!searchResults) return;

    const term = query.trim().toLowerCase();

    const results = term

      ? searchIndex.filter((item) => {

          const searchable =
            item.title + " " + item.keywords;

          return searchable
            .toLowerCase()
            .includes(term);

        })

      : searchIndex.slice(1, 6);


    searchResults.innerHTML = "";


    if (!results.length) {

      const empty = document.createElement("li");

      empty.className = "search-empty";

      empty.textContent =
        "نتیجه‌ای پیدا نشد. عبارت دیگری را جست‌وجو کنید.";

      searchResults.appendChild(empty);

      return;

    }


    results.forEach((item) => {

      const li = document.createElement("li");

      const link = document.createElement("a");

      link.href = item.link;

      const title = document.createElement("span");

      title.textContent = item.title;

      const subtitle = document.createElement("small");

      subtitle.textContent =
        item.link.replace("#", "");

      link.appendChild(title);

      link.appendChild(subtitle);

      link.addEventListener("click", () => {
        toggleSearch(false);
      });

      li.appendChild(link);

      searchResults.appendChild(li);

    });

  };


  const toggleSearch = (open) => {

    if (!searchPanel || !searchBtn) return;

    searchPanel.hidden = !open;

    searchPanel.classList.toggle(
      "open",
      open
    );

    searchBtn.setAttribute(
      "aria-expanded",
      String(open)
    );

    if (open) {

      if (searchInput) {

        searchInput.value = "";

        renderSearchResults("");

        setTimeout(() => {
          searchInput.focus();
        }, 30);

      }

    }

  };


  if (searchBtn && searchPanel) {

    searchBtn.addEventListener("click", () => {

      toggleSearch(searchPanel.hidden);

    });

  }


  if (searchInput) {

    searchInput.addEventListener("input", () => {

      renderSearchResults(searchInput.value);

    });

  }


  if (searchForm) {

    searchForm.addEventListener("submit", (event) => {

      event.preventDefault();

      const firstResult =
        $("a", searchResults);

      if (firstResult) {
        firstResult.click();
      }

    });

  }


  /* ---------- Keyboard Shortcuts ---------- */

  document.addEventListener("keydown", (event) => {

    if (event.key !== "Escape") return;

    if (modal && !modal.hidden) {

      closeModal();

    } else if (
      searchPanel &&
      !searchPanel.hidden
    ) {

      toggleSearch(false);

      if (searchBtn) {
        searchBtn.focus();
      }

    } else if (
      nav &&
      nav.classList.contains("open")
    ) {

      setMenu(false);

    }

  });


  /* ---------- Initialization ---------- */

  console.log(
    "%c PURE DENTAL ",
    "background:#17191d;color:#c5a47e;padding:8px 14px;font-weight:bold;"
  );

  console.log(
    "Website initialized successfully."
  );

})();

/* =====================================
   DR. SHOLEH NEMATI
   Main JavaScript
===================================== */

// منوی موبایل
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        const isOpen = navLinks.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// تغییر هدر هنگام اسکرول
const header = document.querySelector('.header');

function handleHeaderScroll() {
    if (!header) return;

    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleHeaderScroll);
handleHeaderScroll();

// نمایش نرم بخش‌ها هنگام ورود به صفحه
const revealElements = document.querySelectorAll(
    '.about-content, .about-decoration, .service-card, .section-heading, .comparison, .appointment-form, .appointment-info'
);

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    revealElements.forEach(element => {
        element.classList.add('reveal');
        observer.observe(element);
    });
}

// فرم درخواست نوبت
const appointmentForm = document.querySelector('.appointment-form');
const formMessage = document.querySelector('#formMessage');

if (appointmentForm) {
    appointmentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.querySelector('#name')?.value.trim();
        const phone = document.querySelector('#phone')?.value.trim();
        const service = document.querySelector('#service')?.value;
        const date = document.querySelector('#date')?.value;
        const message = document.querySelector('#message')?.value.trim();

        if (!name || !phone || !service || !date) {
            showFormMessage('لطفاً فیلدهای ضروری را کامل کنید.', false);
            return;
        }

        const phonePattern = /^[0-9۰-۹٠-٩+\-\s]{8,20}$/;

        if (!phonePattern.test(phone)) {
            showFormMessage('لطفاً شماره تماس را بررسی کنید.', false);
            return;
        }

        const appointment = {
            id: Date.now(),
            name,
            phone,
            service,
            date,
            message,
            createdAt: new Date().toISOString()
        };

        try {
            const storageKey = 'puredentAppointmentRequests';
            const oldAppointments = JSON.parse(
                localStorage.getItem(storageKey) || '[]'
            );

            oldAppointments.push(appointment);

            localStorage.setItem(
                storageKey,
                JSON.stringify(oldAppointments)
            );

            showFormMessage(
                'درخواست شما در این مرورگر ذخیره شد. برای ثبت قطعی نوبت باید با مطب هماهنگ شود.',
                true
            );

            appointmentForm.reset();

        } catch (error) {
            showFormMessage(
                'ذخیره درخواست انجام نشد. لطفاً دوباره تلاش کنید.',
                false
            );
        }
    });
}

function showFormMessage(message, success) {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.style.color = success ? '#477a55' : '#a34c43';
}

// جلوگیری از انتخاب تاریخ گذشته
const dateInput = document.querySelector('#date');

if (dateInput) {
    const today = new Date();
    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split('T')[0];

    dateInput.min = localDate;
}

// سال جاری در فوتر
const yearElement = document.querySelector('#currentYear');

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

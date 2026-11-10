// Mobile Menu

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", function () {

    navMenu.classList.toggle("active");

});


// Close Mobile Menu After Clicking

const navLinks = document.querySelectorAll(".nav a");

navLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        navMenu.classList.remove("active");

    });

});


// Appointment Minimum Date

const dateInput = document.getElementById("date");

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

dateInput.min = `${year}-${month}-${day}`;


// Appointment Form

const appointmentForm = document.getElementById("appointmentForm");

const formMessage = document.getElementById("formMessage");


appointmentForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("patientName").value.trim();

    const phone = document.getElementById("patientPhone").value.trim();

    const service = document.getElementById("service").value;

    const date = document.getElementById("date").value;

    const time = document.getElementById("time").value;

    const message = document.getElementById("message").value.trim();


    const appointment = {

        name: name,

        phone: phone,

        service: service,

        date: date,

        time: time,

        message: message,

        createdAt: new Date().toISOString()

    };


    let requests = JSON.parse(

        localStorage.getItem("puredentAppointmentRequests") || "[]"

    );


    requests.push(appointment);


    localStorage.setItem(

        "puredentAppointmentRequests",

        JSON.stringify(requests)

    );


    formMessage.textContent =
        "اطلاعات در همین مرورگر ذخیره شد؛ این درخواست هنوز به مطب ارسال نشده است.";


    appointmentForm.reset();

    dateInput.min = `${year}-${month}-${day}`;

});


// Before And After Slider

const comparisonRange = document.getElementById("comparisonRange");

const comparisonAfter = document.querySelector(".comparison-after");

const comparisonDivider = document.getElementById("comparisonDivider");


comparisonRange.addEventListener("input", function () {

    const value = this.value;

    comparisonAfter.style.clipPath = `inset(0 0 0 ${value}%)`;

    comparisonDivider.style.right = `${100 - value}%`;

});

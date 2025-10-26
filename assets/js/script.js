'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });


// THEME TOGGLE
const themeBtn = document.querySelector('[data-theme-btn]');
const preferredTheme = localStorage.getItem('theme');
const applyTheme = (theme) => {
  if (theme === 'light') document.documentElement.classList.add('light-theme');
  else document.documentElement.classList.remove('light-theme');
  if (themeBtn) themeBtn.setAttribute('aria-pressed', theme === 'light');
};

// initialize theme
if (preferredTheme) applyTheme(preferredTheme);
else {
  // respect OS preference if no stored value
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(prefersLight ? 'light' : 'dark');
}

if (themeBtn) {
  themeBtn.addEventListener('click', function () {
    const isLight = document.documentElement.classList.contains('light-theme');
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });
}



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
if (modalCloseBtn) modalCloseBtn.addEventListener("click", testimonialsModalFunc);
if (overlay) overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables (may be absent)
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    if (selectValue) selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    if (lastClickedBtn) lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (!form) return;
    if (form.checkValidity()) {
      if (formBtn) formBtn.removeAttribute("disabled");
    } else {
      if (formBtn) formBtn.setAttribute("disabled", "");
    }

  });
}


// AJAX contact form submit with fallback to mailto
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!form.checkValidity()) return;

    const endpoint = form.dataset.formEndpoint || form.getAttribute('action') || '';
    const adminEmail = form.dataset.adminEmail || '';

    if (formBtn) {
      formBtn.setAttribute('disabled', '');
      const originalText = formBtn.innerText;
      formBtn.innerHTML = '<ion-icon name="paper-plane"></ion-icon> Sending...';

      // collect data
      const data = new FormData(form);

      // If no endpoint configured, fallback immediately to mailto
      if (!endpoint || endpoint.includes('your-form-id')) {
        // open mail client with prefilled message
        fallbackToMailto(adminEmail, data);
        showFormStatus('Opened mail client — please send your message.', true);
        formBtn.removeAttribute('disabled');
        formBtn.innerText = originalText;
        return;
      }

      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (resp.ok) {
          form.reset();
          showFormStatus('Message sent successfully.', true);
        } else {
          // try fallback
          showFormStatus('Unable to send via server. Opening mail client...', false);
          fallbackToMailto(adminEmail, data);
        }

      } catch (err) {
        // network or other error - fallback
        fallbackToMailto(adminEmail, data);
        showFormStatus('Network error — opened mail client for fallback.', false);
      } finally {
        if (formBtn) {
          formBtn.removeAttribute('disabled');
          formBtn.innerText = originalText;
        }
      }
    }

  });
}

function fallbackToMailto(adminEmail, formData) {
  const fullname = formData.get('fullname') || '';
  const fromEmail = formData.get('email') || '';
  const message = formData.get('message') || '';
  const subject = encodeURIComponent('Website contact from ' + fullname);
  const body = encodeURIComponent('From: ' + fullname + ' <' + fromEmail + '>\n\n' + message);
  const to = adminEmail || '';
  // If adminEmail is empty, open user's email client with no recipient so they can choose
  const mailto = 'mailto:' + encodeURIComponent(to) + '?subject=' + subject + '&body=' + body;
  window.location.href = mailto;
}

// helper for showing form submission messages
function showFormStatus(message, success) {
  let statusEl = document.querySelector('.form-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.className = 'form-status';
    const contactSection = document.querySelector('[data-page="contact"] .contact-form');
    if (contactSection) contactSection.appendChild(statusEl);
  }
  statusEl.textContent = message;
  statusEl.classList.toggle('success', !!success);
  statusEl.classList.toggle('error', !success);
  setTimeout(() => { statusEl.classList.add('visible'); }, 10);
  setTimeout(() => { statusEl.classList.remove('visible'); }, 6000);
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        // smooth scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}

// Initialize skill progress fills from <data> values
document.addEventListener('DOMContentLoaded', function () {
  const skillItems = document.querySelectorAll('.skills-item');
  skillItems.forEach(item => {
    const data = item.querySelector('data');
    const fill = item.querySelector('.skill-progress-fill');
    if (data && fill) {
      const val = parseInt(data.getAttribute('value'), 10) || 0;
      fill.style.width = val + '%';
    }
  });
});
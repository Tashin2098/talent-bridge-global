/* ===========================================================
   Hireline — Landing Page Behavior
   Vanilla JS, no dependencies
   =========================================================== */

(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close mobile nav when a link is tapped
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    // Arm the animation only now that JS is confirmed running.
    document.documentElement.classList.add("js-reveal");

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            // slight stagger for elements revealing together
            var delay = (i % 4) * 60;
            setTimeout(function () {
              entry.target.classList.add("is-visible");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px 200px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });

    // Safety net: if a hash link jumps straight to a section (skipping
    // the scroll that would normally trigger the observer), reveal that
    // section's children immediately.
    function revealHashTarget() {
      if (!location.hash) return;
      var target = document.querySelector(location.hash);
      if (!target) return;
      target.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
    window.addEventListener("hashchange", revealHashTarget);
    revealHashTarget();
  }
  /* If IntersectionObserver isn't supported, .reveal elements simply
     stay at their default visible state (see styles.css) — no fallback
     class needed since visibility is the default, not the exception. */

  /* ---------- Chat widget toggle ---------- */
  var chatToggle = document.getElementById("chatToggle");
  var chatPanel = document.getElementById("chatPanel");
  var chatClose = document.getElementById("chatClose");

  function openChat() {
    chatPanel.classList.add("is-open");
    chatPanel.setAttribute("aria-hidden", "false");
    chatToggle.setAttribute("aria-expanded", "true");
  }

  function closeChat() {
    chatPanel.classList.remove("is-open");
    chatPanel.setAttribute("aria-hidden", "true");
    chatToggle.setAttribute("aria-expanded", "false");
  }

  if (chatToggle && chatPanel && chatClose) {
    chatToggle.addEventListener("click", function () {
      var isOpen = chatPanel.classList.contains("is-open");
      if (isOpen) {
        closeChat();
      } else {
        openChat();
      }
    });
    chatClose.addEventListener("click", closeChat);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeChat();
    });
  }

  /* ---------- Waitlist form (front-end only placeholder) ---------- */
  var form = document.getElementById("waitlistForm");
  var note = document.getElementById("formNote");
  var emailInput = document.getElementById("emailInput");

  if (form && note) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      if (!email) return;

      // Placeholder behavior — replace with a real API call
      // (e.g. fetch to your waitlist endpoint, Mailchimp, Airtable, etc.)
      note.textContent = "You're on the list! We'll email " + email + " when Hireline opens.";
      note.style.color = "#F2B89C";
      form.reset();
    });
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  var header = document.getElementById("header");
  var lastY = window.scrollY;

  window.addEventListener(
    "scroll",
    function () {
      if (!header) return;
      if (window.scrollY > 8) {
        header.style.boxShadow = "0 6px 20px rgba(15, 61, 62, 0.06)";
      } else {
        header.style.boxShadow = "none";
      }
      lastY = window.scrollY;
    },
    { passive: true }
  );
})();

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

  /* ===========================================================
     CHATBOT CONFIG — matches your RAG /generate endpoint
     ===========================================================
     Request shape:  { "query": "...", "top_k": 3 }
     Response shape: unconfirmed — see responseFieldCandidates below.
  */
  var CHAT_CONFIG = {
    // Local FastAPI endpoint.
    endpointUrl: "https://rag-chatbot-policy.onrender.com/generate",

    // No API key required — your Swagger UI shows no auth/lock icon on
    // this route. Leave as-is unless you add auth later.
    apiKey: "",
    authMode: "bearer",

    // Your endpoint takes "query", not "message".
    messageField: "query",

    // Your endpoint doesn't accept conversation history at all — set to
    // null so it's left out of the request body entirely.
    historyField: null,

    // How many chunks the RAG retriever should pull per question.
    topK: 3,

    // We haven't confirmed the exact response field name yet (need the
    // Swagger "Execute" response body to know for sure). This tries the
    // most likely field names in order and uses whichever exists.
    // Common possibilities: "answer", "response", "generated_text", "reply".
    responseFieldCandidates: ["answer", "response", "generated_text", "reply", "result", "text"]
  };

  /* ---------- Chat widget ---------- */
  var chatToggle = document.getElementById("chatToggle");
  var chatPanel = document.getElementById("chatPanel");
  var chatClose = document.getElementById("chatClose");
  var chatBody = document.getElementById("chatBody");
  var chatForm = document.getElementById("chatForm");
  var chatInput = document.getElementById("chatInput");
  var chatSend = document.getElementById("chatSend");

  function openChat() {
    chatPanel.classList.add("is-open");
    chatPanel.setAttribute("aria-hidden", "false");
    chatToggle.setAttribute("aria-expanded", "true");
    if (chatInput) chatInput.focus();
  }

  function closeChat() {
    chatPanel.classList.remove("is-open");
    chatPanel.setAttribute("aria-hidden", "true");
    chatToggle.setAttribute("aria-expanded", "false");
  }

  function scrollChatToBottom() {
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }

  function appendMessage(text, role) {
    // role: "user" | "bot" | "error"
    var el = document.createElement("div");
    el.className = "chat-msg chat-msg--" + role;
    el.textContent = text;
    chatBody.appendChild(el);
    scrollChatToBottom();
    return el;
  }

  function showTypingIndicator() {
    var el = document.createElement("div");
    el.className = "chat-msg chat-msg--bot chat-msg--typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    chatBody.appendChild(el);
    scrollChatToBottom();
    return el;
  }

  function buildHeaders() {
    var headers = { "Content-Type": "application/json" };
    if (CHAT_CONFIG.apiKey) {
      if (CHAT_CONFIG.authMode === "bearer") {
        headers["Authorization"] = "Bearer " + CHAT_CONFIG.apiKey;
      } else {
        headers["X-API-Key"] = CHAT_CONFIG.apiKey;
      }
    }
    return headers;
  }

  function buildBody(userMessage) {
    var body = {};
    body[CHAT_CONFIG.messageField] = userMessage;
    if (CHAT_CONFIG.historyField) {
      body[CHAT_CONFIG.historyField] = chatHistory;
    }
    if (typeof CHAT_CONFIG.topK === "number") {
      body.top_k = CHAT_CONFIG.topK;
    }
    return body;
  }

  // Looks through responseFieldCandidates in order and returns the first
  // one that's actually present in the response JSON. Returns null if
  // none of them match, so the caller can show a clear diagnostic instead
  // of silently displaying "undefined".
  function extractReply(data) {
    if (!data) return null;
    for (var i = 0; i < CHAT_CONFIG.responseFieldCandidates.length; i++) {
      var field = CHAT_CONFIG.responseFieldCandidates[i];
      if (typeof data[field] === "string" && data[field].length > 0) {
        return data[field];
      }
    }
    return null;
  }

  function sendToBot(userMessage) {
    var typingEl = showTypingIndicator();

    fetch(CHAT_CONFIG.endpointUrl, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(buildBody(userMessage))
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Server responded with status " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        typingEl.remove();
        var replyText = extractReply(data);

        if (replyText === null) {
          console.warn("Chatbot response JSON:", data);
          appendMessage(
            "Got a response back, but couldn't find the reply text in it. " +
            "Check the browser console for the raw response, then update " +
            "CHAT_CONFIG.responseFieldCandidates in script.js to include " +
            "the correct field name.",
            "error"
          );
          return;
        }

        appendMessage(replyText, "bot");
      })
      .catch(function (err) {
        typingEl.remove();
        appendMessage(
          "Couldn't reach the chatbot service (" + err.message + "). " +
          "Make sure your FastAPI server is running at " +
          CHAT_CONFIG.endpointUrl + " and that CORS is enabled for this page's origin.",
          "error"
        );
        console.error("Chatbot request failed:", err);
      });
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

  if (chatForm && chatInput && chatSend) {
    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = chatInput.value.trim();
      if (!text) return;

      appendMessage(text, "user");
      chatInput.value = "";
      chatInput.focus();
      sendToBot(text);
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

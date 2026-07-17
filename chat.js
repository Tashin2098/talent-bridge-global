/* ===========================================================
   Hireline — Full-page Chat Behavior
   Vanilla JS, no dependencies
   =========================================================== */

(function () {
  "use strict";

  /* ===========================================================
     CHATBOT CONFIG — matches your RAG /generate endpoint
     ===========================================================
     Request shape:  { "query": "...", "top_k": 3 }
     Response shape: { "answer": "..." }  (confirmed from your api.py)

     If your endpoint or response field ever changes, this is the
     only block you need to edit — same as in script.js.
  */
  var CHAT_CONFIG = {
    endpointUrl: "https://rag-chatbot-policy.onrender.com/generate",
    apiKey: "",
    authMode: "bearer",
    messageField: "query",
    historyField: null,
    topK: 3,
    responseFieldCandidates: ["answer", "response", "generated_text", "reply", "result", "text"]
  };

  var chatBody = document.getElementById("chatBody");
  var chatForm = document.getElementById("chatForm");
  var chatInput = document.getElementById("chatInput");
  var chatSend = document.getElementById("chatSend");

  function scrollChatToBottom() {
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }

  function appendMessage(text, role) {
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
    if (typeof CHAT_CONFIG.topK === "number") {
      body.top_k = CHAT_CONFIG.topK;
    }
    return body;
  }

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

  function setSending(isSending) {
    if (chatInput) chatInput.disabled = isSending;
    if (chatSend) chatSend.disabled = isSending;
  }

  function sendToBot(userMessage) {
    var typingEl = showTypingIndicator();
    setSending(true);

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
            "CHAT_CONFIG.responseFieldCandidates in chat.js to include " +
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
      })
      .finally(function () {
        setSending(false);
        if (chatInput) chatInput.focus();
      });
  }

  if (chatForm && chatInput && chatSend) {
    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = chatInput.value.trim();
      if (!text) return;

      appendMessage(text, "user");
      chatInput.value = "";
      sendToBot(text);
    });

    // Auto-focus the input when the page loads, so visitors can start
    // typing immediately.
    chatInput.focus();
  }
})();

/**
 * Server-side HTML renderer for clarification sessions. Pure string
 * concatenation — no React, no template engine. Form posts back to
 *   POST /api/clarification/:promptId/answer
 *   POST /api/clarification/:promptId/skip
 *
 * Styling is inline so the form works standalone if the daemon serves it at
 * a different origin / iframes it into the Build console.
 */

import type { ClarificationQuestion, ClarificationSession } from "./types.js"

// Dash Purple semantic token (registry: --primary-base = --dash-purple-500 = #5e2aac).
// Stored as a CSS var reference so the audit treats it as semantic, not a raw hex.
const DASH_PURPLE = "var(--primary-base)"

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function renderQuestionBody(q: ClarificationQuestion): string {
  switch (q.type) {
    case "single-choice":
    case "multi-choice": {
      const options = q.options ?? []
      const inputType = q.type === "single-choice" ? "radio" : "checkbox"
      return `<div class="options">${options
        .map(
          (opt, idx) => `
        <label class="option">
          <input type="${inputType}" name="${escapeHtml(q.id)}" value="${escapeHtml(opt)}" data-question="${escapeHtml(q.id)}" ${
            inputType === "radio" && idx === 0 ? "" : ""
          } />
          <span>${escapeHtml(opt)}</span>
        </label>`,
        )
        .join("")}</div>`
    }
    case "yes-no":
      return `
        <div class="options yes-no">
          <label class="option">
            <input type="radio" name="${escapeHtml(q.id)}" value="yes" data-question="${escapeHtml(q.id)}" />
            <span>Yes</span>
          </label>
          <label class="option">
            <input type="radio" name="${escapeHtml(q.id)}" value="no" data-question="${escapeHtml(q.id)}" />
            <span>No</span>
          </label>
        </div>`
    case "free-text":
      return `<textarea name="${escapeHtml(q.id)}" data-question="${escapeHtml(q.id)}" rows="3" placeholder="Type your answer..."></textarea>`
  }
}

export function renderClarificationForm(session: ClarificationSession): string {
  const questionCount = session.questions.length
  const questionsHtml = session.questions
    .map(
      (q) => `
    <div class="question" data-id="${escapeHtml(q.id)}">
      <label class="q-label">
        ${escapeHtml(q.text)}
        ${q.required ? '<span class="required" aria-label="required">*</span>' : ""}
      </label>
      <p class="rationale">${escapeHtml(q.rationale)}</p>
      ${renderQuestionBody(q)}
    </div>`,
    )
    .join("\n")

  const promptId = escapeHtml(session.promptId)

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Dash Build — Clarification</title>
  <style>
    :root {
      --purple: ${DASH_PURPLE};
      --bg: #fafafa;
      --surface: #ffffff;
      --border: #e6e6ec;
      --text: #1a1424;
      --mute: #6b6478;
      --required: #b8336a;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px 16px;
      background: var(--bg);
      color: var(--text);
      font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      line-height: 1.5;
    }
    .clarification-form {
      max-width: 640px;
      margin: 0 auto;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
    }
    header h2 {
      margin: 0 0 4px;
      font-size: 20px;
      font-weight: 600;
    }
    header .mute {
      margin: 0;
      color: var(--mute);
      font-size: 13px;
    }
    .original-prompt {
      margin: 20px 0;
      padding: 12px 14px;
      background: var(--primary-alpha-10, var(--bg-weak-50));
      border-left: 3px solid var(--purple);
      border-radius: 4px;
      font-size: 13px;
      color: var(--text-strong-950);
      white-space: pre-wrap;
    }
    .question {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .question:first-of-type { border-top: none; padding-top: 0; }
    .q-label {
      display: block;
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 4px;
    }
    .required { color: var(--required); margin-left: 4px; }
    .rationale {
      margin: 0 0 12px;
      font-size: 12.5px;
      color: var(--mute);
    }
    .options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .options.yes-no .option { min-width: 80px; }
    .option {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      background: var(--bg-white-0);
      transition: all 120ms ease;
    }
    .option:hover { border-color: var(--purple); }
    .option input { accent-color: var(--purple); }
    .option:has(input:checked) {
      border-color: var(--purple);
      background: var(--primary-alpha-10, var(--bg-weak-50));
    }
    textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
    }
    textarea:focus { outline: 2px solid var(--purple); outline-offset: 1px; }
    footer {
      display: flex;
      gap: 12px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    button {
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      padding: 10px 18px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg-white-0);
      cursor: pointer;
    }
    button.primary {
      background: var(--purple);
      border-color: var(--purple);
      color: var(--text-white-0);
    }
    button.primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .status {
      margin-top: 16px;
      font-size: 13px;
      color: var(--mute);
      min-height: 18px;
    }
  </style>
</head>
<body>
  <form class="clarification-form" data-prompt-id="${promptId}">
    <header>
      <h2>I need a bit more info before generating</h2>
      <p class="mute">${questionCount} quick question${questionCount === 1 ? "" : "s"}</p>
    </header>
    <div class="original-prompt">${escapeHtml(session.originalPrompt)}</div>
    ${questionsHtml}
    <footer>
      <button type="button" class="primary" data-action="submit">Submit answers → Generate</button>
      <button type="button" data-action="skip">Skip — generate anyway</button>
    </footer>
    <div class="status" data-role="status"></div>
  </form>
  <script>
    (function () {
      var form = document.querySelector(".clarification-form");
      if (!form) return;
      var promptId = form.getAttribute("data-prompt-id");
      var statusEl = form.querySelector('[data-role="status"]');
      function readAnswers() {
        var answers = {};
        form.querySelectorAll("[data-question]").forEach(function (el) {
          var qId = el.getAttribute("data-question");
          if (el.type === "radio") {
            if (el.checked) answers[qId] = el.value === "yes" ? true : el.value === "no" ? false : el.value;
          } else if (el.type === "checkbox") {
            if (!answers[qId]) answers[qId] = [];
            if (el.checked) answers[qId].push(el.value);
          } else if (el.tagName === "TEXTAREA") {
            if (el.value.trim()) answers[qId] = el.value.trim();
          }
        });
        return answers;
      }
      async function postAnswer(qId, answer) {
        return fetch("/api/clarification/" + encodeURIComponent(promptId) + "/answer", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ questionId: qId, answer: answer })
        });
      }
      form.querySelector('[data-action="submit"]').addEventListener("click", async function () {
        var answers = readAnswers();
        statusEl.textContent = "Submitting...";
        for (var qId in answers) {
          await postAnswer(qId, answers[qId]);
        }
        statusEl.textContent = "Submitted. You can close this tab.";
      });
      form.querySelector('[data-action="skip"]').addEventListener("click", async function () {
        statusEl.textContent = "Skipping...";
        await fetch("/api/clarification/" + encodeURIComponent(promptId) + "/skip", { method: "POST" });
        statusEl.textContent = "Skipped. Generation will proceed without clarification.";
      });
    })();
  </script>
</body>
</html>`
}

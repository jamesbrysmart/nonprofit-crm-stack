export const DONATION_FORM_RENDER_STYLES = `
  :root {
    color-scheme: light;
    --panel: #ffffff;
    --text: #1b2430;
    --muted: #5b6676;
    --line: #d9e1ea;
    --error: #a12424;
    --accent: #0d7a5f;
    --accent-soft: #e9f6f2;
    --accent-outline: #a7d6c9;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: transparent;
    color: var(--text);
    font: 16px/1.5 "Instrument Sans", "Inter", system-ui, sans-serif;
  }

  .shell {
    max-width: 640px;
    margin: 0 auto;
    padding: 16px;
  }

  .card {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 18px 40px rgba(19, 40, 62, 0.08);
  }

  h1 {
    margin: 0 0 8px;
    font-size: clamp(24px, 6vw, 30px);
    line-height: 1.15;
  }

  h2 {
    margin: 0;
    font-size: 20px;
    line-height: 1.3;
  }

  h2:focus,
  .error-summary:focus,
  .error-panel:focus {
    outline: none;
  }

  h2:focus-visible,
  .error-summary:focus-visible,
  .error-panel:focus-visible {
    outline: 3px solid var(--accent-outline);
    outline-offset: 4px;
  }

  .step {
    display: block;
    margin-bottom: 2px;
    font-size: 13px;
    font-weight: 600;
    color: var(--muted);
  }

  p {
    margin: 0;
  }

  .intro {
    color: var(--muted);
  }

  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }

  .section {
    margin-top: 24px;
  }

  .label {
    display: block;
    padding: 0;
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }

  form {
    margin-top: 24px;
  }

  .choices {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .choice {
    position: relative;
  }

  .choice input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .choice span {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 10px 16px;
    background: #fff;
    font-weight: 600;
    cursor: pointer;
    transition:
      border-color 120ms ease,
      background 120ms ease,
      color 120ms ease;
  }

  .choice span:hover {
    border-color: #8d9aab;
  }

  .choice input:checked + span {
    border-color: var(--accent);
    background: var(--accent);
    color: #fff;
  }

  .choice input:focus-visible + span {
    outline: 3px solid var(--accent-outline);
    outline-offset: 2px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field label {
    font-size: 15px;
    font-weight: 600;
  }

  .custom-amount {
    margin-top: 16px;
    max-width: 260px;
  }

  .custom-amount-input {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .currency-symbol {
    font-weight: 600;
  }

  input[type='text'],
  input[type='email'],
  input[type='tel'],
  select {
    width: 100%;
    min-height: 48px;
    border: 1px solid #8d9aab;
    border-radius: 12px;
    padding: 10px 14px;
    /* 16px or more stops iOS zooming into focused inputs. */
    font: inherit;
    font-size: 16px;
    color: var(--text);
    background: #fff;
  }

  input:focus,
  select:focus {
    outline: 3px solid var(--accent-outline);
    outline-offset: 0;
    border-color: var(--accent);
  }

  input[aria-invalid='true'],
  select[aria-invalid='true'] {
    border-color: var(--error);
    border-width: 2px;
  }

  .field-error {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--error);
  }

  .field-error[hidden] {
    display: none;
  }

  .hint {
    font-size: 14px;
    font-weight: 400;
    color: var(--muted);
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .checkbox {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: #fbfcfe;
  }

  .checkbox input {
    flex: none;
    width: 22px;
    height: 22px;
    margin: 1px 0 0;
    accent-color: var(--accent);
  }

  .checkbox label {
    cursor: pointer;
  }

  .checkbox .hint {
    display: block;
    margin-top: 4px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 16px;
    margin-top: 24px;
  }

  .button {
    appearance: none;
    min-height: 48px;
    border: 0;
    border-radius: 999px;
    padding: 12px 22px;
    background: var(--accent);
    color: #fff;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .button:focus-visible,
  .link-button:focus-visible,
  .error-summary a:focus-visible {
    outline: 3px solid var(--accent-outline);
    outline-offset: 2px;
  }

  .button[disabled] {
    opacity: 0.65;
    cursor: progress;
  }

  .button-secondary {
    background: #fff;
    color: var(--accent);
    border: 1px solid var(--accent);
  }

  .link-button {
    appearance: none;
    margin-top: 8px;
    padding: 4px 0;
    border: 0;
    background: none;
    color: var(--accent);
    font: inherit;
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }

  .status {
    font-size: 15px;
    color: var(--muted);
  }

  .status:empty {
    display: none;
  }

  .error-summary {
    margin-top: 16px;
    border: 2px solid var(--error);
    border-radius: 14px;
    padding: 14px 16px;
  }

  .error-summary h3 {
    margin: 0 0 6px;
    font-size: 17px;
  }

  .error-summary ul {
    margin: 0;
    padding-left: 20px;
  }

  .error-summary a {
    color: var(--error);
    font-weight: 600;
  }

  .error-panel {
    margin-top: 18px;
    border: 1px solid #efc0c0;
    background: #fff6f6;
    color: #842a2a;
    border-radius: 14px;
    padding: 12px 14px;
  }

  .error-panel .button {
    margin-top: 10px;
  }

  [hidden] {
    display: none !important;
  }

  .payment-panel {
    margin-top: 24px;
  }

  .summary {
    margin: 12px 0 0;
    font-size: 15px;
  }

  dl.summary div {
    display: flex;
    gap: 8px;
  }

  dl.summary dt {
    min-width: 80px;
    color: var(--muted);
  }

  dl.summary dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  #paymentHint {
    margin-top: 16px;
  }

  #payment-element {
    min-height: 44px;
    margin-top: 12px;
  }

  .success-panel {
    margin-top: 24px;
    padding: 20px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--accent-soft);
  }

  .success-panel h2 {
    margin-bottom: 8px;
    font-size: 22px;
  }

  .secure-note {
    margin-top: 20px;
    font-size: 14px;
    color: var(--muted);
  }

  .meta {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--line);
    font-size: 14px;
    color: var(--muted);
  }

  .nf-hp {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  @media (max-width: 560px) {
    .shell {
      padding: 8px;
    }

    .card {
      padding: 18px 16px;
      border-radius: 16px;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .custom-amount {
      max-width: none;
    }

    .actions .button {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
`;

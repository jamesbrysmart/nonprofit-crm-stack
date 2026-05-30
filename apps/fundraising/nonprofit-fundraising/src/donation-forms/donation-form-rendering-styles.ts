export const DONATION_FORM_RENDER_STYLES = `
  :root {
    color-scheme: light;
    --panel: #ffffff;
    --text: #1b2430;
    --muted: #6c7888;
    --line: #d9e1ea;
    --accent: #0d7a5f;
    --accent-soft: #e9f6f2;
    --accent-outline: #a7d6c9;
  }

  body {
    margin: 0;
    background: linear-gradient(180deg, #f6f8fb 0%, #edf3f8 100%);
    color: var(--text);
    font: 16px/1.5 "Instrument Sans", "Inter", system-ui, sans-serif;
  }

  .shell {
    max-width: 640px;
    margin: 0 auto;
    padding: 24px 16px;
  }

  .card {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 18px 40px rgba(19, 40, 62, 0.08);
  }

  .eyebrow {
    display: inline-flex;
    margin-bottom: 12px;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0 0 8px;
    font-size: 30px;
    line-height: 1.1;
  }

  p {
    margin: 0;
    color: var(--muted);
  }

  .section {
    margin-top: 24px;
  }

  .label {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .amounts {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .amount {
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 10px 14px;
    background: #fff;
    font-weight: 600;
    cursor: pointer;
    transition:
      border-color 120ms ease,
      background 120ms ease,
      color 120ms ease,
      transform 120ms ease;
  }

  .amount:hover {
    transform: translateY(-1px);
    border-color: #b6c4d4;
  }

  .amount.is-selected {
    border-color: var(--accent);
    background: var(--accent);
    color: #fff;
  }

  form {
    margin-top: 24px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field span {
    font-size: 14px;
    font-weight: 600;
  }

  input[type='text'],
  input[type='email'],
  input[type='tel'],
  select {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 12px 14px;
    font: inherit;
    color: var(--text);
    background: #fff;
  }

  input:focus,
  select:focus {
    outline: 2px solid var(--accent-outline);
    outline-offset: 0;
    border-color: var(--accent);
  }

  .hint {
    font-size: 13px;
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
    gap: 10px;
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: #fbfcfe;
  }

  .checkbox input {
    margin-top: 3px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 24px;
  }

  .button {
    appearance: none;
    border: 0;
    border-radius: 999px;
    padding: 12px 18px;
    background: var(--accent);
    color: #fff;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .button[disabled] {
    opacity: 0.65;
    cursor: wait;
  }

  .status {
    font-size: 14px;
    color: var(--muted);
  }

  .payment-panel {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--line);
  }

  .payment-panel[hidden] {
    display: none;
  }

  .success-panel[hidden] {
    display: none;
  }

  #payment-element {
    min-height: 44px;
  }

  .meta {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--line);
    font-size: 14px;
    color: var(--muted);
  }

  .error {
    color: #a12424;
  }

  .error-panel {
    margin-top: 18px;
    border: 1px solid #efc0c0;
    background: #fff6f6;
    color: #842a2a;
    border-radius: 14px;
    padding: 12px 14px;
  }

  .summary {
    margin-top: 12px;
    font-size: 14px;
    color: var(--muted);
  }

  .success-panel {
    margin-top: 24px;
    padding: 20px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--accent-soft);
  }

  .success-panel h2 {
    margin: 0 0 8px;
    font-size: 22px;
    line-height: 1.2;
    color: var(--text);
  }

  @media (max-width: 640px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
`;

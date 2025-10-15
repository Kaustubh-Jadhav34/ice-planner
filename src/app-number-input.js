import { LitElement, html, css } from 'lit';

export class AppNumberInput extends LitElement {
  static get properties() {
    return { label:{type:String}, value:{type:Number}, min:{type:Number}, max:{type:Number}, step:{type:Number}, suffix:{type:String} };
  }

  constructor() {
    super();
    this.label=''; this.value=0; this.min=0; this.max=1_000_000; this.step=1; this.suffix='';
  }

  static get styles() {
    return css`
      :host { display:block; }
      .field { display:grid; gap:6px; }
      label {
        font: 600 .95rem/1.2 system-ui, Arial, sans-serif;
        color: var(--ddd-theme-default-wonderPurple, #5632e6);
      }
      .wrap {
        display:flex; align-items:center; gap:8px;
        background: var(--app-input-bg, #0e1529);
        border: 1px solid var(--app-input-border, #263449);
        border-radius: 12px; padding: 10px 12px;
        transition: border-color .15s ease;
      }
      input[type="number"] {
        width:100%; border:none; outline:none; font-size:1rem; background:transparent;
        color: var(--app-input-fg, #dbeafe);
      }
      .wrap:focus-within { border-color: #60a5fa; }
      .suffix { color:#93a3b8; font-size:.9rem; }
      @media (prefers-color-scheme: light) {
        .wrap{ background:#fff; border-color:#cbd5e1; }
        input[type="number"]{ color:#0b1c5b; }
        .suffix{ color:#475569; }
      }
    `;
  }

  _onInput(e) {
    const v = Number(e.target.value);
    this.value = Number.isFinite(v) ? v : 0;
    this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: this.value } }));
  }

  render() {
    return html`
      <div class="field">
        ${this.label ? html`<label>${this.label}</label>` : html``}
        <div class="wrap">
          <input type="number"
            .value=${String(this.value)}
            min=${this.min}
            max=${this.max}
            step=${this.step}
            @input=${this._onInput} />
          ${this.suffix ? html`<span class="suffix">${this.suffix}</span>` : html``}
        </div>
      </div>
    `;
  }
}
customElements.define('app-number-input', AppNumberInput);

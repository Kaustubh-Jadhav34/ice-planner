import { LitElement, html, css } from 'lit';

export class AppNumberInput extends LitElement {
  static get properties() {
    return { label:{type:String}, value:{type:Number}, min:{type:Number}, max:{type:Number}, step:{type:Number}, suffix:{type:String} };
  }

  constructor() {
    super();
    this.label = '';
    this.value = 0;
    this.min = 0;
    this.max = 1_000_000;
    this.step = 1;
    this.suffix = '';
  }

  static get styles() {
    return css`
      :host { display: block; }
      .field { display: grid; gap: 6px; }
      label { font: 600 0.95rem/1.2 system-ui, Arial, sans-serif; color: var(--ddd-theme-default-wonderPurple, #5632e6); }
      .wrap {
        display: flex; align-items: center; gap: 8px;
        background: var(--app-input-bg, #fff);
        border: 1px solid var(--app-input-border, #cbd5e1);
        border-radius: 10px; padding: 8px 12px;
      }
      input[type="number"] {
        width: 100%; border: none; outline: none; font-size: 1rem; background: transparent;
        color: var(--app-input-fg, #0b1c5b);
      }
      .suffix { color: #475569; font-size: 0.9rem; }
      @media (prefers-color-scheme: dark) {
        :host { --app-input-bg: #0b1220; --app-input-border: #263449; --app-input-fg: #dbeafe; }
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
          <input
            type="number"
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

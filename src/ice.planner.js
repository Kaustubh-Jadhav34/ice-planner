import { LitElement, html, css } from 'lit';
import './app-number-input.js';

export class IcePlanner extends LitElement {
  static get properties() {
    return {
      teamName:      { type: String },
      logo:          { type: String },
      iceCost:       { type: Number },
      hours:         { type: Number },
      feePct:        { type: Number },
      feeFixed:      { type: Number },
      coachCost:     { type: Number },
      jerseyCost:    { type: Number },
      players:       { type: Number },
      totalBase:     { type: Number },
      totalWithFees: { type: Number },
      perPlayer:     { type: Number },
    };
  }

  constructor() {
    super();
    // Defaults from assignment
    this.teamName   = 'Penn State Youth';
    this.logo       = '';
    this.iceCost    = 300;
    this.hours      = 50;
    this.feePct     = 0.02;
    this.feeFixed   = 0.99;
    this.coachCost  = 3000;
    this.jerseyCost = 88;
    this.players    = 1; // avoid divide-by-zero
    this._storageKey   = 'ice-planner-v1';
    this._fromURLOnce  = false;
    this._recalc();
  }

  // Initialize from URL and localStorage once connected
  firstUpdated() {
    this._loadFromURL();
    this._loadFromStorage();
  }

  // When any watched field changes, recompute, persist, and sync URL
  updated(changed) {
    const watched = ['iceCost','hours','feePct','feeFixed','coachCost','jerseyCost','players'];
    if (watched.some(k => changed.has(k))) {
      this._recalc();
      this._saveToStorage();
      this._writeToURL();
    }
  }

  // ---------- Persistence & URL ----------

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        Object.assign(this, data);
        this._recalc();
      }
    } catch(e) { /* ignore */ }
  }

  _saveToStorage() {
    try {
      const data = {
        teamName: this.teamName, logo: this.logo,
        iceCost: this.iceCost, hours: this.hours,
        feePct: this.feePct, feeFixed: this.feeFixed,
        coachCost: this.coachCost, jerseyCost: this.jerseyCost,
        players: this.players
      };
      localStorage.setItem(this._storageKey, JSON.stringify(data));
    } catch(e) { /* ignore */ }
  }

  _loadFromURL() {
    if (this._fromURLOnce) return;
    const sp = new URLSearchParams(window.location.search);
    const getN = (k, d) => {
      const n = Number(sp.get(k));
      return Number.isFinite(n) ? n : d;
    };
    const getS = (k, d) => {
      const v = sp.get(k);
      return v !== null ? v : d;
    };
    if (sp.toString().length > 0) {
      this.teamName   = getS('team',   this.teamName);
      this.logo       = getS('logo',   this.logo);
      this.iceCost    = getN('ice',    this.iceCost);
      this.hours      = getN('hrs',    this.hours);
      this.feePct     = getN('pct',    this.feePct);
      this.feeFixed   = getN('fix',    this.feeFixed);
      this.coachCost  = getN('coach',  this.coachCost);
      this.jerseyCost = getN('jersey', this.jerseyCost);
      this.players    = Math.max(1, getN('players', this.players));
      this._recalc();
    }
    this._fromURLOnce = true;
  }

  _writeToURL() {
    const sp = new URLSearchParams();
    sp.set('team', this.teamName);
    if (this.logo) sp.set('logo', this.logo);
    sp.set('ice',    String(this.iceCost));
    sp.set('hrs',    String(this.hours));
    sp.set('pct',    String(this.feePct));
    sp.set('fix',    String(this.feeFixed));
    sp.set('coach',  String(this.coachCost));
    sp.set('jersey', String(this.jerseyCost));
    sp.set('players',String(this.players));
    const url = `${location.pathname}?${sp.toString()}`;
    window.history.replaceState({}, '', url);
  }

  // ---------- Math & Events ----------

  _recalc() {
    const base = (this.iceCost * this.hours) + this.coachCost + this.jerseyCost;
    const withFees = base * (1 + this.feePct) + this.feeFixed;
    const per = withFees / Math.max(1, this.players);
    this.totalBase = Number(base.toFixed(2));
    this.totalWithFees = Number(withFees.toFixed(2));
    this.perPlayer = Number(per.toFixed(2));
  }

  _onChange(field, e) {
    const v = e.detail?.value ?? 0;
    const n = Number(v);
    this[field] = Number.isFinite(n) ? n : 0;
  }

  _copyURL() {
    navigator.clipboard?.writeText(window.location.href);
  }

  // ---------- Styles & Template ----------

  static get styles() {
    return css`
      :host {
        display: block;
        --pad: 16px;
        --card-bg: #ffffff;
        --card-fg: #0b1c5b;
        --muted: #475569;
        --accent: var(--ddd-theme-default-wonderPurple, #5632e6);
        --ring: #cbd5e1;
      }
      @media (prefers-color-scheme: dark) {
        :host {
          --card-bg: #0b1220;
          --card-fg: #dbeafe;
          --muted: #93a3b8;
          --ring: #263449;
        }
      }
      .planner {
        background: var(--card-bg);
        color: var(--card-fg);
        border: 1px solid var(--ring);
        border-radius: 16px;
        padding: calc(var(--pad) * 1.5);
        display: grid;
        gap: 16px;
      }
      header {
        display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
      }
      header h2 {
        margin: 0; font: 800 1.4rem/1.2 system-ui, Arial, sans-serif; color: var(--accent);
      }
      header input[type="text"] {
        flex: 1; min-width: 240px; max-width: 420px;
        padding: 8px 12px; border-radius: 10px; border: 1px solid var(--ring);
        color: var(--card-fg); background: transparent;
      }
      .grid {
        display: grid; gap: 16px;
        grid-template-columns: repeat(2, minmax(220px, 1fr));
      }
      @media (max-width: 720px) {
        .grid { grid-template-columns: 1fr; }
      }
      .totals {
        display: grid; gap: 8px; border-top: 1px dashed var(--ring); padding-top: 12px;
      }
      .row { display: flex; justify-content: space-between; }
      .label { color: var(--muted); }
      .value { font-weight: 700; }
      .share { margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; }
      .btn {
        background: var(--accent); color: #fff; border: none; border-radius: 10px;
        padding: 10px 14px; cursor: pointer;
      }
      img.logo {
        height: 40px; width: 40px; object-fit: cover; border-radius: 50%;
        border: 1px solid var(--ring);
      }
    `;
  }

  render() {
    return html`
      <div class="planner">
        <header>
          ${this.logo ? html`<img class="logo" src="${this.logo}" alt="logo" />` : html``}
          <h2>Ice Planner</h2>
          <input type="text" placeholder="Team name"
            .value=${this.teamName}
            @input=${e => this.teamName = e.target.value} />
          <input type="text" placeholder="Logo URL (optional)"
            .value=${this.logo}
            @input=${e => this.logo = e.target.value} />
        </header>

        <div class="grid">
          <app-number-input label="Ice cost ($/hour)" .value=${this.iceCost} .min=${0} .step=${1} suffix="$"
            @value-changed=${e => this._onChange('iceCost', e)}></app-number-input>

          <app-number-input label="Hours" .value=${this.hours} .min=${0} .step=${1}
            @value-changed=${e => this._onChange('hours', e)}></app-number-input>

          <app-number-input label="Coaches ($)" .value=${this.coachCost} .min=${0} .step=${1} suffix="$"
            @value-changed=${e => this._onChange('coachCost', e)}></app-number-input>

          <app-number-input label="Jerseys ($)" .value=${this.jerseyCost} .min=${0} .step=${1} suffix="$"
            @value-changed=${e => this._onChange('jerseyCost', e)}></app-number-input>

          <app-number-input label="Fee percent (0.02 = 2%)" .value=${this.feePct} .min=${0} .step=${0.005}
            @value-changed=${e => this._onChange('feePct', e)}></app-number-input>

          <app-number-input label="Fee fixed ($)" .value=${this.feeFixed} .min=${0} .step=${0.5} suffix="$"
            @value-changed=${e => this._onChange('feeFixed', e)}></app-number-input>

          <app-number-input label="Players" .value=${this.players} .min=${1} .step=${1}
            @value-changed=${e => this._onChange('players', e)}></app-number-input>
        </div>

        <div class="totals">
          <div class="row"><span class="label">Base total</span><span class="value">$${this.totalBase}</span></div>
          <div class="row"><span class="label">With fees</span><span class="value">$${this.totalWithFees}</span></div>
          <div class="row"><span class="label">Per player</span><span class="value">$${this.perPlayer}</span></div>
          <div class="share">
            <button class="btn" @click=${this._copyURL}>Copy sharable URL</button>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('ice-planner', IcePlanner);

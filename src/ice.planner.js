import { LitElement, html, css } from 'lit';
import './app-number-input.js';

export class IcePlanner extends LitElement {
  static get properties() {
    return {
      teamName:{type:String}, logo:{type:String},
      iceCost:{type:Number}, hours:{type:Number},
      feePct:{type:Number}, feeFixed:{type:Number},
      coachCost:{type:Number}, jerseyCost:{type:Number},
      players:{type:Number},
      totalBase:{type:Number}, totalWithFees:{type:Number}, perPlayer:{type:Number},
    };
  }

  constructor(){
    super();
    this.teamName='Penn State Champs'; this.logo='';
    this.iceCost=300; this.hours=50; this.feePct=0.02; this.feeFixed=0.99;
    this.coachCost=3000; this.jerseyCost=88; this.players=1;
    this._storageKey='ice-planner-v1'; this._fromURLOnce=false;
    this._recalc();
  }

  firstUpdated(){ this._loadFromURL(); this._loadFromStorage(); }
  updated(changed){
    const watched=['iceCost','hours','feePct','feeFixed','coachCost','jerseyCost','players'];
    if(watched.some(k=>changed.has(k))){ this._recalc(); this._saveToStorage(); this._writeToURL(); }
  }

  // state IO
  _loadFromStorage(){ try{ const raw=localStorage.getItem(this._storageKey); if(raw){ Object.assign(this, JSON.parse(raw)); this._recalc(); } }catch(e){} }
  _saveToStorage(){ try{
    const data={ teamName:this.teamName, logo:this.logo, iceCost:this.iceCost, hours:this.hours,
      feePct:this.feePct, feeFixed:this.feeFixed, coachCost:this.coachCost, jerseyCost:this.jerseyCost, players:this.players };
    localStorage.setItem(this._storageKey, JSON.stringify(data));
  }catch(e){} }

  _loadFromURL(){
    if(this._fromURLOnce) return;
    const sp=new URLSearchParams(window.location.search);
    const N=(k,d)=>{ const n=Number(sp.get(k)); return Number.isFinite(n)?n:d; };
    const S=(k,d)=>{ const v=sp.get(k); return v!==null?v:d; };
    if(sp.toString().length>0){
      this.teamName=S('team',this.teamName); this.logo=S('logo',this.logo);
      this.iceCost=N('ice',this.iceCost); this.hours=N('hrs',this.hours);
      this.feePct=N('pct',this.feePct); this.feeFixed=N('fix',this.feeFixed);
      this.coachCost=N('coach',this.coachCost); this.jerseyCost=N('jersey',this.jerseyCost);
      this.players=Math.max(1,N('players',this.players)); this._recalc();
    }
    this._fromURLOnce=true;
  }

  _writeToURL(){
    const sp=new URLSearchParams();
    sp.set('team',this.teamName); if(this.logo) sp.set('logo',this.logo);
    sp.set('ice',String(this.iceCost)); sp.set('hrs',String(this.hours));
    sp.set('pct',String(this.feePct)); sp.set('fix',String(this.feeFixed));
    sp.set('coach',String(this.coachCost)); sp.set('jersey',String(this.jerseyCost));
    sp.set('players',String(this.players));
    window.history.replaceState({},'',`${location.pathname}?${sp.toString()}`);
  }

  // math
  _recalc(){
    const base=(this.iceCost*this.hours)+this.coachCost+this.jerseyCost;
    const withFees=base*(1+this.feePct)+this.feeFixed;
    const per=withFees/Math.max(1,this.players);
    this.totalBase=Number(base.toFixed(2));
    this.totalWithFees=Number(withFees.toFixed(2));
    this.perPlayer=Number(per.toFixed(2));
  }

  _onChange(field,e){ const n=Number(e.detail?.value ?? 0); this[field]=Number.isFinite(n)?n:0; }
  _copyURL(){ navigator.clipboard?.writeText(window.location.href); }

  static get styles(){
    return css`
      :host{
        display:block;
        --card:#0e1529; --fg:#dbeafe; --muted:#93a3b8; --ring:#263449;
        --accent: var(--ddd-theme-default-wonderPurple,#7c5dff);
      }
      @media (prefers-color-scheme: light){
        :host{ --card:#ffffff; --fg:#0b1c5b; --muted:#475569; --ring:#cbd5e1; }
      }
      .planner{
        background:var(--card); color:var(--fg);
        border:1px solid var(--ring); border-radius:16px;
        padding:18px; display:grid; gap:14px; box-shadow: 0 10px 30px #0007;
      }
      .top{
        display:grid; gap:10px;
        grid-template-columns: minmax(220px,1fr) minmax(200px,1fr);
        align-items:center;
      }
      .title{
        display:flex; align-items:center; gap:10px;
      }
      h2{ margin:0; font:800 1.2rem/1.1 system-ui,Arial,sans-serif; color:var(--accent); }
      .row{ display:flex; gap:10px; }
      .pill{
        flex:1; min-width:140px; display:flex; gap:8px; align-items:center;
        background: rgba(96,165,250,.07);
        border:1px solid var(--ring); border-radius:999px; padding:8px 12px;
      }
      .pill input{
        flex:1; border:none; outline:none; background:transparent; color:var(--fg);
      }
      img.logo{ height:42px; width:42px; border-radius:50%; object-fit:cover; border:1px solid var(--ring); }
      .grid{ display:grid; gap:14px; grid-template-columns: repeat(2, minmax(220px, 1fr)); }
      @media (max-width:720px){ .grid{ grid-template-columns:1fr; } .top{ grid-template-columns:1fr; } }
      .totals{ display:grid; gap:8px; border-top:1px dashed var(--ring); padding-top:12px; }
      .pair{ display:flex; justify-content:space-between; }
      .muted{ color:var(--muted); }
      .strong{ font-weight:800; }
      .cta{ margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; }
      button.btn{
        background: linear-gradient(90deg,#60a5fa,#a78bfa);
        color:#fff; border:none; border-radius:12px; padding:10px 14px; cursor:pointer;
      }
    `;
  }

  render(){
    return html`
      <div class="planner">
        <div class="top">
          <div class="title">
            ${this.logo ? html`<img class="logo" src="${this.logo}" alt="logo">` : html``}
            <h2>Ice Planner</h2>
          </div>
          <div class="row">
            <div class="pill">
              <span class="muted">Team</span>
              <input type="text" .value=${this.teamName} @input=${e=>this.teamName=e.target.value} />
            </div>
            <div class="pill">
              <span class="muted">Logo URL</span>
              <input type="text" .value=${this.logo} @input=${e=>this.logo=e.target.value} />
            </div>
          </div>
        </div>

        <div class="grid">
          <app-number-input label="Ice cost ($/hour)" .value=${this.iceCost} .min=${0} .step=${1} suffix="$"
            @value-changed=${e=>this._onChange('iceCost',e)}></app-number-input>
          <app-number-input label="Hours" .value=${this.hours} .min=${0} .step=${1}
            @value-changed=${e=>this._onChange('hours',e)}></app-number-input>
          <app-number-input label="Coaches ($)" .value=${this.coachCost} .min=${0} .step=${1} suffix="$"
            @value-changed=${e=>this._onChange('coachCost',e)}></app-number-input>
          <app-number-input label="Jerseys ($)" .value=${this.jerseyCost} .min=${0} .step=${1} suffix="$"
            @value-changed=${e=>this._onChange('jerseyCost',e)}></app-number-input>
          <app-number-input label="Fee percent (0.02 = 2%)" .value=${this.feePct} .min=${0} .step=${0.005}
            @value-changed=${e=>this._onChange('feePct',e)}></app-number-input>
          <app-number-input label="Fee fixed ($)" .value=${this.feeFixed} .min=${0} .step=${0.5} suffix="$"
            @value-changed=${e=>this._onChange('feeFixed',e)}></app-number-input>
          <app-number-input label="Players" .value=${this.players} .min=${1} .step=${1}
            @value-changed=${e=>this._onChange('players',e)}></app-number-input>
        </div>

        <div class="totals">
          <div class="pair"><span class="muted">Base total</span><span class="strong">$${this.totalBase}</span></div>
          <div class="pair"><span class="muted">With fees</span><span class="strong">$${this.totalWithFees}</span></div>
          <div class="pair"><span class="muted">Per player</span><span class="strong">$${this.perPlayer}</span></div>
          <div class="cta">
            <button class="btn" @click=${this._copyURL}>Copy sharable URL</button>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('ice-planner', IcePlanner);

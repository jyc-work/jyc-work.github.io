/* JYC visual simulation: decorative client-side behavior, no live infrastructure metrics. */
type TerminalEvent = { kind: string; detail: string; state: string };
const chineseEvents: TerminalEvent[] = [
  {kind:'启动', detail:'初始化演示流程', state:'模拟'},
  {kind:'索引', detail:'读取文章与学习路线', state:'完成'},
  {kind:'工具', detail:'加载工具列表', state:'完成'},
  {kind:'事件', detail:'记录模拟执行步骤', state:'模拟'},
  {kind:'Agent', detail:'准备工具调用流程', state:'模拟'},
  {kind:'待命', detail:'等待页面操作', state:'就绪'}
];
const root = document.documentElement;
const isEnglish = root.lang === 'en';
const englishEvents: TerminalEvent[] = [
  {kind:'Start', detail:'Initialize example workflow', state:'Demo'},
  {kind:'Index', detail:'Read articles and projects', state:'Done'},
  {kind:'Tools', detail:'Load tool list', state:'Done'},
  {kind:'Events', detail:'Record simulated steps', state:'Demo'},
  {kind:'Review', detail:'Check source evidence', state:'Done'},
  {kind:'Ready', detail:'Await interaction', state:'Ready'}
];
const events = isEnglish ? englishEvents : chineseEvents;
const fxButton = document.querySelector<HTMLButtonElement>('.fx-switch');
const terminal = document.querySelector<HTMLElement>('#cyber-runtime-lines');
const heroVisual = document.querySelector<HTMLElement>('.hero-visual');
const clock = document.querySelector<HTMLTimeElement>('#hud-local-clock');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const safeGet = () => { try { return window.localStorage.getItem('jyc-visual-fx'); } catch { return null; } };
const safeSet = (value: string) => { try { window.localStorage.setItem('jyc-visual-fx',value); } catch { /* private browsing */ } };
let fxEnabled = false;
let eventIndex = 0;
let ticker: number | undefined;
let pointerFrame = 0;

function drawTerminal() {
  if (!terminal) return;
  const rows = events.map((entry,i) => {
    const line = document.createElement('div');
    const num = document.createElement('span');
    num.className='line-number';
    num.textContent=String(i+1).padStart(2,'0');
    const kind = document.createElement('span');
    kind.className=entry.state==='OK'?'syntax-light':'syntax-blue';
    kind.textContent=entry.kind.padEnd(7,' ');
    const detail = document.createElement('span');
    detail.textContent=' '+entry.detail;
    const state = document.createElement('span');
    state.className='syntax-yellow';
    state.textContent=' ['+entry.state+']';
    line.append(num,kind,detail,state);
    if(i>eventIndex) line.style.opacity='.24';
    if(i===eventIndex) line.classList.add('terminal-active-line');
    return line;
  });
  terminal.replaceChildren(...rows);
}
function animateTerminal() {
  if (!terminal) return;
  window.clearInterval(ticker);
  ticker=undefined;
  if (!fxEnabled) { eventIndex=events.length-1; drawTerminal();return; }
  eventIndex=0;
  drawTerminal();
  ticker=window.setInterval(()=>{
    if(document.hidden) return;
    eventIndex=(eventIndex+1)%events.length;
    drawTerminal();
  },1800);
}
function setFX(enabled:boolean, persist=false) {
  fxEnabled=enabled && !reducedMotion.matches;
  root.classList.toggle('fx-off',!fxEnabled);
  if(fxButton) {
    fxButton.setAttribute('aria-pressed',String(fxEnabled));
    fxButton.textContent=isEnglish ? `Effects: ${fxEnabled?'on':'off'}` : '动效：'+(fxEnabled?'开':'关');
    fxButton.title=isEnglish ? (fxEnabled?'Turn visual effects off':'Turn visual effects on') : (fxEnabled?'关闭视觉特效':'开启视觉特效');
  }
  if(persist) safeSet(enabled?'on':'off');
  if(!fxEnabled && heroVisual){
    heroVisual.style.setProperty('--fx-x','0px');
    heroVisual.style.setProperty('--fx-y','0px');
  }
  animateTerminal();
}
function renderClock() {
  if (!clock || document.hidden) return;
  const now=new Date();
  clock.dateTime=now.toISOString();
  clock.textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
}
fxButton?.addEventListener('click',()=>setFX(!fxEnabled,true));
reducedMotion.addEventListener('change',()=>setFX(safeGet()!=='off'));
setFX(safeGet()!=='off');
renderClock();
window.setInterval(renderClock,30_000);
heroVisual?.addEventListener('pointermove',(event:PointerEvent)=>{
  if(!fxEnabled || !window.matchMedia('(pointer:fine)').matches) return;
  if(pointerFrame) return;
  const area=heroVisual.getBoundingClientRect();
  const x=Math.max(-26,Math.min(26,(event.clientX-(area.left+area.width/2))/12));
  const y=Math.max(-26,Math.min(26,(event.clientY-(area.top+area.height/2))/12));
  pointerFrame=requestAnimationFrame(()=>{
    heroVisual.style.setProperty('--fx-x',x.toFixed(1)+'px');
    heroVisual.style.setProperty('--fx-y',y.toFixed(1)+'px');
    pointerFrame=0;
  });
},{passive:true});
heroVisual?.addEventListener('pointerleave',()=>{
  heroVisual.style.setProperty('--fx-x','0px');
  heroVisual.style.setProperty('--fx-y','0px');
});
document.addEventListener('visibilitychange',renderClock);

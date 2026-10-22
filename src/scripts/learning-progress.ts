/**
 * Per-browser, opt-in learning stage self-assessment.
 * No analytics, login, server writes or proof of completed external tests.
 */
const STORE_KEY = 'jyc.learning.progress.v1';
type SavedProgress = Record<string, number[]>;
const validSlug = /^[a-z0-9-]{1,64}$/;

function normalize(input: unknown): SavedProgress {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const output: SavedProgress = {};
  for (const [slug, steps] of Object.entries(input)) {
    if (!validSlug.test(slug) || !Array.isArray(steps)) continue;
    const values = [...new Set(steps.filter((step): step is number =>
      Number.isInteger(step) && step >= 0 && step <= 3))];
    output[slug] = values.sort((a,b) => a-b);
  }
  return output;
}
function load(): SavedProgress {
  try { return normalize(JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}')); }
  catch { return {}; }
}
function save(state: SavedProgress): boolean {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}
const cards = [...document.querySelectorAll<HTMLElement>('[data-progress-slug]')];
const stageChecks = [...document.querySelectorAll<HTMLInputElement>('[data-stage-check]')];
if (cards.length || stageChecks.length) {
  let state = load();
  const localStatus = document.querySelector<HTMLElement>('#learning-storage-status');
  const total = document.querySelector<HTMLElement>('#learning-progress-total');
  const totalBar = document.querySelector<HTMLProgressElement>('#learning-total-bar');
  function refresh() {
    let completed = 0;
    let possible = 0;
    cards.forEach(card => {
      const slug = card.dataset.progressSlug ?? '';
      const count = Math.min(4,Math.max(0,Number(card.dataset.progressTotal) || 4));
      const done = (state[slug] ?? []).filter(v=>v<count).length;
      possible += count;
      completed += done;
      const label = card.querySelector<HTMLElement>('[data-progress-label]');
      const bar = card.querySelector<HTMLProgressElement>('progress');
      if(label) label.textContent=`${done} / ${count} 阶段`;
      if(bar) {bar.max=count;bar.value=done;}
    });
    stageChecks.forEach(check => {
      const slug = check.dataset.progressSlug ?? '';
      const index = Number(check.dataset.stageCheck);
      check.checked = (state[slug] ?? []).includes(index);
      const stage = check.closest<HTMLElement>('.stage-card');
      if(stage) stage.classList.toggle('stage-completed',check.checked);
    });
    if(total) total.textContent=`${completed} / ${possible}`;
    if(totalBar) { totalBar.max=possible || 1; totalBar.value=completed; }
  }
  stageChecks.forEach(check=>{
    check.addEventListener('change',()=>{
      const slug = check.dataset.progressSlug ?? '';
      const index = Number(check.dataset.stageCheck);
      if(!validSlug.test(slug) || !Number.isInteger(index) || index<0 || index>3)return;
      const steps = new Set(state[slug]??[]);
      if(check.checked) steps.add(index); else steps.delete(index);
      state={...state,[slug]:[...steps].sort((a,b)=>a-b)};
      if(!save(state) && localStatus) localStatus.textContent='当前浏览器无法保存进度；刷新后可能丢失。';
      refresh();
    });
  });
  const exportButton=document.querySelector<HTMLButtonElement>('#learning-export');
  exportButton?.addEventListener('click',()=>{
    const json=JSON.stringify({version:1,exported_at:new Date().toISOString(),progress:state},null,2);
    const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
    const link=document.createElement('a');
    link.href=url;link.download='jyc-learning-progress.json';
    document.body.append(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    if(localStatus) localStatus.textContent='进度备份已生成；保存在你自己的设备上。';
  });
  const importInput=document.querySelector<HTMLInputElement>('#learning-import');
  importInput?.addEventListener('change',async ()=>{
    const file=importInput.files?.[0];
    if(!file)return;
    try{
      if(file.size>60_000)throw new Error('文件过大');
      const json:unknown=JSON.parse(await file.text());
      if(!json || typeof json!=='object' || Array.isArray(json) || !('version' in json) || json.version!==1 || !('progress' in json)) throw new Error('备份版本不匹配');
      const imported=normalize(json.progress);
      const allowed=new Set(cards.map(x=>x.dataset.progressSlug));
      const accepted:SavedProgress={};
      for(const slug of allowed) if(slug && validSlug.test(slug))accepted[slug]=imported[slug]??[];
      if(!save(accepted))throw new Error('浏览器禁止本地保存');
      state=accepted;
      refresh();
      if(localStatus)localStatus.textContent='本地学习进度已从备份导入。';
    }catch(e){
      if(localStatus)localStatus.textContent='导入失败：'+(e instanceof Error?e.message:'无法读取文件');
    }finally{importInput.value='';}
  });
  refresh();
  try{
    const k='jyc.learning.storage-test';
    localStorage.setItem(k,'1');localStorage.removeItem(k);
  }catch{if(localStatus)localStatus.textContent='当前浏览器禁止持久存储，进度可能不会在刷新后保留。';}
}

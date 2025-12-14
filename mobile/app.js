
// mobile app.js - rebuilt to be robust, file:// friendly
(function(){
  const TRANSLATORS = [
    { key: 'mazhonggang', name: '马仲刚' },
    { key: 'majinpeng', name: '马金鹏' },
    { key: 'tongdaozhang', name: '仝道章' },
    { key: 'wangjingzhai', name: '王静斋' },
    { key: 'majian', name: '马坚' },
  ];

  const $ = (sel)=> document.querySelector(sel);
  const $$ = (sel)=> Array.from(document.querySelectorAll(sel));

  const STATE = {
    selected: new Set(TRANSLATORS.map(t=>t.key)),
    sura: window.SURA_NAMES || {},
    q: '',
  };

  function byId(id){ return document.getElementById(id); }

  function buildSuraList(){
    const wrap = byId('sura-list');
    wrap.innerHTML = '';
    for(let i=1;i<=114;i++){
      const item = document.createElement('div'); item.className='sura-item'; item.dataset.sura = String(i);
      item.innerHTML = `<div class="num">${i}</div><div class="name">${STATE.sura[String(i)]||''}</div>`;
      item.addEventListener('click', ()=>{
        closeDrawer();
        renderSura(i);
      });
      wrap.appendChild(item);
    }
  }

  function openDrawer(){ document.getElementById('drawer').classList.add('open') }
  function closeDrawer(){ document.getElementById('drawer').classList.remove('open') }

  function getSelectedTranslators(){
    const checks = Array.from(document.querySelectorAll('.filters input[type=checkbox]'));
    return checks.filter(c=>c.checked).map(c=>c.dataset.key);
  }

  function search(){
    const q = (byId('q').value || '').trim();
    STATE.q = q;
    const tokens = q.split(/\s+/).filter(Boolean).map(s=>s.toLowerCase());
    const selected = getSelectedTranslators();
    const resultsWrap = byId('results');
    const nores = byId('noresults');
    resultsWrap.innerHTML = '';
    nores.hidden = true;

    if(!tokens.length){
      // if no query, show active sura if any
      if(STATE.activeSura) return renderSura(STATE.activeSura);
      resultsWrap.innerHTML = '<div class="loading">请输入关键词开始搜索</div>';
      return;
    }

    byId('loading').hidden = false;
    setTimeout(()=>{ // simulate async, keep UI responsive for large data
      const matches = {}; // key sura -> {aya -> {translator: text}}
      // iterate translators
      for(const tkey of selected){
        const arr = (window.QDATA && window.QDATA[tkey]) || [];
        for(const rec of arr){
          const text = (rec.text || '').toLowerCase();
          // require all tokens in text (AND logic)
          const ok = tokens.every(tok => text.includes(tok));
          if(ok){
            matches[rec.sura] = matches[rec.sura] || {};
            matches[rec.sura][rec.aya] = matches[rec.sura][rec.aya] || {};
            matches[rec.sura][rec.aya][tkey] = rec.text;
          }
        }
      }

      byId('loading').hidden = true;
      const suraKeys = Object.keys(matches).sort((a,b)=>Number(a)-Number(b));
      if(!suraKeys.length){
        nores.hidden = false;
        return;
      }
      // render matches
      for(const s of suraKeys){
        const ayaNums = Object.keys(matches[s]).sort((a,b)=>Number(a)-Number(b));
        for(const aya of ayaNums){
          const row = document.createElement('div'); row.className='aya-row';
          const meta = document.createElement('div'); meta.className='meta';
          meta.innerHTML = `<div>第${s}章 第${aya}节</div><div>${STATE.sura[String(s)]||''}</div>`;
          row.appendChild(meta);
          const transWrap = document.createElement('div'); transWrap.className='translations';
          for(const tkey of selected){
            const txt = matches[s][aya][tkey];
            if(!txt) continue;
            const card = document.createElement('div'); card.className='card';
            const translatorName = TRANSLATORS.find(x=>x.key===tkey).name || tkey;
            const highlighted = highlightText(txt, STATE.q);
            card.innerHTML = `<div class="translator">${translatorName}</div><div class="text">${highlighted}</div>`;
            transWrap.appendChild(card);
          }
          row.appendChild(transWrap);
          resultsWrap.appendChild(row);
        }
      }
      window.scrollTo({top:0,behavior:'smooth'});
    }, 10);
  }

  function highlightText(text, query){
    if(!query) return escapeHtml(text);
    const tokens = query.split(/\s+/).filter(Boolean);
    let out = escapeHtml(text);
    for(const tok of tokens){
      const re = new RegExp(escapeRegExp(tok),'gi');
      out = out.replace(re, m => `<mark class="hl">${m}</mark>`);
    }
    return out;
  }

  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

  function renderSura(n){
    STATE.activeSura = Number(n);
    const resultsWrap = byId('results'); resultsWrap.innerHTML = '';
    byId('noresults').hidden = true;
    byId('loading').hidden = false;
    const selected = getSelectedTranslators();
    setTimeout(()=>{
      const nums = [];
      // gather aya numbers from selected translators for this sura
      for(const t of selected){
        const arr = (window.QDATA && window.QDATA[t]) || [];
        for(const rec of arr){
          if(rec.sura === Number(n)){
            nums.push(rec.aya);
          }
        }
      }
      const uniqAyas = Array.from(new Set(nums)).sort((a,b)=>a-b);
      if(!uniqAyas.length){
        byId('loading').hidden = true;
        byId('noresults').hidden = false;
        return;
      }
      for(const aya of uniqAyas){
        const row = document.createElement('div'); row.className='aya-row';
        const meta = document.createElement('div'); meta.className='meta';
        meta.innerHTML = `<div>第${n}章 第${aya}节</div><div>${STATE.sura[String(n)]||''}</div>`;
        row.appendChild(meta);
        const transWrap = document.createElement('div'); transWrap.className='translations';
        for(const tkey of selected){
          const arr = (window.QDATA && window.QDATA[tkey]) || [];
          const rec = arr.find(r=>r.sura===Number(n)&&r.aya===Number(aya));
          if(!rec) continue;
          const card = document.createElement('div'); card.className='card';
          const translatorName = TRANSLATORS.find(x=>x.key===tkey).name || tkey;
          card.innerHTML = `<div class="translator">${translatorName}</div><div class="text">${escapeHtml(rec.text)}</div>`;
          transWrap.appendChild(card);
        }
        row.appendChild(transWrap);
        resultsWrap.appendChild(row);
      }
      byId('loading').hidden = true;
      window.scrollTo({top:0,behavior:'smooth'});
    },10);
  }

  function bindUI(){
    byId('btn-drawer').addEventListener('click', openDrawer);
    byId('btn-close').addEventListener('click', closeDrawer);
    byId('go').addEventListener('click', search);
    byId('q').addEventListener('keydown', (e)=>{ if(e.key==='Enter') search(); });

    // checkboxes change
    Array.from(document.querySelectorAll('.filters input[type=checkbox]')).forEach(cb=>{
      cb.addEventListener('change', ()=>{
        // if active sura, re-render it to reflect filters
        if(STATE.activeSura) renderSura(STATE.activeSura);
      });
    });
  }

  // init
  function init(){
    // ensure QDATA exists
    window.QDATA = window.QDATA || {};
    // build UI
    buildSuraList();
    bindUI();
    // open drawer first time
    setTimeout(()=>{ openDrawer(); },150);
  }

  // expose for debug
  window.QMOBILE = { search, renderSura, state: STATE };

  init();

})();

'use strict';
/* ============================================================
   SUIKAVERSE — global leaderboard
   Free, no-login cloud storage via MantleDB (keyless JSON store).
   Shows player level, prestige (seeds/asc), skin avatar and a
   live 💎 balance that updates in real time when you buy things.
   Made by Dave-VR
   ============================================================ */

const Leaderboard = (()=>{
  const URL='https://mantledb.sh/v2/suikaver/leaderboard';

  let scores=[];
  let myId='';
  let initDone=false;
  let lastSubmit=0;

  function getMyId(){
    if(!myId){
      myId=G.save.playerId||('p'+Math.random().toString(36).slice(2,10));
      G.save.playerId=myId;
    }
    return myId;
  }

  function setStatus(t){
    const el=document.getElementById('lbStatus');
    if(el) el.textContent=t;
  }

  function mySkinEmoji(){
    const id=G.save.skin||'classic';
    return {classic:'🍉',golden:'🥇',crystal:'💎',lava:'🌋',galaxy:'🌌',void:'⚫',mint:'🍃',royal:'👑',asc:'⭐',starbound:'✨',cosmic:'🕳️'}[id]||'🍉';
  }

  function myEntry(){
    return {
      id:getMyId(),
      name:(G.save.name||'Player').slice(0,16),
      melons:Math.floor(G.save.lifetimeEarned||0),
      seeds:G.save.totalSeeds||0,
      asc:G.save.ascensions||0,
      level:G.save.level||1,
      crystals:Math.floor(G.save.crystals||0),
      skin:mySkinEmoji(),
      upd:Date.now()
    };
  }

  async function fetchBoard(){
    try{
      const r=await fetch(URL,{cache:'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const data=await r.json();
      scores=(data&&Array.isArray(data.scores))?data.scores:[];
      setStatus(scores.length?('🌐 Synced · '+scores.length+' melon farmers'):'🌐 Be the first on the board!');
      render();
    }catch(e){
      setStatus('📴 Offline — board paused (MantleDB unreachable)');
      if(!scores.length) render();
    }
  }

  function submit(force){
    if(!initDone||!G.save.name) return;
    const now=Date.now();
    if(!force&&now-lastSubmit<15000) return;
    lastSubmit=now;
    const entry=myEntry();
    const arr=scores.filter(s=>s.id!==entry.id);
    arr.push(entry);
    arr.sort((a,b)=>b.melons-a.melons);
    scores=arr.slice(0,250);
    fetch(URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({scores:scores,updated:now})
    }).catch(()=>{});
    render();
  }

  let lastSubmitValue=0;
  function throttledSubmit(){
    if(!initDone) return;
    const v=G.save.lifetimeEarned||0;
    const c=G.save.crystals||0;
    if(v>lastSubmitValue*1.001+5||v<lastSubmitValue*0.5||Math.abs(c-lastSubmitCrystals)>2){
      lastSubmitValue=v;
      lastSubmitCrystals=c;
      submit(false);
    }
  }

  let lastSubmitCrystals=0;

  function bump(){
    lastSubmitValue=G.save.lifetimeEarned||0;
    lastSubmitCrystals=G.save.crystals||0;
    submit(true);
  }

  function onNameChange(){ lastSubmitValue=-1; submit(true); }

  async function removeMe(){
    try{
      const id=G.save.playerId||myId;
      const r=await fetch(URL,{cache:'no-store'});
      if(!r.ok) return;
      const data=await r.json();
      const arr=(data&&Array.isArray(data.scores))?data.scores:[];
      const filtered=arr.filter(s=>s.id!==id);
      if(filtered.length<arr.length){
        await fetch(URL,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({scores:filtered,updated:Date.now()})
        });
        scores=filtered;
      }
    }catch(e){}
  }

  function render(){
    const list=document.getElementById('lbList');
    if(!list) return;
    if(!scores.length){
      list.innerHTML='<div class="lb-empty">No melons harvested yet — be the first! 🌱</div>';
      return;
    }
    const me=myEntry();
    let myRank=-1;
    const medals=['🥇','🥈','🥉'];
    let html='';
    scores.slice(0,100).forEach((s,i)=>{
      if(s.id===me.id) myRank=i+1;
      const extra=(s.asc>0?('⭐ '+s.asc+' · 🌱 '+fmt(s.seeds||0)):'🌱 '+fmt(s.seeds||0));
      const live=s.id===me.id?(' · '+fmt(Math.floor(G.save.melons||0))+' 🍈 now'):'';
      html+='<div class="lb-row'+(s.id===me.id?' me':'')+'">'+
        '<span class="lb-pos">'+(i<3?medals[i]:'#'+(i+1))+'</span>'+
        '<span class="lb-name"><span>'+(s.skin||'🍉')+'</span>'+escapeHtml(s.name||'?')+'<span class="lv-badge">Lv'+(s.level||1)+'</span></span>'+
        '<span class="lb-extra">'+extra+'</span>'+
        '<span class="lb-score">'+fmt(s.melons)+'</span>'+
        '<span class="lb-crys">💎 '+fmt(s.crystals||0)+live+'</span></div>';
    });
    list.innerHTML=html;
    if(myRank<0) myRank=scores.findIndex(s=>s.id===me.id)+1;
    if(myRank<=0) myRank=scores.length+1;
    G.myRank=myRank;
    setStatus('You are #'+myRank+' of '+scores.length+' · refresh every 20s ⟳');
  }

  function refresh(){ fetchBoard(); }

  function init(){
    getMyId();
    initDone=true;
    fetchBoard();
    setInterval(()=>{ if(typeof G!=='undefined'&&G.save) submit(false); },20000);
  }

  return {init,refresh,submit,bump,throttledSubmit,onNameChange,render,removeMe};
})();

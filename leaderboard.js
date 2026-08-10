'use strict';
/* ============================================================
   MELOVERSE — global leaderboard
   Free, no-login cloud storage via MantleDB (keyless JSON store).
   All players share one namespace so the board is truly global.
   Made by Dave-VR
   ============================================================ */

const Leaderboard = (()=>{
  const NS  = 'meloverse';
  const PATH= 'leaderboard';
  const URL = 'https://mantledb.sh/v2/'+NS+'/'+PATH;

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

  function myEntry(){
    return {
      id:getMyId(),
      name:(G.save.name||'Player').slice(0,16),
      melons:Math.floor(G.save.lifetimeEarned||0),
      seeds:G.save.totalSeeds||0,
      asc:G.save.ascensions||0,
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
      setStatus('📴 Offline mode — board paused (MantleDB unreachable)');
      if(!scores.length) render();
    }
  }

  function submit(){
    if(!initDone||!G.save.name) return;
    const now=Date.now();
    if(now-lastSubmit<15000) return;
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

  function throttledSubmit(){
    if(!initDone) return;
    const v=G.save.lifetimeEarned||0;
    if(v>lastSubmitValue*1.001+5||v<lastSubmitValue*0.5){
      lastSubmitValue=v;
      submit();
    }
  }
  let lastSubmitValue=0;

  function onNameChange(){
    lastSubmitValue=-1;
    submit();
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
      const extra=s.asc>0?('⭐ '+fmt(s.asc)+' asc'):'🍈 '+fmt(s.melons);
      html+='<div class="lb-row'+(s.id===me.id?' me':'')+'">'+
        '<span class="lb-pos">'+(i<3?medals[i]:'#'+(i+1))+'</span>'+
        '<span class="lb-name">'+escapeHtml(s.name||'?')+'</span>'+
        '<span class="lb-extra">'+extra+'</span>'+
        '<span class="lb-score">'+fmt(s.melons)+'</span></div>';
    });
    list.innerHTML=html;
    if(myRank<0) myRank=scores.findIndex(s=>s.id===me.id)+1;
    if(myRank<=0) myRank=scores.length+1;
    G.myRank=myRank;
    setStatus('You are #'+myRank+' of '+scores.length+' · 🌐');
    if(typeof renderRankCard==='function') renderRankCard();
  }

  function refresh(){
    fetchBoard();
  }

  function init(){
    getMyId();
    initDone=true;
    fetchBoard();
    setInterval(()=>{ if(typeof G!=='undefined'&&G.save) submit(); },60000);
  }

  return {init,refresh,submit,throttledSubmit,onNameChange,render};
})();

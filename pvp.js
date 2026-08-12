'use strict';
/* ============================================================
   SUIKAVERSE — PvP Raids
   Every farmer's idle production slowly fills their guarded
   STASH in the cloud. Raid other farmers to steal melons from
   their stash — out-power their defense and win big.
   Made by Dave-VR
   ============================================================ */

const PVP=(()=>{
  const URL='https://mantledb.sh/v2/suikaver/pvp';
  const COOLDOWN=60000;
  const STASH_RATE=0.05;       // 5% of production fills stash
  const SYNC_MS=45000;
  const OFFLINE_CAP=12*3600;

  let doc=null;
  let docLoaded=false;
  let pending=0;
  let lastSync=0;
  let raiding=false;
  let lastResult='';

  function myId(){
    if(G.save&&G.save.playerId) return G.save.playerId;
    if(typeof Leaderboard!=='undefined'&&Leaderboard.getMyId) return Leaderboard.getMyId();
    return '';
  }
  function myName(){ return (G.save&&G.save.name)||'Farmer'; }
  function defense(){
    return Math.floor((1+G.save.level*0.1)*(1+G.save.ascensions*0.2)*(1+shopLvl('sh13')*0.15)*10);
  }
  function power(){
    return Math.floor((1+G.save.level*0.06)*(1+G.save.ascensions*0.15)*(1+shopLvl('sh12')*0.25)*(1+(G.save.bossKills||0)*0.02)*10);
  }
  function stashCap(){ return 200+G.save.level*40; }
  function pvpStats(){ G.save.pvp=G.save.pvp||{raids:0,won:0,stolen:0,defended:0,lost:0,lastRaid:0}; return G.save.pvp; }
  function myStash(){ return doc&&doc.p&&doc.p[myId()]?doc.p[myId()].s:0; }

  async function load(){
    try{
      const r=await fetch(URL,{cache:'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const d=await r.json();
      doc=(d&&d.p)?d:null;
      docLoaded=true;
    }catch(e){}
  }
  async function saveDoc(){
    try{
      await fetch(URL,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({p:doc?doc.p:{},updated:Date.now()})});
    }catch(e){}
  }

  async function sync(){
    if(!G.save||!G.save.name) return;
    await load();
    if(!doc) return;
    const id=myId();
    const cur=doc.p[id]||{s:0,d:0,name:''};
    cur.s=(cur.s||0)+pending;
    cur.d=defense();
    cur.name=myName();
    cur.last=Date.now();
    doc.p[id]=cur;
    pending=0;
    await saveDoc();
    render();
  }

  /* stash accrual — called every game tick */
  function tick(){
    if(!G.save||!G.save.name) return;
    const now=Date.now();
    const per=effectivePerSec();
    pending+=per*STASH_RATE*0.1;
    if(pending>1e8) pending=1e8;
    if(now-lastSync>SYNC_MS){ lastSync=now; sync(); }
  }

  /* offline accrual — called once on init */
  async function init(){
    const st=pvpStats();
    st.lastRaid=st.lastRaid||0;
    const off=(Date.now()-(G.save.lastOnline||Date.now()))/1000;
    if(off>60){
      const offSec=Math.min(off,OFFLINE_CAP);
      pending+=effectivePerSec()*offSec*STASH_RATE;
      if(pending>1e8) pending=1e8;
    }
    lastSync=Date.now();
    await load();
    if(doc&&doc.p&&doc.p[myId()]){
      pending+=doc.p[myId()].s||0;
      doc.p[myId()].s=0;
    }
    sync();
  }

  function targetList(){
    const out=[];
    if(doc&&doc.p){
      for(const k in doc.p){
        if(k!==myId()&&doc.p[k]) out.push({id:k,name:doc.p[k].name||'Farmer',stash:doc.p[k].s||0,def:doc.p[k].d||5});
      }
    }
    if(!out.length&&typeof Leaderboard!=='undefined'&&Leaderboard.getScores){
      const sc=Leaderboard.getScores();
      sc.forEach(s=>{ if(s.id!==myId()) out.push({id:s.id,name:s.name||'Farmer',stash:0,def:5+(s.level||1)*2}); });
    }
    return out;
  }

  async function raid(){
    if(raiding) return;
    if(!G.save||!G.save.name){ toast('Enter a name first!','🍉'); return; }
    const st=pvpStats();
    const now=Date.now();
    if(now-(st.lastRaid||0)<COOLDOWN){
      toast('Raid cooldown — wait '+Math.ceil((COOLDOWN-(now-(st.lastRaid||0)))/1000)+'s','⏳');
      return;
    }
    if(!docLoaded){
      toast('Syncing the seas…','🌊');
      await load();
    }
    raiding=true;
    const list=targetList();
    if(!list.length){
      lastResult='No other farmers found to raid yet!';
      raiding=false;
      render();
      toast('Nobody to raid yet!','🏝️');
      return;
    }
    const tgt=list[Math.floor(Math.random()*list.length)];
    const myP=power(), theirD=Math.max(1,tgt.def||5);
    const win=Math.random()<myP/(myP+theirD);
    st.raids=(st.raids||0)+1;
    if(win){
      const steal=Math.min(tgt.stash,stashCap());
      if(steal<=0){
        lastResult='Raid on '+escapeHtml(tgt.name)+'! Their stash is empty — +20 🍈 pity melons.';
        addMelons(20); st.won=(st.won||0)+1;
      }else{
        addMelons(steal);
        st.won=(st.won||0)+1;
        st.stolen=(st.stolen||0)+steal;
        lastResult='Raid on '+escapeHtml(tgt.name)+' SUCCEEDED! Stole +'+fmt(steal)+' 🍈!';
      }
      if(doc&&doc.p&&doc.p[tgt.id]){ doc.p[tgt.id].s=Math.max(0,(doc.p[tgt.id].s||0)-steal); }
      toast(lastResult,'🏴‍☠️');
      beepRaid(true);
    }else{
      const penalty=Math.floor(stashCap()*0.1);
      const had=G.save.melons;
      G.save.melons=Math.max(0,had-penalty);
      st.lost=(st.lost||0)+1;
      lastResult='Raid on '+escapeHtml(tgt.name)+' FAILED — you lost '+fmt(penalty)+' 🍈.';
      toast(lastResult,'💥');
      beepRaid(false);
    }
    st.lastRaid=now;
    await saveDoc();
    saveGame();
    raiding=false;
    refreshHud(); checkAchievements(); checkQuests(true);
    Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
    render();
  }

  function beepRaid(win){
    if(typeof tone!=='function') return;
    if(win){ tone(660,0.1,'square',0.05); tone(880,0.14,'square',0.05,0.09); tone(1174,0.2,'square',0.05,0.18); }
    else tone(200,0.22,'sawtooth',0.05);
  }

  function render(){
    if(typeof G==='undefined'||!G.save) return;
    const st=pvpStats();
    const pw=el('raidPower'),df=el('raidDef'),sh=el('raidStash'),rs=el('raidResult');
    if(pw) pw.textContent=fmt(power());
    if(df) df.textContent=fmt(defense());
    if(sh) sh.textContent=docLoaded?fmt(myStash()):'…';
    if(rs){
      const now=Date.now(), cd=(st.lastRaid||0)+COOLDOWN-now;
      rs.innerHTML=(lastResult?escapeHtml(lastResult)+'<br>':'')+
        (cd>0?'Cooldown: '+Math.ceil(cd/1000)+'s':'Ready to raid!')+
        ' · Raids won: '+(st.won||0)+' · Stolen: '+fmt(st.stolen||0)+' 🍈';
    }
    const b=el('raidBtn');
    if(b) b.disabled=raiding;
  }
  function el(id){ return document.getElementById(id); }

  return {init,tick,raid,render,power,defense,stash:myStash,stats:pvpStats,targets:targetList};
})();
window.PVP=PVP;

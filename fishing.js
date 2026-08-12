'use strict';
/* ============================================================
   SUIKAVERSE — Fishing mini game
   Cast your rod, tap the reel bar to stop the marker in the
   sweet zone (VRChat FISH! style) and grow your 200+ fish index.
   Upgrade rods to reach deeper, rarer waters.
   Made by Dave-VR
   ============================================================ */

const Fishing=(()=>{
  const ZONES=[
    {n:'Pond',e:'🌿'},{n:'River',e:'🏞️'},{n:'Lake',e:'🪷'},
    {n:'Ocean',e:'🌊'},{n:'Deep',e:'🌌'},{n:'Galaxy',e:'🪐'}
  ];
  const SPECIES=[
    ['Guppy','Minnow','Goldfish','Koi','Catfish','Tadpole','Froggy','Snail','Newt','Water Strider','Perch','Bluegill','Carp','Sunfish','Pond Turtle','Stickleback','Lilyfish'],
    ['Trout','Salmon','Pike','Eel','Sturgeon','Chub','Dace','Roach','Grayling','Char','Barbel','Bream','Lamprey','Stone Loach','Bullhead','Shad','River Bass'],
    ['Walleye','Muskie','Whitefish','Burbot','Bluegill','Crappie','Yellow Perch','Lake Trout','Smelt','Cisco','Pickerel','Bowfin','Gar','Smallmouth Bass','Steelhead','Sunfish','Lake Sturgeon'],
    ['Mackerel','Herring','Cod','Haddock','Halibut','Tuna','Anchovy','Squid','Octopus','Crab','Lobster','Shrimp','Clam','Scallop','Flounder','Snapper','Sardine'],
    ['Anglerfish','Viperfish','Gulper Eel','Fangtooth','Blobfish','Hatchetfish','Lanternfish','Dragonfish','Vampire Squid','Comb Jelly','Sea Cucumber','Brittle Star','Dumbo Octopus','Isopod','Barreleye','Coelacanth','Fangblenny'],
    ['Moonfish','Cometfish','Nebula Eel','Photon Ray','Gravity Angler','Crystal Squid','Prism Shrimp','Cosmic Jelly','Void Angler','Stardust Cod','Aurora Salmon','Meteor Crab','Eclipse Clam','Supernova Tuna','Quasar Eel','Plasma Puffer','Blackhole Gill']
  ];
  const EMOJI=['🐟','🐠','🐡','🦈','🐙','🦀','🦐','🦞','🐬','🐳','🦑','🐚','🪼','🐋','🦭','🐢','🦎','🪸'];
  const RARITY_W={common:50,uncommon:28,rare:13,epic:6,legendary:2.4,mythic:0.6};
  const RARITY_V={common:1,uncommon:2,rare:4,epic:8,legendary:16,mythic:32};

  let FISHES=[];
  function buildCatalog(){
    if(FISHES.length) return FISHES;
    ZONES.forEach((z,zi)=>{
      SPECIES[zi].forEach((sp,si)=>{
        FISHES.push({id:'f'+zi+'_'+si,name:sp,zone:zi,tier:0,rarity:zr(zi,0),emoji:EMOJI[(zi*3+si)%EMOJI.length]});
        FISHES.push({id:'f'+zi+'_'+si+'k',name:'Royal '+sp,zone:zi,tier:1,rarity:zr(zi,1),emoji:EMOJI[(zi*3+si+7)%EMOJI.length]});
      });
    });
    return FISHES;
  }
  function zr(zone,tier){
    if(tier===0) return zone<=1?'common':(zone<=3?'uncommon':(zone===4?'rare':'epic'));
    return zone<=1?'uncommon':(zone===4?'epic':'rare');
  }
  function byId(id){ return buildCatalog().find(f=>f.id===id); }
  function fishValue(f){ return (f.zone+1)*RARITY_V[f.rarity]*(f.tier?2:1); }

  const RODS=[
    {id:'r0',n:'Twig Rod',e:'🥢',cost:0,     zone:0,speed:0.9, sweet:0.15,mult:1},
    {id:'r1',n:'Bamboo Rod',e:'🎋',cost:2500,    zone:1,speed:0.84,sweet:0.17,mult:1.4},
    {id:'r2',n:'Copper Rod',e:'🪙',cost:20000,   zone:2,speed:0.78,sweet:0.19,mult:1.9},
    {id:'r3',n:'Silver Rod',e:'🥈',cost:150000,  zone:3,speed:0.72,sweet:0.21,mult:2.6},
    {id:'r4',n:'Gold Rod',e:'🥇',cost:1.2e6,    zone:4,speed:0.66,sweet:0.23,mult:3.5},
    {id:'r5',n:'Diamond Rod',e:'💎',cost:10e6,   zone:5,speed:0.60,sweet:0.25,mult:4.7},
    {id:'r6',n:'Star Rod',e:'⭐',cost:80e6,      zone:6,speed:0.53,sweet:0.28,mult:6.3},
    {id:'r7',n:'Infinity Rod',e:'♾️',cost:6e8,  zone:7,speed:0.45,sweet:0.32,mult:8.5}
  ];

  let state='idle';
  let markerPos=0.5,markerDir=1,sweetPos=0.5,sweetW=0.2;
  let reelingUntil=0,animTimer=null,biteTimer=null;

  function rod(){ return RODS[Math.min((G.save.fish&&G.save.fish.rod)||0,RODS.length-1)]; }
  function maxZone(){ return Math.min(rod().zone,ZONES.length-1); }

  function el(id){ return document.getElementById(id); }
  function zoneName(z){ return ZONES[z].n+' '+ZONES[z].e; }

  /* ---------- main catch flow ---------- */

  function cast(){
    if(state!=='idle') return;
    if(typeof G==='undefined'||!G.save.name){ toast('Enter a name first!','🍉'); return; }
    state='casting';
    setStatus('Casting… 🎣');
    const b=el('fishCastBtn'); if(b){ b.disabled=true; b.textContent='Casting…'; }
    el('fishBobber').style.opacity=1;
    biteTimer=setTimeout(()=>bite(),900+Math.random()*700);
  }

  function bite(){
    if(state!=='casting') return;
    state='reeling';
    el('fishBobber').style.opacity=0;
    setStatus('Bite! Tap the bar to REEL IN! ⚡');
    sweetW=rod().sweet;
    sweetPos=0.12+Math.random()*0.76;
    markerPos=0.5;
    markerDir=Math.random()<0.5?-1:1;
    reelingUntil=Date.now()+4200;
    el('fishTrack').classList.remove('hidden');
    renderSweet();
    animTimer=setInterval(reelAnim,16);
  }

  function reelAnim(){
    if(state!=='reeling'){ clearInterval(animTimer); return; }
    const dt=16/1000;
    markerPos+=markerDir*rod().speed*dt;
    if(markerPos<=0){ markerPos=0; markerDir=1; }
    if(markerPos>=1){ markerPos=1; markerDir=-1; }
    el('fishMarker').style.left=(markerPos*100)+'%';
    if(Date.now()>reelingUntil) resolveCatch(false,false,true);
  }

  function reelIn(){
    if(state!=='reeling') return;
    const inSweet=Math.abs(markerPos-sweetPos)<=sweetW/2;
    const near=Math.abs(markerPos-sweetPos)<=sweetW*1.9;
    resolveCatch(inSweet,near,false);
  }

  function resolveCatch(inSweet,near,timeout){
    clearInterval(animTimer);
    state='resolving';
    el('fishTrack').classList.add('hidden');
    const fail=()=>{
      state='idle';
      setStatus('The fish got away! 💨 Cast again.');
      el('fishCastBtn').disabled=false; el('fishCastBtn').textContent='🎣 Cast';
      beepTone();
      render();
    };
    if(timeout){ fail(); return; }
    if(!inSweet&&!near){ fail(); return; }
    const fish=pickFish(inSweet);
    recordCatch(fish,inSweet);
  }

  function pickFish(perfect){
    const rods=rod(), maxZ=maxZone();
    let pool=buildCatalog().filter(f=>f.zone<=maxZ);
    if(!pool.length) pool=buildCatalog().filter(f=>f.zone===0);
    const luck=(perfect?1:0.6)*(1+rods.zone*0.12)*(1+shopLvl('sh11')*0.08)*(1+level('as13')*0.12);
    const w={...RARITY_W};
    w.epic*=luck; w.legendary*=luck*1.4; w.mythic*=luck*1.8;
    const r=rollRarity(w);
    let cand=pool.filter(f=>f.rarity===r);
    if(!cand.length){
      const order=['mythic','legendary','epic','rare','uncommon','common'];
      for(const rr of order){ cand=pool.filter(f=>f.rarity===rr); if(cand.length) break; }
    }
    const tierBias=perfect?1:0.35;
    const tierPool=[];
    for(const f of cand){ tierPool.push(f); if(Math.random()<tierBias) tierPool.push(f); }
    return tierPool[Math.floor(Math.random()*tierPool.length)];
  }
  function rollRarity(w){
    const total=w.common+w.uncommon+w.rare+w.epic+w.legendary+w.mythic;
    let r=Math.random()*total;
    for(const k of ['common','uncommon','rare','epic','legendary','mythic']){
      r-=w[k]; if(r<=0) return k;
    }
    return 'common';
  }

  function recordCatch(fish,perfect){
    const fs=G.save.fish;
    fs.caught=(fs.caught||0)+1;
    fs.games=(fs.games||0)+1;
    fs.index[fish.id]=(fs.index[fish.id]||0)+1;
    if(fish.tier) fs.royal=(fs.royal||0)+1;
    const m=Math.max(1,Math.round(fishValue(fish)*rod().mult/2));
    let cry=0;
    if(fish.rarity==='epic') cry=1;
    else if(fish.rarity==='legendary') cry=3;
    else if(fish.rarity==='mythic') cry=8;
    addMelons(m); gainXp(1+fish.zone);
    if(cry) addCrystals(cry);
    if(fish.rarity==='epic'||fish.rarity==='legendary'||fish.rarity==='mythic') dropCrateChance(0.25);
    toast('Caught: '+fish.name+' ('+zoneName(fish.zone)+') +'+fmt(m)+' 🍈'+(cry?' +'+cry+' 💎':'')+'!',fish.emoji);
    state='idle';
    el('fishCastBtn').disabled=false; el('fishCastBtn').textContent='🎣 Cast';
    beepCatch();
    refreshHud(); checkAchievements(); checkQuests(true);
    Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
    render();
    showCatchModal(fish,m,cry);
  }

  function showCatchModal(fish,m,cry){
    const mv=el('fishCatchName'),mv2=el('fishCatchZone');
    if(!mv) return;
    mv.textContent=fish.emoji+' '+fish.name;
    mv2.textContent=zoneName(fish.zone)+' · '+(fish.tier?'👑 Royal':'')+' · '+fish.rarity.toUpperCase();
    el('fishCatchReward').textContent='+'+fmt(m)+' 🍈'+(cry?' · +'+cry+' 💎':'');
    el('fishCatchNew').style.display=fsNew(fish)?'block':'none';
    openModal('veilFishCatch');
    setTimeout(()=>closeModal('veilFishCatch'),3200);
  }
  function fsNew(fish){
    const fs=G.save.fish;
    return fs.index[fish.id]===1;
  }

  /* ---------- rods ---------- */

  function upgradeRod(){
    const idx=(G.save.fish&&G.save.fish.rod)||0;
    const next=RODS[idx+1];
    if(!next){ toast('You own the best rod already!','♾️'); return; }
    if(G.save.melons<next.cost){ toast('Need '+fmt(next.cost)+' melons for the '+next.n+'!','💸'); return; }
    G.save.melons-=next.cost;
    G.save.fish.rod=idx+1;
    toast('Upgraded to '+next.e+' '+next.n+'!','🎣');
    beepBuy();
    refreshHud(); render();
    Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
  }

  /* ---------- index ---------- */

  let indexZone='all';
  function renderIndex(){
    const grid=el('fishGrid');
    if(!grid) return;
    const fs=G.save.fish;
    const chips=el('fishZoneChips');
    if(chips){
      let h='<button class="chip" data-z="all"'+(indexZone==='all'?' onclick="Fishing.setIndexZone(\'all\')"':' onclick="Fishing.setIndexZone(\'all\')"')+'>🌐 All</button>';
      h+=ZONES.map((z,i)=>'<button class="chip" data-z="'+i+'" onclick="Fishing.setIndexZone('+i+')">'+z.e+' '+z.n+'</button>').join('');
      chips.innerHTML=h;
      chips.querySelectorAll('button').forEach(b=>b.classList.toggle('on',String(b.dataset.z)===String(indexZone)));
    }
    const caught=Object.keys(fs.index).length;
    el('fishIndexCount').textContent=caught+' / '+buildCatalog().length+' fish discovered';
    let h='';
    buildCatalog().forEach(f=>{
      if(indexZone!=='all'&&String(f.zone)!==indexZone) return;
      const have=(fs.index[f.id]||0)>0;
      const r=RARITY_V[f.rarity];
      h+='<div class="fish-slot'+(have?'':' locked')+'" style="--fc:'+fishColor(f.rarity)+'">'+
        '<div class="fish-e">'+(have?f.emoji:'❓')+'</div>'+
        '<div class="fish-n">'+(have?escapeHtml(f.name):'???')+(f.tier?' 👑':'')+'</div>'+
        '<div class="fish-r">'+f.rarity+'</div>'+
        (have?(fs.index[f.id]>1?'<div class="fish-c">×'+fs.index[f.id]+'</div>':''):'')+
        '</div>';
    });
    grid.innerHTML=h;
  }
  function fishColor(r){
    return {common:'#a8c0ae',uncommon:'#7fe7ff',rare:'#c39bd3',epic:'#ff9de8',legendary:'#ffd24a',mythic:'#ff6b9d'}[r]||'#a8c0ae';
  }
  function setIndexZone(z){ indexZone=String(z); renderIndex(); }

  /* ---------- panel render ---------- */

  function setStatus(t){
    const s=el('fishStatus');
    if(s) s.textContent=t;
  }
  function renderSweet(){
    const sw=el('fishSweet');
    if(!sw) return;
    sw.style.left=((sweetPos-sweetW/2)*100)+'%';
    sw.style.width=(sweetW*100)+'%';
    el('fishMarker').style.left=(markerPos*100)+'%';
  }
  function render(){
    if(typeof G==='undefined'||!G.save) return;
    const fs=G.save.fish||{};
    const r=rod();
    const nm=el('fishRodName'); if(nm) nm.textContent=r.e+' '+r.n;
    const nxt=el('fishRodNext'); if(nxt) nxt.textContent=(RODS[(fs.rod||0)+1]?('Next: '+RODS[(fs.rod||0)+1].n+' — '+fmt(RODS[(fs.rod||0)+1].cost)+' 🍈'):'MAX rod!');
    const up=el('fishUpgradeBtn');
    if(up){ up.disabled=(fs.rod||0)>=RODS.length-1||G.save.melons<(RODS[(fs.rod||0)+1]||{}).cost; }
    const zn=el('fishZoneName'); if(zn) zn.textContent='Waters: '+ZONES[0].n+' → '+zoneName(maxZone());
    const st=el('fishStats'); if(st) st.textContent='🐟 '+fmt(fs.caught||0)+' caught · '+Object.keys(fs.index||{}).length+'/'+buildCatalog().length+' discovered'+(fs.royal?(' · 👑 '+fs.royal):'');
    const b=el('fishCastBtn'); if(b&&state==='idle'){ b.disabled=false; b.textContent='🎣 Cast'; }
    if(state==='idle'&&el('fishTrack')) el('fishTrack').classList.add('hidden');
  }

  /* ---------- sounds ---------- */

  function beepCatch(){
    if(typeof tone!=='function') return;
    tone(523,0.08,'square',0.04); tone(784,0.12,'square',0.04,0.07); tone(1046,0.16,'square',0.04,0.14);
  }
  function beepTone(){
    if(typeof tone==='function') tone(220,0.2,'sine',0.04);
  }

  /* ---------- init ---------- */

  function init(){
    buildCatalog();
    const track=el('fishTrack');
    if(track&&!track.dataset.bound){
      track.dataset.bound='1';
      track.addEventListener('pointerdown',e=>{ e.preventDefault(); reelIn(); });
    }
    const cast=el('fishCastBtn');
    if(cast&&!cast.dataset.bound){
      cast.dataset.bound='1';
      cast.addEventListener('click',()=>cast());
    }
    const up=el('fishUpgradeBtn');
    if(up&&!up.dataset.bound){
      up.dataset.bound='1';
      up.addEventListener('click',()=>upgradeRod());
    }
    const idx=el('fishIndexBtn');
    if(idx&&!idx.dataset.bound){
      idx.dataset.bound='1';
      idx.addEventListener('click',()=>openIndex());
    }
    render();
  }
  function openIndex(){
    renderIndex();
    openModal('veilFish');
  }

  return {
    init,cast,bite,reelIn,upgradeRod,render,renderIndex,openIndex,setIndexZone,
    rods:RODS,zones:ZONES,catalog:buildCatalog,byId,
    get state(){ return state; },
    get marker(){ return markerPos; },
    set marker(v){ markerPos=v; if(el('fishMarker')) el('fishMarker').style.left=(v*100)+'%'; },
    set sweetPos(v){ sweetPos=v; renderSweet(); },
    get sweetCenter(){ return sweetPos; }
  };
})();
window.Fishing=Fishing;

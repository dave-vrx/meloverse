'use strict';
/* ============================================================
   SUIKAVERSE — game engine (idle core + levels, quests,
   events, collection, crates, skins, mini-game bridges)
   Made by Dave-VR
   ============================================================ */

const G = window.G = {
  save:null, buyMult:1,
  combo:0, comboUntil:0, comboMax:10, maxShown:0,
  frenzyUntil:0, tapUntil:0,
  goldenBusy:false, goldTimer:null,
  tick:0, last:Date.now(), lastSave:0,
  soundOn:true, AC:null, bldRefs:{}, achCount:-1, myRank:0,
  evt:null, evtPolled:0, clickCryCounter:0
};

function $(id){ return document.getElementById(id); }

/* ---------------- data ---------------- */

const BUILDINGS=[
  {id:'vine',    name:'Melon Vine',    emoji:'🌱', cost:15,    rate:0.1,  cb:0.1},
  {id:'basket',  name:'Melon Basket',  emoji:'🧺', cost:100,   rate:1,    cb:0.5},
  {id:'truck',   name:'Melon Truck',   emoji:'🚚', cost:1100,  rate:8,    cb:4},
  {id:'juice',   name:'Juice Bar',     emoji:'🥤', cost:12000, rate:47,   cb:15},
  {id:'farm',    name:'Mega Farm',     emoji:'🏞️', cost:130000, rate:260,  cb:60},
  {id:'factory', name:'Melon Factory', emoji:'🏭', cost:1.4e6,  rate:1400, cb:250},
  {id:'rocket',  name:'Melon Rocket',  emoji:'🚀', cost:20e6,   rate:7800, cb:1200},
  {id:'moon',    name:'Moon Colony',   emoji:'🌕', cost:330e6,  rate:44000, cb:5000},
  {id:'ship',    name:'Star Freighter',emoji:'🛸', cost:5.1e9,  rate:260000, cb:22000},
  {id:'planet',  name:'Melon Planet',  emoji:'🌍', cost:75e9,   rate:1.6e6, cb:100000},
  {id:'galaxy',  name:'Melon Galaxy',  emoji:'🌌', cost:1e12,   rate:1e7,   cb:5e5},
  {id:'universe',name:'Melonverse',    emoji:'🌠', cost:14e12,  rate:6.5e7, cb:2.5e6}
];

const RANKS=[
  [0,'Melon Seedling','🐣'],[1e3,'Melon Sprout','🌱'],[1e5,'Melon Grower','🌿'],
  [1e7,'Melon Farmer','🧑‍🌾'],[1e9,'Melon Baron','🏰'],[1e11,'Melon Duke','👑'],
  [1e13,'Melon King','🤴'],[1e15,'Melon Emperor','🪄'],[1e17,'Celestial Melon','⭐'],
  [1e19,'Melon Overlord','🕶️'],[1e21,'Melon Legend','🏆'],[1e24,'Melon God','👽']
];

const ASC_UP=[
  {id:'as1', emoji:'🌱', name:'Golden Soil',    desc:'Each seed gives +1% MORE production (stacks)', max:5,  base:5,  mult:2.1},
  {id:'as2', emoji:'⚡', name:'Seed Surge',     desc:'+25% seeds gained per ascension',             max:5,  base:8,  mult:2.2},
  {id:'as3', emoji:'💪', name:'Perpetual Growth', desc:'+100% ALL production (per level)',          max:10, base:25, mult:1.7},
  {id:'as4', emoji:'👆', name:'Titan Thumbs',   desc:'+50% tap power (per level)',                  max:10, base:15, mult:1.6},
  {id:'as5', emoji:'💤', name:'Dream Harvest',  desc:'+2× offline earnings (per level)',            max:5,  base:10, mult:2},
  {id:'as6', emoji:'🍀', name:'Golden Orchard', desc:'Golden melons appear 2× more often',          max:5,  base:12, mult:2},
  {id:'as7', emoji:'🧬', name:'Starter Seeds',  desc:'Start every run with 25 vines',               max:1,  base:50, mult:1}
];

const SHOP=[
  {id:'sh1', emoji:'🤖', name:'Auto-Tapper Bot', desc:'+1 auto tap per second',             max:25, base:5,  mult:2.1},
  {id:'sh2', emoji:'💎', name:'Mega Multiplier', desc:'+100% ALL production (per level)',   max:25, base:15, mult:2.4},
  {id:'sh3', emoji:'⏳', name:'Time Warp Core',  desc:'+4h offline earning cap (per level)', max:6,  base:10, mult:2},
  {id:'sh4', emoji:'🍀', name:'Lucky Charm',     desc:'Golden melons 2× more often',        max:6,  base:8,  mult:2},
  {id:'sh5', emoji:'✨', name:'Golden Feast',    desc:'+50% golden melon rewards',          max:10, base:12, mult:1.8},
  {id:'sh6', emoji:'🔥', name:'Combo King',      desc:'Combo lasts +1s, max combo +5',      max:10, base:7,  mult:1.7}
];

const SKINS=[
  {id:'classic', name:'Classic Melon',  emoji:'🍉', price:0,    lvl:0,  asc:0},
  {id:'golden',  name:'Golden Melon',   emoji:'🥇', price:250,  lvl:0,  asc:0},
  {id:'mint',    name:'Mint Melon',     emoji:'🍃', price:300,  lvl:5,  asc:0},
  {id:'crystal', name:'Crystal Melon',  emoji:'💎', price:500,  lvl:0,  asc:0},
  {id:'lava',    name:'Lava Melon',     emoji:'🌋', price:800,  lvl:10, asc:0},
  {id:'galaxy',  name:'Galaxy Melon',   emoji:'🌌', price:1200, lvl:20, asc:0},
  {id:'void',    name:'Void Melon',     emoji:'⚫', price:2000, lvl:30, asc:0},
  {id:'royal',   name:'Royal Melon',    emoji:'👑', price:3000, lvl:40, asc:0},
  {id:'asc',     name:'Ascended Melon', emoji:'⭐', price:0,    lvl:0,  asc:3},
  {id:'starbound',name:'Starbound Melon',emoji:'✨', price:0,   lvl:0,  asc:10},
  {id:'cosmic',  name:'Cosmic Melon',   emoji:'🕳️', price:0,    lvl:0,  asc:25}
];

const QUESTS=[
  {id:'q_first_tap',e:'👆',n:'First Tap',d:'Tap the watermelon once',cry:2,xp:20,need:()=>G.save.totalClicks>=1},
  {id:'q_first_buy',e:'🧺',n:'Green Thumb',d:'Buy your first farm',cry:3,xp:30,need:()=>totalBuildings()>=1},
  {id:'q_1k',e:'🍈',n:'Melon Boost',d:'Harvest 1K lifetime melons',cry:3,xp:40,need:()=>G.save.lifetimeEarned>=1e3},
  {id:'q_10_buildings',e:'🏗️',n:'Builder',d:'Own 10 buildings',cry:5,xp:60,need:()=>totalBuildings()>=10},
  {id:'q_combo5',e:'🔥',n:'On Fire',d:'Reach a ×5 combo',cry:4,xp:40,need:()=>G.save.maxCombo>=5},
  {id:'q_golden',e:'🍀',n:'Lucky Break',d:'Click a golden melon',cry:5,xp:50,need:()=>G.save.goldenClicks>=1},
  {id:'q_suika1',e:'🍉',n:'Stack Master',d:'Play Suika once',cry:5,xp:50,need:()=>G.save.suika.games>=1},
  {id:'q_suika500',e:'🎯',n:'Suika Pro',d:'Score 500 in a Suika run',cry:8,xp:80,need:()=>G.save.suika.best>=500},
  {id:'q_suika_wm',e:'🏆',n:'Watermelon King',d:'Merge a watermelon in Suika',cry:15,xp:150,need:()=>G.save.suika.watermelons>=1},
  {id:'q_asc1',e:'⭐',n:'Stardust',d:'Ascend once',cry:10,xp:100,need:()=>G.save.ascensions>=1},
  {id:'q_asc5',e:'✨',n:'Cosmic Soul',d:'Ascend 5 times',cry:20,xp:200,need:()=>G.save.ascensions>=5},
  {id:'q_crate',e:'📦',n:"What's Inside?",d:'Open a crate',cry:5,xp:50,need:()=>G.save.cratesOpened>=1},
  {id:'q_whack',e:'🔨',n:'Whack It',d:'Play Whack-a-Melon once',cry:5,xp:50,need:()=>G.save.whack.games>=1},
  {id:'q_coll5',e:'🗃️',n:'Collector',d:'Find 5 collection items',cry:6,xp:60,need:()=>Object.keys(G.save.coll).length>=5},
  {id:'q_lvl5',e:'🎓',n:'Rising Star',d:'Reach Level 5',cry:6,xp:60,need:()=>G.save.level>=5}
];

const DQ=[
  {id:'d_tap',e:'👆',n:'Tap Happy',t:'Tap the watermelon',goal:100,unit:' taps'},
  {id:'d_buy',e:'🧺',n:'Buyer',t:'Buy farms',goal:5,unit:' farms'},
  {id:'d_grow',e:'🍈',n:'Harvest',t:'Grow melons (lifetime)',goal:1e5,unit:' 🍈'},
  {id:'d_combo',e:'🔥',n:'Combo Run',t:'Reach a combo of',goal:8,unit:''},
  {id:'d_suika',e:'🍉',n:'Fruit Stacker',t:'Play Suika',goal:1,unit:' time'},
  {id:'d_crate',e:'📦',n:'Crate Hunter',t:'Open crates',goal:1,unit:' crate'},
  {id:'d_whack',e:'🔨',n:'Whacker',t:'Play Whack-a-Melon',goal:1,unit:' time'},
  {id:'d_golden',e:'🍀',n:'Golden Hunter',t:'Click golden melons',goal:2,unit:' melons'}
];

const ITEMS=[
  {id:'seed',e:'🌰',n:'Melon Seed',r:'common'},
  {id:'apple',e:'🍎',n:'Crimson Apple',r:'common'},
  {id:'juice',e:'🥤',n:'Juice Carton',r:'common'},
  {id:'sign',e:'🪧',n:'Farm Sign',r:'common'},
  {id:'grape',e:'🍇',n:'Tiny Grape',r:'common'},
  {id:'hoe',e:'⛏️',n:'Rusty Hoe',r:'common'},
  {id:'shard',e:'💠',n:'Crystal Shard',r:'uncommon'},
  {id:'clover',e:'🍀',n:'Lucky Clover',r:'uncommon'},
  {id:'rind',e:'🍈',n:'Golden Rind',r:'uncommon'},
  {id:'combo',e:'🎟️',n:'Combo Token',r:'uncommon'},
  {id:'fuel',e:'⛽',n:'Rocket Fuel',r:'uncommon'},
  {id:'moonrock',e:'🪨',n:'Moon Rock',r:'uncommon'},
  {id:'vine',e:'🍃',n:'Ancient Vine',r:'rare'},
  {id:'stardust',e:'✨',n:'Stardust Seed',r:'rare'},
  {id:'phoenix',e:'🔥',n:'Phoenix Melon',r:'rare'},
  {id:'pebble',e:'⏳',n:'Time Pebble',r:'rare'},
  {id:'dragon',e:'🐉',n:'Dragon Fruit',r:'rare'},
  {id:'jelly',e:'🫙',n:'Royal Jelly',r:'rare'},
  {id:'goldwm',e:'🥇',n:'Golden Watermelon',r:'epic'},
  {id:'pearl',e:'🦪',n:'Galaxy Pearl',r:'epic'},
  {id:'nova',e:'🌌',n:'Frozen Nova',r:'epic'},
  {id:'ember',e:'🌋',n:'Void Ember',r:'epic'},
  {id:'rainbow',e:'🌈',n:'Rainbow Melon',r:'epic'},
  {id:'boss',e:'👑',n:'Boss Watermelon',r:'legendary'},
  {id:'knife',e:'🔪',n:'Cosmic Chef Knife',r:'legendary'},
  {id:'infseed',e:'♾️',n:'Infinity Seed',r:'legendary'},
  {id:'crown',e:'💎',n:'Melon God Crown',r:'legendary'}
];
const RARITY={common:{w:55,v:1,c:'#a8c0ae'},uncommon:{w:25,v:3,c:'#7fe7ff'},rare:{w:12,v:8,c:'#c39bd3'},epic:{w:6,v:20,c:'#ff9de8'},legendary:{w:2,v:50,c:'#ffd24a'}};

const EVENTS=[
  {id:'meteor',e:'🌠',n:'Meteor Shower',d:'All melon production ×2!'},
  {id:'crystal',e:'💎',n:'Crystal Rain',d:'Extra crystals from everything!'},
  {id:'fruit',e:'🍉',n:'Fruit Rush',d:'Mini game rewards ×3!'},
  {id:'turbo',e:'⚡',n:'Turbo Storm',d:'×5 tap power and ×2 production!'},
  {id:'gold',e:'🥇',n:'Gold Rush',d:'Golden melons every 12 seconds!'}
];

function makeUpgrades(){
  const list=[];
  BUILDINGS.forEach(b=>{
    list.push({id:'b_'+b.id+'_10',emoji:b.emoji,name:b.name+' ×2',desc:'Double '+b.name+' output',cost:Math.ceil(b.cost*25),
      need:()=>(G.save.buildings[b.id]||0)>=10, kind:'build', bld:b.id, mult:2});
    list.push({id:'b_'+b.id+'_50',emoji:b.emoji,name:b.name+' ×2 II',desc:'Double '+b.name+' output again',cost:Math.ceil(b.cost*1000),
      need:()=>(G.save.buildings[b.id]||0)>=50, kind:'build', bld:b.id, mult:2});
  });
  const clicks=[
    ['c1','🔪','Sharpened Knife','Double tap power',500,50,2],
    ['c2','⚔️','Melon Mulcher','Double tap power',5000,400,2],
    ['c3','☀️','Solar Fingers','Double tap power',50000,3000,2],
    ['c4','🌩️','Thunder Thumbs','Double tap power',500000,15000,2],
    ['c5','🌀','Vortex Touch','TRIPLE tap power',5e6,60000,3],
    ['c6','💥','Galactic Slap','TRIPLE tap power',5e8,250000,3]
  ];
  clicks.forEach(c=>list.push({id:c[0],emoji:c[1],name:c[2],desc:c[3],cost:c[4],need:()=>G.save.totalClicks>=c[5],kind:'click',mult:c[6]}));
  const globs=[
    ['g1','🧲','Melon Magnet','Double ALL production',2e4,1e4,2],
    ['g2','⚗️','Growth Formula','Double ALL production',2e6,5e5,2],
    ['g3','🛰️','Orbital Sunshine','Double ALL production',2e8,2e7,2],
    ['g4','🔭','Deep Space Rays','Double ALL production',2e10,1e9,2],
    ['g5','🪐','Planetary Bounty','Double ALL production',2e12,5e10,2],
    ['g6','🌠','Supernova Harvest','Double ALL production',2e14,2.5e12,2],
    ['g7','🕳️','Black Hole Vineyard','TRIPLE ALL production',2e16,1e14,3],
    ['g8','👽','Alien Watermelon Tech','TRIPLE ALL production',2e18,5e15,3]
  ];
  globs.forEach(g=>list.push({id:g[0],emoji:g[1],name:g[2],desc:g[3],cost:g[4],need:()=>G.save.lifetimeEarned>=g[5],kind:'global',mult:g[6]}));
  return list;
}
const UPGRADES=makeUpgrades();

const ACH=[
  {id:'cl1',e:'👆',n:'Warm Up',d:'Tap the melon 100 times',g:1,need:()=>G.save.totalClicks>=100},
  {id:'cl2',e:'✊',n:'Getting Strong',d:'Tap 1,000 times',g:2,need:()=>G.save.totalClicks>=1e3},
  {id:'cl3',e:'🥊',n:'Melon Punching Bag',d:'Tap 10,000 times',g:3,need:()=>G.save.totalClicks>=1e4},
  {id:'cl4',e:'💥',n:'Finger Fury',d:'Tap 100,000 times',g:5,need:()=>G.save.totalClicks>=1e5},
  {id:'cl5',e:'🌋',n:'Tap Titan',d:'Tap 1,000,000 times',g:8,need:()=>G.save.totalClicks>=1e6},
  {id:'ml1',e:'🍈',n:'First Harvest',d:'Grow 10K melons (lifetime)',g:1,need:()=>G.save.lifetimeEarned>=1e4},
  {id:'ml2',e:'🍉',n:'Melon Millionaire',d:'Grow 1M melons',g:2,need:()=>G.save.lifetimeEarned>=1e6},
  {id:'ml3',e:'🚀',n:'Orbital Harvest',d:'Grow 1B melons',g:4,need:()=>G.save.lifetimeEarned>=1e9},
  {id:'ml4',e:'🌌',n:'Galactic Grower',d:'Grow 1T melons',g:6,need:()=>G.save.lifetimeEarned>=1e12},
  {id:'ml5',e:'⭐',n:'Stellar Farmer',d:'Grow 1Qa melons',g:10,need:()=>G.save.lifetimeEarned>=1e15},
  {id:'ml6',e:'👑',n:'Melon Monarch',d:'Grow 1Qi melons',g:16,need:()=>G.save.lifetimeEarned>=1e18},
  {id:'ml7',e:'🕶️',n:'Melon Overlord',d:'Grow 1Sx melons',g:25,need:()=>G.save.lifetimeEarned>=1e21},
  {id:'bd1',e:'🧺',n:'Builder',d:'Own 10 buildings',g:1,need:()=>totalBuildings()>=10},
  {id:'bd2',e:'🏗️',n:'Construction Crew',d:'Own 50 buildings',g:2,need:()=>totalBuildings()>=50},
  {id:'bd3',e:'🏙️',n:'Melon Metropolis',d:'Own 200 buildings',g:4,need:()=>totalBuildings()>=200},
  {id:'bd4',e:'🌐',n:'Melon Megalopolis',d:'Own 500 buildings',g:8,need:()=>totalBuildings()>=500},
  {id:'bd5',e:'🌱',n:'Full Garden',d:'Own at least 1 of EVERY building',g:3,need:()=>BUILDINGS.every(b=>(G.save.buildings[b.id]||0)>=1)},
  {id:'bd6',e:'🏭',n:'Mega Grower',d:'Own 50 of a single building',g:3,need:()=>BUILDINGS.some(b=>(G.save.buildings[b.id]||0)>=50)},
  {id:'bd7',e:'💎',n:'Melon Tycoon',d:'Own 100 of a single building',g:5,need:()=>BUILDINGS.some(b=>(G.save.buildings[b.id]||0)>=100)},
  {id:'as1',e:'⭐',n:'Ascended',d:'Ascend once',g:5,need:()=>G.save.ascensions>=1},
  {id:'as2',e:'✨',n:'Starbound',d:'Ascend 5 times',g:8,need:()=>G.save.ascensions>=5},
  {id:'as3',e:'🌠',n:'Cosmic Soul',d:'Ascend 20 times',g:15,need:()=>G.save.ascensions>=20},
  {id:'as4',e:'🕳️',n:'Beyond Infinity',d:'Ascend 100 times',g:30,need:()=>G.save.ascensions>=100},
  {id:'sd1',e:'🌱',n:'Seedling',d:'Hold 10 total seeds',g:2,need:()=>G.save.totalSeeds>=10},
  {id:'sd2',e:'🌳',n:'Seed Bank',d:'Hold 100 total seeds',g:5,need:()=>G.save.totalSeeds>=100},
  {id:'sd3',e:'🌲',n:'Seed Empire',d:'Hold 1K total seeds',g:10,need:()=>G.save.totalSeeds>=1000},
  {id:'sd4',e:'🌴',n:'Seed God',d:'Hold 10K total seeds',g:20,need:()=>G.save.totalSeeds>=1e4},
  {id:'gm1',e:'🍀',n:'Lucky',d:'Click a golden melon',g:1,need:()=>G.save.goldenClicks>=1},
  {id:'gm2',e:'🍀',n:'Lucky Charm',d:'Click 10 golden melons',g:3,need:()=>G.save.goldenClicks>=10},
  {id:'gm3',e:'🍀',n:'Fortune Favors',d:'Click 50 golden melons',g:8,need:()=>G.save.goldenClicks>=50},
  {id:'gm4',e:'🍀',n:'Blessed Harvest',d:'Click 100 golden melons',g:15,need:()=>G.save.goldenClicks>=100},
  {id:'co1',e:'🔥',n:'On Fire',d:'Reach a ×5 combo',g:1,need:()=>G.save.maxCombo>=5},
  {id:'co2',e:'🌪️',n:'Storm of Taps',d:'Reach a ×15 combo',g:3,need:()=>G.save.maxCombo>=15},
  {id:'co3',e:'⚡',n:'Combo Legend',d:'Reach a ×25 combo',g:8,need:()=>G.save.maxCombo>=25},
  {id:'cy1',e:'💎',n:'Crystal Seeker',d:'Hold 25 crystals',g:2,need:()=>G.save.crystals>=25},
  {id:'cy2',e:'💎',n:'Crystal Hoarder',d:'Hold 100 crystals',g:5,need:()=>G.save.crystals>=100},
  {id:'cy3',e:'💎',n:'Crystal Lord',d:'Hold 500 crystals',g:12,need:()=>G.save.crystals>=500},
  {id:'of1',e:'💤',n:'Deep Sleeper',d:'Earn melons while away',g:1,need:()=>G.save.offlineEarns>=1}
];

/* ---------------- helpers ---------------- */

const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','UDc','DDc','TDc','QaDc','QiDc','SxDc','SpDc','OcDc','NoDc','Vg','UVg','DVg','TVg','QaVg','QiVg','SxVg','SpVg','OcVg','NoVg'];
function fmt(n){
  if(!isFinite(n)) return '∞';
  if(n<0) return '-'+fmt(-n);
  if(n<1000) return Math.floor(n).toString();
  const e=Math.floor(Math.log10(n));
  const i=Math.floor(e/3);
  if(i>=SUF.length) return n.toExponential(2).replace('e+','e');
  const m=n/Math.pow(10,i*3);
  return (m>=100?m.toFixed(0):m>=10?m.toFixed(1):m.toFixed(2))+SUF[i];
}
function fmtDur(sec){
  sec=Math.floor(sec);
  const d=Math.floor(sec/86400),h=Math.floor(sec%86400/3600),m=Math.floor(sec%3600/60),s=sec%60;
  if(d>0) return d+'d '+h+'h'; if(h>0) return h+'h '+m+'m'; if(m>0) return m+'m '+s+'s'; return s+'s';
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

/* ---------------- levels / xp ---------------- */

function xpNeed(l){ return Math.floor(100*Math.pow(l,1.6)); }
function levelMult(){ return 1+0.02*(G.save.level-1); }
function gainXp(n){
  if(!(n>0)) return;
  G.save.xp+=n;
  while(G.save.xp>=xpNeed(G.save.level)){
    G.save.xp-=xpNeed(G.save.level);
    G.save.level++;
    const rew=2+G.save.level;
    G.save.crystals+=rew;
    toast('LEVEL UP! Now Level '+G.save.level+'! +'+rew+' 💎','🎉');
    beepAch();
  }
  refreshHud();
}
function xpPct(){
  return clamp(G.save.xp/xpNeed(G.save.level)*100,0,100);
}

/* ---------------- economy ---------------- */

function owned(id){ return G.save.upgrades.includes(id); }
function level(id){ return G.save.asc[id]||0; }
function shopLvl(id){ return G.save.shop[id]||0; }
function totalBuildings(){ return BUILDINGS.reduce((s,b)=>s+(G.save.buildings[b.id]||0),0); }
function buildingCost(b,ownedN,n){ return b.cost*Math.pow(1.15,ownedN)*(Math.pow(1.15,n)-1)/0.15; }
function buildingRate(b){ return b.rate*(owned('b_'+b.id+'_10')?2:1)*(owned('b_'+b.id+'_50')?2:1); }

function perSecRaw(){
  let s=0;
  for(const b of BUILDINGS){ const n=G.save.buildings[b.id]||0; if(n) s+=n*buildingRate(b); }
  return s;
}
function clickBase(){
  let c=1;
  for(const b of BUILDINGS) c+=(G.save.buildings[b.id]||0)*b.cb;
  return c;
}
function globalMult(){
  let m=1;
  for(const u of UPGRADES) if(u.kind==='global'&&owned(u.id)) m*=u.mult;
  m*=Math.pow(2,level('as3'));
  m*=Math.pow(2,shopLvl('sh2'));
  m*=levelMult();
  return m;
}
function seedMult(){ return 1+0.01*(1+level('as1'))*G.save.totalSeeds; }
function clickMult(){
  let m=1;
  for(const u of UPGRADES) if(u.kind==='click'&&owned(u.id)) m*=u.mult;
  m*=1+0.5*level('as4');
  m*=levelMult();
  return m;
}
function clickPower(withCombo){
  const c=(G.combo>=2)?(1+0.1*(G.combo-1)):1;
  const combo=(withCombo!==false)?c:1;
  const tap=(Date.now()<G.tapUntil)?10:1;
  const evt=(G.evt&&G.evt.id==='turbo')?5:1;
  return clickBase()*clickMult()*combo*tap*evt;
}
function autoPerSec(){ return shopLvl('sh1')*clickPower(); }
function frenzyMult(){ return (Date.now()<G.frenzyUntil)?7:1; }
function eventProdMult(){ return (G.evt&&(G.evt.id==='meteor'||G.evt.id==='turbo'))?2:1; }
function effectivePerSec(){ return perSecRaw()*globalMult()*seedMult()*frenzyMult()*eventProdMult()+autoPerSec(); }
function calcSeedGain(){ return Math.floor(Math.pow(G.save.runEarned/1e6,0.5)*(1+0.25*level('as2'))); }
function rankInfo(){
  let i=0;
  for(let r=0;r<RANKS.length;r++) if(G.save.lifetimeEarned>=RANKS[r][0]) i=r;
  const cur=RANKS[i],next=RANKS[i+1]||null;
  let pct=100;
  if(next){ pct=(G.save.lifetimeEarned-cur[0])/(next[0]-cur[0])*100; pct=Math.max(0,Math.min(100,pct)); }
  return {name:cur[1],emoji:cur[2],next:next?next[0]:null,nextName:next?next[1]:null,pct:i,hasNext:!!next};
}

function addMelons(n){ if(n<=0)return; G.save.melons+=n; G.save.runEarned+=n; G.save.lifetimeEarned+=n; }

/* ---------------- save/load ---------------- */

function defaultSave(){
  return {v:2,name:'',playerId:'',melons:0,runEarned:0,lifetimeEarned:0,buildings:{},upgrades:[],
    seeds:0,totalSeeds:0,ascensions:0,crystals:0,asc:{},shop:{},ach:[],
    totalClicks:0,goldenClicks:0,maxCombo:0,offlineEarns:0,
    lastDaily:null,dailyStreak:0,dailyClaimed:true,lastOnline:Date.now(),sound:true,
    xp:0,level:1,quests:{},dqDay:'',dqIds:[],dqProg:{},dqDone:[],dqBase:{},
    coll:{},inv:0,cratesOpened:0,skins:[],skin:'classic',
    suika:{best:0,games:0,merges:0,watermelons:0,suikaBoost:false},
    whack:{best:0,games:0},roulette:{spins:0,wins:0},
    eventClaimed:'',lastEventEnd:0};
}
function loadGame(){
  let s=null;
  try{ const raw=localStorage.getItem('suikaver_save'); if(raw) s=JSON.parse(raw);
    if(!s){ const old=localStorage.getItem('meloverse_save'); if(old){ s=JSON.parse(old); } } }catch(e){}
  G.save=Object.assign(defaultSave(),s||{});
  G.save.buildings=G.save.buildings||{};
  G.save.upgrades=G.save.upgrades||[];
  G.save.asc=G.save.asc||{};
  G.save.shop=G.save.shop||{};
  G.save.ach=G.save.ach||[];
  G.save.quests=G.save.quests||{};
  G.save.dqIds=G.save.dqIds||[];
  G.save.dqProg=G.save.dqProg||{};
  G.save.dqDone=G.save.dqDone||[];
  G.save.dqBase=G.save.dqBase||{};
  G.save.coll=G.save.coll||{};
  G.save.skins=G.save.skins||[];
  G.save.skin=G.save.skin||'classic';
  G.save.suika=Object.assign({best:0,games:0,merges:0,watermelons:0,suikaBoost:false},G.save.suika||{});
  G.save.whack=Object.assign({best:0,games:0},G.save.whack||{});
  G.save.roulette=Object.assign({spins:0,wins:0},G.save.roulette||{});
  G.save.level=G.save.level||1;
  G.save.xp=G.save.xp||0;
  G.soundOn=G.save.sound!==false;
  applySkin();
}
function saveGame(){
  G.save.lastOnline=Date.now();
  try{ localStorage.setItem('suikaver_save',JSON.stringify(G.save)); }catch(e){}
}

/* ---------------- sound ---------------- */

function ac(){ if(!G.AC){ G.AC=new (window.AudioContext||window.webkitAudioContext)(); } if(G.AC.state==='suspended') G.AC.resume(); return G.AC; }
function tone(freq,dur,type,vol,delay){
  if(!G.soundOn) return;
  try{
    const ctx=ac(),t=ctx.currentTime+(delay||0);
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type||'sine'; o.frequency.value=freq;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(vol||0.05,t+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t+dur+0.03);
  }catch(e){}
}
function beepClick(){ tone(300+Math.random()*90,0.06,'triangle',0.035); }
function beepBuy(){ tone(520,0.08,'square',0.035); tone(700,0.12,'square',0.035,0.06); }
function beepAch(){ tone(880,0.1,'sine',0.05); tone(1174,0.16,'sine',0.05,0.09); }
function beepGolden(){ tone(660,0.09,'sine',0.05); tone(880,0.09,'sine',0.05,0.08); tone(1320,0.16,'sine',0.05,0.16); }
function beepAscend(){ tone(392,0.14,'sawtooth',0.04); tone(523,0.14,'sawtooth',0.04,0.12); tone(659,0.14,'sawtooth',0.04,0.24); tone(784,0.3,'sawtooth',0.05,0.36); }
function toggleSound(){ G.soundOn=!G.soundOn; G.save.sound=G.soundOn; $('btnSound').textContent=G.soundOn?'🔊':'🔇'; saveGame(); }

/* ---------------- ui ---------------- */

function toast(msg,icon){
  const t=document.createElement('div'); t.className='toast';
  t.innerHTML=(icon?'<span>'+escapeHtml(icon)+'</span>':'')+escapeHtml(msg);
  $('toasts').appendChild(t);
  setTimeout(()=>t.remove(),3600);
  while($('toasts').children.length>4) $('toasts').firstChild.remove();
}
function openModal(id){ $(id).classList.remove('hidden'); }
function closeModal(id){ $(id).classList.add('hidden'); }
function setView(v){
  document.body.dataset.view=v;
  document.querySelectorAll('#bottomNav button,#sidebar button').forEach(b=>b.classList.toggle('on',b.dataset.view===v));
  if(v==='quests'){ renderQuestTab(); renderCollection(); renderInventory(); }
  if(v==='chat'&&typeof Chat!=='undefined') Chat.onOpen();
  if(v==='grow') updateEventBanner();
  window.scrollTo(0,0);
}
function switchGrowTab(t){
  document.querySelectorAll('#growTabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
  ['farm','upgrades','ascend','shop'].forEach(x=>$('tab-'+x).classList.toggle('on',x===t));
}
function switchMiniTab(m){
  document.querySelectorAll('#miniTabs button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
  ['suika','whack','roulette'].forEach(x=>$('mini-'+x).classList.toggle('on',x===m));
}

function refreshHud(){
  $('hudName').textContent=G.save.name||'PLAYER';
  $('hudCrystals').textContent=fmt(G.save.crystals);
  $('hudSeeds').textContent=fmt(G.save.seeds);
  $('hudLevel').textContent='Lv'+G.save.level;
  $('hudCrateN').textContent=G.save.inv;
  const r=rankInfo();
  $('hudRankEmoji')&&($('hudRankEmoji').textContent=r.emoji);
}

function updateComboUI(){
  const w=$('comboWrap');
  if(G.combo>=2){ w.style.opacity=1; $('comboCount').textContent='×'+G.combo; }
  else w.style.opacity=0;
}
function comboPulse(){ const w=$('comboWrap'); w.classList.add('pop'); setTimeout(()=>w.classList.remove('pop'),130); }

function updateBoostPill(){
  const p=$('boostPill'),now=Date.now();
  if(now<G.frenzyUntil){ p.style.display='block'; p.textContent='⚡ FRENZY ×7 · '+Math.ceil((G.frenzyUntil-now)/1000)+'s'; }
  else if(now<G.tapUntil){ p.style.display='block'; p.textContent='👆 TAP STORM ×10 · '+Math.ceil((G.tapUntil-now)/1000)+'s'; }
  else p.style.display='none';
}

/* ---------------- buildings ---------------- */

function renderBuildings(){
  const wrap=$('buildings'); wrap.innerHTML=''; G.bldRefs={};
  for(const b of BUILDINGS){
    const card=document.createElement('div'); card.className='bld-card'; card.dataset.id=b.id;
    card.innerHTML='<div class="bld-emoji">'+b.emoji+'</div>'+
      '<div class="bld-info"><div class="bld-name">'+b.name+'</div><div class="bld-sub"></div></div>'+
      '<div class="bld-right"><div class="bld-cost">🍈 <span></span></div><div class="bld-owned">0</div></div>';
    card.addEventListener('click',()=>buyBuilding(b.id));
    wrap.appendChild(card); G.bldRefs[b.id]=card;
  }
  updateBuildings();
}
function updateBuildings(){
  for(const b of BUILDINGS){
    const card=G.bldRefs[b.id]; if(!card) continue;
    const ownedN=G.save.buildings[b.id]||0, n=G.buyMult;
    const cost=buildingCost(b,ownedN,n);
    card.querySelector('.bld-sub').textContent='+'+fmt(buildingRate(b))+'/s each · '+fmt(ownedN)+' owned';
    card.querySelector('.bld-cost span').textContent=fmt(cost);
    card.querySelector('.bld-owned').textContent=fmt(ownedN);
    card.classList.toggle('afford',G.save.melons>=cost);
  }
}
function buyBuilding(id){
  const b=BUILDINGS.find(x=>x.id===id);
  const ownedN=G.save.buildings[id]||0, n=G.buyMult;
  const cost=buildingCost(b,ownedN,n);
  if(G.save.melons<cost) return;
  G.save.melons-=cost;
  G.save.buildings[id]=ownedN+n;
  if(ownedN===0) toast('Bought your first '+b.name+'! '+b.emoji,'🎉');
  beepBuy(); gainXp(5*n); dropCrateChance(0.03*n);
  updateBuildings(); updateStats();
  Leaderboard&&Leaderboard.throttledSubmit&&Leaderboard.throttledSubmit();
}
function setBuyMult(n){ G.buyMult=n; document.querySelectorAll('#buyToggle button').forEach(b=>b.classList.toggle('on',+b.dataset.n===n)); updateBuildings(); }

/* ---------------- upgrades ---------------- */

function renderUpgrades(){
  const wrap=$('tab-upgrades');
  let html='';
  const vis=UPGRADES.filter(u=>u.need());
  if(!vis.length) html='<div class="lb-empty">Buy more farms &amp; tap more to unlock upgrades!</div>';
  vis.forEach(u=>{
    const has=owned(u.id), can=!has&&G.save.melons>=u.cost;
    html+='<div class="up-card'+(has?' bought':can?' afford':'')+'" onclick="buyUpgrade(\''+u.id+'\')">'+
      '<div class="u-emoji">'+(has?'✅':u.emoji)+'</div>'+
      '<div class="u-info"><div class="u-name">'+u.name+'</div><div class="u-desc">'+u.desc+'</div></div>'+
      '<div class="u-cost '+(can?'':'no')+'">'+(has?'OWNED':('🍈 '+fmt(u.cost)))+'</div></div>';
  });
  wrap.innerHTML=html;
}
function buyUpgrade(id){
  const u=UPGRADES.find(x=>x.id===id); if(!u||owned(id)||G.save.melons<u.cost) return;
  G.save.melons-=u.cost; G.save.upgrades.push(id);
  beepBuy(); toast(u.name+' bought! '+u.emoji,'🔧'); gainXp(10);
  reRenderPanels(); updateBuildings(); updateStats();
}

/* ---------------- ascension / prestige ---------------- */

function renderAscend(){
  const wrap=$('tab-ascend');
  const gain=calcSeedGain();
  let html='<div class="ascend-hero">'+
    '<div class="ah-big">🌱 '+fmt(G.save.seeds)+' seeds</div>'+
    '<div class="ah-gain">Ascension grants <b>'+fmt(gain)+'</b> seeds · each +'+(1+level('as1'))+'% production</div>'+
    '<button onclick="openAscendConfirm()">⭐ ASCEND</button>'+
    '<div class="ah-hint">Resets melons, farms &amp; upgrades — keeps seeds, crystals, levels &amp; collection.</div>'+
    '<div class="ah-hint">Prestige skins: ⭐ '+(G.save.ascensions>=3?'unlocked':'3 asc')+' · ✨ 10 asc · 🕳️ 25 asc</div></div>'+
    '<div class="ascend-note">Permanent upgrades — bought with 🌱 seeds:</div>';
  ASC_UP.forEach(a=>{
    const lv=level(a.id), maxed=lv>=a.max;
    const cost=Math.ceil(a.base*Math.pow(a.mult,lv));
    const can=!maxed&&G.save.seeds>=cost;
    html+='<div class="up-card'+(maxed?' bought':can?' afford':'')+'" onclick="buyAsc(\''+a.id+'\')">'+
      '<div class="u-emoji">'+(maxed?'✅':a.emoji)+'</div>'+
      '<div class="u-info"><div class="u-name">'+a.name+' <span class="u-lv">Lv '+(lv>=1?lv:'—')+'/'+a.max+'</span></div>'+
      '<div class="u-desc">'+a.desc+'</div></div>'+
      '<div class="u-cost '+(can?'':'no')+'">'+(maxed?'MAX':'🌱 '+fmt(cost))+'</div></div>';
  });
  wrap.innerHTML=html;
}
function buyAsc(id){
  const a=ASC_UP.find(x=>x.id===id); if(!a) return;
  const lv=level(a.id); if(lv>=a.max) return;
  const cost=Math.ceil(a.base*Math.pow(a.mult,lv));
  if(G.save.seeds<cost) return;
  G.save.seeds-=cost; G.save.asc[id]=lv+1;
  beepBuy(); toast(a.name+' → Lv '+(lv+1)+'! '+a.emoji,'🌱'); gainXp(20);
  reRenderPanels(); updateStats(); Leaderboard&&Leaderboard.throttledSubmit&&Leaderboard.throttledSubmit();
}
function openAscendConfirm(){
  const gain=calcSeedGain();
  if(gain<1){ toast('Keep growing! ~1M melons this run unlocks ascension.','🌱'); return; }
  $('ascGainN').textContent=fmt(gain);
  openModal('veilAscend');
}
function doAscend(){
  const gain=calcSeedGain(); if(gain<1){ closeModal('veilAscend'); return; }
  G.save.seeds+=gain; G.save.totalSeeds+=gain; G.save.ascensions++;
  G.save.melons=0; G.save.runEarned=0; G.save.buildings={}; G.save.upgrades=[]; G.save.totalClicks=0;
  G.combo=0;
  if(level('as7')>0) G.save.buildings.vine=25;
  closeModal('veilAscend');
  beepAscend();
  gainXp(100+gain);
  toast('⭐ ASCENDED! +'+fmt(gain)+' seeds!','🌱');
  const newSkin=SKINS.find(s=>s.asc===G.save.ascensions);
  if(newSkin&&!G.save.skins.includes(newSkin.id)){ G.save.skins.push(newSkin.id); toast('PRESTIGE SKIN UNLOCKED: '+newSkin.name+' '+newSkin.emoji,'👑'); }
  saveGame(); renderAll();
  Leaderboard&&Leaderboard.onNameChange&&Leaderboard.onNameChange();
}

/* ---------------- shop (boosters + skins) ---------------- */

function renderShop(){
  const wrap=$('tab-shop');
  let html='<div class="ascend-note">Buy permanent boosts with 💎 crystals (no reset needed!):</div>';
  SHOP.forEach(s=>{
    const lv=shopLvl(s.id), maxed=lv>=s.max;
    const cost=Math.ceil(s.base*Math.pow(s.mult,lv));
    const can=!maxed&&G.save.crystals>=cost;
    let desc=s.desc;
    if(s.id==='sh1') desc='+'+lv+' auto taps/sec';
    if(s.id==='sh2') desc='+'+lv+' ×2 production (×'+fmt(Math.pow(2,lv))+')';
    if(s.id==='sh3') desc='+'+(lv*4)+'h offline cap';
    if(s.id==='sh4') desc='golden melons ×'+fmt(Math.pow(2,lv))+' more often';
    if(s.id==='sh5') desc='+'+Math.round(lv*50)+'% golden rewards';
    if(s.id==='sh6') desc='+'+lv+'s combo window · +'+(lv*5)+' max combo';
    html+='<div class="up-card'+(maxed?' bought':can?' afford':'')+'" onclick="buyShop(\''+s.id+'\')">'+
      '<div class="u-emoji">'+(maxed?'✅':s.emoji)+'</div>'+
      '<div class="u-info"><div class="u-name">'+s.name+' <span class="u-lv">Lv '+lv+'/'+s.max+'</span></div>'+
      '<div class="u-desc">'+desc+'</div></div>'+
      '<div class="u-cost '+(can?'':'no')+'">'+(maxed?'MAX':'💎 '+fmt(cost))+'</div></div>';
  });
  html+='<div class="ascend-note">🎨 Skins — your melon &amp; avatar. Buying updates your balance on the live board:</div>';
  SKINS.forEach(s=>{
    const ownedSkin=G.save.skins.includes(s.id), active=G.save.skin===s.id;
    const lvlOK=G.save.level>=s.lvl, ascOK=G.save.ascensions>=s.asc;
    const can=!ownedSkin&&G.save.crystals>=s.price&&lvlOK&&ascOK;
    let tag='';
    if(s.lvl>0&&!lvlOK) tag='<div class="u-desc">Requires Level '+s.lvl+'</div>';
    if(s.asc>0&&!ascOK) tag='<div class="u-desc">Prestige reward — ascend '+s.asc+'×</div>';
    if(s.price===0&&s.asc>0&&ascOK) tag='<div class="u-desc">Prestige reward (free)!</div>';
    html+='<div class="up-card'+(active?' bought':can?' afford':'')+'" onclick="buySkin(\''+s.id+'\')">'+
      '<div class="u-emoji">'+s.emoji+'</div>'+
      '<div class="u-info"><div class="u-name">'+s.name+(active?' <span class="u-lv">EQUIPPED</span>':'')+'</div>'+
      '<div class="u-desc">'+tag+(s.price>0?('Cost '+s.price+' 💎'):'')+'</div></div>'+
      '<div class="u-cost '+(can?'':'no')+'">'+(active?'✓':ownedSkin?'OWNED':(s.price>0?('💎 '+fmt(s.price)):'FREE'))+'</div></div>';
  });
  wrap.innerHTML=html;
}
function buyShop(id){
  const s=SHOP.find(x=>x.id===id); if(!s) return;
  const lv=shopLvl(s.id); if(lv>=s.max) return;
  const cost=Math.ceil(s.base*Math.pow(s.mult,lv));
  if(G.save.crystals<cost) return;
  G.save.crystals-=cost; G.save.shop[id]=lv+1;
  beepBuy(); toast(s.name+' → Lv '+(lv+1)+'! '+s.emoji,'💎'); gainXp(10);
  reRenderPanels(); updateStats(); refreshHud();
  Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
}
function buySkin(id){
  const s=SKINS.find(x=>x.id===id); if(!s) return;
  if(G.save.skins.includes(id)){ G.save.skin=id; applySkin(); renderShop(); refreshHud(); toast(s.name+' equipped! '+s.emoji,'🎨'); return; }
  if(G.save.level<s.lvl){ toast('Need Level '+s.lvl+' to unlock this skin!','🎓'); return; }
  if(G.save.ascensions<s.asc){ toast('Prestige reward — ascend '+s.asc+'× to unlock!','⭐'); return; }
  if(G.save.crystals<s.price){ toast('Need '+s.price+' 💎 for this skin!','💎'); return; }
  G.save.crystals-=s.price; G.save.skins.push(id); G.save.skin=id;
  applySkin(); renderShop(); refreshHud();
  beepGolden(); toast(s.name+' bought & equipped! '+s.emoji,'🎨');
  saveGame(); checkAchievements();
  Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
}
function applySkin(){
  document.body.className=document.body.className.replace(/\bskin-\S+/g,'').trim();
  const s=SKINS.find(x=>x.id===G.save.skin)||SKINS[0];
  document.body.classList.add('skin-'+s.id);
  const av=$('hudAvatar'); if(av) av.textContent=s.emoji;
}

/* ---------------- achievements / daily / rank ---------------- */

function renderAchievements(){
  const grid=$('achGrid');
  const unlocked=G.save.ach.length;
  if(unlocked!==G.achCount){
    G.achCount=unlocked;
    let html='';
    ACH.forEach(a=>{
      const has=G.save.ach.includes(a.id);
      html+='<div class="ach-item'+(has?' unlocked':'')+'">'+
        '<div class="a-emoji">'+a.e+'</div>'+
        '<div class="a-info"><div class="a-name">'+a.n+'</div><div class="a-desc">'+a.d+'</div></div>'+
        '<div class="a-give">'+(has?('+'+a.g+' 💎'):'🔒')+'</div></div>';
    });
    grid.innerHTML=html;
  }
}
function checkAchievements(){
  let any=false;
  for(const a of ACH){
    if(G.save.ach.includes(a.id)) continue;
    if(a.need()){
      G.save.ach.push(a.id); G.save.crystals+=a.g;
      toast(a.n+' unlocked! +'+a.g+' 💎','🏆');
      beepAch(); any=true;
    }
  }
  if(any){ refreshHud(); Leaderboard&&Leaderboard.throttledSubmit&&Leaderboard.throttledSubmit(); }
}
function renderRankCard(){
  const r=rankInfo();
  $('rankIcon').textContent=r.emoji;
  $('rankTitle').textContent=r.name+' · Lv '+G.save.level;
  $('rankBar').style.width=xpPct()+'%';
  $('rankNext').textContent='Lv '+(G.save.level+1)+' · '+fmt(xpNeed(G.save.level)-G.save.xp)+' xp to go';
}
function renderDaily(){
  const btn=$('dailyBtn');
  if(btn){
    if(G.save.dailyClaimed){ btn.textContent='DONE'; btn.classList.add('done'); $('dailySub').textContent='Streak: day '+G.save.dailyStreak+' · come back tomorrow!'; }
    else{ btn.classList.remove('done'); btn.textContent='CLAIM'; $('dailySub').textContent='Day '+G.save.dailyStreak+' streak — free crystals!'; }
  }
}
function checkDaily(){
  const today=new Date(), ds=today.toDateString();
  if(G.save.lastDaily!==ds){
    const yest=new Date(today); yest.setDate(yest.getDate()-1);
    G.save.dailyStreak=(G.save.lastDaily===yest.toDateString())?G.save.dailyStreak+1:1;
    G.save.dailyClaimed=false;
    rollDailyQuests();
  }
  renderDaily();
}
function rollDailyQuests(){
  const pool=[...DQ];
  const pick=[];
  while(pick.length<4&&pool.length){ const i=Math.floor(Math.random()*pool.length); pick.push(pool.splice(i,1)[0]); }
  G.save.dqIds=pick.map(q=>q.id);
  G.save.dqProg={}; G.save.dqDone=[];
  G.save.dqBase={ grow:G.save.lifetimeEarned, combo:G.save.maxCombo, golden:G.save.goldenClicks, crates:G.save.cratesOpened, suika:G.save.suika.games, whack:G.save.whack.games, buy:0, tap:0 };
  G.save.dqDay=new Date().toDateString();
  renderQuestTab();
}
function claimDaily(){
  if(G.save.dailyClaimed) return;
  G.save.lastDaily=new Date().toDateString(); G.save.dailyClaimed=true;
  const c=Math.min(4+G.save.dailyStreak,25);
  G.save.crystals+=c; gainXp(25);
  $('dailyMsg').innerHTML='<b>Day '+G.save.dailyStreak+'</b> streak!<br>You earned <b>+'+c+' 💎</b> crystals!';
  openModal('veilDaily');
  toast('+'+c+' 💎 daily reward!','🎁');
  beepAch(); refreshHud(); renderDaily(); checkAchievements();
  Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
}
function checkOffline(){
  const dt=(Date.now()-G.save.lastOnline)/1000;
  if(dt>120){
    const cap=(8+4*shopLvl('sh3'))*3600;
    const offSec=Math.min(dt,cap);
    const earned=effectivePerSec()*offSec*Math.pow(2,level('as5'));
    addMelons(earned);
    G.save.offlineEarns=(G.save.offlineEarns||0)+1;
    $('offlineMsg').innerHTML='You were away for <b>'+fmtDur(offSec)+'</b>.<br>Your melons kept growing and produced <b>'+fmt(earned)+' 🍈</b>!';
    openModal('veilOffline');
    checkAchievements();
  }
}

/* ---------------- quests ---------------- */

function dqProgress(id){
  const q=DQ.find(x=>x.id===id); if(!q) return 0;
  if(id==='d_tap') return G.save.totalClicks-(G.save.dqBase.tap||0);
  if(id==='d_buy') return Math.floor(totalBuildings()-(G.save.dqBase.buy||0));
  if(id==='d_grow') return Math.floor(G.save.lifetimeEarned-(G.save.dqBase.grow||0));
  if(id==='d_combo') return Math.max(0,(G.save.maxCombo||0)-(G.save.dqBase.combo||0));
  if(id==='d_golden') return G.save.goldenClicks-(G.save.dqBase.golden||0);
  if(id==='d_crate') return G.save.cratesOpened-(G.save.dqBase.crates||0);
  if(id==='d_suika') return G.save.suika.games-(G.save.dqBase.suika||0);
  if(id==='d_whack') return G.save.whack.games-(G.save.dqBase.whack||0);
  return 0;
}
function renderQuestTab(){
  if(document.body.dataset.view!=='quests') return;
  const qr=$('questReset');
  if(qr){ const now=new Date(); const mid=new Date(now); mid.setHours(24,0,0,0); qr.textContent='reset in '+fmtDur((mid-now)/1000); }
  const dw=$('dailyQuests');
  if(dw){
    if(G.save.dqIds.length){
      let html='';
      G.save.dqIds.forEach(id=>{
        const q=DQ.find(x=>x.id===id); if(!q) return;
        const p=dqProgress(id), done=G.save.dqDone.includes(id), claim=p>=q.goal&&!done;
        const pct=clamp(p/q.goal*100,0,100);
        html+='<div class="quest-card'+(done?' done':'')+'">'+
          '<div class="q-emoji">'+q.e+'</div>'+
          '<div class="q-info"><div class="q-name">'+q.n+'</div>'+
          '<div class="q-desc">'+q.t+' <b>'+fmt(Math.min(p,q.goal))+'/'+fmt(q.goal)+'</b>'+q.unit+'</div>'+
          '<div class="q-bar"><div style="width:'+pct+'%"></div></div></div>'+
          (claim?'<button class="q-claim-btn" onclick="claimDailyQuest(\''+q.id+'\')">CLAIM</button>':
          '<div class="q-reward">+2 💎<br>+30 xp</div>')+'</div>';
      });
      dw.innerHTML=html;
    }else dw.innerHTML='<div class="lb-empty">Daily quests roll at midnight 🌙</div>';
  }
  const sw=$('storyQuests');
  if(sw){
    let html='';
    QUESTS.forEach(q=>{
      const done=G.save.quests[q.id], can=!done&&q.need();
      html+='<div class="quest-card'+(done?' done':'')+'" '+(can?'onclick="claimQuest(\''+q.id+'\')"':'')+'>'+
        '<div class="q-emoji">'+(done?'✅':q.e)+'</div>'+
        '<div class="q-info"><div class="q-name">'+q.n+'</div><div class="q-desc">'+q.d+'</div></div>'+
        (can?'<button class="q-claim-btn">CLAIM</button>':'<div class="q-reward">+'+q.cry+' 💎<br>+'+q.xp+' xp</div>')+'</div>';
    });
    sw.innerHTML=html;
  }
}
function claimQuest(id){
  const q=QUESTS.find(x=>x.id===id); if(!q||G.save.quests[id]||!q.need()) return;
  G.save.quests[id]=true; G.save.crystals+=q.cry; gainXp(q.xp);
  toast(q.n+' complete! +'+q.cry+' 💎','🌟');
  beepAch(); renderQuestTab(); refreshHud(); checkAchievements();
  Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
}
function claimDailyQuest(id){
  const q=DQ.find(x=>x.id===id); if(!q||G.save.dqDone.includes(id)||dqProgress(id)<q.goal) return;
  G.save.dqDone.push(id); G.save.crystals+=2; gainXp(30);
  toast(q.n+' complete! +2 💎','🗓️');
  beepAch(); renderQuestTab(); refreshHud();
  Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
}

/* ---------------- golden melon ---------------- */

function scheduleGolden(delay){
  clearTimeout(G.goldTimer);
  const evtGold=G.evt&&G.evt.id==='gold';
  const freq=Math.pow(2,level('as6')+shopLvl('sh4'));
  const base=evtGold?12000:((150+Math.random()*210)*1000)/freq;
  const t=(delay!==undefined)?delay:base;
  G.goldTimer=setTimeout(spawnGolden,t);
}
function spawnGolden(){
  if(G.goldenBusy){ scheduleGolden(20000); return; }
  G.goldenBusy=true;
  const el=$('goldenMelon');
  const pad=16,w=innerWidth-pad*2-84,h=innerHeight-160;
  el.style.left=(pad+Math.random()*Math.max(10,w))+'px';
  el.style.top=(Math.max(70,innerHeight*0.15)+Math.random()*Math.max(50,h))+'px';
  el.classList.remove('hidden');
  G.goldTimer=setTimeout(()=>{ el.classList.add('hidden'); G.goldenBusy=false; scheduleGolden(); },12000);
}
function clickGolden(){
  const el=$('goldenMelon');
  el.classList.add('hidden'); clearTimeout(G.goldTimer); G.goldenBusy=false;
  G.save.goldenClicks++;
  const val=Math.pow(1.5,shopLvl('sh5')), per=effectivePerSec();
  const cryEvt=(G.evt&&G.evt.id==='crystal');
  const r=Math.random(); let msg='';
  if(r<0.30){
    const amt=777*per*val; addMelons(amt); msg='🍀 LUCKY! +'+fmt(amt)+' melons!';
  }else if(r<0.52){
    G.frenzyUntil=Date.now()+30000; msg='⚡ FRENZY! ×7 production for 30s!';
  }else if(r<0.70){
    const c=Math.max(1,Math.round(val*(1+Math.random()*4)))+(cryEvt?3:0);
    G.save.crystals+=c; msg='🎁 JACKPOT! +'+c+' 💎!';
  }else if(r<0.85){
    G.tapUntil=Date.now()+30000; msg='👆 TAP STORM! ×10 tap power!';
  }else{
    const amt=per*3600*val; addMelons(amt); msg='🕐 TIME WARP! +1h of growth ('+fmt(amt)+')!';
  }
  if(cryEvt) G.save.crystals+=1+Math.floor(Math.random()*3);
  if(Math.random()<0.25){ dropCrate(1); }
  const gp=document.createElement('div'); gp.className='golden-pop'; gp.textContent='🍈';
  gp.style.left=(el.offsetLeft+24)+'px'; gp.style.top=(el.offsetTop+12)+'px';
  document.body.appendChild(gp); setTimeout(()=>gp.remove(),700);
  toast(msg,'🍈'); beepGolden(); refreshHud(); checkAchievements(); scheduleGolden();
  Leaderboard&&Leaderboard.throttledSubmit&&Leaderboard.throttledSubmit();
}

/* ---------------- crates / collection ---------------- */

function dropCrate(n){
  if(n<=0) return;
  G.save.inv+=n;
  toast('You found '+(n>1?n+' ':'a ')+'crate'+(n>1?'s':'')+'! 📦','🎁');
  $('hudCrateN').textContent=G.save.inv;
  const btn=$('openCrateBtn'); if(btn) btn.textContent='Open a crate ('+G.save.inv+')';
}
function dropCrateChance(p){
  if(Math.random()<p) dropCrate(1);
}
function pickItem(){
  let roll=Math.random()*100, acc=0, chosen=null;
  for(const key of Object.keys(RARITY)){ acc+=RARITY[key].w; if(roll<acc){ chosen=key; break; } }
  if(!chosen) chosen='common';
  const pool=ITEMS.filter(i=>i.r===chosen);
  return pool[Math.floor(Math.random()*pool.length)];
}
function openCrate(){
  const btn=$('openCrateBtn');
  if(G.save.inv<=0){ toast('No crates yet! Keep tapping.','📦'); return; }
  G.save.inv--; G.save.cratesOpened++;
  if(btn) btn.textContent='Open a crate ('+G.save.inv+')';
  const item=pickItem(), rar=RARITY[item.r];
  const had=G.save.coll[item.id];
  if(had){ G.save.coll[item.id]=had+1; G.save.crystals+=rar.v; }
  else G.save.coll[item.id]=1;
  $('crateEmoji').textContent=item.e;
  $('crateName').textContent=(had?'Duplicate: ':'NEW! ')+item.n;
  $('crateMsg').innerHTML=('<span style="color:'+rar.c+'">'+item.r.toUpperCase()+'</span> item!'+(had?'<br>Converted to <b>+'+rar.v+' 💎</b> because you already own it.':'<br>Added to your collection!'+(rar.w<=6?'<br><b>SUPER RARE!</b>':'')+(item.r==='legendary'?'<br><b>LEGENDARY DROP!</b>':'')).replace(/</g,'<'));
  $('crateAgain').style.display=G.save.inv>0?'':'none';
  openModal('veilCrate');
  beepAch(); refreshHud(); gainXp(5);
  renderCollection(); renderInventory(); checkAchievements();
  Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
}
function renderCollection(){
  const grid=$('collectionGrid');
  if(!grid||document.body.dataset.view!=='quests') return;
  const foundN=Object.keys(G.save.coll).length;
  $('collCount').textContent=foundN+'/'+ITEMS.length+' found';
  let html='';
  ITEMS.forEach(i=>{
    const n=G.save.coll[i.id]||0;
    const c=RARITY[i.r].c;
    html+='<div class="coll-item'+(n>0?' found':' locked')+'" style="'+(n>0?('--rarity:'+c+';--rarity-bg:'+c+'22'):'')+'">'+
      '<div class="c-emoji">'+(n>0?i.e:'❓')+'</div>'+
      '<div class="c-name">'+(n>0?i.n:'???')+'</div>'+
      '<div class="c-count" style="color:'+c+'">'+(n>0?('×'+n+' · '+i.r):i.r)+'</div></div>';
  });
  grid.innerHTML=html;
}
function renderInventory(){
  const list=$('invList');
  if(!list||document.body.dataset.view!=='quests') return;
  const btn=$('openCrateBtn');
  if(btn) btn.textContent='Open a crate ('+G.save.inv+')';
  const recent=G.save.recentDrops||[];
  if(!recent.length&&!G.save.inv){ list.innerHTML='<div class="lb-empty">No crates yet — they drop from clicks, buys &amp; mini games!</div>'; return; }
  list.innerHTML='<div class="inv-row"><div class="i-emoji">📦</div><div class="i-name">Crates ready to open</div><div class="i-val">×'+G.save.inv+'</div></div>';
}

/* ---------------- mini game bridges ---------------- */

function miniRewardMult(){ return (G.evt&&G.evt.id==='fruit')?3:1; }
window.suikaIdleFinish=function(score,stats){
  stats=stats||{merges:0,watermelons:0,bestTier:0};
  G.save.suika.games++;
  if(score>G.save.suika.best) G.save.suika.best=score;
  G.save.suika.merges+=stats.merges;
  if(stats.watermelons>0) G.save.suika.watermelons=(G.save.suika.watermelons||0)+stats.watermelons;
  const boost=G.save.suika.suikaBoost?2:1;
  G.save.suika.suikaBoost=false;
  const mult=miniRewardMult()*boost;
  const m=Math.floor(score*25*mult);
  addMelons(m); gainXp(Math.floor(score/2*mult));
  let cry=0;
  if(score>=2000) cry+=5;
  if(stats.watermelons>0) cry+=25*stats.watermelons;
  let drops=0;
  if(stats.watermelons>0){ dropCrate(stats.watermelons); drops+=stats.watermelons; }
  if(score>=1000){ dropCrate(1); drops++; }
  G.save.crystals+=cry;
  window.suikaIdleRewardText='+'+fmt(m)+' 🍈 · +'+cry+' 💎'+(drops?(' · '+drops+' 📦'):'');
  toast('Suika run: +'+fmt(m)+' melons'+(cry?' +'+cry+' 💎':'')+'!','🍉');
  refreshHud(); checkAchievements(); checkQuests(true);
  Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
};
function whackFinish(score){
  G.save.whack.games++;
  if(score>G.save.whack.best) G.save.whack.best=score;
  const mult=miniRewardMult();
  const m=Math.floor(score*10*mult);
  addMelons(m); gainXp(Math.floor(score/3*mult));
  if(score>=100) dropCrate(1);
  toast('Whack run: +'+fmt(m)+' melons!','🔨');
  refreshHud(); checkAchievements(); checkQuests(true);
  Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
}

/* ---------------- roulette ---------------- */

const ROULETTE_SEGS=[
  {l:'100💎',w:2,pay:100},{l:'25💎',w:8,pay:25},{l:'10💎',w:20,pay:10},
  {l:'5💎',w:25,pay:5},{l:'🍉×2',w:15,pay:0,boost:true},{l:'0',w:30,pay:0}
];
let rouletteRotation=0,rouletteBusy=false;
function initRoulette(){
  const wheel=$('rouletteWheel');
  if(!wheel) return;
  const n=ROULETTE_SEGS.length, step=360/n;
  let con=[];
  ROULETTE_SEGS.forEach((s,i)=>{
    const c=i%2?['#2f8f3a','#17602a']:['#3fce6a','#1f8f46'];
    con.push(s.l+' '+(i*step)+'deg '+((i+1)*step)+'deg');
  });
  wheel.style.background='conic-gradient('+con.join(',')+')';
  wheel.style.setProperty('--segs',n);
}
function spinRoulette(){
  if(rouletteBusy) return;
  if(G.save.crystals<10){ toast('Need 10 💎 to spin!','💎'); return; }
  G.save.crystals-=10; G.save.roulette.spins++;
  refreshHud(); rouletteBusy=true;
  const r=Math.random(); let acc=0,idx=0;
  for(let i=0;i<ROULETTE_SEGS.length;i++){ acc+=ROULETTE_SEGS[i].w; if(r<acc/100){ idx=i; break; } }
  const seg=ROULETTE_SEGS[idx];
  const step=360/ROULETTE_SEGS.length;
  rouletteRotation+=360*6+(360-(idx*step+step/2));
  const wheel=$('rouletteWheel');
  wheel.style.transform='rotate('+rouletteRotation+'deg)';
  $('rouletteResult').textContent='Spinning…';
  setTimeout(()=>{
    if(seg.boost){ G.save.suika.suikaBoost=true; $('rouletteResult').textContent='🍉 Suika Boost! Next run ×2!'; toast('Suika Boost! Next run ×2!','🍉'); }
    else if(seg.pay>0){
      G.save.crystals+=seg.pay; G.save.roulette.wins++;
      $('rouletteResult').textContent='+'+seg.pay+' 💎!'; toast('Roulette win: +'+seg.pay+' 💎!','🎡');
    }else{ $('rouletteResult').textContent='RIP — nothing! 🫠'; toast('Roulette: nothing! 🫠','🎡'); }
    refreshHud(); rouletteBusy=false; beepAch();
    Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
  },3400);
}

/* ---------------- global events ---------------- */

function Events(){
  const URL='https://mantledb.sh/v2/suikaver/event';
  let lastCheck=0;
  async function poll(){
    try{
      const r=await fetch(URL,{cache:'no-store'});
      if(!r.ok) return;
      const data=await r.json();
      const now=Date.now();
      if(data&&data.id&&data.ends>now){
        if(!G.evt||G.evt.id!==data.id){
          const ev=EVENTS.find(e=>e.id===data.id);
          if(ev){ toast(ev.n+' started — '+ev.d,ev.e); beepGolden(); }
        }
        G.evt={id:data.id,ends:data.ends,started:data.starts};
        G.save.lastEventEnd=data.ends;
      }else{
        if(G.evt) toast('The event has ended!','🌙');
        G.evt=null;
        maybeStart(data,now);
      }
      updateEventBanner();
    }catch(e){}
  }
  function maybeStart(data,now){
    if(G.save.name==='') return;
    const lastEnd=data&&data.lastEnd?data.lastEnd:G.save.lastEventEnd||0;
    if(now-lastEnd<6*60000) return;
    if(Math.random()>0.35) return;
    const ev=EVENTS[Math.floor(Math.random()*EVENTS.length)];
    const dur=(3+Math.random()*3)*60000;
    const payload={id:ev.id,starts:now,ends:now+dur,lastEnd:now+dur};
    G.evt={id:ev.id,ends:now+dur,started:now};
    G.save.lastEventEnd=now+dur;
    toast(ev.n+' started — '+ev.d,ev.e);
    updateEventBanner();
    fetch(URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(()=>{});
  }
  function tick(){
    if(Date.now()-lastCheck>30000){ lastCheck=Date.now(); poll(); }
  }
  function init(){ lastCheck=0; poll(); }
  return {init,tick};
}
const EVENTS_API=Events();

function updateEventBanner(){
  const b=$('eventBanner');
  if(!b) return;
  if(G.evt&&G.evt.ends>Date.now()){
    const ev=EVENTS.find(e=>e.id===G.evt.id);
    b.classList.remove('hidden');
    $('eventText').textContent=ev?(ev.e+' '+ev.n+' — '+ev.d):'EVENT!';
    $('eventTimer').textContent=fmtDur((G.evt.ends-Date.now())/1000);
  }else{ b.classList.add('hidden'); G.evt=null; }
}
function collectEventReward(){
  if(!G.evt) return;
  if(G.save.eventClaimed===G.evt.id){ toast('Already claimed — enjoy the buff!','🎉'); return; }
  G.save.eventClaimed=G.evt.id;
  const c=5+Math.floor(Math.random()*11);
  G.save.crystals+=c; gainXp(20);
  toast('Event reward: +'+c+' 💎!','🌟');
  refreshHud(); beepAch();
  Leaderboard&&Leaderboard.bump&&Leaderboard.bump();
}

/* ---------------- name / boot ---------------- */

function openNameModal(){ $('nameInput').value=G.save.name||''; openModal('veilName'); setTimeout(()=>$('nameInput').focus(),60); }
function submitName(){
  const v=($('nameInput').value.trim()||'MelonFarmer').slice(0,16);
  G.save.name=v; $('hudName').textContent=v;
  closeModal('veilName');
  toast('Welcome, '+v+'! Tap the watermelon! 🍉');
  refreshHud();
  if(booted){ if(typeof Leaderboard!=='undefined') Leaderboard.onNameChange(); if(typeof Chat!=='undefined') Chat.onOpen(); }
  else postBoot();
}
function resetGame(){
  if(confirm('Reset ALL progress and remove your leaderboard entry?')){
    localStorage.removeItem('suikaver_save'); localStorage.removeItem('meloverse_save'); location.reload();
  }
}

let booted=false;
function postBoot(){
  if(booted) return;
  if(!G.save.name){ openNameModal(); return; }
  booted=true;
  Leaderboard.init();
  EVENTS_API.init();
  Chat.init&&Chat.init();
  checkOffline();
  checkDaily();
}

/* ---------------- particles ---------------- */

function spawnFloatingNum(x,y,text){
  const el=document.createElement('div');
  el.className='floating-num'; el.textContent=text;
  el.style.left=(x+(-34+Math.random()*68))+'px';
  el.style.top=(y-24)+'px';
  document.body.appendChild(el); setTimeout(()=>el.remove(),900);
}
function spawnJuice(x,y){
  for(let i=0;i<8;i++){
    const el=document.createElement('div'); el.className='juice';
    el.style.left=x+'px'; el.style.top=y+'px';
    el.style.setProperty('--jx',(-70+Math.random()*140)+'px');
    el.style.setProperty('--jy',(-95+Math.random()*40)+'px');
    el.style.width=el.style.height=(3+Math.random()*9)+'px';
    document.body.appendChild(el); setTimeout(()=>el.remove(),620);
  }
}

/* ---------------- starfield ---------------- */

function initSpace(){
  const cv=$('space'),ctx=cv.getContext('2d');
  const stars=[],N=140;
  function resize(){ cv.width=innerWidth; cv.height=innerHeight; }
  resize(); addEventListener('resize',resize);
  for(let i=0;i<N;i++) stars.push({x:Math.random(),y:Math.random(),r:Math.random()*1.6+0.3,a:Math.random()*Math.PI*2,sp:0.004+Math.random()*0.02});
  (function draw(){
    ctx.clearRect(0,0,cv.width,cv.height);
    for(const s of stars){
      s.a+=s.sp;
      ctx.globalAlpha=0.15+((Math.sin(s.a)+1)/2)*0.85;
      ctx.fillStyle='#ffffff';
      ctx.beginPath(); ctx.arc(s.x*cv.width,s.y*cv.height,s.r,0,7); ctx.fill();
    }
    ctx.globalAlpha=1;
    requestAnimationFrame(draw);
  })();
}

/* ---------------- click handlers ---------------- */

function onMelonClick(x,y){
  const now=Date.now();
  const winMs=3000+shopLvl('sh6')*1000;
  if(now<=G.comboUntil&&G.combo>0){ G.combo=Math.min(G.combo+1,G.comboMax); }
  else G.combo=1;
  G.comboMax=10+shopLvl('sh6')*5;
  G.comboUntil=now+winMs;
  G.save.maxCombo=Math.max(G.save.maxCombo||0,G.combo);
  const pow=clickPower();
  addMelons(pow);
  G.save.totalClicks++;
  gainXp(1);
  $('melonCount').textContent=fmt(G.save.melons);
  spawnFloatingNum(x,y,'+'+fmt(pow));
  spawnJuice(x,y);
  comboPulse(); beepClick();
  const el=$('melonBtn'); el.classList.add('press'); setTimeout(()=>el.classList.remove('press'),90);
  G.clickCryCounter++;
  if(G.evt&&G.evt.id==='crystal'&&G.clickCryCounter%30===0){ G.save.crystals++; refreshHud(); spawnFloatingNum(x,y-30,'+1 💎'); }
  dropCrateChance(0.004);
  if(G.tick%10===0) checkQuests(false);
}

function checkQuests(silent){
  const day=new Date().toDateString();
  if(G.save.dqDay!==day){ checkDaily(); }
  renderQuestTab();
  if(!silent){ for(const q of QUESTS){ if(!G.save.quests[q.id]&&q.need()){ renderQuestTab(); } } }
}

function updateStats(){
  $('melonCount').textContent=fmt(G.save.melons);
  $('perSec').textContent=fmt(effectivePerSec());
  $('perClick').textContent=fmt(clickPower(false));
  updateComboUI(); updateBoostPill(); updateBuildings(); refreshHud();
}
function renderAll(){
  renderBuildings(); renderUpgrades(); renderAscend(); renderShop();
  renderAchievements(); renderRankCard(); renderDaily(); updateStats();
  renderQuestTab(); renderCollection(); renderInventory();
  checkAchievements();
}
function reRenderPanels(){
  renderUpgrades(); renderAscend(); renderShop();
}

/* ---------------- whack-a-melon ---------------- */

let whackRun=false,whackTimer=null,whackInterval=null,whackScore=0,whackEnd=0;
function initWhack(){
  const grid=$('whackGrid');
  if(!grid) return;
  grid.innerHTML='';
  for(let i=0;i<9;i++){
    const cell=document.createElement('div');
    cell.className='whack-cell';
    cell.dataset.i=i;
    cell.addEventListener('pointerdown',e=>{ e.preventDefault(); whackHit(i,cell); });
    grid.appendChild(cell);
  }
  $('whackStart').addEventListener('click',()=>{
    if(whackRun) return;
    whackRun=true; whackScore=0; whackEnd=Date.now()+15000;
    $('whackScore').textContent='0'; $('whackStart').textContent='GO!';
    whackInterval=setInterval(whackSpawn,620);
    whackTimer=setInterval(()=>{
      const left=Math.max(0,Math.ceil((whackEnd-Date.now())/1000));
      $('whackTimer').textContent=left+'s';
      if(left<=0) whackEndGame();
    },200);
  });
}
function whackSpawn(){
  const cells=document.querySelectorAll('.whack-cell');
  const idx=Math.floor(Math.random()*cells.length);
  const cell=cells[idx];
  if(cell.querySelector('.wm-emoji')) return;
  const gold=Math.random()<0.16;
  const el=document.createElement('div');
  el.className='wm-emoji';
  el.textContent=gold?'🥇':'🍈';
  el.dataset.gold=gold?'1':'0';
  cell.appendChild(el);
  const life=gold?900:1200;
  setTimeout(()=>{ if(el.parentNode) el.remove(); },life);
}
function whackHit(i,cell){
  if(!whackRun) return;
  const el=cell.querySelector('.wm-emoji');
  if(!el) return;
  const gold=el.dataset.gold==='1';
  whackScore+=gold?5:1;
  $('whackScore').textContent=whackScore;
  cell.classList.add('smash');
  setTimeout(()=>cell.classList.remove('smash'),140);
  spawnJuice(cell.offsetLeft+cell.offsetWidth/2,cell.offsetTop+cell.offsetHeight/2);
  beepClick();
  el.remove();
}
function whackEndGame(){
  if(!whackRun) return;
  whackRun=false;
  clearInterval(whackInterval); clearInterval(whackTimer);
  document.querySelectorAll('.whack-cell .wm-emoji').forEach(el=>el.remove());
  $('whackStart').textContent='Start!';
  $('whackTimer').textContent='15s';
  whackFinish(whackScore);
}

/* ---------------- main loop ---------------- */

function tick(){
  const now=Date.now(), dt=(now-G.last)/1000; G.last=now;
  const per=effectivePerSec();
  if(per>0) addMelons(per*dt);
  gainXp(Math.max(0,Math.log10(1+per)*2*dt));
  if(G.combo>0&&now>G.comboUntil){ G.combo=0; updateComboUI(); }
  G.tick++;
  if(G.tick%5===0) updateStats();
  if(G.tick%20===0){ checkAchievements(); renderAchievements(); renderRankCard(); checkQuests(true); }
  if(G.tick%100===0) reRenderPanels();
  if(G.tick%100===0){ if(typeof Leaderboard!=='undefined') Leaderboard.throttledSubmit(); }
  if(G.tick%200===0) saveGame();
  if(G.tick%10===0) updateEventBanner();
  EVENTS_API.tick();
}

function bindEvents(){
  const mb=$('melonBtn');
  let lastPt={x:innerWidth/2,y:innerHeight/3}, holdTimer=null;
  mb.addEventListener('pointerdown',e=>{
    e.preventDefault();
    lastPt={x:e.clientX,y:e.clientY};
    onMelonClick(e.clientX,e.clientY);
    clearInterval(holdTimer);
    holdTimer=setInterval(()=>onMelonClick(lastPt.x,lastPt.y),150);
  });
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>mb.addEventListener(ev,()=>clearInterval(holdTimer)));
  mb.addEventListener('contextmenu',e=>e.preventDefault());

  $('goldenMelon').addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); clickGolden(); });

  $('buyToggle').addEventListener('click',e=>{
    const t=e.target.closest('button'); if(t) setBuyMult(+t.dataset.n);
  });
  $('growTabs').addEventListener('click',e=>{
    const t=e.target.closest('button'); if(t) switchGrowTab(t.dataset.tab);
  });
  $('miniTabs').addEventListener('click',e=>{
    const t=e.target.closest('button'); if(t) switchMiniTab(t.dataset.m);
  });
  document.addEventListener('keydown',e=>{
    if(e.code==='Space'&&!(e.target.matches&&e.target.matches('input,button,textarea'))){ e.preventDefault(); onMelonClick(innerWidth/2,innerHeight/3); }
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){ saveGame(); if(typeof Leaderboard!=='undefined') Leaderboard.submit(); }
  });
  window.addEventListener('beforeunload',()=>{ saveGame(); if(typeof Leaderboard!=='undefined') Leaderboard.submit(); });
}

function startGame(){
  loadGame();
  initSpace();
  bindEvents();
  initRoulette();
  initWhack();
  renderAll();
  scheduleGolden(25000);
  postBoot();
  setInterval(tick,100);
}
document.addEventListener('DOMContentLoaded',startGame);

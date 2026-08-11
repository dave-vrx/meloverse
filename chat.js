'use strict';
/* ============================================================
   SUIKAVERSE — global chat
   Free, no-login cloud chat via MantleDB. Polls every 5s.
   Messages show player name, level and skin avatar.
   Made by Dave-VR
   ============================================================ */

const Chat = (()=>{
  const URL='https://mantledb.sh/v2/suikaver/chat';
  const BAD=[/f+u+ck/gi,/sh+i+t/gi,/b+i+tch/gi,/a+ss/gi,/n+igg+a/gi,/n+igg+er/gi,/c+u+nt/gi,/ret+ard/gi,/\bd+am+n\b/gi,/\bh+e+ll\b/gi];

  let msgs=[];
  let lastSend=0;
  let lastSeen=0;
  let focused=false;

  function clean(t){
    let s=String(t);
    BAD.forEach(r=>{ s=s.replace(r,'🍉'); });
    return s.slice(0,120);
  }

  function mySkinEmoji(){
    const id=G.save.skin||'classic';
    return {classic:'🍉',golden:'🥇',crystal:'💎',lava:'🌋',galaxy:'🌌',void:'⚫',mint:'🍃',royal:'👑',asc:'⭐',starbound:'✨',cosmic:'🕳️'}[id]||'🍉';
  }

  async function fetchMsgs(){
    try{
      const r=await fetch(URL,{cache:'no-store'});
      if(!r.ok) return;
      const data=await r.json();
      msgs=(data&&Array.isArray(data.msgs))?data.msgs:[];
      setStatus('🌐 connected');
      render();
    }catch(e){ setStatus('📴 offline chat'); }
  }

  function setStatus(t){
    const el=document.getElementById('chatStatus');
    if(el) el.textContent=t;
  }

  function send(){
    if(!G.save.name){ openNameModal(); return; }
    const input=document.getElementById('chatInput');
    const text=clean(input.value);
    if(!text) return;
    if(Date.now()-lastSend<3000){ setStatus('⏳ slow down!'); return; }
    lastSend=Date.now();
    input.value='';
    const msg={id:'m'+Date.now()+Math.random().toString(36).slice(2,6),p:G.save.name.slice(0,16),lvl:G.save.level||1,skin:mySkinEmoji(),t:text,ts:Date.now()};
    const arr=msgs.filter(m=>m.id!==msg.id);
    arr.push(msg);
    msgs=arr.slice(-60);
    fetch(URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({msgs:msgs.slice(-60),updated:Date.now()})}).catch(()=>{});
    render();
  }

  function render(){
    const list=document.getElementById('chatList');
    if(!list) return;
    if(!msgs.length){
      list.innerHTML='<div class="lb-empty">No messages yet — say hi! 👋</div>';
      return;
    }
    const meId=G.save.name;
    let html='';
    msgs.forEach(m=>{
      const isMe=m.p===meId;
      const time=new Date(m.ts||Date.now()).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
      html+='<div class="chat-msg'+(isMe?' me':'')+'">'+
        '<div class="cm-head"><span>'+(m.skin||'🍉')+'</span><span class="cm-name">'+escapeHtml(m.p||'?')+'</span>'+
        '<span class="lv-badge">Lv'+(m.lvl||1)+'</span><span class="cm-time">'+time+'</span></div>'+
        '<div class="cm-text">'+escapeHtml(m.t)+'</div></div>';
    });
    list.innerHTML=html;
    if(focused) list.scrollTop=list.scrollHeight;
  }

  function onOpen(){
    focused=true;
    const list=document.getElementById('chatList');
    if(list) list.scrollTop=list.scrollHeight;
    fetchMsgs();
  }

  function init(){
    const inp=document.getElementById('chatInput');
    if(inp) inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); send(); } });
    fetchMsgs();
    setInterval(fetchMsgs,5000);
  }

  return {init,send,onOpen};
})();

'use strict';
(() => {
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),E=MumbaiEngine,s=E.create();
let best=0,sound=true,audio=null,last=0,clock=0,tootAge=10,lastScore=0,boostToot=false,lastWarning='';
try{best=Math.max(0,Number(localStorage.getItem('mumbai-toot-best-v2'))||0);sound=localStorage.getItem('mumbai-toot-sound')!=='off';}catch{}
$('best').textContent=String(best).padStart(2,'0');
function rr(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
function line(p,c,w=2){ctx.beginPath();ctx.moveTo(...p[0]);for(let i=1;i<p.length;i++)ctx.lineTo(...p[i]);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function text(str,x,y,size,c,font='Trebuchet MS'){ctx.font=`bold ${size}px ${font}`;ctx.fillStyle=c;ctx.fillText(str,x,y);}
function soundUI(){$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));}soundUI();
function unlock(){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
function beep(kind){if(!sound)return;unlock();if(!audio)return;try{const n=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);
if(kind==='jump'||kind==='boost'){const boost=kind==='boost';o.type=boost?'sawtooth':'triangle';o.frequency.setValueAtTime(boost?560:310+Math.random()*80,n);o.frequency.exponentialRampToValueAtTime(boost?280:105,n+.13);o.frequency.setValueAtTime(boost?660:160,n+.16);o.frequency.exponentialRampToValueAtTime(boost?190:75,n+.26);g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(.23,n+.018);g.gain.exponentialRampToValueAtTime(.0001,n+.29);o.start(n);o.stop(n+.3);}else{o.type='sine';o.frequency.setValueAtTime(kind==='score'?640:180,n);o.frequency.exponentialRampToValueAtTime(kind==='score'?960:60,n+.16);g.gain.setValueAtTime(.1,n);g.gain.exponentialRampToValueAtTime(.0001,n+.2);o.start(n);o.stop(n+.21);}}catch{}}
function deathCopy(){return s.deathReason==='wire'?'Those live wires caught you. Stay low under low wires; use just one jump over a wired local.':s.deathReason==='express'?'That express was longer and faster. Jump, then tap again in the air to boost over every car.':'That local caught you. Jump just before it reaches you; save your second toot for the express.';}
function showOverlay(kind){const ready=kind==='ready',paused=kind==='paused';$('overlay').hidden=false;$('kicker').textContent=ready?'Now boarding · Double-toot edition':paused?'Taking a breather':'That was a close commute';$('heading').innerHTML=ready?'Mind the gap.<br><em>Make a little noise.</em>':paused?'Hold that <em>toot.</em>':'End of the <em>line!</em>';$('message').innerHTML=ready?'Hop the locals. Double-toot the express.<br>Watch the wires. Keep your cool.':paused?'Your sunset sprint is paused.<br>Ready when you are.':`<strong>${s.cleared}</strong> train${s.cleared===1?'':'s'} cleared. ${s.cleared&&s.cleared>=best?'Personal best!':''}<br>${deathCopy()}`;$('start').textContent=ready?"Let's roll →":paused?'Keep rolling →':'One more ride ↻';}
const warningLabels={'express':'EXPRESS · DOUBLE TOOT','low-wire':'LIVE WIRES · STAY LOW','local-wires':'LOW CLEARANCE · ONE JUMP'};
function hazardKind(){if(s.warning)return s.warning.kind;const wires=(s.wires||[]).filter(w=>w.x+w.w>150).sort((a,b)=>a.x-b.x);if(wires.length)return wires[0].kind==='low'?'low-wire':'local-wires';if(s.trains.some(t=>t.kind==='express'&&t.x+t.w>150))return 'express';return '';}
function hud(){const playing=s.mode==='playing',kind=playing?hazardKind():'';const label=warningLabels[kind]||'';$('hazard').hidden=!label;$('hazard').textContent=label;$('hazard').dataset.kind=kind;if(label!==lastWarning){lastWarning=label;if(label)$('announcement').textContent=label.replace(' · ','. ');}const left=Math.max(0,2-(s.jumpsUsed||0));$('reserve').hidden=!playing;$('reserve').setAttribute('aria-label',`${left} of 2 jumps remaining`);$('reserve').dataset.remaining=String(left);$('reserve-count').textContent=`${left}/2`;$('jump').textContent=playing&&s.jumpsUsed===1?'Boost ↗↗':'Jump ↗';}
function sync(){$('pause').disabled=s.mode==='ready'||s.mode==='over';$('pause').textContent=s.mode==='paused'?'Resume':'Pause';$('jump').disabled=s.mode==='paused';if(s.mode==='playing')$('overlay').hidden=true;else showOverlay(s.mode);$('score').textContent=String(s.cleared).padStart(2,'0');hud();}
function start(){unlock();E.start(s);tootAge=10;boostToot=false;lastScore=0;lastWarning='';sync();$('announcement').textContent='Run started. One tap to jump, a second tap in the air to boost. Watch the warning signs.';canvas.focus({preventScroll:true});}
function jump(){unlock();if(s.mode==='ready'||s.mode==='over'){start();return;}if(E.jump(s)){tootAge=0;boostToot=s.jumpsUsed===2;beep(boostToot?'boost':'jump');hud();}}
function pause(){E.pause(s);sync();}
$('start').addEventListener('click',()=>{if(s.mode==='paused'){pause();canvas.focus({preventScroll:true});}else start();});
$('jump').addEventListener('pointerdown',e=>{e.preventDefault();jump();});$('jump').addEventListener('click',e=>{if(e.detail===0)jump();});
canvas.addEventListener('pointerdown',e=>{e.preventDefault();jump();canvas.focus({preventScroll:true});});$('pause').addEventListener('click',pause);
$('sound').addEventListener('click',()=>{sound=!sound;soundUI();if(sound){unlock();beep('score');}try{localStorage.setItem('mumbai-toot-sound',sound?'on':'off');}catch{}});
document.addEventListener('keydown',e=>{if(e.target.closest?.('button')){if(e.code==='Space'&&e.repeat)e.preventDefault();return;}if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(!e.repeat)jump();}else if(['KeyP','Escape'].includes(e.code)&&!e.repeat){e.preventDefault();pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&s.mode==='playing'){E.pause(s);sync();}});window.addEventListener('blur',()=>{if(s.mode==='playing'){E.pause(s);sync();}});
function cloud(x,y,k){ctx.save();ctx.translate(x,y);ctx.scale(k,k);ellipse(0,0,38,12,'#fff4d2');ellipse(20,-9,22,15,'#fff4d2');ellipse(-16,-7,19,15,'#fff4d2');ctx.restore();}
function skyline(offset){const wash=ctx.createLinearGradient(0,0,0,400);wash.addColorStop(0,'#f6bc88');wash.addColorStop(.7,'#f9d9a1');wash.addColorStop(1,'#d2dbc2');rect(0,0,1080,480,wash);ellipse(831,109,48,48,'#f8e6b4');ellipse(831,109,36,36,'#ffeec7');
for(let i=0;i<5;i++)cloud(((i*269+115-offset*.025)%1400+1400)%1400-110,70+(i%3)*24,.75+(i%2)*.3);
for(let i=-1;i<18;i++){const x=((i*91-offset*.11)%1600+1600)%1600-160,h=55+((i+20)*37%85);rect(x,302-h,64,h,'#b7bfa6');rect(x+9,294-h,19,9,'#b7bfa6');for(let j=0;j<3;j++)rect(x+11+j*17,320-h,6,6,'#dce0ba');}
// Gateway-inspired silhouette beside the sea.
const gx=704-(offset*.055%1500);ctx.fillStyle='#b1aa87';ctx.beginPath();ctx.moveTo(gx,295);ctx.lineTo(gx,218);ctx.lineTo(gx+17,218);ctx.lineTo(gx+17,204);ctx.lineTo(gx+36,204);ctx.lineTo(gx+36,215);ctx.lineTo(gx+96,215);ctx.lineTo(gx+96,204);ctx.lineTo(gx+115,204);ctx.lineTo(gx+115,218);ctx.lineTo(gx+132,218);ctx.lineTo(gx+132,295);ctx.closePath();ctx.fill();rr(gx+47,243,39,62,[20,20,0,0],'#e3d7a9');rect(gx-4,228,140,6,'#a49d7f');ellipse(gx+26,201,10,4,'#b1aa87');ellipse(gx+106,201,10,4,'#b1aa87');
// Sea Link-inspired cable bridge in the distant scenery.
const bx=80-(offset*.07%1500);line([[bx,298],[bx+560,298]],'#8baba1',4);for(const tx of [bx+170,bx+355]){line([[tx,297],[tx,216],[tx+12,206],[tx+24,216],[tx+24,297]],'#8baba1',4);for(let j=0;j<5;j++)line([[tx+12,216+j*11],[tx-100+j*22,298]],'#98b5a5',1);for(let j=0;j<5;j++)line([[tx+12,216+j*11],[tx+125-j*22,298]],'#98b5a5',1);}
rect(0,300,1080,52,'#93bdb2');for(let i=0;i<20;i++){const x=((i*73-offset*.15)%1250+1250)%1250-90;rect(x,311+(i%4)*8,25+(i%3)*14,2,'#c5d6b5');}
for(let i=0;i<5;i++){const x=((i*285-offset*.25)%1550+1550)%1550-150;line([[x,350],[x+8,286],[x+6,264]],'#5f8b77',6);for(let j=0;j<6;j++){const a=j*Math.PI/3;line([[x+6,264],[x+6+Math.cos(a)*24,257+Math.sin(a)*11],[x+6+Math.cos(a)*38,265+Math.sin(a)*17]],'#5f8b77',4);}}
rect(0,350,1080,45,'#d6d2ac');rect(0,350,1080,6,'#f4e7bd');for(let i=-1;i<30;i++){const x=i*48-(offset*.65%48);rect(x,357,3,31,'#84998a');}rect(0,360,1080,3,'#84998a');rect(0,382,1080,3,'#84998a');const sx=((950-offset*.45)%1700+1700)%1700;rect(sx+13,280,6,70,'#577566');rr(sx-31,258,94,37,4,'#faf1d3','#577566');text('MUMBAI',sx-20,282,14,'#315d52');
const pole=((1040-offset*.55)%1300+1300)%1300;line([[pole,393],[pole,118],[pole-115,118],[pole-115,130]],'#486f6538',4);line([[0,133],[1080,133]],'#486f6528',1);line([[0,143],[1080,143]],'#486f6528',1);
rect(0,395,1080,85,'#c7ba91');rect(0,395,1080,7,'#395d54');rect(0,403,1080,5,'#eae4c1');rect(0,415,1080,65,'#a59f80');for(let i=-1;i<32;i++){const x=i*44-(offset%44);ctx.save();ctx.translate(x,442);ctx.rotate(-.12);rect(0,-5,22,27,'#746f5c');ctx.restore();}rect(0,427,1080,5,'#4d6053');rect(0,433,1080,2,'#e2d7b6');rect(0,455,1080,5,'#4d6053');rect(0,460,1080,2,'#ddd0a9');}
function train(t){
const x=t.x,w=t.w,y=400-t.h,express=t.kind==='express';
ellipse(x+w/2,405,w*.52,7,'#193e4020');
if(express){
  // Every carriage is drawn, including its underframe and bogies.
  const cars=Math.max(3,Math.ceil(w/172)),gap=9,cw=(w-gap*(cars-1))/cars;
  for(let i=0;i<cars;i++){
    const cx=x+i*(cw+gap);
    if(i) {rr(cx-gap-2,y+19,gap+4,44,2,'#283f3a');for(let k=0;k<3;k++)line([[cx-gap+2+k*3,y+21],[cx-gap+2+k*3,y+60]],'#67736a',1);}
    rr(cx,y,cw,t.h-7,9,'#7b3441','#294c47');
    rr(cx+3,y+3,cw-6,13,[7,7,0,0],'#aa5960');rect(cx+2,y+50,cw-4,9,'#efd39b');rect(cx+5,y+64,cw-10,8,'#582a36');
    const windows=Math.max(3,Math.floor((cw-30)/29));
    for(let k=0;k<windows;k++){const wx=cx+12+k*29;rr(wx,y+23,21,22,3,'#213f46','#d4ba99');rect(wx+3,y+26,5,15,'#7da7a5');line([[wx+11,y+26],[wx+17,y+26]],'#d8e7cb',1);}
    rect(cx+10,y-3,cw-20,3,'#3a5148');rr(cx+cw*.55,y-7,24,4,2,'#6b7867');
    for(const xx of [cx+24,cx+cw-24]){rect(xx-13,388,26,6,'#29463e');ellipse(xx,396,9,9,'#263f3a');ellipse(xx,396,3,3,'#b8b99a');}
    if(i===0){rr(cx+3,y+23,6,23,2,'#dfd3ae');ellipse(cx+7,y+63,4,4,'#ffe4a0');text('EXPRESS',cx+35,y+58,8,'#61323a');}
    else text('MUMBAI  •  '+String(i+1).padStart(2,'0'),cx+35,y+58,7,'#61323a');
  }
  // Speed strokes are low and behind the train, never fake overhead hazards.
  for(let i=0;i<3;i++)line([[x+w+12,351+i*16],[x+w+48+i*16,351+i*16]],'#9c55505c',3);
  return;
}
const c=['#b77d91','#4b8d86','#d98b46'][t.tint||0];rr(x,y,w,t.h-7,11,'#f4e5c3','#315e57');rr(x+3,y+3,w-6,19,[8,8,0,0],c);rect(x+2,y+52,w-4,16,c);for(let i=0;i<Math.floor((w-25)/33);i++){rr(x+15+i*33,y+27,24,22,3,'#375f60');rect(x+18+i*33,y+29,7,16,'#7dabb0');}rr(x+5,y+27,6,22,2,'#345b56');ellipse(x+9,y+62,4,4,'#ffe49e');rect(x+14,y-3,w-28,3,'#315e57');rr(x+w*.52,y-7,24,4,2,'#627b6a');for(const xx of [x+23,x+w-24]){ellipse(xx,396,10,10,'#2b5049');ellipse(xx,396,4,4,'#b9c1a6');}text('LOCAL',x+44,y+66,9,'#fff0ce');}
function wire(w){
  // Render the exact engine polylines, not a smoothed or invented collision line.
  for(let j=0;j<w.paths.length;j++){
    const points=w.paths[j].map(([dx,y])=>[w.x+dx,y]);if(points.length<2)continue;
    ctx.save();ctx.shadowColor='#ed9b44';ctx.shadowBlur=7;line(points,'#57392b',6);ctx.shadowBlur=0;line(points,'#aa6a39',2);ctx.restore();
    for(const index of [0,points.length-1]){const [x,y]=points[index];rr(x-5,y-5,10,10,2,'#eed49a','#5c5741');line([[x-5,y-1],[x+5,y-1]],'#84663c',1);}
    // Short sparks hang from actual vertices; their flicker reads as electricity.
    if(Math.sin(clock*19+j*2)>.15){const [x,y]=points[Math.floor(points.length/2)];line([[x,y+3],[x-3,y+9],[x+3,y+10],[x-1,y+17]],'#e9a343',3);line([[x,y+3],[x-3,y+9],[x+3,y+10],[x-1,y+17]],'#fff0b0',1);}
  }
}
function player(){const air=s.y<399.9,run=s.mode==='playing'?Math.sin(s.time*19):Math.sin(clock*3)*.2;ellipse(180,401,air?14:22,4,air?'#193e4018':'#193e4033');ctx.save();ctx.translate(180,s.y);ctx.rotate(air?-.13:.06);line([[0,-21],[-8-(air?7:run*8),-11],[-11-(air?9:run*10),-3]],'#244b4b',7);line([[3,-21],[10+(air?6:run*8),-13],[13+(air?3:run*11),-3]],'#244b4b',7);rr(-19-(air?9:run*10),-6,15,6,3,'#fff5d7');rr(8+(air?3:run*11),-6,16,6,3,'#fff5d7');rr(-16,-43,13,23,5,'#417c70','#244f49');rr(-9,-43,23,24,7,'#f2b43f');line([[8,-38],[air?19:18,-30],[air?25:12,-40]],'#ab6641',5);line([[-5,-38],[-15,-28],[-20,-32]],'#ab6641',5);ctx.fillStyle='#e05b39';ctx.beginPath();ctx.moveTo(-5,-44);ctx.lineTo(-29-Math.sin(clock*15)*3,-49);ctx.lineTo(-23,-39);ctx.closePath();ctx.fill();rr(-6,-47,14,6,2,'#e05b39');ellipse(4,-56,12,13,'#b9764a');ellipse(14,-54,4,3,'#b9764a');rr(-8,-70,23,10,5,'#273f3a');rect(-8,-62,7,7,'#273f3a');ellipse(10,-58,1.5,1.8,'#213f39');line([[11,-49],[15,-50]],'#753e2d',1.5);ctx.restore();
if(tootAge<(boostToot?.72:.55)){ctx.save();const duration=boostToot?.72:.55;ctx.globalAlpha=1-tootAge/duration;const x=118-tootAge*35,y=s.y-31-tootAge*45;for(let i=0;i<(boostToot?5:3);i++)ellipse(x-i*11,y+i*6,9+i*2,7+i*2,boostToot?'#ffe6a0':'#f0cf7b');if(boostToot){for(let i=0;i<3;i++)line([[150-i*11,s.y+5+i*5],[146-i*11,s.y+14+i*7]],'#e79037',3);}ctx.translate(x-(boostToot?50:42),y-23);ctx.rotate(-.16);text(boostToot?'TOOT TOOT!':'toot!',0,0,boostToot?20:23,boostToot?'#a33f26':'#ba4c2e','Georgia');ctx.restore();}}
function draw(){ctx.clearRect(0,0,1080,480);skyline(s.distance);if(s.mode==='ready')train({x:765,w:158,h:82,tint:0});for(const t of s.trains)train(t);for(const w of s.wires||[])wire(w);player();if(s.mode==='over')text(s.deathReason==='wire'?'ZAP!':'OOPS!',144,s.y-91,22,'#ac482c','Georgia');}
function frame(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;const prev=s.mode;if(s.mode!=='paused'){clock+=dt;tootAge+=dt;}E.step(s,dt);if(s.cleared!==lastScore){lastScore=s.cleared;$('score').textContent=String(s.cleared).padStart(2,'0');beep('score');}if(prev==='playing'&&s.mode==='over'){beep('crash');if(s.cleared>best){best=s.cleared;$('best').textContent=String(best).padStart(2,'0');try{localStorage.setItem('mumbai-toot-best-v2',String(best));}catch{}}sync();$('announcement').textContent=`Run over. ${s.cleared} trains cleared. ${deathCopy()} Play again to retry.`;}hud();draw();requestAnimationFrame(frame);}
window.mumbaiToot=Object.freeze({snapshot:()=>({...s,version:'2.0',trains:s.trains.map(t=>({...t})),wires:(s.wires||[]).map(w=>({...w,paths:w.paths.map(path=>path.map(point=>[...point]))})),warning:s.warning?{...s.warning}:null,best,sound,audioState:audio?.state||'not-started'})});sync();requestAnimationFrame(frame);
})();
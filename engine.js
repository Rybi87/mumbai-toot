var MumbaiEngine = (() => {
  const GROUND = 400;
  function create(){return {mode:'ready',y:GROUND,vy:0,time:0,distance:0,speed:360,trains:[],wires:[],spawn:0.7,cleared:0,jumps:0,jumpsUsed:0,warning:null,deathReason:null,encounters:0,expressCleared:0,wiresDodged:0};}
  function start(s){Object.assign(s,create(),{mode:'playing'});}
  function jump(s){
    if(s.mode!=='playing'||s.jumpsUsed>=2)return false;
    s.vy=s.jumpsUsed===0?-800:Math.min(s.vy,-740);
    s.y=Math.min(s.y,GROUND-0.01);s.jumpsUsed++;s.jumps++;return true;
  }
  function pause(s){if(s.mode==='playing')s.mode='paused';else if(s.mode==='paused')s.mode='playing';}
  // Encounters are isolated: low wires never demand a simultaneous train jump.
  // Express length scales with its velocity, preserving the double-jump challenge.
  function spawnEncounter(s,kind,rng=Math.random){
    const express=kind==='express',speed=Math.min(950,s.speed*(express?1.95:1));
    if(kind!=='low-wire')s.trains.push({x:1130,w:express?Math.round(speed*.8+36):128+rng()*22,h:82,kind:express?'express':'local',speed,tint:express?0:Math.floor(rng()*3),passed:false});
    if(kind==='low-wire'||kind==='local-wires'){
      const low=kind==='low-wire';
      const base=low?[[0,156],[45,172],[95,216],[156,244],[210,222],[255,180],[300,151]]:[[0,88],[50,121],[115,145],[176,151],[240,119],[300,84]];
      const paths=[base,base.map(([x,y])=>[x,y-14])];
      if(low)paths.push([[67,178],[80,196],[71,218],[96,231]]);
      s.wires.push({x:low?1130:1090,w:300,paths,kind:low?'low':'high',speed,passed:false});
    }
    s.warning=null;s.spawn=.45+rng()*.25;
  }
  function segmentHitsRect(ax,ay,bx,by,left,top,right,bottom){
    let enter=0,exit=1;
    for(const [a,delta,min,max] of [[ax,bx-ax,left,right],[ay,by-ay,top,bottom]]){
      if(Math.abs(delta)<1e-9){if(a<min||a>max)return false;continue;}
      let u=(min-a)/delta,v=(max-a)/delta;if(u>v)[u,v]=[v,u];
      enter=Math.max(enter,u);exit=Math.min(exit,v);if(enter>exit)return false;
    }
    return true;
  }
  function wireHitsPlayer(s,wire){
    if(wire.x>197||wire.x+wire.w<163)return false;
    for(const path of wire.paths)for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i];
      if(segmentHitsRect(wire.x+a[0],a[1],wire.x+b[0],b[1],163,s.y-67,197,s.y-5))return true;
    }
    return false;
  }
  function step(s,dt,rng=Math.random){
    if(s.mode!=='playing')return;
    dt=Math.min(.1,Math.max(0,dt));
    while(dt>0&&s.mode==='playing'){
      const d=Math.min(dt,1/120);dt-=d;s.time+=d;s.speed=Math.min(580,360+s.time*2.5);s.distance+=s.speed*d;
      s.vy+=1900*d;s.y=Math.min(GROUND,s.y+s.vy*d);if(s.y===GROUND){s.vy=0;s.jumpsUsed=0;}
      for(const t of s.trains){
        t.x-=(t.speed??s.speed)*d;
        if(t.x+10<195&&t.x+t.w-10>166&&s.y-8>GROUND-t.h&&s.y-64<GROUND-4){s.mode='over';s.deathReason=t.kind==='express'?'express':'train';break;}
        if(!t.passed&&t.x+t.w<164){t.passed=true;s.cleared++;if(t.kind==='express')s.expressCleared++;}
      }
      if(s.mode!=='playing')break;
      for(const wire of s.wires){
        wire.x-=(wire.speed??s.speed)*d;
        if(wireHitsPlayer(s,wire)){s.mode='over';s.deathReason='wire';break;}
        if(!wire.passed&&wire.x+wire.w<164){wire.passed=true;s.wiresDodged++;}
      }
      s.trains=s.trains.filter(t=>t.x+t.w>-60);s.wires=s.wires.filter(w=>w.x+w.w>-60);
      if(s.mode!=='playing')break;
      if(s.warning){
        s.warning.remaining-=d;if(s.warning.remaining<=0)spawnEncounter(s,s.warning.kind,rng);
      }else if(!s.trains.length&&!s.wires.length){
        s.spawn-=d;
        if(s.spawn<=0){
          const sequence=['local','local','low-wire','express','local-wires','local','low-wire','express'];
          const kind=sequence[s.encounters++%sequence.length];
          if(kind==='local')spawnEncounter(s,kind,rng);else s.warning={kind,remaining:kind==='express'?1.05:.65};
        }
      }
    }
  }
  return {GROUND,create,start,jump,pause,step,spawnEncounter};
})();
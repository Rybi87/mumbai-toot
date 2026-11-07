var MumbaiEngine = (() => {
  const GROUND = 400;
  function create(){return {mode:'ready',y:GROUND,vy:0,time:0,distance:0,speed:360,trains:[],spawn:0.7,cleared:0,jumps:0};}
  function start(s){Object.assign(s,create(),{mode:'playing'});}
  function jump(s){if(s.mode!=='playing'||s.y<GROUND)return false;s.vy=-800;s.y=GROUND-0.01;s.jumps++;return true;}
  function pause(s){if(s.mode==='playing')s.mode='paused';else if(s.mode==='paused')s.mode='playing';}
  function step(s,dt,rng=Math.random){
    if(s.mode!=='playing')return;
    dt=Math.min(0.1,Math.max(0,dt));
    while(dt>0&&s.mode==='playing'){
      const d=Math.min(dt,1/120);dt-=d;s.time+=d;s.speed=Math.min(580,360+s.time*2.5);s.distance+=s.speed*d;
      s.vy+=1900*d;s.y=Math.min(GROUND,s.y+s.vy*d);if(s.y===GROUND)s.vy=0;
      s.spawn-=d;if(s.spawn<=0){s.trains.push({x:1130,w:128+rng()*22,h:82,passed:false,tint:Math.floor(rng()*3)});s.spawn=1.6+rng()*0.65;}
      for(const t of s.trains){t.x-=s.speed*d;
        if(t.x+10<195&&t.x+t.w-10>166&&s.y-8>GROUND-t.h&&s.y-48<GROUND-4){s.mode='over';break;}
        if(!t.passed&&t.x+t.w<164){t.passed=true;s.cleared++;}
      }
      s.trains=s.trains.filter(t=>t.x+t.w>-60);
    }
  }
  return {GROUND,create,start,jump,pause,step};
})();
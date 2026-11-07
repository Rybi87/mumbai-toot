const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const scope={Math};vm.createContext(scope);vm.runInContext(fs.readFileSync(__dirname+'/engine.js','utf8'),scope);const E=scope.MumbaiEngine;
function fresh(speed=360){const s=E.create();E.start(s);s.time=(speed-360)/2.5;s.speed=speed;s.spawn=Infinity;return s;}
function advance(s,time,rng=()=>.5){for(let i=0;i<Math.ceil(time*120);i++)E.step(s,1/120,rng);}
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
let s=fresh();
assert.equal(typeof E.spawnEncounter,'function','encounter generator must exist');
E.spawnEncounter(s,'low-wire',()=>.5);
assert.equal(s.wires.length,1,'low powerlines spawn');assert.equal(s.trains.length,0,'low lines do not force an impossible train jump');
assert.ok(s.wires[0].paths.length>=2,'messy powerlines have multiple collidable cables');
advance(s,5);assert.equal(s.mode,'playing','staying on the ground safely passes low cables');assert.equal(s.wiresDodged,1);
s=fresh();s.y=320;s.wires=[{x:140,w:100,paths:[[[0,270],[100,270]]],kind:'low',speed:0,passed:false}];E.step(s,1/120);assert.equal(s.mode,'over');assert.equal(s.deathReason,'wire','head/body contact with an actual wire is lethal');
s=fresh();s.y=224;s.wires=[{x:140,w:100,paths:[[[0,130],[100,130]],[[0,260],[100,260]]],kind:'low',speed:0,passed:false}];E.step(s,1/120);assert.equal(s.mode,'playing','empty space between cables is not a filled collision rectangle');
s=fresh();E.spawnEncounter(s,'local-wires',()=>.5);assert.equal(s.trains.length,1);assert.equal(s.wires[0].kind,'high');
console.log('PASS: low wires, true polyline collision, cable gaps, paired high wires');
for(const [feet,hit] of [[300,true],[230,false]]){
 s=fresh();s.y=feet;s.wires=[{x:140,w:100,paths:[[[0,220],[100,320]]],kind:'low',speed:0,passed:false}];E.step(s,1/120);
 assert.equal(s.mode,hit?'over':'playing','diagonal contact uses the actual segment, not its bounding box');
}
for(const [x,hit] of [[197,true],[198,false]]){
 s=fresh();s.y=320;s.wires=[{x,w:30,paths:[[[0,270],[30,280]]],kind:'low',speed:0,passed:false}];E.step(s,1/120);
 assert.equal(s.mode,hit?'over':'playing','cable endpoint contact respects stroke radius');
}
console.log('PASS: diagonal cable collision, empty diagonal box space, exact endpoint boundary');

s=fresh();E.spawnEncounter(s,'express',()=>.5);assert.equal(s.trains[0].kind,'express');assert.ok(s.trains[0].w>500,'express is visibly long');assert.ok(s.trains[0].speed>=s.speed*1.8,'express is substantially faster');assert.equal(s.wires.length,0,'no unavoidable express-and-wire trap');
for(const speed of [360,450,580]){
 for(const double of [false,true]){
  s=fresh(speed);E.spawnEncounter(s,'express',()=>.5);let firstAt=null;
  for(let i=0;i<1200&&s.mode==='playing'&&s.cleared===0;i++){
   const t=s.trains[0];
   if(s.y===400&&t&&t.x<195+t.speed*.19&&firstAt===null){E.jump(s);firstAt=s.time;}
   if(double&&s.jumpsUsed===1&&s.vy>-250)E.jump(s);
   E.step(s,1/120,()=>.5);
  }
  if(double){assert.equal(s.mode,'playing',`timed double jump clears express at speed ${speed}`);assert.equal(s.cleared,1);assert.equal(s.expressCleared,1);}
  else{assert.equal(s.mode,'over',`single jump cannot cheese express at speed ${speed}`);assert.equal(s.deathReason,'express');}
 }
}
console.log('PASS: fast long express needs and can be cleared by timed double jumping at all tested speeds');

s=fresh();s.spawn=0;s.encounters=3;E.step(s,1/120,()=>.5);assert.equal(s.warning.kind,'express');assert.ok(s.warning.remaining>=.9,'express gets an advance warning');assert.equal(s.trains.length,0,'train waits for warning');E.pause(s);const frozen=JSON.stringify(s);advance(s,1);assert.equal(JSON.stringify(s),frozen,'pause freezes warning and all hazards');E.pause(s);advance(s,1.2);assert.equal(s.trains[0].kind,'express');
s=fresh();s.spawn=0;s.trains=[{x:1000,w:150,h:82,speed:360,passed:false,kind:'local'}];advance(s,.2);assert.equal(s.trains.length,1);assert.equal(s.warning,null,'new encounters wait until prior threats clear');
E.start(s);assert.equal(s.wires.length,0);assert.equal(s.warning,null);assert.equal(s.jumpsUsed,0);assert.equal(s.deathReason,null);assert.equal(s.expressCleared,0);
console.log('PASS: advance warning, no overlapping encounters, pause and restart');

for(const boost of [false,true]){
 s=fresh();E.spawnEncounter(s,'local-wires',()=>.5);
 for(let i=0;i<1000&&s.mode==='playing'&&(s.trains.length||s.wires.length);i++){
  pilot(s);if(boost&&s.jumpsUsed===1&&s.vy>-250)E.jump(s);E.step(s,1/120,()=>.5);
 }
 if(boost){assert.equal(s.mode,'over','unnecessary boost under low-clearance cables is dangerous');assert.equal(s.deathReason,'wire');}
 else{assert.equal(s.mode,'playing','single jump clears a local underneath the high cables');assert.equal(s.cleared,1);}
}
console.log('PASS: single-jump route under cables is safe; careless double jump hits live wires');

function pilot(s){
 const t=s.trains.find(t=>!t.passed&&t.x+t.w>166);
 if(t&&s.y===400&&t.x<195+t.speed*(t.kind==='express'?.19:.18)&&t.x>195)E.jump(s);
 if(t?.kind==='express'&&s.jumpsUsed===1&&s.vy>-250)E.jump(s);
}
let runs=0,cleared=0,expresses=0,wireDodges=0;
for(const speed of [360,500,580])for(let seed=1;seed<=16;seed++){
 s=fresh(speed);s.spawn=.1;const random=rng(seed);
 for(let i=0;i<120*90;i++){pilot(s);E.step(s,1/120,random);if(s.mode!=='playing')break;}
 assert.equal(s.mode,'playing',`fair encounter sequence at speed ${speed}, seed ${seed}, death ${s.deathReason}`);
 assert.ok(s.cleared>=10);assert.ok(s.expressCleared>=2);assert.ok(s.wiresDodged>=3);runs++;cleared+=s.cleared;expresses+=s.expressCleared;wireDodges+=s.wiresDodged;
}
console.log(`PASS: ${runs} seeded 90-second fairness runs; ${cleared} trains (${expresses} express), ${wireDodges} wire sets safely negotiated`);
let frameRuns=0;
for(const fps of [15,30,60])for(const speed of [360,580]){
 s=fresh(speed);s.spawn=.1;const random=rng(fps+speed);
 for(let i=0;i<fps*60;i++){pilot(s);E.step(s,1/fps,random);if(s.mode!=='playing')break;}
 assert.equal(s.mode,'playing',`playable at ${fps}fps and speed ${speed}`);assert.ok(s.expressCleared>=1);frameRuns++;
}
console.log(`PASS: ${frameRuns} low/normal-framerate fairness runs (15, 30 and 60 fps)`);

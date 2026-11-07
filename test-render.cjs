const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/game.js','utf8').replace(/\r\n/g,'\n');
const poles=source.match(/function wirePoles\(w\)\{[\s\S]*?\n\}\n(?=function wire\(w\))/);
assert.ok(poles,'hazard wires must have a trackside pole renderer');
let calls=[];
const sandbox={Math,ctx:{save(){},restore(){}},rr:(...a)=>calls.push(['rr',...a]),line:(...a)=>calls.push(['line',...a]),ellipse:(...a)=>calls.push(['ellipse',...a]),rect:(...a)=>calls.push(['rect',...a]),text:(...a)=>calls.push(['text',...a])};
vm.createContext(sandbox);vm.runInContext(poles[0],sandbox);
for(const height of [150,90]){
 const w={x:430,w:300,kind:height===150?'low':'high',paths:[[[0,height],[150,height+90],[300,height-5]],[[0,height-14],[150,height+76],[300,height-19]],[[67,height+22],[96,height+81]]]};
 const before=JSON.stringify(w);calls=[];sandbox.wirePoles(w);
 assert.equal(JSON.stringify(w),before,'drawing poles must not mutate collision paths');
 const feet=calls.filter(c=>c[0]==='rr'&&c[3]===26&&c[4]===12);
 assert.equal(feet.length,2,'exactly two concrete foundations, not a pole on each loose branch');
 assert.ok(feet.every(c=>c[2]===380),'concrete bases sit on the rear platform, not the running track');
 for(const path of w.paths.slice(0,2))for(const endpoint of [path[0],path[path.length-1]]){
  const [x,y]=[w.x+endpoint[0],endpoint[1]];
  assert.ok(calls.some(c=>c[0]==='line'&&c[1].some(p=>p[0]===x&&p[1]===y)),'each main cable endpoint is physically connected to its support insulator');
 }
 const firstXs=feet.map(c=>c[1]);w.x-=91;calls=[];sandbox.wirePoles(w);
 const moved=calls.filter(c=>c[0]==='rr'&&c[3]===26&&c[4]===12);
 assert.deepEqual(moved.map(c=>c[1]),firstXs.map(x=>x-91),'poles scroll in lockstep with their attached cables');
}
const draw=source.match(/function draw\(\)\{[\s\S]*?(?=\nfunction frame\()/);
assert.ok(draw);const order=[];
const layer={ctx:{clearRect(){}},s:{mode:'playing',distance:0,wires:[{}],trains:[{}]},skyline(){},wirePoles(){order.push('poles')},train(){order.push('train')},wire(){order.push('wire')},player(){order.push('player')},text(){}};
vm.createContext(layer);vm.runInContext(draw[0]+';draw();',layer);
assert.deepEqual(order,['poles','train','wire','player'],'support poles sit behind trains and the player, not across their collision lane');
console.log('PASS: grounded pole pairs, anchored cable endpoints, loose branches, scroll synchronization, unchanged collision geometry and background layering');

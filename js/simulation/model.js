import {makeFleet,makeTree,random,geo} from './fleet.js';
export class FleetSimulation {
 constructor({count=300,seed=42,availability=.8,speed=25,passengers=3,rate=20}={}){
  if(!Number.isInteger(count)||count<1||count>2000||!Number.isInteger(passengers)||passengers<1||passengers>20||speed<=0||speed>130||rate<=0||rate>100||availability<0||availability>1)throw new RangeError('Configuración de flota inválida.');
  this.speed=speed;this.rate=rate;this.time=0;this.fleet=makeFleet(count,seed,availability);const r=random(seed+17);
  this.fleet.forEach(p=>{p.axis=r()<.5?'x':'y';p.direction=r()<.5?-1:1;const fixed=p.axis==='x'?'y':'x';p[fixed]=Math.round(p[fixed]*6)/6;Object.assign(p,geo(p));});
  this.passengers=Array.from({length:passengers},(_,id)=>{const p={id,x:r(),y:r()};return {...p,...geo(p)};});this.tree=makeTree(this.fleet);
 }
 advance(seconds){if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('Paso temporal inválido.');this.time+=seconds*this.rate;const delta=this.speed/3600/7.7*seconds*this.rate;for(const p of this.fleet){let n=p[p.axis]+p.direction*delta;while(n<0||n>1){if(n>1){n=2-n;p.direction=-1;}if(n<0){n=-n;p.direction=1;}}p[p.axis]=n;Object.assign(p,geo(p));}this.tree=makeTree(this.fleet);return this.fleet;}
}

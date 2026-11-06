import {Quadtree} from '../algorithms/quadtree.js';
import {haversine,eta} from '../algorithms/haversine.js';
import {Heap,nearestK} from '../algorithms/heap.js';
import {dijkstra} from '../algorithms/dijkstra.js';
import {makeFleet,makeTree,dispatch,geo,makeRoads} from '../simulation/fleet.js';
import {linearQuery} from '../simulation/benchmark.js';
const expect=(value,message='Resultado inesperado')=>{if(!value)throw new Error(message);};
const same=(a,b)=>expect(JSON.stringify(a)===JSON.stringify(b),`${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
const throws=fn=>{let failed=false;try{fn();}catch{failed=true;}expect(failed,'Se esperaba una excepción');};
export const algorithmChecks=[
 {name:'Quadtree vacío',run(){same(new Quadtree().query({x:0,y:0,w:1,h:1}),[]);}},
 {name:'Inserción y rechazo fuera del dominio',run(){const q=new Quadtree();expect(q.insert({id:1,x:.2,y:.3}));expect(!q.insert({id:2,x:2,y:.3}));expect(q.query(q.bounds).length===1);}},
 {name:'100 puntos coincidentes / profundidad máxima',run(){const q=new Quadtree();for(let id=0;id<100;id++)q.insert({id,x:.5,y:.5});expect(q.query(q.bounds).length===100);let max=0;q.visit(n=>max=Math.max(max,n.depth));expect(max===18);}},
 {name:'Eliminación por ID',run(){const q=makeTree([{id:1,x:.2,y:.3},{id:2,x:.8,y:.9}]);expect(q.remove(1));expect(!q.remove(1));same(q.query(q.bounds).map(p=>p.id),[2]);}},
 {name:'Actualización y conservación ante posición inválida',run(){const q=makeTree([{id:1,x:.2,y:.3}]);expect(q.update(1,{x:.8,y:.9}));expect(!q.update(1,{x:3,y:3}));const p=q.query(q.bounds)[0];expect(p.x===.8&&p.y===.9);}},
 {name:'Consulta rectangular coincide con búsqueda lineal',run(){const points=makeFleet(500,81),q=makeTree(points),r={x:.25,y:.4,w:.3,h:.2};same(q.query(r).map(p=>p.id).sort((a,b)=>a-b),linearQuery(points,r).map(p=>p.id).sort((a,b)=>a-b));}},
 {name:'Haversine: identidad, simetría y arco conocido',run(){const a={lat:0,lng:0},b={lat:0,lng:1};expect(haversine(a,a)===0);expect(Math.abs(haversine(a,b)-111.1949266)<.000001);expect(haversine(a,b)===haversine(b,a));}},
 {name:'Haversine: coordenadas inválidas',run(){throws(()=>haversine({lat:91,lng:0},{lat:0,lng:0}));throws(()=>haversine({lat:0,lng:NaN},{lat:0,lng:0}));}},
 {name:'Heap: extracción ordenada y selección top-K',run(){const h=new Heap();[5,1,8,2].forEach(n=>h.push(n));same([h.pop(),h.pop(),h.pop(),h.pop()],[1,2,5,8]);const points=[{id:1,v:7},{id:2,v:2},{id:3,v:4}];same(nearestK(points,{},2,p=>p.v).map(e=>e.point.id),[2,3]);same(nearestK(points,{},0,p=>p.v),[]);}},
 {name:'Dijkstra: ruta óptima y traza consistente',run(){const g={A:[{to:'B',weight:7},{to:'C',weight:2}],B:[],C:[{to:'B',weight:1}]};const result=dijkstra(g,'A','B');expect(result.distance===3);same(result.path,['A','C','B']);expect(result.steps.at(-1).distances.B===3);same(dijkstra(g,'A','B',{trace:false}).path,result.path);}},
 {name:'Dijkstra: desconexión, origen igual y pesos negativos',run(){const g={A:[],B:[]};expect(dijkstra(g,'A','B').distance===Infinity);same(dijkstra(g,'A','A').path,['A']);throws(()=>dijkstra({A:[{to:'B',weight:-1}],B:[]},'A','B'));}},
 {name:'ETA: fórmula y velocidad inválida',run(){expect(eta(3,30)===6);throws(()=>eta(1,0));}},
 {name:'Despachador: ganador es disponible y tiene mínimo ETA',run(){const p={x:.5,y:.5,...geo({x:.5,y:.5})};const result=dispatch(makeFleet(300,42),p,8,25,makeRoads(),.4);expect(result.winner!==null);expect(result.winner.point.available);expect(result.winner.eta===Math.min(...result.ranked.map(c=>c.eta)));expect(result.ranked.length<=8);}},
 {name:'Despachador: sin disponibilidad no hay asignación',run(){const p={x:.5,y:.5,...geo({x:.5,y:.5})};expect(dispatch(makeFleet(50,42,0),p,8,25).winner===null);}},
];
export function runAlgorithmChecks({clock=()=>performance.now(),environment='JavaScript · entorno actual'}={}){
 const at=new Date().toISOString(),start=clock();const results=algorithmChecks.map(check=>{const t=clock();try{check.run();return {name:check.name,passed:true,ms:clock()-t};}catch(error){return {name:check.name,passed:false,ms:clock()-t,error:error.message};}});return {at,environment,results,passed:results.filter(r=>r.passed).length,total:results.length,durationMs:clock()-start};
}

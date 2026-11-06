export class Heap {
 constructor(compare=(a,b)=>a-b){this.items=[];this.compare=compare;}
 get size(){return this.items.length;}
 peek(){return this.items[0];}
 push(value){const a=this.items;a.push(value);let i=a.length-1;while(i>0){const p=(i-1)>>1;if(this.compare(a[i],a[p])>=0)break;[a[i],a[p]]=[a[p],a[i]];i=p;}}
 pop(){const a=this.items;if(!a.length)return undefined;const first=a[0],last=a.pop();if(a.length){a[0]=last;let i=0;while(true){let best=i;for(const c of [i*2+1,i*2+2])if(c<a.length&&this.compare(a[c],a[best])<0)best=c;if(best===i)break;[a[i],a[best]]=[a[best],a[i]];i=best;}}return first;}
}
export function nearestK(points,target,k,distance,trace=null){if(!Number.isInteger(k)||k<0)throw new RangeError('K debe ser entero no negativo');const heap=new Heap((a,b)=>b.distance-a.distance||b.point.id-a.point.id);for(const point of points){const entry={point,distance:distance(point,target)};heap.push(entry);if(heap.size>k)heap.pop();if(trace)trace.push({examined:point.id,heap:heap.items.map(e=>({...e}))});}return heap.items.slice().sort((a,b)=>a.distance-b.distance||a.point.id-b.point.id);}
